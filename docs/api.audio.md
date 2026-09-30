# chrome.audio 管理音频功能展示

> 使用 `chrome.audio` API 查询和控制系统上的音频设备：列出输入 / 输出设备、设置活动设备、调整音量与静音、监听设备变化等。
> 该 API **仅适用于 ChromeOS**，需要 `audio` 权限。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "音频 展示 (chrome.audio)",
    "permissions": [
        "audio"
    ],
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## AudioDeviceInfo

```javascript
{
    id: "device-id",
    name: "扬声器",
    type: "OUTPUT",          // INPUT | OUTPUT
    isActive: true,          // 是否为当前活动设备
    streamType: "PLAYBACK",  // 音频流类型
    deviceName: "Built-in Audio",
    isMuted: false,
    volume: 80,              // 0 ~ 100
    stableDeviceId: "..."    // 稳定设备 ID
}
```

## 方法

### getDevices()
> 获取音频设备列表
```javascript
chrome.audio.getDevices({
    // 可选过滤条件
    // isActive: true,
    // streamType: "PLAYBACK",
    // type: "OUTPUT"
}, (devices) => {
    for (const device of devices) {
        console.log("设备 ID:", device.id);
        console.log("名称:", device.name);
        console.log("类型:", device.type);       // INPUT | OUTPUT
        console.log("活动:", device.isActive);
        console.log("音量:", device.volume);
        console.log("静音:", device.isMuted);
    }
});
```

### getProperties()
> 获取指定设备的属性
```javascript
chrome.audio.getProperties({ id: ["device-id"] }, (devices) => {
    console.log(devices);
});
```

### setActiveDevices()
> 设置活动设备
```javascript
chrome.audio.setActiveDevices([
    { id: "device-id", type: "OUTPUT" }
], () => {
    if (chrome.runtime.lastError) {
        console.error("设置失败:", chrome.runtime.lastError.message);
    } else {
        console.log("活动设备已设置");
    }
});
```

### setProperties()
> 设置设备属性（音量、静音、名称）
```javascript
chrome.audio.setProperties([
    {
        id: "device-id",
        volume: 60,      // 0 ~ 100
        isMuted: false,
        // name: "我的扬声器"
    }
], () => {
    console.log("属性已更新");
});
```

## 事件

### onDeviceListChanged
> 音频设备列表变化（新增 / 移除设备）时触发
```javascript
chrome.audio.onDeviceListChanged.addListener((devices) => {
    console.log("设备列表变化:", devices);
});
```

### onLevelChanged
> 设备音量变化时触发（高频事件）
```javascript
chrome.audio.onLevelChanged.addListener((levelChangeInfo) => {
    console.log("音量变化:", levelChangeInfo.id, levelChangeInfo.level);
});
```

### onMuteChanged
> 设备静音状态变化时触发
```javascript
chrome.audio.onMuteChanged.addListener((muteChangeInfo) => {
    console.log("静音状态变化:", muteChangeInfo.id);
    console.log("是否静音:", muteChangeInfo.isMuted);
    console.log("变化的设备类型:", muteChangeInfo.isMuted);
});
```

## 使用示例：切换输出设备

```javascript
async function listOutputDevices() {
    return await new Promise((resolve) => {
        chrome.audio.getDevices({ type: "OUTPUT" }, resolve);
    });
}

async function switchOutput(deviceId) {
    await chrome.audio.setActiveDevices([
        { id: deviceId, type: "OUTPUT" }
    ]);
}

const devices = await listOutputDevices();
console.log(devices);
```

## 说明

- 该 API 仅在 ChromeOS 上可用，桌面版 Chrome 调用会失败。
- `onLevelChanged` 事件触发非常频繁，处理时应做节流。
- 音量范围为 0 ~ 100。

## 项目
> 参考示例：`code/` 中暂无独立 demo（仅限 ChromeOS）。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/audio?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/audio
```
