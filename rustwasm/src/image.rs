// 图像处理：压缩（size是压缩之后的大小，单位KB），调整灰度、锐度、对比度（ratio是比率）
use image::{DynamicImage, ImageBuffer, Rgba};
use wasm_bindgen::prelude::*;
use std::io::Cursor;

#[wasm_bindgen]
pub fn process_image(file_data: &[u8], mode: u32, ratio: i32, size: i32) -> Vec<u8> {
    match mode {
        0 => compress(file_data, size),
        1 => gray(file_data, ratio),
        2 => sharp(file_data, ratio),
        3 => contrast(file_data, ratio),
        _ => file_data.to_vec(),
    }
}

fn compress(file_data: &[u8], size: i32) -> Vec<u8> {
    let img = image::load_from_memory(file_data).expect("Failed to load image");
    let quality = (size.max(1).min(100)) as u8; // Ensuring quality is within 1-100
    let mut buf: Vec<u8> = Vec::new();
    img.write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::JPEG(quality))
        .expect("Failed to write image");
    buf
}

fn gray(file_data: &[u8], _ratio: i32) -> Vec<u8> {
    let img = image::load_from_memory(file_data).expect("Failed to load image");
    let gray_img = img.grayscale();
    let mut buf: Vec<u8> = Vec::new();
    gray_img.write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::PNG)
        .expect("Failed to write image");
    buf
}

fn sharp(file_data: &[u8], ratio: i32) -> Vec<u8> {
    let img = image::load_from_memory(file_data).expect("Failed to load image");
    let sigma = (ratio as f32).max(0.1); // Ensuring sigma is positive
    let sharpened_img = img.unsharpen(sigma, 1);
    let mut buf: Vec<u8> = Vec::new();
    sharpened_img.write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::PNG)
        .expect("Failed to write image");
    buf
}

fn contrast(file_data: &[u8], ratio: i32) -> Vec<u8> {
    let img = image::load_from_memory(file_data).expect("Failed to load image");
    let contrast_img = img.adjust_contrast(ratio as f32);
    let mut buf: Vec<u8> = Vec::new();
    contrast_img.write_to(&mut Cursor::new(&mut buf), image::ImageOutputFormat::PNG)
        .expect("Failed to write image");
    buf
}

