pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

use std::fs;
use wasm_bindgen::prelude::*;
use std::fs::File;
use std::io::{self, Read, Write};
use std::path::Path;

/*我想用rust保存一个标签（id="favor_sites"）中的所有内容到本地的一个文件（这里举例为../assets/site.json，
如果你想的话不用json也是可以的）；在页面加载时读取这个文件，规定这个标签中的内容为先前保存的内容。这两个功
能如何用rust实现？注意为了让函数与js兼容，参数和返回值都必须是基本类型（数，字节串，字符串等）*/

#[wasm_bindgen]
extern { // extern关键字用于声明外部函数
    fn alert(s: &str); // 这个函数本来在js中
}

pub fn create_file() {
    let dir_path = "C:\\Users\\LiuHuaqiang\\AppData\\Local\\startpage203";
    let file_path = format!("{}\\site.json", dir_path);

    fs::create_dir_all(dir_path).unwrap();
    let mut file;
    alert("create_file");
    if !Path::new(&file_path).exists() {
        file = File::create(file_path).unwrap();
    }
}

#[wasm_bindgen]
pub fn save_favor_sites_to_file() {
    let favor_sites = web_sys::window()
        .unwrap()
        .document()
        .unwrap()
        .get_element_by_id("favor_sites")
        .unwrap()
        .inner_html();
    create_file();
    let file_path = "C:\\Users\\LiuHuaqiang\\AppData\\Local\\startpage203\\site.json";
    // 现在文件一定存在，从头覆写
    let mut file = File::open(file_path).unwrap();
    file.write_all(favor_sites.as_bytes()).unwrap();
}


#[wasm_bindgen]
pub fn load_favor_sites_from_file() -> JsValue {
    create_file();
    let file_path = "C:\\Users\\LiuHuaqiang\\AppData\\Local\\startpage203\\site.json";
    let mut file = File::open(file_path).unwrap();
    // 如果文件为空，返回空字符串
    if file.metadata().unwrap().len() == 0 {
        return JsValue::from_str("");
    }
    let mut favor_sites = String::new();
    file.read_to_string(&mut favor_sites).unwrap();
    JsValue::from_str(&favor_sites)
}

