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
    window.uploadFile = uploadFile;
    window.processFile = processFile;
    initPage();
}
await init().then(run);

function initPage() {
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
    // console.log("text: " + text);
    // 直接把字符串转换成字节流，这个字符串不符合"114,514"这样的，所以要用js自带的解编码方法，而不能用专门处理"114,514"这样的字符串而编写的str_to_bytes！！
    var bytes = new TextEncoder().encode(text);
    // console.log("bytes: " + bytes);
    var encrypted_bytes = encrypt_by_aes(bytes);

    // var tmp0 = decrypt_by_aes(encrypted_bytes);
    // // 解码
    // var encrypted_text = new TextDecoder().decode(tmp0);
    // document.getElementById("encrypted_text").innerText = encrypted_text;

    // console.log("checkpoint 0, tmp0: " + tmp0);
    // // 直接AES加密会得到乱码，所以转换成形如"114,514"这样的字节流
    // console.log("checkpoint 1");
    var encrypted_text = bytes_to_str(encrypted_bytes);
    // console.log("checkpoint 2, encrypted_text: " + encrypted_text);
    // var tmp1 = str_to_bytes(encrypted_text);
    // console.log("checkpoint 3, tmp1: " + tmp1);
    // var tmp2 = decrypt_by_aes(tmp1);
    // console.log("checkpoint 4, tmp2: " + tmp2);
    // var tmp3 = bytes_to_str(tmp2);
    // console.log("checkpoint 5, tmp3: " + tmp3);
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
        processed_data = encrypt_by_aes(file_to_encrypt_data);
    else
        processed_data = decrypt_by_aes(file_to_decrypt_data);
    var blob = new Blob([processed_data]);
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = file_to_encrypt_path.split("\\").pop();
    a.click();
    URL.revokeObjectURL(url);
}
