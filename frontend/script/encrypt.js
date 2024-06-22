// import init, {
//     test_wasm,
//     init_page,
//     encrypt_aes_by_rsa,
//     rsa_pub_key_to_string,
//     str_to_aes,
//     check_data,
//     encrypt_by_aes,
//     decrypt_by_aes
// } from '../../rustwasm/pkg/rustwasm_bg.js';

// import * as wasm from "../../rustwasm/pkg/rustwasm";
const wasm = import("../../rustwasm/pkg/rustwasm.js");

// id="fn_mode"的内容，为"0"或者"1"
var fnmode;
document.addEventListener("DOMContentLoaded", function() {
    fnmode = document.getElementById("fn_mode").innerText;
}); // 超级大坑：如果直接fnmode=document.getElementById("fn_mode").innerText，
    // 那么fnmode的值会是undefined，因为页面还没加载出来就取了这个值

function initPage() {
    wasm.test_wasm();
    if (fnmode == "1") { // 用别人的AES，产生RSA密钥对
        document.getElementById("exist_when_0").style.display = "none";
        document.getElementById("exist_when_1").style.display = "block";
        wasm.init_page(1);
        document.getElementById("my_rsa_pub_key").innerText = wasm.rsa_pub_key_to_string();
    } else {
        document.getElementById("exist_when_0").style.display = "block";
        document.getElementById("exist_when_1").style.display = "none";
        wasm.init_page(0);
        document.getElementById("0").innerText = "AES密钥已保存";
    }
    
    document.getElementById("exist_when_aes_ready").style.display = "none";
    console.log("fnmode: " + fnmode);
} // 没加载出来东西就调用initPage也会像上面的坑一样，所以要想下面这样调用
window.addEventListener('DOMContentLoaded', initPage);

function copy(id) {
    var text = document.getElementById(id).innerText;
    // 如果在电脑端运行
    if (navigator.userAgent.indexOf('Mobile') < 0) {
        console.log('电脑端')
        navigator.clipboard.writeText(text).then(function() {
            console.log('已复制到剪贴板');
        }, function() {
            alert('复制失败');
        });
    }
    // 如果是在手机上运行
    else {
        console.log('手机端')
        var input = document.createElement('input');
        input.setAttribute('readonly', 'readonly');
        input.setAttribute('value', text);
        document.body.appendChild(input);
        input.setSelectionRange(0, 9999);
        input.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
            console.log('已复制到剪贴板');
        }
        document.body.removeChild(input);
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
    var aes_key = wasm.str_to_aes(aes_key_str);
    if (wasm.check_data(aes_key)) {
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
    var aes_str = wasm.encrypt_aes_by_rsa(pub_key_str);
    if (wasm.check_data(pub_key_str)) {
        document.getElementById("exist_when_aes_ready").style.display = "block";
        document.getElementById("my_aes_key_str").innerText = aes_str;
    } else {
        alert("错误！请检查RSA公钥字符串是否正确");
    }
}

function encryptText() {
    var text = document.getElementById("text").innerText;
    var encrypted_text = wasm.encrypt_by_aes(text);
    document.getElementById("encrypted_text").innerText = encrypted_text;
}

function decryptText() {
    var text = document.getElementById("op_encrypted_text").innerText;
    var encrypted_text = new TextEncoder().encode(text);
    var decrypted_array = wasm.decrypt_by_aes(encrypted_text);
    var decrypted_text = new TextDecoder().decode(decrypted_array);
    document.getElementById("decrypted_text").innerText = decrypted_text;
}

// 选择要上传的文件，选中后记录路径，转换成字节流
var file_to_encrypt_path = "";
var file_to_encrypt_data = null;
var file_to_decrypt_path = "";
var file_to_decrypt_data = null;
function uploadFile(mode) {
    if (mode == 1) { // 上传要加密的文件，打开系统资源管理器，选择后记录路径
        document.getElementById("file_to_encrypt").click();
        var file = document.getElementById("file_to_encrypt").files[0];
        file_to_encrypt_path = file ? file.path : "";
        if (file == null) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            file_to_encrypt_data = new Uint8Array(e.target.result);
        }
        reader.readAsArrayBuffer(file);
    } else {
        document.getElementById("file_to_decrypt").click();
        var file = document.getElementById("file_to_decrypt").files[0];
        file_to_decrypt_path = file ? file.path : "";
        if (file == null) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            file_to_decrypt_data = new Uint8Array(e.target.result);
        }
        reader.readAsArrayBuffer(file);
    
    }
}

// 加密或解密完成后弹出系统资源管理器选择保存处理之后的文件的位置
function processFile(mode) { 
    var processed_data = null;
    if (mode == 1)
        processed_data = wasm.encrypt_by_aes(file_to_encrypt_data);
    else
        processed_data = wasm.decrypt_by_aes(file_to_decrypt_data);
    var blob = new Blob([processed_data]);
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = file_to_encrypt_path.split("\\").pop();
    a.click();
    URL.revokeObjectURL(url);
}
