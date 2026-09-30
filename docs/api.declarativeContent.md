# chrome.declarativeContent 根据网页内容执行操作，而无需读取网页内容的权限

> 使用 `chrome.declarativeContent` API 根据页面的状态（URL、CSS 选择器、是否包含某元素等）**声明式地**执行操作，而无需申请 `tabs` 或主机权限去读取页面内容。
> 最典型的用法是：只有当页面满足条件时，才让扩展程序的 action 图标变为可用。
> 该 API 需要 `declarativeContent` 权限；若使用 `ShowAction`，还需要 `activeTab`。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "declarativeContent 展示",
    "permissions": [
        "declarativeContent",
        "activeTab"
    ],
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## 规则组成

`chrome.declarativeContent` 的规则由以下部分组成：

- **条件（Condition）**：`PageStateMatcher`、`RequestContentScript` 等
- **操作（Action）**：`ShowAction`、`SetIcon`、`RequestContentScript` 等

```javascript
{
    conditions: [ new chrome.declarativeContent.PageStateMatcher({...}) ],
    actions: [ new chrome.declarativeContent.ShowAction() ]
}
```

## PageStateMatcher

用于匹配页面状态：

```javascript
new chrome.declarativeContent.PageStateMatcher({
    pageUrl: { hostEquals: "example.com" },     // 匹配 URL
    css: ["img.banner"],                          // 匹配 CSS 选择器（页面中存在该元素）
    // pageUrl 支持:
    // urlEquals, urlContains, urlMatches / originAndPathMatches,
    // hostEquals, hostContains, hostPrefix, hostSuffix, hostMatches,
    // scheme, pathEquals, pathContains, pathPrefix, pathSuffix, pathMatches,
    // queryEquals, queryContains, queryPrefix, querySuffix, queryMatches,
    // ports, isBookmarked
});
```

## 操作

### ShowAction
> 当条件满足时显示扩展程序的 action 图标（配合 `openPanelOnActionClick` 等）
```javascript
new chrome.declarativeContent.ShowAction()
```

### SetIcon
> 当条件满足时切换图标
```javascript
new chrome.declarativeContent.SetIcon({
    path: { 16: "images/icon16.png", 32: "images/icon32.png" },
    // imageData: { ... }
})
```

### RequestContentScript
> 请求注入内容脚本（仅开发者模式可用）
```javascript
new chrome.declarativeContent.RequestContentScript({
    js: ["js/content-script.js"],
    // css: ["css/content.css"]
})
```

## 事件

### onPageChanged
> 当页面状态变化、满足 / 不满足规则时触发。在 Service Worker 启动时注册规则即可
```javascript
chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostSuffix: "github.com" }
                })
            ],
            actions: [ new chrome.declarativeContent.ShowAction() ]
        }]);
    });
});
```

### 动态增删规则
```javascript
// 添加规则，返回规则 ID
chrome.declarativeContent.onPageChanged.addRules([rule], (rules) => {
    console.log("已添加规则:", rules);
});

// 删除指定规则
chrome.declarativeContent.onPageChanged.removeRules(["rule-id"], () => {
    console.log("已删除规则");
});

// 删除所有规则
chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    console.log("已删除全部规则");
});

// 获取规则
chrome.declarativeContent.onPageChanged.getRules((rules) => {
    console.log(rules);
});
```

## 使用示例：仅在特定网站启用图标

```javascript
chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: "developer.chrome.com" }
                })
            ],
            actions: [ new chrome.declarativeContent.ShowAction() ]
        }]);
    });
});

// 用户点击图标时才使用 activeTab 权限
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => console.log("仅在用户点击后执行")
    });
});
```

## 项目
> https://github.com/freewu/chrome-extension-cookbook-v3/blob/main/code/46-declarative-content-demo/

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/declarativeContent?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/declarativeContent
```
