// 检索扩展程序对无痕模式的访问权限状态。此设置对应于用户控制的“允许在无痕模式下运行”扩展程序级设置，可通过 chrome://extensions 页面设置
document.getElementById('is-allowed-incognito-access-btn').addEventListener('click', function () {
    chrome.extension.isAllowedIncognitoAccess(function (isAllowed) {
        console.log('扩展程序是否允许在无痕模式下运行：', isAllowed);
        document.getElementById('result-container').value = "扩展程序是否允许在无痕模式下运行：" + isAllowed;
    });
});

// 检索扩展程序对“file://”方案的访问状态。此设置对应于用户控制的“允许访问文件网址”设置，可通过 chrome://extensions 页面设置
document.getElementById('is-allowed-file-access-btn').addEventListener('click', function () {
    chrome.extension.isAllowedFileSchemeAccess(function (isAllowed) {
        console.log('扩展程序是否允许访问“file://”方案：', isAllowed);
        document.getElementById('result-container').value = "扩展程序是否允许访问“file://”方案：" + isAllowed;
    });
});

// 返回一个 JavaScript“window”对象数组，其中包含当前扩展程序中运行的每个网页。
document.getElementById('get-views-btn').addEventListener('click', function () {
    let fetchProperties = {
        // tabId: 123, // 可选 根据标签页 ID 查找视图。如果省略此字段，则返回所有视图。
        // windowId: 123, // 可选 限制搜索范围的窗口。如果省略，则返回所有视图。
        // type: 'popup', // 要获取的视图的类型。如果省略，则返回所有视图（包括后台网页和标签页）。 popup | tab
    };
    let views = chrome.extension.getViews(fetchProperties);
    console.log('当前扩展程序中运行的每个网页：', views);
    // or: Converting circular structure to JSON
    //document.getElementById('result-container').value = "当前扩展程序中运行的每个网页：" + JSON.stringify(views);
    document.getElementById('result-container').value = "当前扩展程序中运行的每个网页(看 console 输出 )";
});

// 返回在当前扩展程序内运行的后台网页的 JavaScript“window”对象。如果扩展程序没有背景页面，则返回 null。 V2 才有的概念吧
document.getElementById('get-background-page-btn').addEventListener('click', function () {
    let backgroundPage = chrome.extension.getBackgroundPage();
    console.log('当前扩展程序的背景页面：', backgroundPage);
    document.getElementById('result-container').value = "当前扩展程序的背景页面：" + backgroundPage;
});

// 设置扩展程序更新网址中使用的 ap CGI 参数的值。对于托管在 Chrome 扩展程序库中的扩展程序，系统会忽略此值。 目前不知道有啥用
document.getElementById('set-update-url-param-btn').addEventListener('click', function () {
    try {
        chrome.extension.setUpdateUrlData("bluefrog");
    } catch (error) {
        console.log('设置扩展程序更新网址中使用的 ap CGI 参数的值失败：', error);
        document.getElementById('result-container').value = "设置扩展程序更新网址中使用的 ap CGI 参数的值失败：" + error;
        return;
    }
    document.getElementById('result-container').value = "设置扩展程序更新网址中使用的 ap CGI 参数的值为: bluefrog"; 
});