// 点击扩展图标，在新标签页打开 Magic Tools
chrome.action.onClicked.addListener(async () => {
    const url = chrome.runtime.getURL("pages/index.html");
    // 如果已经打开则聚焦，否则新建
    const tabs = await chrome.tabs.query({ url });
    if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id, { active: true });
        await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
        await chrome.tabs.create({ url });
    }
});
