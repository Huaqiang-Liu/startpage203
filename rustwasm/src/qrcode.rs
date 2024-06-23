use wasm_bindgen::prelude::*;
use image::{DynamicImage, GenericImageView, ImageBuffer, Rgba, RgbaImage};

#[wasm_bindgen]
extern { // extern关键字用于声明外部函数
    fn alert(s: &str); // 这个函数本来在js中
}
#[wasm_bindgen]
pub fn merge_image(background_data: &[u8], qrcode_data: &[u8]) -> Vec<u8> {
    // 读取图片数据
    let bgimg = image::load_from_memory(background_data).expect("Failed to load background image");
    let qrimg = image::load_from_memory(qrcode_data).expect("Failed to load QR code image");

    // 如果背景图片的长宽有小于二维码的，返回空Vec
    if bgimg.width() < qrimg.width() || bgimg.height() < qrimg.height() {
        return Vec::new();
    }

    // alert("checkpoint 1");

    let (width, height) = bgimg.dimensions();
    let mut img_mix: RgbaImage = ImageBuffer::new(width, height);

    // alert("checkpoint 2");

    for (w, h, pixel) in img_mix.enumerate_pixels_mut() {
        // w和h超过qrimg的长宽时，直接复制背景图片对应位置的像素值到目标图片
        if w >= qrimg.width() || h >= qrimg.height() {
            let bgpxl = bgimg.get_pixel(w, h);
            *pixel = Rgba([bgpxl[0], bgpxl[1], bgpxl[2], 255]);
            continue;
        }
        let bgpxl = bgimg.get_pixel(w, h);
        let qrpxl = qrimg.get_pixel(w, h);

        if qrpxl[0] > 200 {
            // 如果二维码上的这个像素为白色，直接复制背景图片对应位置的像素值到目标
            // 图片，透明度设为255（不透明）
            // alert("white");
            *pixel = Rgba([bgpxl[0], bgpxl[1], bgpxl[2], 255]);
        } else {
            // alert("not white");
            let alpha = 150; // 透明度：255 * 60% ≈ 150 （半透明）
            *pixel = Rgba([
                ((bgpxl[0] as i32 - (255 - alpha)) * 255 / alpha) as u8,
                ((bgpxl[1] as i32 - (255 - alpha)) * 255 / alpha) as u8,
                ((bgpxl[2] as i32 - (255 - alpha)) * 255 / alpha) as u8,
                alpha as u8,
            ]);
        }
    }

    let mut buffer = Vec::new();
    DynamicImage::ImageRgba8(img_mix)
        .write_to(&mut buffer, image::ImageOutputFormat::PNG)
        .expect("Failed to write image to buffer");


    buffer
}
