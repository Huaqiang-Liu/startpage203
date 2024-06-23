import init, {
    process_image
} from '../../rustwasm/pkg/rustwasm.js'

function run() {
    // initialize WebAssembly module
    console.log("running function run()");

    var theme_value = localStorage.getItem("theme");
    if (theme_value == "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
    }
    // 隐藏id="choosemode"，id="not_compress"，id="is_compress"，id="process"
    document.getElementById("choosemode").style.display = "none";
    document.getElementById("not_compress").style.display = "none";
    document.getElementById("is_compress").style.display = "none";
    document.getElementById("process").style.display = "none";

}
await init().then(run);


/*<input type="range" id="ratio" min="0" max="100" value="50">
            <span id="ratio_value">50%</span> */
// 随着滑块的移动，ratio_value的值也会变化
var ratio = document.getElementById('ratio');
var ratio_value = document.getElementById('ratio_value');
ratio.addEventListener('input', function() {
    ratio_value.value = ratio.value;
}, false);
// 为ratio_value添加事件监听，当其值改变时，ratio的值也会改变
ratio_value.addEventListener('input', function() {
    // 表单检查，如果不是0~100之间的整数，alert并返回
    if (isNaN(ratio_value.value) || ratio_value.value < 0 || ratio_value.value > 100) {
        alert("请输入0~100之间的整数");
        ratio_value.value = "";
        return;
    }
    ratio.value = ratio_value.value;
}, false);

// 上传了图片再让id="choosemode"显示
var file = document.getElementById('image');
var file_size;
file.addEventListener('change', function() {
    document.getElementById("choosemode").style.display = "block";
    // click一下图像压缩，因为最开始没有显示出来
    compress.click();
    // id="image_size"显示图片大小（KB）
    file_size = file.files[0].size / 1024;
    document.getElementById("image_size").innerText = file_size.toFixed(2) + "KB";
    file_size = file.files[0].size;
}, false);
// 选中图像压缩，则让id="is_compress"和id="process"显示，让id="not_compress"隐藏
//；否则让id="is_compress"和id="process"显示，让id="not_compress"隐藏
var compress = document.getElementById('compress');
var gray = document.getElementById('gray');
var sharp = document.getElementById('sharp');
var contrast = document.getElementById('contrast');
compress.addEventListener('click', function() {
    document.getElementById("is_compress").style.display = "block";
    document.getElementById("process").style.display = "block";
    document.getElementById("not_compress").style.display = "none";
}, false);
gray.addEventListener('click', function() {
    document.getElementById("is_compress").style.display = "none";
    document.getElementById("process").style.display = "block";
    document.getElementById("not_compress").style.display = "block";
}, false);
sharp.addEventListener('click', function() {
    document.getElementById("is_compress").style.display = "none";
    document.getElementById("process").style.display = "block";
    document.getElementById("not_compress").style.display = "block";
}, false);
contrast.addEventListener('click', function() {
    document.getElementById("is_compress").style.display = "none";
    document.getElementById("process").style.display = "block";
    document.getElementById("not_compress").style.display = "block";
}, false);


document.getElementById('process').addEventListener('click', async () => {
    const fileInput = document.getElementById('image');
    const ratio = parseInt(document.getElementById('ratio').value);
    var mode;
    if (document.getElementById('compress').checked) {
        mode = 0;
        // id="size"的input表单检查：不能<=10kb，不能>原图大小
        if (size.value <= 10 || size.value > file_size) {
            alert("请输入大于10KB且小于原图大小的数值");
            size.value = "";
            return;
        }
    } else if (document.getElementById('gray').checked) {
        mode = 1;
    } else if (document.getElementById('sharp').checked) {
        mode = 2;
    } else if (document.getElementById('contrast').checked) {
        mode = 3;
    }

    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
        const data = new Uint8Array(reader.result);
        const size = ratio; // Use the same value for size in this example
        const processedData = process_image(data, mode, ratio, size);

        // Convert the resulting byte array to a blob and display it
        const blob = new Blob([processedData], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        document.getElementById('result').src = url;
    };

    reader.readAsArrayBuffer(file);
});
