use rsa::{Pkcs1v15Encrypt, RsaPrivateKey, RsaPublicKey, Error};

pub fn generate() -> Result<(RsaPrivateKey, RsaPublicKey), Error> {
    let mut rng = rand::thread_rng();
    let bits = 4096;
    let priv_key = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate a key");
    let pub_key = RsaPublicKey::from(&priv_key);
    Ok((priv_key, pub_key))
}

