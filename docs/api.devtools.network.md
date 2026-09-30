# chrome.devtools.network 监控和分析网络请求

> 使用 `chrome.devtools.network` API 在开发者工具的 **Network** 面板上下文中检索网络请求信息，包括完整的 HAR（HTTP Archive）日志、单个请求的响应内容等。
> 该 API 仅在扩展程序的 **DevTools 页面** 中可用，需要在 `manifest.json` 中通过 `devtools_page` 注册一个 devtools 页面。
> 从 Chrome 108 开始，也可以结合 `chrome.devtools.inspectedWindow` 使用。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "开发者工具 Network 展示",
    "devtools_page": "pages/devtools.html",
    "background": {
        "service_worker": "js/background.js"
    },
    "permissions": [
        "tabs"
    ]
}
```

`pages/devtools.html` 会在开发者工具打开时加载：

```html
<script src="devtools.js"></script>
```

## Request 对象

`onRequestFinished` 回调中的 `request` 对象包含：

```javascript
{
    url: "https://example.com/api",
    method: "GET",
    requestHeaders: [ { name: "Accept", value: "..." } ],
    responseHeaders: [ { name: "Content-Type", value: "..." } ],
    status: 200,
    statusText: "OK",
    getContent: (callback) => { /* 获取响应正文 */ }
}
```

## 方法

### getHAR()
> 获取当前 Network 面板记录的完整 HAR 日志
```javascript
chrome.devtools.network.getHAR((harLog) => {
    console.log("HAR 版本:", harLog.version);
    for (const entry of harLog.entries) {
        console.log("请求:", entry.request.method, entry.request.url);
        console.log("状态:", entry.response.status);
        console.log("耗时(ms):", entry.time);
    }
});
```

## 事件

### onRequestFinished
> 网络请求完成时触发，可获取响应内容
```javascript
chrome.devtools.network.onRequestFinished.addListener((request) => {
    console.log("请求完成:", request.request.method, request.request.url);
    console.log("状态码:", request.response.status);

    // 获取响应正文（注意：异步）
    request.getContent((content, encoding) => {
        console.log("编码:", encoding);
        console.log("响应内容:", content);
    });
});
```

### onNavigated
> 被检查的标签页发生导航时触发，表示之前的网络记录已失效
```javascript
chrome.devtools.network.onNavigated.addListener((url) => {
    console.log("页面已导航:", url);
    // 此时之前的 HAR 记录会被清空
});
```

## 使用示例：统计页面所有请求大小

```javascript
chrome.devtools.network.getHAR((harLog) => {
    let total = 0;
    for (const entry of harLog.entries) {
        total += entry.response.content.size || 0;
    }
    console.log("响应总大小(字节):", total);
});
```

## 使用示例：导出 HAR

```javascript
function exportHAR() {
    chrome.devtools.network.getHAR((harLog) => {
        const har = { log: harLog };
        const blob = new Blob([JSON.stringify(har, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "network.har";
        a.click();
        URL.revokeObjectURL(url);
    });
}
```

## 说明

- `getHAR()` 只能获取 **Network 面板当前已记录** 的请求，建议在 `onNavigated` 后重新收集。
- `getContent()` 是异步的，且对于未完成的请求或跨域资源可能返回空内容。
- 该 API 只能在 DevTools 页面中使用，不能在其他扩展程序页面调用。

## 项目
> https://github.com/freewu/chrome-extension-cookbook-v3/blob/main/code/4-devtools-demo/
![debug](./images/api/devtools.network-debug.png)

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/devtools/network?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/devtools/network
```
