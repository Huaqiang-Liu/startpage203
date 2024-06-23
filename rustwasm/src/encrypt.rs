use aes::cipher::typenum;
use rsa::{Pkcs1v15Encrypt, RsaPrivateKey, RsaPublicKey, Error};
use aes::cipher::{KeyInit, generic_array::GenericArray};
use aes_gcm::{aead::{Aead, AeadCore, OsRng}, Aes256Gcm, Nonce};
use pkcs1::DecodeRsaPublicKey;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern { // extern关键字用于声明外部函数
    fn alert(s: &str); // 这个函数本来在js中
}

// 保存我的RSA密钥对，未加密的AES密钥及生成器（包括我自己生成的，或者别人发来密文后我用
// RSA私钥解密得到的AES密钥）。注意加密了的AES密钥字符串是兼容js的类型，不在这里保存
struct SavedData {
    saved_pub_key: Option<RsaPublicKey>,
    saved_priv_key: Option<RsaPrivateKey>,
    saved_aes_key: Option<Vec<u8>>,
    saved_aes_cipher: Option<Aes256Gcm>
}

static mut DATA: SavedData = SavedData {
    saved_pub_key: None,
    saved_priv_key: None,
    saved_aes_key: None,
    saved_aes_cipher: None
};

#[wasm_bindgen]
pub fn test_wasm() {
    alert("如果输出了这条，说明可以正常使用wasm函数");
}

// fnmode为1则用别人的AES，生成RSA密钥对保存进DATA；否则自己生成AES，也保存进DATA
#[wasm_bindgen]
pub fn init_page(fnmode: i32) {
    unsafe {
        DATA.saved_pub_key = None;
        DATA.saved_priv_key = None;
        DATA.saved_aes_key = None;
        DATA.saved_aes_cipher = None;
    }
    if fnmode == 1 {
        let (priv_key, pub_key) = gen_rsa().unwrap();
        unsafe {
            DATA.saved_priv_key = Some(priv_key);
            DATA.saved_pub_key = Some(pub_key);
        }
    } else {
        let (aes_key, cipher) = gen_aes();
        unsafe {
            DATA.saved_aes_key = Some(aes_key);
            DATA.saved_aes_cipher = Some(cipher);
        }
    }
}

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

// RSA加密的AES，AES加密的数据，都有可能出现乱码，所以传输时应转换为形如"114,514"的字符串
#[wasm_bindgen]
pub fn str_to_bytes(data_str: &str) -> Vec<u8> {
    // data_str形如"114,514"，将其转为字节串
    let mut data = Vec::new();
    let mut num = 0;
    for c in data_str.chars() {
        if c == ',' {
            data.push(num);
            num = 0;
        } else if c.is_digit(10) {
            num = num * 10 + c.to_digit(10).unwrap() as u8;
        }
    }
    data.push(num);
    data
}
#[wasm_bindgen]
pub fn bytes_to_str(data: &[u8]) -> String {
    data.iter().map(|x| x.to_string()).collect::<Vec<String>>().join(",")
}

// 把别人的RSA公钥字符串保存到DATA，然后加密我的256位AES密钥，返回加密后并转为形如"114,514"的字符串
#[wasm_bindgen]
pub fn encrypt_aes_by_rsa(pub_key_str: &str) -> String {
    let pub_key = RsaPublicKey::from_pkcs1_pem(pub_key_str).unwrap();
    unsafe {
        DATA.saved_pub_key = Some(pub_key);
    }
    let pub_key = unsafe { DATA.saved_pub_key.as_ref().unwrap() };
    let mut rng = rand::thread_rng();
    let aes_key = unsafe { DATA.saved_aes_key.as_ref().unwrap() };
    let encrypted_aes = pub_key.encrypt(&mut rng, Pkcs1v15Encrypt, aes_key.as_slice())
        .expect("encrypt my aes key with other's rsa public key failure!");
    bytes_to_str(encrypted_aes.as_slice())
}

// 将自己的RSA公钥转换为字符串，符合PKCS#1标准
#[wasm_bindgen]
pub fn rsa_pub_key_to_string() -> String {
    let pub_key = unsafe { DATA.saved_pub_key.as_ref().unwrap() };
    pkcs1::EncodeRsaPublicKey::to_pkcs1_pem(pub_key, pkcs1::LineEnding::default()).unwrap()
}

// 由于加密了的AES密钥不都是可见字符，所以传输时会传送形如"114,514"的字符串，需要将其转为字节串，
// 解密，保存到DATA中
#[wasm_bindgen]
pub fn str_to_aes(encrypted_aes_str: &str) {
    let encrypted_aes = str_to_bytes(encrypted_aes_str);
    // 现在得到了加密了的aes key的字节串，解密后保存到DATA中
    let priv_key = unsafe { DATA.saved_priv_key.as_ref().unwrap() };
    let key = priv_key.decrypt(Pkcs1v15Encrypt, encrypted_aes.as_slice())
        .expect("decrypt other's aes key with my rsa private key failure!");
    let cipher = Aes256Gcm::new(GenericArray::from_slice(key.as_slice()));
    unsafe {
        DATA.saved_aes_key = Some(key);
        DATA.saved_aes_cipher = Some(cipher);
    }
}

// 检查DATA是否完整，即RSA公钥和AES key、cipher是否都不为None
#[wasm_bindgen]
pub fn check_data() -> bool {
    unsafe {
        DATA.saved_pub_key.is_some() && DATA.saved_aes_key.is_some() && DATA.saved_aes_cipher.is_some()
    }
}

// 不管是用别人的还是用自己的AES加密数据，现在key和cipher都保存在DATA中了，直接用其加密解密数据即可。
// 数据可能涉及二进制，所以都是字节流，而非字符串
#[wasm_bindgen]
pub fn encrypt_by_aes(data: &[u8]) -> Vec<u8> { // 加密后的内容的最后12个字节是nonce
    let cipher = unsafe { DATA.saved_aes_cipher.as_ref().unwrap() };
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let mut encrypted_data = cipher.encrypt(&nonce, data.as_ref())
        .expect("encryption by my aes failure!");
    encrypted_data.extend_from_slice(nonce.as_slice());
    encrypted_data
}
#[wasm_bindgen]
pub fn decrypt_by_aes(data: &[u8]) -> Vec<u8> { // 解密前的数据的最后12个字节是nonce
    let cipher = unsafe { DATA.saved_aes_cipher.as_ref().unwrap() };
    let nonce: &GenericArray<u8, typenum::U12> = Nonce::from_slice(&data[data.len()-12..]);
    let decrypted_data = cipher.decrypt(nonce, &data[..data.len()-12])
        .expect("decryption by my aes failure!");
    decrypted_data
}

