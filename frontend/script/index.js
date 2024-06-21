

function dayNightSwitch() {
    // 函数将id="day_or_night"这个span里面存放的值01替换，0是夜间模式，1是白天模式
    var day_or_night = document.getElementById("day_or_night");
    var value = day_or_night.innerText;
    if (value == "0") {
        day_or_night.innerText = "1";
        // TODO: 修改CSS切换到白天模式
    } else {
        day_or_night.innerText = "0";
        // TODO: 修改CSS切换到夜间模式
    }
}


function hideAddSiteWindow() {
    // id="add_site_window"，将其改为不可见
    document.getElementById("add_site_window").style.display = "none";
}

function openSite() {
    // 打开这个div所在的span（class="site）中的class="site_url"的div中的网址
    var site_url = this.parentNode.getElementsByClassName("site_url")[0].innerText;
    console.log("openSite函数已触发，即将打开网址：" + site_url);
    window.open(site_url);
}

function addSite() {
    // <div>网站名缩写：<input type="text" id="add_site_name"></div>
    // <div>网址：<input type="text" id="add_site_url"></div>
    // 网站名缩写不能超过9个汉字或18个字母，即18字节
    var site_name = document.getElementById("add_site_name").value;
    var site_url = document.getElementById("add_site_url").value;
    if (site_name.length > 18) {
        alert("网站名缩写不能超过18个字节（9个汉字）");
        return;
    }
    // <span class="site">
    // <div>网站名缩写</div><!--不能超过9个汉字/18字节，填写弹窗中的表单时要作出限制-->
    // <div class="site_url" style="display: none;">不显示，只是存储收藏网站的域名</div>
    // <div class="del_site" onclick="delSite()">×</div>
    // </span>
    // 像上面这样的结构有多个，都包含在id="favor_sites"的div中，其中最后一个span是用来添加新
    // 网址的，所以添加的这个结构应该放在favor_sites的倒数第二个位置。
    var new_site = document.createElement("span");
    new_site.className = "site";
    var new_site_name = document.createElement("div");
    new_site_name.innerText = site_name;
    new_site_name.onclick = openSite; // 打开这个div所在的span（class="site）中的class="site_url"的div中的网址
    new_site.appendChild(new_site_name);
    var new_site_url = document.createElement("div");
    new_site_url.className = "site_url";
    new_site_url.style.display = "none";
    new_site_url.innerText = site_url;
    new_site.appendChild(new_site_url);
    var new_del_site = document.createElement("div");
    new_del_site.className = "del_site";
    new_del_site.innerText = "×";
    new_del_site.onclick = delSite;
    new_site.appendChild(new_del_site);
    var favor_sites = document.getElementById("favor_sites");
    favor_sites.insertBefore(new_site, favor_sites.lastChild);
    
    hideAddSiteWindow();
}


function delSite() {
    // 删除这个div所在的span，这个span的class="site"
    var site = this.parentNode;
    site.parentNode.removeChild(site);
}

function showAddSiteWindow() {
    // id="add_site_window"，将其改为可见
    document.getElementById("add_site_window").style.display = "block";
    // 删掉其中两个输入框中的内容
    document.getElementById("add_site_name").value = "";
    document.getElementById("add_site_url").value = "";
}

