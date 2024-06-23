mod utils;
pub use utils::*;

mod encrypt;
mod image;
mod qrcode; // 和use语句的区别：use是引入模块，而mod是声明模块。声明了之后，才能在其他地方使用use引入。
pub use encrypt::*; // 重导出到lib.rs这个根模块，以便js使用
pub use image::*;
pub use qrcode::*;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator. 为了减少wasm文件的大小，使用wee_alloc作为全局分配器
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

