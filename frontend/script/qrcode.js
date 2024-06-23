import init, {
    merge_image
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
}
await init().then(run);


// id="background_image"上传图片后，检查id="qrcode_image"是否上传
// 如果没有则alert并返回；如果上传了则检查背景图片是否宽和高都大于二维码图片
// 如果没有则alert并返回；如果都大于则调用merge_image函数，并在id="result"
// 显示合成后的图片
// id="background_image"上传图片，添加listener
var background_image = document.getElementById('background_image');
var qrcode_image = document.getElementById('qrcode_image');
background_image.addEventListener('change', function() {
    if (qrcode_image.files.length == 0) {
        alert("请上传二维码图片");
        return;
    }
    // merge_image接收两个图片的字节流，返回合成后的图片的字节流，将返回保存在id="result"的img标签中
    const background_reader = new FileReader();
    const qrcode_reader = new FileReader();
    background_reader.onload = async () => {
        const background_data = new Uint8Array(background_reader.result);
        qrcode_reader.onload = async () => {
            const qrcode_data = new Uint8Array(qrcode_reader.result);
            const processedData = merge_image(background_data, qrcode_data);
            // 如果返回了空字节流，则说明背景图片的长宽有小于二维码的，alert并返回
            if (processedData.length == 0) {
                alert("背景图片的长宽不能小于二维码图片的长宽");
                return;
            }
            const blob = new Blob([processedData], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            document.getElementById('result').src = url;
        };
        qrcode_reader.readAsArrayBuffer(qrcode_image.files[0]);
    };
    background_reader.readAsArrayBuffer(background_image.files[0]);

}, false);

