# 声明式网络请求 展示 (chrome.declarativeNetRequest)

> 使用 chrome.declarativeNetRequest API 通过指定声明性规则来屏蔽或修改网络请求

> 自 Manifest V3 开始，阻塞式 webRequest 仅对政策安装的扩展程序开放，普通扩展程序应使用 declarativeNetRequest。
> 扩展程序不再需要监听每一个请求，而是把「规则」交给浏览器，由浏览器高效执行匹配与拦截。

## 权限

- declarativeNetRequest

    使用 declarativeNetRequest API 的核心权限。

- declarativeNetRequestFeedback

    仅在开发者模式 / 调试时使用，用于接收 onRuleMatchedDebug 事件、调用 getMatchedRules。

- declarativeNetRequestWithHostAccess

    可选权限，允许在拥有主机权限时修改请求（如 modifyHeaders、redirect）。

- host_permissions

    规则若要作用于目标站点，需要对应的主机权限。

## manifest.json 配置

```json
{
    "permissions": [
        "declarativeNetRequest",
        "declarativeNetRequestFeedback"
    ],
    "host_permissions": [
        "<all_urls>"
    ],
    "declarative_net_request": {
        "rule_resources": [
            {
                "id": "ruleset_block_ads",
                "enabled": false,
                "path": "rules/block-ads.json"
            }
        ]
    }
}
```

- `enabled: false` 表示安装后默认不启用该规则集，可在运行时通过 `updateEnabledRulesets()` 动态启用。

## rules/block-ads.json

```json
[
    {
        "id": 1,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
            "urlFilter": "||doubleclick.net",
            "resourceTypes": ["script", "image", "xmlhttprequest", "sub_frame"]
        }
    }
]
```

## 规则组成

- `id`：规则唯一 ID（正整数）
- `priority`：优先级，数值越大越优先
- `action`：动作类型 `block | redirect | allow | upgradeScheme | modifyHeaders | allowAllRequests`
- `condition`：匹配条件，常用 `urlFilter` / `regexFilter` / `resourceTypes` / `requestDomains` 等

## methods 演示

### 启用 / 停用静态规则集

```js
await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: ["ruleset_block_ads"]
});
await chrome.declarativeNetRequest.updateEnabledRulesets({
    disableRulesetIds: ["ruleset_block_ads"]
});
```

### 动态规则（跨会话持久化）

```js
await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2001],
    addRules: [{
        id: 2001,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: "||example-block.com", resourceTypes: ["script"] }
    }]
});
const rules = await chrome.declarativeNetRequest.getDynamicRules();
```

### 会话规则（浏览器关闭即失效）

```js
await chrome.declarativeNetRequest.updateSessionRules({
    addRules: [{
        id: 1001,
        priority: 1,
        action: { type: "upgradeScheme" },
        condition: { urlFilter: "http://*", resourceTypes: ["main_frame"] }
    }]
});
```

### 测试匹配 / 查看匹配

```js
const outcome = await chrome.declarativeNetRequest.testMatchOutcome({
    url: "https://doubleclick.net/ad.js",
    type: "script",
    initiator: "https://example.com"
});
console.log(outcome.matchedRules);

// 需要 declarativeNetRequestFeedback 权限
const matched = await chrome.declarativeNetRequest.getMatchedRules({});
console.log(matched.rulesMatchedInfo);
```

## 效果

1. 在扩展管理页加载本 demo（开发者模式）。
2. 点击工具栏图标打开 popup。
3. 点击「启用广告规则集」，然后访问包含 doubleclick.net 的页面，观察请求被拦截。
4. 在 `chrome://extensions` 打开 Service Worker 控制台，可看到 onRuleMatchedDebug 日志。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/declarativeNetRequest
```
