// 点击 action 图标打开 popup（pages/action.html）
// background.js 仅用于注册会话规则示例

// 扩展安装时添加一条会话规则：把 http 升级为 https
chrome.runtime.onInstalled.addListener(async () => {
    await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [
            {
                id: 1001,
                priority: 1,
                action: { type: "upgradeScheme" },
                condition: {
                    urlFilter: "http://*",
                    resourceTypes: ["main_frame", "sub_frame"]
                }
            }
        ],
        removeRuleIds: [1001]
    });
    console.log("已注册会话规则 upgradeScheme");
});

// 调试：规则匹配时输出日志（需要 declarativeNetRequestFeedback 权限）
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    console.log("[onRuleMatchedDebug] 规则匹配:", info.rule.ruleId, info.request.url);
});
