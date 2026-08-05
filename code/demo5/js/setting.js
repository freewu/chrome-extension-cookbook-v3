// 返回扩展程序的当前侧边栏行为
document.getElementById("get-behavior-btn").addEventListener("click", () => {
    chrome.sidePanel.getPanelBehavior().then((behavior) => {
        console.log("当前侧边栏行为: ", behavior);
        console.log("PanelBehavior.openPanelOnActionClick: ", behavior.openPanelOnActionClick); // 点击扩展程序的图标是否会切换侧边栏中扩展程序条目的显示状态。默认值为 false。 
        document.getElementById("result-container").textContent = "当前侧边栏行为: " + JSON.stringify(behavior, null, 2);
    }).catch((error) => {
        console.error("获取侧边栏行为失败: " + error);
        document.getElementById("result-container").textContent = "获取侧边栏行为失败: " + error.message;
    });
});

// 返回有效面板配置
document.getElementById("get-options-btn").addEventListener("click", () => {
    chrome.sidePanel.getOptions({
        // tabId: chrome.runtime.id // 如果指定，则返回指定标签页的侧边栏选项。否则，返回默认的侧边栏选项（用于没有任何特定设置的任何标签页）
    }).then((config) => {
        console.log("有效面板配置: ", config);
        console.log("PanelOptions.enabled: ", config.enabled); // 侧边栏是否应处于启用状态。您可以选择是否创建 PIN 码。默认值为 true
        console.log("PanelOptions.path: ", config.path); // 要使用的侧边栏 HTML 文件的路径。这必须是扩展程序包中的本地资源。
        console.log("PanelOptions.tabId: ", config.tabId); // 如果指定了此 ID，侧边栏选项将仅适用于具有此 ID 的标签页。如果省略，这些选项会设置默认行为（用于没有任何特定设置的任何标签页）。注意：如果为相应 tabId 和默认 tabId 设置了相同的路径，则相应 tabId 的面板将是与默认 tabId 的面板不同的实例。
        document.getElementById("result-container").textContent = "有效面板配置: " + JSON.stringify(config, null, 2);
    }).catch((error) => {
        console.error("获取有效面板配置失败: " + error);
        document.getElementById("result-container").textContent = "获取有效面板配置失败: " + error.message;
    });
});

// 返回侧边栏的当前布局
document.getElementById("get-layout-btn").addEventListener("click", () => {
    chrome.sidePanel.getLayout().then((layout) => {
        console.log("当前侧边栏布局: ", layout);
        console.log("PanelLayout.side: ", layout.side); // 定义浏览器界面中侧边栏的可能对齐方式 left | right 
        document.getElementById("result-container").textContent = "当前侧边栏布局: " + JSON.stringify(layout, null, 2);
    }).catch((error) => {
        console.error("获取侧边栏布局失败: " + error);
        document.getElementById("result-container").textContent = "获取侧边栏布局失败: " + error.message;
    });
});

// 打开扩展程序的侧边栏。此方法只能在响应用户操作时调用。
document.getElementById("open-btn").addEventListener("click", async () => {
    // 获取当前的 tabId
    let tabId = await chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        console.log("当前活动标签页: ", tabs[0]);
        console.log("当前活动标签页的 ID: ", tabs[0].id);
        return tabs[0].id;
    });
    chrome.sidePanel.open({
        tabId: tabId, // 用于打开侧边栏的标签页。如果相应标签页具有特定于该标签页的侧边栏，则该侧边栏仅会针对该标签页打开。如果没有特定于标签页的面板，则全局面板将在指定标签页以及当前未打开任何特定于标签页的面板的其他标签页中打开。此操作会替换相应标签页中当前处于活动状态的任何侧边栏（全局或特定于标签页）。必须提供此参数或 windowId 中的至少一个。
        // windowId: 0 // 于打开侧边栏的窗口。仅当扩展程序具有全局（非标签页专用）侧边栏或还指定了 tabId 时，此属性才适用。此操作会替换用户在指定窗口中打开的任何当前处于活动状态的全局侧边栏。必须提供此参数或 tabId 中的至少一个
    }).then(() => {
        console.log("侧边栏已打开");
        document.getElementById("result-container").textContent = "侧边栏已打开";
    }).catch((error) => {
        console.error("打开侧边栏失败: " + error);
        document.getElementById("result-container").textContent = "打开侧边栏失败: " + error.message;
    });
});

// 设置面板的配置选项为百度
document.getElementById("set-baidu-option-btn").addEventListener("click", async () => {
    chrome.sidePanel.setOptions({
        enabled: true, // 侧边栏是否应处于启用状态。您可以选择是否创建 PIN 码。默认值为 true
        path: "pages/sidepanel-baidu.html", // 要使用的侧边栏 HTML 文件的路径。这必须是扩展程序包中的本地资源。
        // tabId: 0 // 如果指定了此 ID，侧边栏选项将仅适用于具有此 ID 的标签页。如果省略，这些选项会设置默认行为（用于没有任何特定设置的任何标签页）。注意：如果为相应 tabId 和默认 tabId 设置了相同的路径，则相应 tabId 的面板将是与默认 tabId 的面板不同的实例。
    }).then(() => {
        console.log("侧边栏已设置为 pages/sidepanel-baidu.html");
        document.getElementById("result-container").textContent = "侧边栏已设置为 pages/sidepanel-baidu.html";
    }).catch((error) => {
        console.error("设置侧边栏为 pages/sidepanel-baidu.html 失败: " + error);
        document.getElementById("result-container").textContent = "设置侧边栏为 pages/sidepanel-baidu.html 失败: " + error.message;
    });
});
document.getElementById("set-main-option-btn").addEventListener("click", async () => {
    chrome.sidePanel.setOptions({
        enabled: true, // 侧边栏是否应处于启用状态。您可以选择是否创建 PIN 码。默认值为 true
        path: "pages/sidepanel-main.html", // 要使用的侧边栏 HTML 文件的路径。这必须是扩展程序包中的本地资源。
        // tabId: 0 // 如果指定了此 ID，侧边栏选项将仅适用于具有此 ID 的标签页。如果省略，这些选项会设置默认行为（用于没有任何特定设置的任何标签页）。注意：如果为相应 tabId 和默认 tabId 设置了相同的路径，则相应 tabId 的面板将是与默认 tabId 的面板不同的实例。
    }).then(() => {
        console.log("侧边栏已设置为 pages/sidepanel-main.html");
        document.getElementById("result-container").textContent = "侧边栏已设置为 pages/sidepanel-main.html";
    }).catch((error) => {
        console.error("设置侧边栏为 pages/sidepanel-main.html 失败: " + error);
        document.getElementById("result-container").textContent = "设置侧边栏为 pages/sidepanel-main.html 失败: " + error.message;  
    });
});
document.getElementById("set-welcome-option-btn").addEventListener("click", async () => {
    chrome.sidePanel.setOptions({
        enabled: true, // 侧边栏是否应处于启用状态。您可以选择是否创建 PIN 码。默认值为 true
        path: "pages/sidepanel-welcome.html", // 要使用的侧边栏 HTML 文件的路径。这必须是扩展程序包中的本地资源。
        // tabId: 0 // 如果指定了此 ID，侧边栏选项将仅适用于具有此 ID 的标签页。如果省略，这些选项会设置默认行为（用于没有任何特定设置的任何标签页）。注意：如果为相应 tabId 和默认 tabId 设置了相同的路径，则相应 tabId 的面板将是与默认 tabId 的面板不同的实例。
    }).then(() => {
        console.log("侧边栏已设置为 pages/sidepanel-welcome.html");
        document.getElementById("result-container").textContent = "侧边栏已设置为 pages/sidepanel-welcome.html";
    }).catch((error) => {
        console.error("设置侧边栏为 pages/sidepanel-welcome.html 失败: " + error);
        document.getElementById("result-container").textContent = "设置侧边栏为 pages/sidepanel-welcome.html 失败: " + error.message;   
    });
});