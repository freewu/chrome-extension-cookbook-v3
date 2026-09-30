// chrome.declarativeContent 演示
// 目标：只有当页面满足特定条件时，才让扩展程序的 action 图标可用，
//       从而无需申请 tabs / host 权限去读取页面内容。

// 1. 安装时注册规则
chrome.runtime.onInstalled.addListener(() => {
    // 先清除旧规则，避免重复
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                // 条件：页面 URL 的 host 以 github.com 结尾
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostSuffix: "github.com" }
                    })
                ],
                // 动作：满足条件时显示 action 图标
                actions: [new chrome.declarativeContent.ShowAction()]
            },
            {
                // 条件：页面中存在 img 元素的页面（用 CSS 选择器匹配，无需读取页面）
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        css: ["img"]
                    })
                ],
                // 动作：满足条件时把图标换成另一张
                actions: [
                    new chrome.declarativeContent.SetIcon({
                        path: { 16: "images/icon.png", 128: "images/icon.png" }
                    })
                ]
            }
        ], (rules) => {
            console.log("已注册 declarativeContent 规则:", rules);
        });
    });
});

// 2. 用户点击 action 图标时，才使用 activeTab 权限注入脚本
chrome.action.onClicked.addListener(async (tab) => {
    console.log("点击 action，当前页面:", tab.url);

    // 只有满足规则（图标可用）时才会触发
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            alert("这是通过 activeTab + scripting 注入的脚本！\n当前页面标题: " + document.title);
        }
    });
});

// 3. 监听规则匹配（PageStateMatcher 变化）
chrome.declarativeContent.onPageChanged.addRules([], (rules) => {
    console.log("当前 declarativeContent 规则:", rules);
});
