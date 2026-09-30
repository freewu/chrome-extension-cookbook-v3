# chrome.debugger 作为 Chrome 远程调试协议的替代传输方式

> 使用 `chrome.debugger` API 将 Chrome 远程调试协议（CDP，Chrome DevTools Protocol）附加到标签页上，作为 DevTools 之外的另一种调试传输方式。
> 通过它，扩展程序可以向页面发送任意 CDP 命令、监听调试事件。
> 该 API 需要 `debugger` 权限；附加的标签页会显示「扩展程序正在调试此浏览器」的提示。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "debugger 展示",
    "permissions": [
        "debugger"
    ],
    "host_permissions": [
        "<all_urls>"
    ],
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## Debuggee / Target

```javascript
// Debuggee（调试目标）
{
    tabId: 123,             // 标签页 ID
    extensionId: "...",     // 调试扩展程序目标
    targetId: "..."         // 调试目标 ID
}

// Target（附加后的目标）
{
    id: "target-id",
    type: "page",           // page | background_page | worker 等
    title: "示例页面",
    url: "https://example.com",
    attached: true,
    faviconUrl: "..."
}
```

## 方法

### attach()
> 将调试器附加到目标；可指定 CDP 版本
```javascript
chrome.debugger.attach(
    { tabId: 123 },        // 调试目标
    "1.3",                  // 要求的调试协议版本
    () => {
        if (chrome.runtime.lastError) {
            console.error("附加失败:", chrome.runtime.lastError.message);
        } else {
            console.log("调试器已附加");
        }
    }
);
```

### detach()
> 分离调试器
```javascript
chrome.debugger.detach({ tabId: 123 }, () => {
    console.log("调试器已分离");
});
```

### sendCommand()
> 发送 CDP 命令
```javascript
// 例如：获取页面 DOM
chrome.debugger.sendCommand(
    { tabId: 123 },           // 调试目标
    "DOM.getDocument",        // CDP 方法名
    {},                        // 参数
    (result) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            console.log("结果:", result);
        }
    }
);
```

```javascript
// 例如：在页面中执行脚本
chrome.debugger.sendCommand(
    { tabId: 123 },
    "Runtime.evaluate",
    { expression: "document.title" },
    (result) => console.log(result.result.value)
);
```

### getTargets()
> 获取所有可附加的调试目标
```javascript
const targets = await chrome.debugger.getTargets();
for (const target of targets) {
    console.log(target.id, target.type, target.title, target.attached);
}
```

## 事件

### onDetach
> 调试器分离时触发
```javascript
chrome.debugger.onDetach.addListener((source, reason) => {
    console.log("调试器已分离:", source.tabId);
    console.log("原因:", reason); // target_closed | canceled_by_user | replaced_with_devtools
});
```

### onEvent
> 收到调试目标发出的 CDP 事件时触发
```javascript
chrome.debugger.onEvent.addListener((source, method, params) => {
    console.log("来自标签页:", source.tabId);
    console.log("事件方法:", method); // 例如 "Network.requestWillBeSent"
    console.log("事件参数:", params);
});
```

## 使用示例：监听网络请求

```javascript
chrome.action.onClicked.addListener(async (tab) => {
    // 附加调试器
    await chrome.debugger.attach({ tabId: tab.id }, "1.3");
    // 启用 Network 域
    await chrome.debugger.sendCommand({ tabId: tab.id }, "Network.enable");

    chrome.debugger.onEvent.addListener((source, method, params) => {
        if (method === "Network.requestWillBeSent") {
            console.log("请求:", params.request.url);
        }
    });
});
```

## 说明

- 同一时刻一个目标只能被一个调试器（扩展程序或 DevTools）附加。
- 附加后页面顶部会显示调试提示条，用户可随时点击「取消」来分离。
- CDP 命令的含义可参考 [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)。

## 项目
> https://github.com/freewu/chrome-extension-cookbook-v3/blob/main/code/47-debugger-demo/

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/debugger?hl=zh-cn
https://chromedevtools.github.io/devtools-protocol/
```
