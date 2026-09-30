const resultEl = document.getElementById("result");

function show(data) {
    resultEl.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// 启用静态规则集
document.getElementById("enable-ruleset").addEventListener("click", async () => {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ["ruleset_block_ads"]
    });
    show("已启用静态规则集 ruleset_block_ads");
});

// 停用静态规则集
document.getElementById("disable-ruleset").addEventListener("click", async () => {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ["ruleset_block_ads"]
    });
    show("已停用静态规则集 ruleset_block_ads");
});

// 查看已启用规则集
document.getElementById("list-rulesets").addEventListener("click", async () => {
    const ids = await chrome.declarativeNetRequest.getEnabledRulesets();
    show({ enabledRulesets: ids });
});

// 添加动态规则
document.getElementById("add-dynamic").addEventListener("click", async () => {
    const urlFilter = document.getElementById("url-filter").value.trim();
    if (!urlFilter) {
        show("请输入 URL 关键字");
        return;
    }
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [2001],
        addRules: [
            {
                id: 2001,
                priority: 1,
                action: { type: "block" },
                condition: {
                    urlFilter: urlFilter,
                    resourceTypes: ["script", "image", "xmlhttprequest"]
                }
            }
        ]
    });
    show("已添加动态规则: " + urlFilter);
});

// 查看动态规则
document.getElementById("list-dynamic").addEventListener("click", async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    show({ dynamicRules: rules });
});

// 清空动态规则
document.getElementById("clear-dynamic").addEventListener("click", async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map((r) => r.id)
    });
    show("已清空动态规则");
});

// 测试匹配
document.getElementById("test-match").addEventListener("click", async () => {
    const url = document.getElementById("test-url").value.trim();
    if (!url) {
        show("请输入测试 URL");
        return;
    }
    const outcome = await chrome.declarativeNetRequest.testMatchOutcome({
        url: url,
        type: "script",
        initiator: "https://example.com"
    });
    show(outcome);
});
