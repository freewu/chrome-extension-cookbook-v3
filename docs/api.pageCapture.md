# chrome.pageCapture 将标签页另存为 MHTML

> 使用 `chrome.pageCapture` API 将标签页的内容保存为 **MHTML** 文件。
> MHTML（MIME HTML）会把页面 HTML 及其所有资源（图片、CSS 等）打包进单个文件，适合离线保存网页。
> 该 API 需要 `pageCapture` 权限。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "将标签页另存为 MHTML 展示 (chrome.pageCapture)",
    "permissions": [
        "pageCapture",
        "tabs"
    ]
}
```

## 方法

### saveAsMHTML()
> 将指定标签页保存为 MHTML，返回 Blob（包含 MHTML 数据）
```javascript
chrome.pageCapture.saveAsMHTML({
    tabId: 123 // 要捕获的标签页 ID
}, (mhtmlBlob) => {
    if (chrome.runtime.lastError) {
        console.error("捕获失败:", chrome.runtime.lastError.message);
        return;
    }
    console.log("MHTML Blob:", mhtmlBlob);

    // 生成下载链接
    const url = URL.createObjectURL(mhtmlBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.mhtml";
    a.click();
    URL.revokeObjectURL(url);
});
```

### 使用 service worker + downloads 下载
```javascript
// 在 background.js 中
chrome.action.onClicked.addListener(async (tab) => {
    chrome.pageCapture.saveAsMHTML({ tabId: tab.id }, (mhtmlBlob) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        const url = URL.createObjectURL(mhtmlBlob);
        chrome.downloads.download({ url, filename: "page.mhtml" });
    });
});
```

## 说明

- `saveAsMHTML()` 只能捕获 **当前标签页** 的内容，且需要页面已加载完成。
- 返回的 Blob 是内存中的 MHTML 数据，需自行通过 `URL.createObjectURL()` 或 `FileReader` 处理。
- 生成的 `.mhtml` 文件可直接用 Chrome 打开，页面会以离线方式还原。
- `chrome.pageCapture` 没有事件。

## 项目
> https://github.com/freewu/plugin-demo/blob/main/chrome-extension-demo/demo24/
![action](./images/api/pageCapture-action.png)

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/pageCapture?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/pageCapture
```
