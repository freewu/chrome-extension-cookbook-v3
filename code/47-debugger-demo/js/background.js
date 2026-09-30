// chrome.debugger 演示
// 附加调试器后，可以像 DevTools 一样发送 CDP 命令。

// 调试器被分离时（例如用户点击取消、DevTools 打开同一标签页）
chrome.debugger.onDetach.addListener((source, reason) => {
    console.log("[onDetach] 调试器已分离:", source, "原因:", reason);
});

// 接收调试目标发出的 CDP 事件
chrome.debugger.onEvent.addListener((source, method, params) => {
    console.log("[onEvent] 来自标签页", source.tabId, "的事件:", method, params);
});
