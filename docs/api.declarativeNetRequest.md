# chrome.declarativeNetRequest 通过指定声明性规则来屏蔽或修改网络请求

> 使用 `chrome.declarativeNetRequest` API 通过声明式规则来屏蔽或修改网络请求。
> 在 Manifest V3 中，它是阻塞式 `chrome.webRequest` 的替代方案：扩展程序通过规则（而不是监听每个请求）告诉浏览器如何处理匹配的请求，浏览器可以更高效地执行。
> 该 API 需要 `declarativeNetRequest` 权限；若规则涉及主机访问，还需要对应的主机权限。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "declarativeNetRequest 展示",
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
                "id": "ruleset_1",
                "enabled": true,
                "path": "rules/block.json"
            }
        ]
    }
}
```

## 规则结构

```javascript
{
    id: 1,                       // 唯一 ID，正整数
    priority: 1,                 // 优先级，越大越优先，默认 1
    action: {
        type: "block"            // block | redirect | allow | upgradeScheme | modifyHeaders | allowAllRequests
    },
    condition: {
        urlFilter: "||ads.example.com",       // URL 过滤器
        // regexFilter: "^https://.*\\.example\\.com/",
        resourceTypes: ["script", "image", "xmlhttprequest"],
        excludedRequestDomains: ["trusted.example.com"],
        requestMethods: ["get", "post"],
        // domains / initiatorDomains / requestDomains
        // tabIds / excludedTabIds
    }
}
```

### 静态规则文件 rules/block.json
```json
[
    {
        "id": 1,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
            "urlFilter": "||ads.example.com",
            "resourceTypes": ["script", "image"]
        }
    }
]
```

## 方法

### updateDynamicRules()
> 更新动态规则（跨浏览器会话持久化）
```javascript
await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
        id: 1,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: "||tracking.example.com",
            resourceTypes: ["script", "image"]
        }
    }]
});
```

### getDynamicRules()
> 获取动态规则
```javascript
const rules = await chrome.declarativeNetRequest.getDynamicRules();
console.log(rules);
```

### updateSessionRules()
> 更新会话规则（浏览器关闭后失效）
```javascript
await chrome.declarativeNetRequest.updateSessionRules({
    addRules: [{
        id: 100,
        priority: 1,
        action: { type: "allow" },
        condition: { urlFilter: "||safe.example.com" }
    }],
    removeRuleIds: []
});
```

### getSessionRules()
> 获取会话规则
```javascript
const sessionRules = await chrome.declarativeNetRequest.getSessionRules();
```

### getEnabledRulesets() / updateEnabledRulesets()
> 查询 / 启用静态规则集
```javascript
const enabled = await chrome.declarativeNetRequest.getEnabledRulesets();
console.log("已启用的规则集:", enabled);

await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: ["ruleset_2"],
    disableRulesetIds: ["ruleset_1"]
});
```

### getMatchedRules()
> 获取已匹配的规则（需要 `declarativeNetRequestFeedback` 权限）
```javascript
const matched = await chrome.declarativeNetRequest.getMatchedRules({
    tabId: 123,
    minTimeStamp: Date.now() - 60000
});
for (const info of matched.rulesMatchedInfo) {
    console.log("规则:", info.rule.ruleId, info.tabId, info.timeStamp);
}
```

### isRegexSupported()
> 检查正则表达式是否受支持
```javascript
const result = await chrome.declarativeNetRequest.isRegexSupported({
    regex: "^https://.*\\.example\\.com/"
});
console.log("是否支持:", result.isSupported, result.reason);
```

### testMatchOutcome()
> 测试请求会匹配哪些规则
```javascript
const outcome = await chrome.declarativeNetRequest.testMatchOutcome({
    url: "https://ads.example.com/banner.png",
    type: "image",
    initiator: "https://site.example.com"
});
console.log("匹配的规则:", outcome.matchedRules);
```

## 动作类型

| 类型 | 说明 |
| ---- | ---- |
| `block` | 屏蔽请求 |
| `redirect` | 重定向请求 |
| `allow` | 允许请求（用于覆盖其他规则） |
| `upgradeScheme` | 将 http 升级为 https |
| `modifyHeaders` | 修改请求 / 响应头 |
| `allowAllRequests` | 允许某个请求及其所有子资源请求 |

### 重定向示例
```javascript
{
    id: 2,
    priority: 1,
    action: {
        type: "redirect",
        redirect: { url: "https://example.com/blocked" }
    },
    condition: { urlFilter: "||old.example.com" }
}
```

### 修改请求头示例
```javascript
{
    id: 3,
    priority: 1,
    action: {
        type: "modifyHeaders",
        requestHeaders: [
            { header: "Referer", operation: "remove" }
        ],
        responseHeaders: [
            { header: "X-Frame-Options", operation: "set", value: "SAMEORIGIN" }
        ]
    },
    condition: { urlFilter: "||example.com", resourceTypes: ["sub_frame"] }
}
```

## 事件

### onRuleMatchedDebug
> 调试用，规则匹配时触发（仅开发者模式）
```javascript
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    console.log("规则匹配:", info.rule.ruleId, info.request.url);
});
```

## 项目
> https://github.com/freewu/chrome-extension-cookbook-v3/blob/main/code/45-declarative-net-request-demo/

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest?hl=zh-cn#type-Rule
```
