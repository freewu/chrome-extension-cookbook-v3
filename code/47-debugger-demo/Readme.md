# 调试器 展示 (chrome.debugger)

> 使用 chrome.debugger API 作为 Chrome 远程调试协议 (CDP) 的替代传输方式

> 通过 chrome.debugger，扩展程序可以把调试器附加到标签页上，然后像 DevTools 一样发送 CDP 命令、监听调试事件。

## 权限

- debugger

    使用 chrome.debugger API 的核心权限。

- host_permissions

    附加到目标页面通常需要对应的主机权限。

## manifest.json 配置

```json
{
    "permissions": [
        "debugger",
        "tabs"
    ],
    "host_permissions": [
        "<all_urls>"
    ]
}
```

## methods 演示

### 附加 / 分离

```js
// 附加，'1.3' 是 CDP 版本
await chrome.debugger.attach({ tabId: tab.id }, "1.3");

// 分离
await chrome.debugger.detach({ tabId: tab.id });
```

### 发送 CDP 命令

```js
// 获取页面 DOM
const doc = await chrome.debugger.sendCommand(
    { tabId: tab.id },
    "DOM.getDocument",
    {}
);

// 执行 JS
const result = await chrome.debugger.sendCommand(
    { tabId: tab.id },
    "Runtime.evaluate",
    { expression: "document.title" }
);
console.log(result.result.value);
```

### 获取可附加目标

```js
const targets = await chrome.debugger.getTargets();
for (const t of targets) {
    console.log(t.id, t.type, t.title, t.attached);
}
```

## 事件

```js
// 调试器分离
chrome.debugger.onDetach.addListener((source, reason) => {
    // reason: target_closed | canceled_by_user | replaced_with_devtools
    console.log("已分离:", source.tabId, reason);
});

// 接收 CDP 事件
chrome.debugger.onEvent.addListener((source, method, params) => {
    console.log(method, params);
});
```

## 效果

1. 加载扩展（开发者模式），打开任意网页。
2. 点击工具栏图标，点击「附加到当前标签页」，页面顶部出现调试提示条。
3. 点击「发送命令」，使用 `Runtime.evaluate` + `document.title` 获取页面标题。
4. 在 Service Worker 控制台可看到 onEvent / onDetach 日志。

## 说明

- 同一标签页同时只能被一个调试器附加（扩展程序或 DevTools）。
- 附加期间页面顶部会显示「扩展程序正在调试此浏览器」提示，用户可随时取消。
- CDP 命令参考：https://chromedevtools.github.io/devtools-protocol/

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/debugger?hl=zh-cn
https://chromedevtools.github.io/devtools-protocol/
```
