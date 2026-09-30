// 面板页面脚本，可访问 chrome.devtools.*
document.getElementById("tab-id").textContent = chrome.devtools.inspectedWindow.tabId;

const output = document.getElementById("output");

function show(data) {
    output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// 获取 HAR 摘要
document.getElementById("btn-har").addEventListener("click", async () => {
    chrome.devtools.network.getHAR((harLog) => {
        const summary = harLog.entries.map((e) => ({
            method: e.request.method,
            url: e.request.url,
            status: e.response.status,
            time: Math.round(e.time)
        }));
        show({ count: summary.length, entries: summary.slice(0, 20) });
    });
});

// 获取性能指标
document.getElementById("btn-metrics").addEventListener("click", () => {
    chrome.devtools.performance.getMetrics((metrics) => {
        const obj = {};
        for (const m of metrics) {
            obj[m.name] = Math.round(m.value * 100) / 100;
        }
        show(obj);
    });
});
