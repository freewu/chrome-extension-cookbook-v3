# chrome.devtools.recorder 记录用户在浏览器中的操作

> 使用 `chrome.devtools.recorder` API 扩展开发者工具中的 **Recorder（录制器）** 面板。
> 你可以注册自定义的导出插件（把录制结果导出为自定义格式），或创建一个 Recorder 视图来展示 / 回放录制内容。
> 该 API 仅在扩展程序的 **DevTools 页面** 中可用，需要 `devtools_page`。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "开发者工具 Recorder 展示",
    "devtools_page": "pages/devtools.html",
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## 方法

### createView()
> 在 Recorder 面板中创建一个自定义视图
```javascript
chrome.devtools.recorder.createView(
    "My Recorder",              // 视图标题
    "pages/recorder.html",      // 页面路径
    (view) => {
        view.onShown.addListener((window) => {
            console.log("Recorder 视图已显示");
        });
        view.onHidden.addListener(() => {
            console.log("Recorder 视图已隐藏");
        });
    }
);
```

### registerRecorderExtensionPlugin()
> 注册一个录制导出 / 回放插件
```javascript
chrome.devtools.recorder.registerRecorderExtensionPlugin(
    {
        // 将录制内容编码为字符串
        encode: (recording) => {
            return JSON.stringify(recording, null, 2);
        },
        // 将录制内容转换为可读字符串
        stringify: (recording) => {
            return `包含 ${recording.steps.length} 个步骤`;
        },
        // 将单个步骤转换为可读字符串
        stringifyStep: (step) => {
            return step.type;
        },
        // 可选：回放录制内容
        replayer: {
            start: (recording, extensionReplayCallback) => {
                console.log("开始回放:", recording);
                // ... 执行回放
                extensionReplayCallback([{
                    message: "回放完成",
                    isError: false
                }]);
            }
        }
    },
    "My Plugin",        // 插件名称
    "application/json"  // MIME 类型
);
```

## 事件

### onRecordingStarted
> Recorder 开始录制时触发
```javascript
chrome.devtools.recorder.onRecordingStarted.addListener(() => {
    console.log("录制已开始");
});
```

### onRecordingStopped
> Recorder 停止录制时触发
```javascript
chrome.devtools.recorder.onRecordingStopped.addListener(() => {
    console.log("录制已停止");
});
```

## 类型

### RecorderView
```javascript
{
    onShown: Event<(window) => void>,
    onHidden: Event<() => void>
}
```

### RecorderExtensionPlugin
```
encode(recording) => string
stringify(recording) => string
stringifyStep(step) => string
replayer?: {
    start(recording, callback),
    startStep?(step, callback),
    stop?()
}
```

## 使用示例：注册 JSON 导出插件

```javascript
// devtools.js
chrome.devtools.recorder.registerRecorderExtensionPlugin({
    encode: (recording) => JSON.stringify(recording),
    stringify: (recording) => "导出为 JSON",
    stringifyStep: (step) => step.type
}, "JSON Exporter", "application/json");

chrome.devtools.recorder.onRecordingStarted.addListener(() => {
    console.log("用户开始录制操作");
});

chrome.devtools.recorder.onRecordingStopped.addListener(() => {
    console.log("录制结束，可以导出");
});
```

## 说明

- Recorder 面板用于录制用户操作（点击、输入、导航等）并生成可回放的脚本。
- 通过扩展插件，可以把录制内容导出为 JSON、测试脚本或其他自定义格式。
- 该 API 只能在 DevTools 页面中使用。

## 项目
> https://github.com/freewu/chrome-extension-cookbook-v3/blob/main/code/4-devtools-demo/
![debug](./images/api/devtools.recorder-debug.png)

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/devtools/recorder?hl=zh-cn
https://developer.chrome.com/docs/devtools/recorder/
```
