# chrome.extensionTypes 定义 Chrome 扩展程序的类型

> `chrome.extensionTypes` 定义了一组被多个扩展程序 API 复用的数据类型，例如注入脚本的 `InjectDetails`、图片的 `ImageDetails`、执行世界 `ExecutionWorld` 等。
> 它本身不提供运行时方法，主要用于类型约定和文档参考。

## 常用类型

### RunAt
> 内容脚本 / 脚本注入的时机
```
document_start   文档开始加载时（DOM 尚未构建）
document_end     DOM 构建完成后、资源加载前
document_idle    文档空闲时（默认）
```

### ExecutionWorld
> 脚本执行所在的世界
```
ISOLATED    隔离世界（默认），扩展程序专用，不能访问页面 JS 变量
MAIN        主世界，可访问页面 JS 变量，但受页面 CSP 限制
USER_SCRIPT 用户脚本世界
```

### InjectDetails
> 注入脚本 / CSS 的详细信息（`scripting.executeScript` 等）
```javascript
{
    code: "console.log('hi')",  // 要注入的代码（与 file 二选一）
    file: "js/content.js",       // 要注入的文件
    allFrames: false,            // 是否注入所有框架
    frameId: 0,                  // 指定框架
    matchAboutBlank: false,      // 是否注入 about:blank
    runAt: "document_idle"       // document_start | document_end | document_idle
}
```

### ImageDetails
> 图片细节
```javascript
{
    imageData: ImageData,        // ImageData 对象（与 path 二选一）
    path: "images/icon.png",     // 图片路径
    // 或按尺寸指定
    // path: { 16: "icon16.png", 32: "icon32.png" }
}
```

### CSSOrigin
> 注入 CSS 的来源
```
author     作者样式（默认）
user       用户样式
```

### DeleteRange
> 删除时间范围（用于历史记录等）
```javascript
{
    startTime: 1759218545000,   // 起始时间（毫秒）
    endTime: 1759218545000      // 结束时间（毫秒）
}
```

### DocumentLifecycle
> 文档生命周期
```
prerender   预渲染中
active      活跃
cached      已缓存
pending_deletion  待删除
```

### FileSystem / FileEntry 等

`chrome.extensionTypes` 还包含一些与文件、图片、注入相关的辅助类型，供 `chrome.fileBrowserHandler`、`chrome.desktopCapture` 等 API 使用。

## 使用示例

### 注入脚本时指定执行世界
```javascript
await chrome.scripting.executeScript({
    target: { tabId: 123 },
    world: "MAIN",              // ExecutionWorld
    func: () => window.myAppVersion
});
```

### 注入 CSS 时指定来源
```javascript
await chrome.scripting.insertCSS({
    target: { tabId: 123 },
    css: "body { background: red; }",
    origin: "USER"              // CSSOrigin
});
```

### 设置图标图片
```javascript
chrome.action.setIcon({
    path: {                      // ImageDetails
        16: "images/icon16.png",
        32: "images/icon32.png"
    }
});
```

## 说明

- 这些类型在 TypeScript 中通常以 `chrome.extensionTypes.XXX` 的形式出现。
- 理解它们有助于编写类型安全、兼容性更好的扩展程序代码。

## 项目
> 参考 `api.scripting.md`。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/extensionTypes?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/extensionTypes?hl=zh-cn#type-RunAt
```
