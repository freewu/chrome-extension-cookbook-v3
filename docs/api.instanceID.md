# chrome.instanceID 管理实例 ID

> 使用 `chrome.instanceID` API 为扩展程序实例获取唯一标识符，用于向服务器标识设备 / 实例。
> 该 API 需要 `gcm` 权限。
>
> ⚠️ 注意：Google 已停用 Instance ID / GCM 服务，`chrome.instanceID` 也已随之弃用。新项目请直接生成并持久化自己的 UUID。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "InstanceID 展示",
    "permissions": [
        "gcm"
    ],
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## 方法

### getID()
> 获取当前扩展程序实例的 ID；如果不存在则创建
```javascript
chrome.instanceID.getID((instanceId) => {
    if (chrome.runtime.lastError) {
        console.error("获取失败:", chrome.runtime.lastError.message);
    } else {
        console.log("实例 ID:", instanceId);
    }
});
```

### getCreationTime()
> 获取实例 ID 的创建时间
```javascript
chrome.instanceID.getCreationTime((creationTime) => {
    console.log("创建时间:", new Date(creationTime));
});
```

### getToken()
> 获取用于向 GCM 发送消息的 token
```javascript
chrome.instanceID.getToken({
    authorizedEntity: "sender-id",        // 授权实体
    scope: "GCM",                         // 作用域
    // options: { ... }
}, (token) => {
    if (chrome.runtime.lastError) {
        console.error("获取 token 失败:", chrome.runtime.lastError.message);
    } else {
        console.log("token:", token);
    }
});
```

### deleteToken()
> 删除 token
```javascript
chrome.instanceID.deleteToken({
    authorizedEntity: "sender-id",
    scope: "GCM"
}, (success) => {
    console.log("删除结果:", success);
});
```

### deleteID()
> 删除实例 ID
```javascript
chrome.instanceID.deleteID((success) => {
    console.log("实例 ID 已删除:", success);
});
```

## 事件

### onTokenRefresh
> token 刷新时触发
```javascript
chrome.instanceID.onTokenRefresh.addListener(() => {
    console.log("token 已刷新，请重新调用 getToken()");
    chrome.instanceID.getToken(
        { authorizedEntity: "sender-id", scope: "GCM" },
        (token) => {
            // 上报新 token 到服务器
        }
    );
});
```

## 替代方案

由于 Instance ID 已停用，建议：

```javascript
// 自己生成并持久化设备 ID
async function getOrCreateInstanceId() {
    let { instanceId } = await chrome.storage.local.get("instanceId");
    if (!instanceId) {
        instanceId = crypto.randomUUID();
        await chrome.storage.local.set({ instanceId });
    }
    return instanceId;
}
```

## 项目
> 参考示例：`code/` 中暂无独立 demo。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/instanceID?hl=zh-cn
```
