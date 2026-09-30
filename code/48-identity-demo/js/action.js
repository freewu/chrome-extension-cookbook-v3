const resultEl = document.getElementById("result");

function show(data) {
    resultEl.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// 获取已登录用户的信息（需要 identity.email 权限，且用户已登录 Chrome）
document.getElementById("profile").addEventListener("click", () => {
    chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
        if (chrome.runtime.lastError) {
            show("获取失败: " + chrome.runtime.lastError.message);
            return;
        }
        show({
            id: userInfo.id,
            email: userInfo.email || "(未登录或未授予 email 权限)"
        });
    });
});

// 获取 OAuth 重定向 URL
document.getElementById("redirect").addEventListener("click", () => {
    const url = chrome.identity.getRedirectURL("oauth2");
    show("重定向 URL:\n" + url + "\n\n将其配置到 OAuth 提供方的回调地址中。");
});

// Web 授权流程示例
// 使用 httpbin 的 redirect-to 模拟一个会回调到扩展重定向 URL 的授权服务器
document.getElementById("webauth").addEventListener("click", () => {
    const redirectUrl = chrome.identity.getRedirectURL("oauth2");
    const callback = redirectUrl + "?access_token=demo-token-123";
    const authUrl = "https://httpbin.org/redirect-to?url=" + encodeURIComponent(callback);

    chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        (responseUrl) => {
            if (chrome.runtime.lastError) {
                show("授权失败: " + chrome.runtime.lastError.message);
                return;
            }
            const url = new URL(responseUrl);
            const token = new URLSearchParams(url.search).get("access_token");
            show("授权成功！从回调中解析到的 token:\n" + token);
        }
    );
});

// 清除所有缓存的令牌
document.getElementById("clear").addEventListener("click", async () => {
    await chrome.identity.clearAllCachedAuthTokens();
    show("已清除所有缓存令牌");
});
