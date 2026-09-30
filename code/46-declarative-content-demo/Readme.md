# 声明式内容 展示 (chrome.declarativeContent)

> 使用 chrome.declarativeContent API 根据网页内容执行操作，而无需读取网页内容的权限

> 传统做法需要申请 tabs 或 host 权限去读取页面 URL / DOM，然后在后台判断。
> declarativeContent 让你用「声明式规则」描述页面条件，由浏览器负责匹配，从而避免申请敏感权限。

## 权限

- declarativeContent

    使用 declarativeContent API 的核心权限。

- activeTab

    当用户点击 action 图标时，临时授予当前标签页的主机权限，用于执行注入等操作。

- scripting

    配合 activeTab 注入脚本（本 demo 演示）。

## manifest.json 配置

```json
{
    "permissions": [
        "declarativeContent",
        "activeTab",
        "scripting"
    ],
    "action": {
        "default_title": "声明式内容 展示",
        "default_icon": "images/icon.png"
    },
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## 规则组成

```js
chrome.declarativeContent.onPageChanged.addRules([
    {
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostSuffix: "github.com" }   // 匹配 URL
            })
        ],
        actions: [new chrome.declarativeContent.ShowAction()] // 显示图标
    }
]);
```

### PageStateMatcher 常用条件

```js
// URL 匹配
pageUrl: {
    urlEquals, urlContains, urlMatches, originAndPathMatches,
    hostEquals, hostContains, hostPrefix, hostSuffix, hostMatches,
    scheme, pathEquals, pathContains, pathPrefix, pathSuffix, pathMatches,
    queryEquals, queryContains, queryPrefix, querySuffix, queryMatches,
    ports, isBookmarked
}

// CSS 选择器匹配（页面中存在该元素即为真，无需读取 DOM）
css: ["img.banner", ".ad-container"]
```

### 动作类型

```js
new chrome.declarativeContent.ShowAction()   // 显示 action 图标
new chrome.declarativeContent.SetIcon({       // 切换图标
    path: { 16: "images/icon16.png" }
})
new chrome.declarativeContent.RequestContentScript({  // 请求注入脚本（仅开发者模式）
    js: ["js/content-script.js"]
})
```

## 规则管理

```js
// 添加规则
chrome.declarativeContent.onPageChanged.addRules([rule], (rules) => {
    console.log("已添加:", rules);
});

// 获取规则
chrome.declarativeContent.onPageChanged.getRules((rules) => {
    console.log(rules);
});

// 删除指定规则
chrome.declarativeContent.onPageChanged.removeRules(["rule-id"]);

// 删除全部规则
chrome.declarativeContent.onPageChanged.removeRules(undefined);
```

## 效果

1. 加载扩展（开发者模式）。
2. 访问 `https://github.com`，扩展图标变为可用（ShowAction）。
3. 访问包含 `<img>` 的页面，图标被 SetIcon 替换。
4. 点击扩展图标，通过 `activeTab + scripting` 注入脚本弹出提示。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/declarativeContent?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/declarativeContent
```
