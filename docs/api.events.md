# chrome.events 监听和响应 Chrome 扩展程序的事件

> `chrome.events` 定义了扩展程序事件系统的通用类型，例如 `Event`、`Rule`、`UrlFilter` 等。
> 许多 API（`chrome.tabs`、`chrome.webRequest`、`chrome.declarativeContent` 等）中暴露的事件对象都实现了 `Event` 接口。
> 它本身不提供运行时方法，主要用于类型定义和统一事件处理。

## Event 接口

所有扩展程序事件都实现了以下方法：

### addListener()
> 添加事件监听器
```javascript
// 基本用法
chrome.tabs.onCreated.addListener((tab) => {
    console.log("标签页创建:", tab.id);
});

// 带过滤器与额外参数（常用于 webRequest / declarativeContent）
chrome.webRequest.onBeforeRequest.addListener(
    (details) => console.log(details.url),
    { urls: ["<all_urls>"] },
    ["blocking"]
);
```

### removeListener()
> 移除指定监听器
```javascript
function onCreated(tab) {
    console.log("标签页创建:", tab.id);
}

chrome.tabs.onCreated.addListener(onCreated);
// 稍后移除
chrome.tabs.onCreated.removeListener(onCreated);
```

### hasListener()
> 判断某个监听器是否已注册
```javascript
const exists = chrome.tabs.onCreated.hasListener(onCreated);
console.log("监听器是否存在:", exists);
```

### hasListeners()
> 判断该事件是否注册了任何监听器
```javascript
const any = chrome.tabs.onCreated.hasListeners();
console.log("是否有监听器:", any);
```

## Rule 类型

用于 `chrome.declarativeContent`、`chrome.declarativeWebRequest`（已废弃）等声明式 API：

```javascript
{
    id: "rule-id",           // 规则 ID
    tags: ["tag1"],          // 标签，便于批量操作
    conditions: [ ... ],     // 条件列表
    actions: [ ... ],        // 动作列表
    priority: 1              // 优先级
}
```

## UrlFilter 类型

用于 `chrome.events` 的 URL 匹配过滤：

```javascript
{
    hostContains: ".example",
    hostEquals: "www.example.com",
    hostPrefix: "www",
    hostSuffix: ".com",
    hostMatches: ".*",
    pathContains: "foo",
    pathEquals: "/foo",
    pathPrefix: "/foo",
    pathSuffix: ".html",
    pathMatches: "^/foo.*",
    urlContains: "example",
    urlEquals: "https://example.com",
    urlMatches: "https://.*\\.example\\.com/.*",
    originAndPathMatches: ".*",
    queryContains: "q=",
    queryEquals: "a=1",
    queryPrefix: "a=",
    querySuffix: "&b=2",
    queryMatches: ".*",
    schemes: ["https"],
    ports: [80, 443]
}
```

## 常见事件对象

| 事件对象 | 所属 API | 说明 |
| -------- | -------- | ---- |
| `chrome.tabs.onCreated` | tabs | 标签页创建 |
| `chrome.tabs.onUpdated` | tabs | 标签页更新 |
| `chrome.runtime.onMessage` | runtime | 收到消息 |
| `chrome.runtime.onInstalled` | runtime | 扩展安装 / 更新 |
| `chrome.webRequest.onBeforeRequest` | webRequest | 请求发出前 |
| `chrome.declarativeContent.onPageChanged` | declarativeContent | 页面状态变化 |
| `chrome.cookies.onChanged` | cookies | Cookie 变化 |
| `chrome.storage.onChanged` | storage | 存储变化 |

## 使用示例：统一包装事件监听

```javascript
// 监听多个标签页事件
const listeners = {
    onCreated: (tab) => console.log("创建:", tab.id),
    onUpdated: (tabId, info) => console.log("更新:", tabId, info),
    onRemoved: (tabId) => console.log("移除:", tabId)
};

chrome.tabs.onCreated.addListener(listeners.onCreated);
chrome.tabs.onUpdated.addListener(listeners.onUpdated);
chrome.tabs.onRemoved.addListener(listeners.onRemoved);

// 清理
function cleanup() {
    chrome.tabs.onCreated.removeListener(listeners.onCreated);
    chrome.tabs.onUpdated.removeListener(listeners.onUpdated);
    chrome.tabs.onRemoved.removeListener(listeners.onRemoved);
}
```

## 说明

- `Event` 是接口，不能直接实例化；它由各个 API 在命名空间中提供。
- 在 Manifest V3 的 Service Worker 中，事件监听器必须在顶层同步注册，否则 Service Worker 被唤醒时可能无法收到事件。
- 使用 `removeListener` 时必须传入与 `addListener` 相同的函数引用。

## 项目
> 参考各 API 的事件章节。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/events?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/events?hl=zh-cn#type-Event
```
