// 获取徽章 (badge) 的背景颜色
document.getElementById("get-badge-background-color-btn").addEventListener("click", function() {
    chrome.action.getBadgeBackgroundColor({
        // tabId: chrome.runtime.id, // 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
    }, function(color) {
        console.log("徽章背景颜色:", color); // [number, number, number, number] RGBA 数组
        document.getElementById("result-container").value = "徽章背景颜色:" +JSON.stringify(color,null,2);
    });
});

// 获取徽章文本。如果未指定任何标签页，则返回非标签页特定的徽章文字。
// 如果启用了 displayActionCountAsBadgeText，则除非存在 declarativeNetRequestFeedback 权限或提供了标签页专用徽章文本，否则系统会返回占位文本。
document.getElementById("get-badge-text-btn").addEventListener("click", function() {
    chrome.action.getBadgeText({
        // tabId: chrome.runtime.id, // 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
    }, function(text) {
        console.log("徽章文本:", text);
        document.getElementById("result-container").value = "徽章文本:" +  text;
    });
});

// 获取徽章文字颜色
document.getElementById("get-badge-text-color-btn").addEventListener("click", function() {
    chrome.action.getBadgeTextColor({
        // tabId: chrome.runtime.id, // 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
    }, function(color) {
        console.log("徽章文字颜色:", color);
        document.getElementById("result-container").value = "徽章文字颜色:" +JSON.stringify(color,null,2);
    });
});

// 停用标签页的操作
document.getElementById("disable-btn").addEventListener("click", function() {
    chrome.action.disable(
        // tabId: chrome.runtime.id, // 要停用操作的标签页的 ID。如果未指定任何标签页，则停用所有标签页的操作。
    ).then(() => {
        console.log("操作已停用");
        document.getElementById("result-container").value = "操作已停用";
    }).catch((error) => {
        console.error("停用操作时出错:", error);
        document.getElementById("result-container").value = "停用操作时出错:" + error.message;
    });
});

// 启用标签页的操作
document.getElementById("enable-btn").addEventListener("click", function() {
    chrome.action.enable(
        // tabId: chrome.runtime.id, // 要启用操作的标签页的 ID。如果未指定任何标签页，则启用所有标签页的操作。
    ).then(() => {
        console.log("操作已启用");
        document.getElementById("result-container").value = "操作已启用";
    }).catch((error) => {
        console.error("启用操作时出错:", error);
        document.getElementById("result-container").value = "启用操作时出错:" + error.message;
    });
});

// 获取 action 的标题
document.getElementById("get-title-btn").addEventListener("click", function() {
    chrome.action.getTitle({
        // tabId: chrome.runtime.id, // 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
    }, function(title) {
        console.log("操作标题:", title);
        document.getElementById("result-container").value = "操作标题:" +  title;
    });
});

// 返回与扩展程序操作相关的用户指定设置
document.getElementById("get-setting-btn").addEventListener("click", function() {
    chrome.action.getUserSettings(function(setting) {
        console.log("操作设置:", setting); 
        console.log("UserSettings.isOnToolbar:", setting.isOnToolbar); // isOnToolbar扩展程序的 action 图标是否显示在浏览器窗口的顶级工具栏上（即，用户是否已“固定”该扩展程序）
        document.getElementById("result-container").value = "操作设置:" +JSON.stringify(setting,null,2);
    });
});

// 指示扩展程序操作是否已针对某个标签页启用（如果未提供 tabId，则表示已全局启用）。仅使用 declarativeContent 启用的操作始终返回 false。
document.getElementById("is-enabled-btn").addEventListener("click", function() {
    chrome.action.isEnabled(
        // tabId: chrome.runtime.id, // 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态
    ).then((enabled) => {
        console.log("action 是否已启用:", enabled);
        document.getElementById("result-container").value = "action是否已启用:" +  enabled;
    }).catch((error) => {
        console.error("查询 action 是否已启用时出错:", error);
        document.getElementById("result-container").value = "查询 action 是否已启用时出错:" + error.message;    
    });
});

// 打开扩展程序的弹出式窗口。在 Chrome 118 和 Chrome 126 之间，此功能仅适用于根据政策安装的扩展程序
document.getElementById("open-popup-btn").addEventListener("click", function() {
    chrome.action.openPopup({
        // windowId: chrome.windows.WINDOW_ID_CURRENT, // 要在其中打开操作弹出式窗口的窗口的 ID。如果未指定，则默认为当前活跃窗口。
    }).then(() => {
        console.log("弹出式窗口已打开");
        document.getElementById("result-container").value = "弹出式窗口已打开";
    }).catch((error) => {
        console.error("打开弹出式窗口时出错:", error);
        document.getElementById("result-container").value = "打开弹出式窗口时出错:" + error.message;
    });
});

// 设置徽章的背景颜色
document.getElementById("set-badge-background-color-btn").addEventListener("click", function() {
    const color = document.getElementById("badge-background-color-input").value;
    if (!color) {
        document.getElementById("result-container").value = "请输入徽章背景颜色";
        return;
    }
    chrome.action.setBadgeBackgroundColor({
        color: color, // 一个包含四个整数的数组，这些整数的范围为 [0,255]，用于构成徽章的 RGBA 颜色。例如，不透明的红色为 [255, 0, 0, 255]。也可以是具有 CSS 值的字符串，其中不透明的红色为 #FF0000 或 #F00
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        console.log("徽章背景颜色已设置");
        document.getElementById("result-container").value = "徽章背景颜色已设置:" + color;
    }).catch((error) => {
        console.error("设置徽章背景颜色时出错:", error);
        document.getElementById("result-container").value = "设置徽章背景颜色时出错:" + error.message;
    });
});

// 设置徽章的文本
document.getElementById("set-badge-text-btn").addEventListener("click", function() {
    const text = document.getElementById("badge-text-input").value;
    if (!text) {
        document.getElementById("result-container").value = "请输入徽章文本";
        return;
    }
    chrome.action.setBadgeText({
        text: text, // 要设置为徽章的文本。如果为空字符串，则清除徽章。
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        console.log("徽章文本已设置");
        document.getElementById("result-container").value = "徽章文本已设置: " + text;
    }).catch((error) => {
        console.error("设置徽章文本时出错:", error);
        document.getElementById("result-container").value = "设置徽章文本时出错:" + error.message;
    });
});

//  设置徽章的文字颜色
document.getElementById("set-badge-text-color-btn").addEventListener("click", function() {
    const color = document.getElementById("badge-text-color-input").value;
    if (!color) {
        document.getElementById("result-container").value = "请输入徽章文本颜色";
        return;
    }
    chrome.action.setBadgeTextColor({
        color: color, // 一个包含四个整数的数组，这些整数的范围为 [0,255]，用于构成徽章的 RGBA 颜色。例如，不透明的红色为 [255, 0, 0, 255]。也可以是具有 CSS 值的字符串，其中不透明的红色为 #FF0000 或 #F00
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        console.log("徽章文本颜色已设置");
        document.getElementById("result-container").value = "徽章文本颜色已设置:" + color;
    }).catch((error) => {
        console.error("设置徽章文本颜色时出错:", error);
        document.getElementById("result-container").value = "设置徽章文本颜色时出错:" + error.message;
    });
});

// 设置 HTML 文档，以便在用户点击操作的图标时将其作为弹出式窗口打开
document.getElementById("set-popup-btn").addEventListener("click", function() {
    chrome.action.setPopup({
        popup: "pages/action.html", // 要设置为弹出式窗口的 HTML 文件的路径。如果为空字符串，则清除弹出式窗口。
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        console.log("action 弹出式窗口已设置");
        document.getElementById("result-container").value = "action 弹出式窗口已设置: popup.html";
    }).catch((error) => {
        console.error("设置 action 弹出式窗口时出错:", error);
        document.getElementById("result-container").value = "设置 action 弹出式窗口时出错:" + error.message;
    });
});
document.getElementById("set-popup1-btn").addEventListener("click", function() {
    chrome.action.setPopup({
        popup: "pages/action1.html", // 要设置为弹出式窗口的 HTML 文件的路径。如果为空字符串，则清除弹出式窗口。
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        console.log("action1 弹出式窗口已设置");
        document.getElementById("result-container").value = "action1 弹出式窗口已设置: popup1.html";
    }).catch((error) => {
        console.error("设置 action1 弹出式窗口时出错:", error);
        document.getElementById("result-container").value = "设置 action1 弹出式窗口时出错:" + error.message;
    });
});

// 为操作设置图标。图标可以指定为图片文件的路径、画布元素的像素数据，也可以指定为包含其中任一信息的字典。必须指定 path 或 imageData 属性。
document.getElementById("set-icon-btn").addEventListener("click", function() {
    chrome.action.setIcon({
        path: "../images/icon.png", // 要设置为操作图标的图片文件的路径。如果为空字符串，则清除图标。
        // imageData: {} // 要设置的图标，可以是 ImageData 对象，也可以是表示图标的字典 {size -> ImageData}。如果图标指定为字典，则会根据屏幕的像素密度选择要使用的实际图片。
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        console.log("action 图标已设置");
        document.getElementById("result-container").value = "action 图标已设置: icon.png";
    }).catch((error) => {
        if (chrome.runtime.lastError) {
            console.error("设置 action 图标时出错:", chrome.runtime.lastError);
            document.getElementById("result-container").value = "设置 action 图标时出错:" + chrome.runtime.lastError.message;
            return;
        }
        console.error("设置 action 图标时出错:", error);
        document.getElementById("result-container").value = "设置 action 图标时出错:" + error.message;
    });
});
document.getElementById("set-icon1-btn").addEventListener("click", function() {
    chrome.action.setIcon({
        path: "../images/icon1.png", // 要设置为操作图标的图片文件的路径。如果为空字符串，则清除图标。
        // imageData: imageData, // 要设置为操作图标的画布元素的像素数据。如果为空字符串，则清除图标。
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        if (chrome.runtime.lastError) {
            console.error("设置 action1 图标时出错:", chrome.runtime.lastError);
            document.getElementById("result-container").value = "设置 action1 图标时出错:" + chrome.runtime.lastError.message;
            return;
        }
        console.log("action1 图标已设置");
        document.getElementById("result-container").value = "action1 图标已设置: icon1.png";
    }).catch((error) => {
        console.error("设置 action1 图标时出错:", error);
        document.getElementById("result-container").value = "设置 action1 图标时出错:" + error.message;
    });
});

// clear-badge-btn
document.getElementById("clear-badge-btn").addEventListener("click", function() {
    chrome.action.setBadgeText({
        text: "", // 要设置为操作徽章的文本。如果为空字符串，则清除徽章。
        // tabId: chrome.runtime.id, // 要设置状态的标签页的 ID。如果未指定任何标签页，则设置所有标签页的状态。
    }).then(() => {
        console.log("action 徽章已清除");
        document.getElementById("result-container").value = "action 徽章已清除";
    }).catch((error) => {
        console.error("清除 action 徽章时出错:", error);
        document.getElementById("result-container").value = "清除 action 徽章时出错:" + error.message;
    });
});
