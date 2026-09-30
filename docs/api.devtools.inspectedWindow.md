# chrome.devtools.inspectedWindow 与当前选中的标签页进行交互

> 使用 `chrome.devtools.inspectedWindow` API 与开发者工具中当前检查的标签页进行交互，例如在页面中执行 JavaScript、重新加载页面、获取页面资源列表。
> 该 API 仅在扩展程序的 **DevTools 页面** 中可用，需要在 `manifest.json` 中通过 `devtools_page` 注册一个 devtools 页面。
> 同类的还有 `chrome.devtools.panels`（自定义面板）、`chrome.devtools.network`（网络请求）、`chrome.devtools.recorder`（录制器）等。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "开发者工具 chrome.devtools.* 效果演示",
    "devtools_page": "pages/devtools.html",
    "background": {
        "service_worker": "js/background.js"
    }
}
```

`pages/devtools.html` 会在开发者工具打开时自动加载，通常在其中引入一个脚本：

```html
<script src="devtools.js"></script>
```

## 属性

### inspectedWindow.tabId
> 当前被检查的标签页 ID
```javascript
const tabId = chrome.devtools.inspectedWindow.tabId;
console.log("被检查的标签页 ID:", tabId);
```

## 方法

### eval()
> 在被检查页面的上下文中执行 JavaScript
```javascript
chrome.devtools.inspectedWindow.eval(
    "document.title",   // 要执行的表达式 / 代码
    { useContentScriptContext: true }, // 可选：在内容脚本上下文中执行
    (result, isException) => {
        if (isException) {
            console.error("执行出错:", isException);
        } else {
            console.log("执行结果:", result);
        }
    }
);
```

```javascript
// 统计页面中的图片数量
chrome.devtools.inspectedWindow.eval(
    "document.querySelectorAll('img').length",
    (count, isException) => {
        console.log("图片数量:", count);
    }
);
```

### reload()
> 重新加载被检查的页面
```javascript
chrome.devtools.inspectedWindow.reload({
    ignoreCache: true,       // 是否忽略缓存（相当于 Ctrl+Shift+R）
    userAgent: "MyAgent",    // 覆盖 User-Agent
    injectedScript: "console.log('injected')" // 在页面加载前注入脚本
});
```

### getResources()
> 获取被检查页面加载的资源列表
```javascript
chrome.devtools.inspectedWindow.getResources((resources) => {
    for (const resource of resources) {
        console.log("资源 URL:", resource.url);
        console.log("资源类型:", resource.type); // document | stylesheet | image | script | ...
        // resource.getContent((content, encoding) => { ... });
    }
});
```

## 事件

### onResourceAdded
> 页面新增资源时触发
```javascript
chrome.devtools.inspectedWindow.onResourceAdded.addListener((resource) => {
    console.log("新增资源:", resource.url);
});
```

### onResourceContentCommitted
> 资源内容被编辑并提交时触发
```javascript
chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener((resource, content) => {
    console.log("资源已提交:", resource.url);
    console.log("新内容:", content);
});
```

## 相关资料：chrome.devtools.panels

`chrome.devtools.panels` 用于在开发者工具中创建自定义面板：

```javascript
chrome.devtools.panels.create(
    "My Panel",              // 面板标题
    "images/icon.png",       // 图标
    "pages/panel.html",      // 面板 HTML
    (panel) => {
        panel.onShown.addListener((window) => {
            console.log("面板已显示");
        });
        panel.onHidden.addListener(() => {
            console.log("面板已隐藏");
        });
    }
);
```

## 项目
> https://github.com/freewu/chrome-extension-cookbook-v3/blob/main/code/4-devtools-demo/
![debug](./images/api/devtools.inspectedWindow-debug.png)

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/devtools/inspectedWindow?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/devtools/panels?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/devtools
```
