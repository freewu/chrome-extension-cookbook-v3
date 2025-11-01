# Chrome Extension Cookbook V3

## 封面
<img src="./images/book cover.png" />

## 计划

> 和 https://developer.chrome.google.cn/docs/extensions/reference/api/ 左边栏的 API 对应

| Chrome API                         |  完成     | 备注                                                                  |
| ---------------------------------- | -------- | --------------------------------------------------------------------- |
| accessibilityFeatures              | ❌️       | 仅限 ChromeOS                                                         |
| action                             | ✅️       | 右上角popup展示                                                        |
| alarms                             | 未开始    | 闹钟展示                                                               |
| audio                              | ❌️       | 仅限 ChromeOS                                                         |
| bookmarks                          | 未开始    | 创建、整理和以其他方式操作书签                                            |
| browsingData                       | 未开始    | 从用户的本地个人资料中移除浏览数据                                         |
| certificateProvider                | ❌️       | 仅限 ChromeOS                                                         |
| clipboard                          | 未开始    | 剪贴板展示                                                             |
| commands                           | 未开始    | 键盘快捷键                                                             |
| contentSettings                    | 未开始    | 使用模式来指定每项内容设置所影响的网站                                      |
| contextMenus                       | 未开始    | 右键菜单展示                                                           |
| cookies                            | 未开始    | 查询和修改 Cookie                                                      |
| debugger                           | 未开始    | 作为 Chrome 远程调试协议的替代传输方式                                     |
| declarativeContent                 | 未开始    | 根据网页内容执行操作，而无需读取网页内容的权限                               |
| declarativeNetRequest              | 未开始    | 通过指定声明性规则来屏蔽或修改网络请求                                      |
| desktopCapture                     | 未开始    | 获屏幕、单个窗口或单个标签页的内容                                         |
| devtools.inspectedWindow           | 未开始    | 与当前选中的标签页进行交互，例如执行 JavaScript 代码或获取 DOM 元素           |
| devtools.network                   | 未开始    | 监控和分析网络请求，例如查看请求头、响应体和网络延迟等信息                      |
| devtools.panels                    | 未开始    | 开发者工具展示                                                          |
| devtools.performance               | 未开始    | 分析和优化网页性能，例如测量页面加载时间、渲染时间和资源使用情况等信息            |
| devtools.recorder                  | 未开始    | 记录用户在浏览器中的操作，例如点击、滚动和输入文本等事件，以便后续分析和回放       |
| dns                                | ❌️       | 仅在 Chrome Dev 中可用。目前没有将此 API 从开发渠道移至 Chrome 稳定版的计划   |
| documentScan                       | ❌️       | 仅限 ChromeOS                                                         |
| dom                                | ❌️       | 适用于扩展程序的特殊 DOM API (不知道怎么用，想到在写 demo)                  | 
| downloads                          | 未开始    | 以编程方式发起、监控、操纵和搜索下载                                       |  
| enterprise.deviceAttributes        | ❌️       | 仅限 ChromeOS                                                         |
| enterprise.hardwarePlatform        | ❌️       | 管理企业设备的硬件平台信息，适用于由企业政策安装的扩展程序。                   |
| enterprise.login                   | ❌️       | 仅限 ChromeOS                                                         |
| enterprise.networkingAttributes    | ❌️       | 仅限 ChromeOS                                                         |
| enterprise.platformKeys            | ❌️       | 仅限 ChromeOS                                                         |
| events                             | 未开始    | 监听和响应 Chrome 扩展程序的事件，例如用户交互、系统事件等。                   |
| extension                          | 未开始    | 可供任何扩展程序页面使用的实用程序                                          |
| extensionTypes                     | 未开始    | 定义 Chrome 扩展程序的类型，例如后台脚本、内容脚本、弹出窗口等。                |
| favicon                            | 未开始    | 获取网站图标                                                            |
| fileBrowserHandler                 | ❌️       | 仅限 ChromeOS                                                          |
| fileSystemProvider                 | ❌️       | 仅限 ChromeOS                                                          |
| fontSettings                       | 未开始    | 管理 Chrome 的字体设置                                                   |
| gcm                                | 未开始    | 与 Google Cloud Messaging (GCM) 进行通信，用于发送和接收消息。              |
| history                            | 未开始    | 管理用户的浏览器历史记录                                                   |
| i18n                               | 未开始    | 国际化                                                                  |
| identity                           | 未开始    | 与用户身份验证和授权相关的 API，例如登录、注销和获取用户信息等。                 |
| idle                               | 未开始    | 检测用户是否空闲，以及在用户空闲时执行操作。                                  |    
| input.ime                          | ❌️       | 仅限 ChromeOS                                                          |
| instanceID                         | 未开始    |                                                                        |
| loginState                         | ❌️       | 仅限 ChromeOS                                                          |
| management                         | 未开始    | 管理安装式应用和扩展程序                                                   |
| notifications                      | 未开始    | 通知展示                                                                |
| offscreen                          | 未开始    | 创建和管理屏幕外文档                                                      |
| omnibox                            | 未开始    | 向 Google Chrome 的地址栏注册关键字                                       |
| pageCapture                        | 未开始    | 将标签页另存为 MHTML                                                     |
| permissions                        | 未开始    | 可选的权限                                                              |
| platformKeys                       | ❌️       | 仅限 ChromeOS                                                          |
| power                              | 未开始    | 电源管理                                                                |
| printerProvider                    | ❌️       | 查询由扩展程序控制的打印机、查询其功能以及向这些打印机提交打印作业的事件。         |
| printing                           | ❌️       | 仅限 ChromeOS                                                          |
| printingMetrics                    | ❌️       | 仅限 ChromeOS                                                          |
| privacy                            | 未开始    | 控制 Chrome 中可能会影响用户隐私的功能的使用情况                             |
| processes                          | ❌️       | 仅在 Chrome Dev 中可用。 与浏览器的进程进行交互                             |
| proxy                              | 未开始    | 管理 Chrome 的代理设置                                                   |
| readingList                        | 未开始    | 读取和修改阅读清单中的内容                                                 |
| runtime                            | 未开始    | 检索服务工作线程、返回清单的相关详细信息，以及监听和响应扩展程序生命周期中的事件    |
| scripting                          | 未开始    | 在不同上下文中执行脚本                                                     |  
| search                             | 未开始    | 通过默认提供程序进行搜索                                                   |
| sessions                           | 未开始    | 查询和恢复浏览会话中的标签页和窗口                                           |
| sidePanel                          | 未开始    | 侧边栏展示                                                               |
| storage                            | 未开始    | 数据存储                                                                |
| system.cpu                         | 未开始    | 查询 CPU 元数据                                                          |
| system.display                     | 未开始    | 查询内存元数据                                                           |
| system.memory                      | 未开始    | 查询存储元数据                                                           |
| system.storage                     | 未开始    | 查询显示元数据                                                           |
| systemLog                          | ❌️       | 仅限 ChromeOS                                                          |
| tabCapture                         | 未开始    | 与标签页媒体流进行互动                                                    |
| tabGroups                          | 未开始    | 标签页分组系统进行交互                                                    |
| tabs                               | 未开始    | 与标签页系统进行交互                                                      |     
| topSites                           | 未开始    | 获取访问次数最多的网站                                                    |
| tts                                | 未开始    | 播放合成的文字转语音 (TTS)                                                |
| ttsEngine                          | 未开始    | 通过扩展程序实现文本转语音(TTS) 引擎                                        |
| types                              | 未开始    | ChromeSetting 类型提供了一组通用函数（get()、set() 和 clear()）事件处理 (onChange)  |
| userScripts                        | 未开始    | 在用户脚本上下文中执行用户脚本                                             |
| vpnProvider                        | ❌️       | 仅限 ChromeOS                                                          |
| wallpaper                          | ❌️       | 仅限 ChromeOS                                                          |
| webAuthenticationProxy             | ❌️       | 拦截 Web 身份验证 API (WebAuthn) 请求，以便在本地客户端上处理这些请求 (搞不明白)  |
| webNavigation                      | 未开始    | 接收有关正在处理的导航请求的状态的通知                                      |
| webRequest                         | 未开始    | 观察和分析流量，并拦截、屏蔽或修改正在处理的请求                              |
| windows                            | 未开始    | 在浏览器中创建、修改和重新排列窗口                                          |


## 参考资料
```
https://github.com/sxei/chrome-plugin-demo
https://developer.chrome.com/docs/extensions?hl=zh-cn
https://developer.chrome.com/docs/extensions/samples?hl=zh-cn
```