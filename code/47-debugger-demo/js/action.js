const resultEl = document.getElementById("result");

function show(data) {
    resultEl.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

// 附加调试器
document.getElementById("attach").addEventListener("click", async () => {
    const tab = await getCurrentTab();
    if (!tab) {
        show("未找到当前标签页");
        return;
    }
    try {
        await chrome.debugger.attach({ tabId: tab.id }, "1.3");
        show("已附加到标签页: " + tab.id + "\n（页面顶部会出现调试提示条）");
    } catch (error) {
        show("附加失败: " + error.message);
    }
});

// 分离调试器
document.getElementById("detach").addEventListener("click", async () => {
    const tab = await getCurrentTab();
    try {
        await chrome.debugger.detach({ tabId: tab.id });
        show("已分离");
    } catch (error) {
        show("分离失败: " + error.message);
    }
});

// 获取可附加目标
document.getElementById("targets").addEventListener("click", async () => {
    const targets = await chrome.debugger.getTargets();
    show({ targets });
});

// 发送 CDP 命令
document.getElementById("send").addEventListener("click", async () => {
    const tab = await getCurrentTab();
    const method = document.getElementById("method").value.trim();
    let params = {};
    try {
        params = JSON.parse(document.getElementById("params").value || "{}");
    } catch (e) {
        show("参数不是合法 JSON: " + e.message);
        return;
    }
    try {
        const result = await chrome.debugger.sendCommand({ tabId: tab.id }, method, params);
        show({ method, result });
    } catch (error) {
        show("命令执行失败: " + error.message + "\n请先点击「附加到当前标签页」");
    }
});
