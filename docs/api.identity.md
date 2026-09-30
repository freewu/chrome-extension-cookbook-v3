# chrome.identity 与用户身份验证和授权相关的 API

> 使用 `chrome.identity` API 进行用户身份验证和授权，例如获取 Google 账号的 OAuth2 访问令牌、获取用户基本信息、启动 Web 授权流程等。
> 该 API 需要 `identity` 权限；获取邮箱等还需要 `identity.email`。主要用于 Google 账号登录和第三方 OAuth。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "Identity 展示",
    "permissions": [
        "identity",
        "identity.email"
    ],
    "oauth2": {
        "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
        "scopes": [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    }
}
```

## AccountInfo

```javascript
{
    id: "user-id",                       // 用户 ID
}
// 启用 identity.email 后额外包含：
{
    email: "user@example.com",
    id: "user-id"
}
```

## 方法

### getAuthToken()
> 获取 OAuth2 访问令牌
```javascript
chrome.identity.getAuthToken(
    {
        interactive: true,               // 是否允许弹出授权界面
        scopes: ["https://www.googleapis.com/auth/userinfo.email"]
    },
    (token) => {
        if (chrome.runtime.lastError) {
            console.error("获取令牌失败:", chrome.runtime.lastError.message);
        } else {
            console.log("访问令牌:", token);
        }
    }
);
```

### getProfileUserInfo()
> 获取已登录用户的资料信息
```javascript
chrome.identity.getProfileUserInfo(
    { accountStatus: "ANY" }, // ANY | SYNC
    (userInfo) => {
        console.log("用户 ID:", userInfo.id);
        console.log("邮箱:", userInfo.email);
    }
);
```

### removeCachedAuthToken()
> 移除已缓存的令牌（例如令牌失效时）
```javascript
chrome.identity.removeCachedAuthToken({ token: "expired-token" }, () => {
    console.log("已移除缓存令牌");
    // 可重新调用 getAuthToken 获取新令牌
});
```

### launchWebAuthFlow()
> 启动 OAuth2 授权流程，适用于非 Google 的第三方 OAuth 提供方
```javascript
const redirectUrl = chrome.identity.getRedirectURL("oauth2");
chrome.identity.launchWebAuthFlow({
    url: `https://example.com/oauth/authorize?client_id=xxx&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=token`,
    interactive: true
}, (responseUrl) => {
    if (chrome.runtime.lastError) {
        console.error("授权失败:", chrome.runtime.lastError.message);
        return;
    }
    // 从回调 URL 中解析 token
    const url = new URL(responseUrl);
    const accessToken = new URLSearchParams(url.hash.substring(1)).get("access_token");
    console.log("访问令牌:", accessToken);
});
```

### getRedirectURL()
> 获取扩展程序的 OAuth 重定向 URL
```javascript
const redirectUrl = chrome.identity.getRedirectURL("oauth2");
console.log(redirectUrl);
// https://<extension-id>.chromiumapp.org/oauth2
```

### clearAllCachedAuthTokens()（Chrome 87+）
> 清除所有缓存的令牌
```javascript
await chrome.identity.clearAllCachedAuthTokens();
```

## 事件

### onSignInChanged
> 用户的登录状态变化时触发
```javascript
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
    console.log("账号:", account.id);
    console.log("是否已登录:", signedIn);
});
```

## 使用示例：获取 Google 用户信息

```javascript
async function getUserInfo() {
    const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(token);
        });
    });

    const resp = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return resp.json();
}
```

## 说明

- `oauth2.client_id` 需要在 Google Cloud Console 中为「Chrome 扩展程序」创建 OAuth 客户端 ID，并配置扩展程序 ID。
- `getAuthToken()` 会缓存令牌，失效时用 `removeCachedAuthToken()` 清除后重试。
- `launchWebAuthFlow()` 的 `url` 必须使用 HTTPS。

## 项目
> https://github.com/freewu/chrome-extension-cookbook-v3/blob/main/code/48-identity-demo/

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/identity?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/identity
```
