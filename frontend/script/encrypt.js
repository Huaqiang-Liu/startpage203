// import init from '../../rustwasm/pkg/rustwasm.js';
// import * as wasm from '../../rustwasm/pkg/rustwasm_bg.wasm';

// init(wasm).then(() => {
//     // All the functions from the wasm module are now available here
//     // You can use them like this:
//     // wasm.functionName()
// }).catch(console.error);

// id="fn_mode"的内容，为"0"或者"1"
var fnmode;
document.addEventListener("DOMContentLoaded", function() {
    fnmode = document.getElementById("fn_mode").innerText;
}); // 超级大坑：如果直接fnmode=document.getElementById("fn_mode").innerText，
    // 那么fnmode的值会是undefined，因为页面还没加载出来就取了这个值

function initPage() {
    if (fnmode == "1") { // 用别人的AES，产生RSA密钥对
        document.getElementById("exist_when_0").style.display = "none";
        document.getElementById("exist_when_1").style.display = "block";
    } else {
        document.getElementById("exist_when_0").style.display = "block";
        document.getElementById("exist_when_1").style.display = "none";
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

function decryptAESKey() {

}


function encryptAESKey() {

}

function encryptText() {

}

function decryptText() {

}

function uploadFile() {



}


function encryptFile() {

}

function decryptFile() {

}