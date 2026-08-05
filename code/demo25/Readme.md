# 创建和管理屏幕外文档 展示 (chrome.offscreen)

> 使用 offscreen API 创建和管理屏幕外文档

Service worker 没有 DOM 访问权限，并且许多网站都有内容安全政策来限制内容脚本的功能。
借助 Offscreen API，扩展程序可以在隐藏文档中使用 DOM API，而不会通过打开新窗口或标签页来中断用户体验。runtime API 是离屏文档支持的唯一扩展程序 API。

作为屏幕外文档加载的页面与其他类型的扩展程序页面不同，其处理方式也不同。 扩展程序的权限会沿用到离屏文档，但对扩展程序 API 的访问权限有限制。
例如，由于 chrome.runtime API 是离屏文档支持的唯一扩展服务 API，因此必须使用该 API 的成员来处理消息传递。

以下是离屏文档与常规网页的不同之处：
- 离屏文档的网址必须是与扩展程序捆绑的静态 HTML 文件。
- 无法聚焦屏幕外的文档。
- 屏幕外文档是 window 的实例，但其 opener 属性的值始终为 null。

虽然扩展程序软件包可以包含多个屏幕外文档，但已安装的扩展程序一次只能打开一个屏幕外文档。
如果扩展程序在分屏模式下运行，且无痕式浏览个人资料处于活动状态，则常规个人资料和无痕式浏览个人资料各自可以有一个屏幕外文档。

## 扩展程序创建屏幕外文档的原因
```markdown
- TESTING               仅用于测试目的的原因。
- AUDIO_PLAYBACK        指定离屏文档负责播放音频。
- IFRAME_SCRIPTING      指定离屏文档需要嵌入 iframe 并通过脚本修改 iframe 的内容。
- DOM_SCRAPING          指定离屏文档需要嵌入 iframe 并抓取其 DOM 以提取信息。
- BLOBS                 指定离屏文档需要与 Blob 对象（包括 URL.createObjectURL()）互动。
- DOM_PARSER            指定离屏文档需要使用 DOMParser API。
- USER_MEDIA            指定离屏文档需要与来自用户媒体（例如 getUserMedia()）的媒体流进行交互。
- DISPLAY_MEDIA         指定离屏文档需要与来自展示媒体（例如 getDisplayMedia()）的媒体流进行互动。
- WEB_RTC               指定了离屏文档需要使用 WebRTC API。
- CLIPBOARD             指定屏幕外文档需要与 Clipboard API 互动
- LOCAL_STORAGE         指定屏幕外文档需要访问 localStorage。
- WORKERS               指定了离屏文档需要衍生工作器。
- BATTERY_STATUS        指定了离屏文档需要使用 navigator.getBattery。
- MATCH_MEDIA           指定离屏文档需要使用 window.matchMedia。
- GEOLOCATION           指定离屏文档需要使用 navigator.geolocation。
```

离屏文档是 Chrome 扩展的一种特殊机制，用于解决 “后台页面被移除后，扩展需要在后台处理 DOM 相关操作” 的问题。它有以下限制:
- 没有可视化窗口，无法通过浏览器标签页、弹窗等形式展示。
- 不能直接与用户交互（如响应点击、输入等）。
- 生命周期受扩展控制，通常在完成特定任务后会被销毁（通过 chrome.offscreen.closeDocument）




## 资料
```markdown
https://developer.chrome.com/docs/extensions/reference/api/offscreen?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/cookbook.offscreen-dom
```