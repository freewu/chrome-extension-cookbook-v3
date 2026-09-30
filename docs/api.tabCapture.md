# chrome.tabCapture 与标签页媒体流进行互动

> 使用 `chrome.tabCapture` API 捕获当前标签页的媒体（视频 / 音频），生成一个媒体流供扩展程序处理。
> 该 API 需要 `tabCapture` 权限，并且必须在用户手势（如点击扩展图标）触发的上下文中调用。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "标签页捕获 展示 (chrome.tabCapture)",
    "permissions": [
        "tabCapture",
        "activeTab"
    ],
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## CapturedTab 对象

```javascript
{
    tabId: 123,        // 标签页 ID
    status: "active",  // pending | active | stopped | error
    fullscreen: false  // 是否全屏
}
```

## 方法

### capture()
> 捕获指定标签页的媒体流，返回 MediaStream（只能在用户手势中调用）
```javascript
// 在 popup 或 action 点击回调中调用
document.getElementById("capture-btn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const stream = await chrome.tabCapture.capture({
        audio: true,             // 是否捕获音频
        video: true,             // 是否捕获视频
        // audioConstraints: { ... },
        // videoConstraints: { ... }
    });

    // 将流绑定到 video 元素进行预览
    const video = document.getElementById("preview");
    video.srcObject = stream;
    video.play();
});

// 回调写法
chrome.tabCapture.capture({ audio: true, video: true }, (stream) => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
    }
    console.log("已获取媒体流:", stream);
});
```

### getMediaStreamId()
> 获取媒体流 ID，可在 Service Worker 中调用，再将 ID 传给 offscreen 文档使用
```javascript
// background.js
chrome.action.onClicked.addListener(async (tab) => {
    const streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: tab.id
    });
    console.log("媒体流 ID:", streamId);

    // 交由 offscreen 文档通过 getUserMedia 使用
    await chrome.offscreen.createDocument({
        url: "pages/offscreen.html",
        reasons: ["USER_MEDIA"],
        justification: "捕获标签页媒体流"
    });
    chrome.runtime.sendMessage({ type: "startCapture", streamId });
});
```

```javascript
// offscreen.js 中
navigator.mediaDevices.getUserMedia({
    audio: {
        mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId }
    },
    video: {
        mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId }
    }
}).then((stream) => {
    // 处理媒体流
});
```

### getCapturedTabs()
> 获取所有正在被捕获的标签页
```javascript
const tabs = await chrome.tabCapture.getCapturedTabs();
for (const tab of tabs) {
    console.log("标签页:", tab.tabId, "状态:", tab.status);
}
```

## 事件

### onStatusChanged
> 捕获状态变化时触发
```javascript
chrome.tabCapture.onStatusChanged.addListener((info) => {
    console.log("捕获状态变化:", info.tabId, info.status);
    // status: pending | active | stopped | error
});
```

## 使用示例：录制标签页并保存

```javascript
// 在 popup 中开始录制
const stream = await chrome.tabCapture.capture({ audio: true, video: true });
const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
const chunks = [];
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename: "capture.webm" });
};
recorder.start();

// 停止
document.getElementById("stop-btn").addEventListener("click", () => {
    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
});
```

## 项目
> 参考示例：`code/` 中暂无独立 demo，可结合 `offscreen` 示例理解。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/tabCapture?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/sample.tabcapture-recorder
```
