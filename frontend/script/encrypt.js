import init, {
    test_wasm,
    init_page,
    str_to_bytes,
    bytes_to_str,
    encrypt_aes_by_rsa,
    rsa_pub_key_to_string,
    str_to_aes,
    check_data,
    encrypt_by_aes,
    decrypt_by_aes
} from '../../rustwasm/pkg/rustwasm.js';

// id="fn_mode"的内容，为"0"或者"1"
var fnmode;
document.addEventListener("DOMContentLoaded", function() {
    fnmode = document.getElementById("fn_mode").innerText;
}); // 超级大坑：如果直接fnmode=document.getElementById("fn_mode").innerText，
    // 那么fnmode的值会是undefined，因为页面还没加载出来就取了这个值

// 异步导入WASM代码，必须要异步！！
function run() {
    // initialize WebAssembly module
    console.log("running function run()");
    window.fnSwitch = fnSwitch;
    window.copy = copy;
    window.decryptAESKey = decryptAESKey;
    window.encryptAESKey = encryptAESKey;
    window.encryptText = encryptText;
    window.decryptText = decryptText;
    window.processFile = processFile;
    initPage();
}
await init().then(run);

function initPage() {
    var theme_value = localStorage.getItem("theme");
    if (theme_value == "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
    }
    // test_wasm();
    if (fnmode == "1") { // 用别人的AES，产生RSA密钥对
        document.getElementById("exist_when_0").style.display = "none";
        document.getElementById("exist_when_1").style.display = "block";
        init_page(1);
        document.getElementById("my_rsa_pub_key").innerText = rsa_pub_key_to_string();
    } else {
        document.getElementById("exist_when_0").style.display = "block";
        document.getElementById("exist_when_1").style.display = "none";
        init_page(0);
        document.getElementById("0").innerText = "AES密钥已保存";
    }
    
    document.getElementById("exist_when_aes_ready").style.display = "none";
    console.log("fnmode: " + fnmode);
} // 没加载出来东西就调用initPage也会像上面的坑一样，所以要想下面这样调用




function copy(id) {
    var text = document.getElementById(id).innerText;
    if (navigator.userAgent.indexOf('Mobile') < 0) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('已复制到剪贴板');
        }, function() {
            alert('复制失败');
        });
    } else {
        alert("手机端暂不支持复制到剪贴板，请手动复制");
    }
}

function fnSwitch() {
    if (fnmode == "0") {
        document.getElementById("fn_mode").innerText = "1";
        fnmode = "1";
    } else {
        document.getElementById("fn_mode").innerText = "0";
        fnmode = "0";
    }
    initPage();
}

// <textarea id="op_aes_key_str"></textarea>中的内容，用str_to_aes转换，
// 转换后调用check_data，如果返回true，让id="exist_when_aes_ready"的元素
// 显示，并将id="1"的内容改为“AES密钥已保存”
function decryptAESKey() {
    var aes_key_str = document.getElementById("op_aes_key_str").value;
    var aes_key = str_to_aes(aes_key_str);
    if (check_data(aes_key)) {
        document.getElementById("exist_when_aes_ready").style.display = "block";
        document.getElementById("1").innerText = "AES密钥已保存";
    } else {
        alert("错误！请检查AES密钥字符串是否正确");
    }
}

// <textarea id="op_rsa_pub_key"></textarea>
// <div id="my_aes_key_str">这里将显示加密后的AES密钥转换为的字符串</div>
function encryptAESKey() {
    var pub_key_str = document.getElementById("op_rsa_pub_key").value;
    var aes_str = encrypt_aes_by_rsa(pub_key_str);
    if (check_data(pub_key_str)) {
        document.getElementById("exist_when_aes_ready").style.display = "block";
        document.getElementById("my_aes_key_str").innerText = aes_str;
    } else {
        alert("错误！请检查RSA公钥字符串是否正确");
    }
}

function encryptText() {
    var text = document.getElementById("text").value;
    var bytes = new TextEncoder().encode(text);
    var encrypted_bytes = encrypt_by_aes(bytes);
    var encrypted_text = bytes_to_str(encrypted_bytes);
    document.getElementById("encrypted_text").innerText = encrypted_text;//encrypted_text;
}

function decryptText() {
    var encrypted_text = document.getElementById("op_encrypted_text").value;
    var encrypted_bytes = str_to_bytes(encrypted_text);
    var decrypted_bytes = decrypt_by_aes(encrypted_bytes);
    // 用js的方法将bytes转为字符串并显示
    var decrypted_text = new TextDecoder().decode(decrypted_bytes);
    document.getElementById("decrypted_text").innerText = decrypted_text;
}


// 加密或解密完成后弹出系统资源管理器选择保存处理之后的文件的位置
// 从下面这两个地方获取文件，转换为字节流。在此之前应该已经点击并上传了文件，如果没有就alert并返回
// <input type="file" id="file_to_encrypt">，<input type="file" id="file_to_decrypt">
function processFile(mode) {
    var file;
    if (mode == 1) {
        file = document.getElementById("file_to_encrypt").files[0];
    } else {
        file = document.getElementById("file_to_decrypt").files[0];
    }
    if (file == null) {
        alert("请先选择文件");
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var file_data = new Uint8Array(e.target.result);
        if (mode == 1) {
            var encrypted_data = encrypt_by_aes(file_data);
            var blob = new Blob([encrypted_data], {type: "application/octet-stream"});
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = file.name + ".encrypted";
            a.click();
        } else {
            var decrypted_data = decrypt_by_aes(file_data);
            var blob = new Blob([decrypted_data], {type: "application/octet-stream"});
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = file.name + ".decrypted";
            a.click();
        }
    }
    reader.readAsArrayBuffer(file);

}
