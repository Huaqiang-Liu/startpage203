use aes::cipher::typenum;
use pkcs1::der::Encode;
use rand::RngCore;
use rsa::{Pkcs1v15Encrypt, RsaPrivateKey, RsaPublicKey, Error};
use aes::Aes256;
use aes::cipher::{
    BlockCipher, BlockEncrypt, BlockDecrypt, KeyInit,
    generic_array::GenericArray
};
use aes_gcm::{
    aead::{Aead, AeadCore, OsRng},
    Aes256Gcm, Nonce, Key
};

// 生成RSA512密钥对
pub fn gen_rsa() -> Result<(RsaPrivateKey, RsaPublicKey), Error> {
    let mut rng = rand::thread_rng();
    let bits = 512;
    let priv_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
    let pub_key = RsaPublicKey::from(&priv_key);
    Ok((priv_key, pub_key))
}

// 生成AES密钥和加密器
pub fn gen_aes() -> (Vec<u8>, Aes256Gcm) {
    // 随机生成32字节的key
    let key = Aes256Gcm::generate_key(OsRng);
    let cipher = Aes256Gcm::new(&key);
    (key.to_vec(), cipher)
}

// 用RSA加密256位AES密钥
pub fn encrypt_by_rsa(pub_key: &RsaPublicKey, data: &[u8]) -> Result<Vec<u8>, Error> {
    let mut rng = rand::thread_rng();
    pub_key.encrypt(&mut rng, Pkcs1v15Encrypt, data)
}

// 将RSA公钥转换为字符串，符合PKCS#1标准
pub fn rsapublickey_to_string(pub_key: &RsaPublicKey) -> Result<String, pkcs1::Error>{
    pkcs1::EncodeRsaPublicKey::to_pkcs1_pem(pub_key, pkcs1::LineEnding::default())
}

// 用对方发来的，用我的RSA公钥加密的AES密钥加密数据，加密后的内容的最后12个字节是本次的nonce
// 先将encrypted_aes用RSA解密得到AES key，然后用AES key加密data
pub fn encrypt_by_other_aes(encrypted_aes: &[u8], priv_key: &RsaPrivateKey, data: &[u8]) -> Vec<u8> {
    let key = priv_key.decrypt(Pkcs1v15Encrypt, encrypted_aes)
        .expect("decrypt other's aes key with my rsa private key failure!");
    let cipher = Aes256Gcm::new(GenericArray::from_slice(key.as_slice()));
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let mut encrypted_data = cipher.encrypt(&nonce, data.as_ref())
        .expect("encryption by other's aes failure!");
    encrypted_data.extend_from_slice(nonce.as_slice());
    encrypted_data
}
// 用自己的AES密钥加密数据，加密后的内容的最后12个字节是nonce，这里直接加密即可
pub fn encrypt_by_my_aes(cipher: &Aes256Gcm, data: &[u8]) -> Vec<u8> {
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let mut encrypted_data = cipher.encrypt(&nonce, data.as_ref())
        .expect("encryption by my aes failure!");
    encrypted_data.extend_from_slice(nonce.as_slice());
    encrypted_data
}

// 用对方发来的，用我的RSA公钥机密的AES密钥解密数据，解密前的数据的最后12个字节是nonce
// 先将encrypted_aes用RSA解密得到AES key，然后用AES key解密data
pub fn decrypt_by_other_aes(encrypted_aes: &[u8], priv_key: &RsaPrivateKey, data: &[u8]) -> Vec<u8> {
    let key = priv_key.decrypt(Pkcs1v15Encrypt, encrypted_aes)
        .expect("decrypt other's aes key with my rsa private key failure!");
    println!("用私钥解密之后的key={:?}", key);
    let cipher = Aes256Gcm::new(GenericArray::from_slice(key.as_slice()));
    let nonce: &GenericArray<u8, typenum::U12> = Nonce::from_slice(&data[data.len()-12..]);
    let decrypted_data = cipher.decrypt(nonce, &data[..data.len()-12])
        .expect("decryption by other's aes failure!");
    decrypted_data
}

// 用自己的AES解密数据，解密前的数据的最后12个字节是nonce
pub fn decrypt_by_my_aes(cipher: &Aes256Gcm, data: &[u8]) -> Vec<u8> {
    let nonce: &GenericArray<u8, typenum::U12> = Nonce::from_slice(&data[data.len()-12..]);
    let decrypted_data = cipher.decrypt(nonce, &data[..data.len()-12])
        .expect("decryption by my aes failure!");
    decrypted_data
}

// 由于加密了的AES密钥不都是可见字符，所以传输时会传送形如"140,250," 这样的字符串，需要将其转为字节串，再用到上面两个by_other_aes函数中
pub fn str_to_encrypted_aes(encrypted_aes_str: &str) -> Vec<u8> {
    let mut encrypted_aes = Vec::new();
    let mut num = 0;
    for c in encrypted_aes_str.chars() {
        if c == ',' {
            encrypted_aes.push(num);
            num = 0;
        } else if c.is_digit(10) {
            num = num * 10 + c.to_digit(10).unwrap() as u8;
        }
    }
    encrypted_aes.push(num);
    encrypted_aes
}

pub fn encrypted_aes_to_str(encrypted_aes: &[u8]) -> String {
    encrypted_aes.iter().map(|x| x.to_string()).collect::<Vec<String>>().join(",")
}
