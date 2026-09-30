# chrome.gcm 与 Google Cloud Messaging (GCM) 进行通信

> 使用 `chrome.gcm` API 让扩展程序通过 Google Cloud Messaging（现为 Firebase Cloud Messaging，FCM）接收和发送推送消息。
> 该 API 需要 `gcm` 权限。
>
> ⚠️ 注意：Google 已于 2023 年起停用 GCM，`chrome.gcm` API 也从 Chrome 118 开始被弃用 / 移除。新项目请改用 Web Push 或 Firebase Cloud Messaging（FCM）的 Web SDK。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "GCM 展示",
    "permissions": [
        "gcm"
    ],
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## 方法

### register()
> 向 GCM 注册，返回一个注册 ID（registration id / token）
```javascript
chrome.gcm.register(["sender-id-1"], (registrationId) => {
    if (chrome.runtime.lastError) {
        console.error("注册失败:", chrome.runtime.lastError.message);
    } else {
        console.log("注册 ID:", registrationId);
        // 将 registrationId 发送到自己的服务器
    }
});
```

### unregister()
> 注销 GCM
```javascript
chrome.gcm.unregister((success) => {
    console.log("注销结果:", success);
});
```

### send()
> 通过 GCM 向下游服务器发送消息
```javascript
chrome.gcm.send({
    destinationId: "server-id",      // 目标（通常是应用服务器 / sender id）
    messageId: "msg-001",            // 消息 ID，用于去重
    timeToLive: 3600,                // 存活时间（秒）
    data: {
        key1: "value1",
        key2: "value2"
    }
}, (messageId) => {
    if (chrome.runtime.lastError) {
        console.error("发送失败:", chrome.runtime.lastError.message);
    } else {
        console.log("发送成功，messageId:", messageId);
    }
});
```

## 事件

### onMessage
> 收到推送消息时触发
```javascript
chrome.gcm.onMessage.addListener((message) => {
    console.log("收到消息:", message);
    console.log("数据:", message.data);
    // data 的键值均为字符串
});
```

### onMessagesDeleted
> 服务器端删除了消息时触发（客户端应清理本地缓存）
```javascript
chrome.gcm.onMessagesDeleted.addListener(() => {
    console.log("消息已被删除，请清理本地缓存");
});
```

### onSendError
> 发送消息出错时触发
```javascript
chrome.gcm.onSendError.addListener((error) => {
    console.error("发送错误:", error);
    console.error("错误详情:", error.errorMessage);
    console.error("消息 ID:", error.messageId);
    console.error("详细信息:", error.details);
});
```

## 示例：注册并上报 token

```javascript
chrome.runtime.onInstalled.addListener(() => {
    chrome.gcm.register(["1234567890"], async (registrationId) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        // 上报到自己的服务器
        await fetch("https://my-server.example.com/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: registrationId })
        });
    });
});
```

## 替代方案

由于 GCM 已停用，建议：

- **Web Push**：使用标准 Push API（`ServiceWorkerRegistration.pushManager.subscribe()`），配合自建或 Firebase 推送服务。
- **Firebase Cloud Messaging (FCM)**：使用 FCM 的 Web / HTTP v1 API。

## 项目
> 参考示例：`code/` 中暂无独立 demo。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/gcm?hl=zh-cn
https://firebase.google.com/docs/cloud-messaging
```
