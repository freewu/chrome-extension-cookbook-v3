// LeetCode 助手 - 后台 Service Worker
// 作用：根据当前标签页是否为 LeetCode，动态启用 / 禁用工具栏图标，
//       从而保证扩展「只在 leetcode.cn / leetcode.com 生效」。

const LEETCODE_URL = /^https?:\/\/([a-z0-9-]+\.)*leetcode\.(cn|com)(\/|$)/i;

// 根据标签页 URL 启用或禁用图标
async function syncAction(tabId, url) {
    try {
        if (url && LEETCODE_URL.test(url)) {
            await chrome.action.enable(tabId);
            await chrome.action.setTitle({ tabId, title: "LeetCode 助手" });
        } else {
            await chrome.action.disable(tabId);
            await chrome.action.setTitle({ tabId, title: "LeetCode 助手（仅在 LeetCode 生效）" });
        }
    } catch (error) {
        // 标签页可能已关闭，忽略即可
    }
}

// 标签页激活时同步
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    try {
        const tab = await chrome.tabs.get(tabId);
        await syncAction(tabId, tab.url);
    } catch (error) {
        // ignore
    }
});

// 标签页 URL / 加载状态变化时同步
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" || changeInfo.url) {
        syncAction(tabId, tab.url);
    }
});

// LeetCode 是单页应用（SPA），站内跳转不会触发 tabs.onUpdated，
// 这里用 webNavigation 捕获 history.pushState 产生的 URL 变化。
chrome.webNavigation.onHistoryStateUpdated.addListener(({ tabId, url }) => {
    syncAction(tabId, url);
});

// 安装（或更新）时，遍历所有已打开标签页初始化一次
chrome.runtime.onInstalled.addListener(async () => {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        await syncAction(tab.id, tab.url);
    }
});
