# 观察和分析流量，并拦截、屏蔽或修改正在处理的请求 展示 (chrome.webRequest)

***学习该api没有意义***

> 使用 chrome.webRequest API 观察和分析流量，并拦截、屏蔽或修改正在处理的请求

>  自 Manifest V3 开始，大多数扩展程序不再具有 "webRequestBlocking" 权限。考虑使用 "declarativeNetRequest"，该属性可启用 declarativeNetRequest API。
> 除了 "webRequestBlocking" 之外，webRequest API 保持不变，可正常使用。政策安装的扩展程序可以继续使用 "webRequestBlocking"。

## 权限
- webRequest

    必须在扩展程序清单中声明 "webRequest" 权限，才能使用 Web 请求 API，
    同时还需声明必要的主机权限。
    如需拦截子资源请求，扩展程序必须有权访问所请求的网址及其发起者

- webRequestBlocking

    注册阻塞事件处理脚本时需要此权限。自 Manifest V3 起，此 API 仅适用于通过政策安装的扩展程序。

- webRequestAuthProvider

    使用 onAuthRequired 方法时必需。请参阅处理身份验证。 https://developer.chrome.com/docs/extensions/reference/api/webRequest?hl=zh-cn#handle-auth

## 请求的生命周期
![请求的生命周期](./docs/web-request-lifecycle.png)

- onBeforeRequest（可选同步）

    在即将发生请求时触发。此事件在建立任何 TCP 连接之前发送，可用于取消或重定向请求。

- onBeforeSendHeaders（可选同步）
    
    在即将发生请求且初始标头已准备就绪时触发。此事件旨在允许扩展程序添加、修改和删除请求标头 (*)。
    onBeforeSendHeaders 事件会传递给所有订阅者，因此不同的订阅者可能会尝试修改请求；有关此事件的处理方式，请参阅实现详情部分。此事件可用于取消请求。
    
- onSendHeaders

    在所有扩展程序都有机会修改请求标头后触发，并呈现最终的 (*) 版本。
    此事件在标头发送到网络之前触发。此事件属于信息性事件，以异步方式处理。不允许修改或取消请求。

- onHeadersReceived（可选同步）

    每次收到 HTTP(S) 响应标头时都会触发。
    由于重定向和身份验证请求，每个请求可能会发生多次这种情况。此事件旨在允许扩展程序添加、修改和删除响应标头，
    例如传入的 Content-Type 标头。缓存指令会在触发此事件之前进行处理，因此修改 Cache-Control 等标头不会对浏览器的缓存产生影响。您还可以取消或重定向请求。

- onAuthRequired（可选同步）

    当请求需要对用户进行身份验证时触发。此事件可以同步处理，以提供身份验证凭据。
    请注意，扩展程序可能会提供无效的凭据。
    请注意，不要因反复提供无效凭据而进入无限循环。此方法也可用于取消请求。

- onBeforeRedirect
    在即将执行重定向时触发。重定向可由 HTTP 响应代码或扩展程序触发。
    此事件为信息性事件，以异步方式处理。您无法修改或取消请求。

- onResponseStarted
    
    在收到响应正文的第一个字节时触发。对于 HTTP 请求，这意味着状态行和响应标头可用。此事件为信息性事件，以异步方式处理。不允许修改或取消请求。

- onCompleted

    在请求已成功处理时触发。
    
- onErrorOccurred
    
    当请求无法成功处理时触发。
    

## 资料
```markdown
https://developer.chrome.com/docs/extensions/reference/api/webRequest?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/webRequest/
```