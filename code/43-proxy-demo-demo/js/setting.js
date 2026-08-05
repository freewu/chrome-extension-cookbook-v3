// get-btn 点击事件
document.getElementById("get-btn").addEventListener("click", function() {
    chrome.proxy.settings.get({}, function(details) {
        console.log("当前 proxy 设置:",details);
        document.getElementById("result-container").value = "当前 proxy 设置:" + JSON.stringify(details, null, 2);
    });
});

// clear-btn 点击事件
document.getElementById("clear-btn").addEventListener("click", function() {
    chrome.proxy.settings.clear({}, function() {
        console.log("proxy 设置已清除");
        document.getElementById("result-container").value = "proxy 设置已清除";
    });
});

// set-btn 点击事件
document.getElementById("set-btn").addEventListener("click", function() {
    const proxySettings = { // 参看 redadme 中的示例
        "mode": "fixed_servers",
        "rules": {
            "proxyForHttp": {
                "scheme": "socks5",
                "host": "1.2.3.4",
                "port": 1080
            },
            "bypassList": ["foobar.com"]
        }
    };
    console.log("要设置的 proxy 设置:", proxySettings); 
    chrome.proxy.settings.set({value: proxySettings}, function() {
        console.log("proxy 设置已设置");
        document.getElementById("result-container").value = "proxy 设置已设置";
    });
});