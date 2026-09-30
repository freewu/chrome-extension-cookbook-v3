# 身份验证 展示 (chrome.identity)

> 使用 chrome.identity API 与用户身份验证和授权相关的功能，例如获取 Google 账号信息、OAuth2 访问令牌、启动 Web 授权流程等

## 权限

- identity

- identity.email

    获取用户邮箱地址（如 `getProfileUserInfo()` 的 email）。

## manifest.json 配置

```json
{
    "permissions": [
        "identity",
        "identity.email"
    ]
}
```

> 若要使用 `getAuthToken()` 获取 Google OAuth 令牌，还需要在 manifest 中配置 `oauth2`：

```json
{
    "oauth2": {
        "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
        "scopes": [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    }
}
```

## methods 演示

### getProfileUserInfo()
```js
chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
    console.log(userInfo.id, userInfo.email);
});
```

### getRedirectURL()
```js
const redirectUrl = chrome.identity.getRedirectURL("oauth2");
// https://<extension-id>.chromiumapp.org/oauth2
```

### launchWebAuthFlow()
```js
const redirectUrl = chrome.identity.getRedirectURL("oauth2");
const authUrl = "https://your-auth-server/authorize?redirect_uri=" +
    encodeURIComponent(redirectUrl);

chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (responseUrl) => {
    const url = new URL(responseUrl);
    const token = new URLSearchParams(url.search).get("access_token");
    console.log(token);
});
```

### getAuthToken() / removeCachedAuthToken() / clearAllCachedAuthTokens()
```js
chrome.identity.getAuthToken({ interactive: true }, (token) => {
    console.log(token);
    // 失效时：
    chrome.identity.removeCachedAuthToken({ token });
});
await chrome.identity.clearAllCachedAuthTokens();
```

## 效果

1. 加载扩展（开发者模式），点击工具栏图标。
2. 「getProfileUserInfo」显示当前登录用户的 ID / 邮箱。
3. 「getRedirectURL」显示 `https://<id>.chromiumapp.org/oauth2`。
4. 「启动授权流程」通过 httpbin 模拟授权服务器回调，解析出回调中的 token。
5. 「clearAllCachedAuthTokens」清除缓存令牌。

> 注意：本 demo 的授权流程使用 `httpbin.org/redirect-to` 模拟第三方授权服务器，需要联网。
> 真实的 `getAuthToken()` 需要先在 Google Cloud Console 创建 OAuth 客户端 ID 并配置扩展 ID。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/identity?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/identity
```
