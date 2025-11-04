# permissions 权限

> 如需访问大多数扩展程序 API 和功能，您必须在扩展程序的清单中声明权限。某些权限会触发警告，用户必须允许才能继续使用扩展程序

## 声明权限

如需使用大多数扩展程序 API 和功能，您必须在清单的权限字段中声明扩展程序的 intent。扩展程序可以请求使用相应清单键指定的以下类别的权限：

- permissions 

    包含已知字符串列表中的项。更改可能会触发警告
    ```json
    {
        "permissions": [
            "tabs"
        ]
    }
    ```

- optional_permissions 

    由用户在运行时（而不是安装时）授予, 查看 chrome.permissions API。
    ```json
    {
        "optional_permissions": [
            "tabs"
        ]
    }
    ```

- content_scripts.matches 

    包含一个或多个匹配模式，允许内容脚本注入到一个或多个主机中。更改可能会触发警告。
    ```json
    {
        "content_scripts": [
            {
                "js": [
                    "js/content-script.js"
                ],
                "matches": [
                    "http://*.example.com//"
                ]
            }
        ]
    }
    ```

- host_permissions 

    包含一个或多个匹配格式，用于授予对一个或多个主机的访问权限。更改可能会触发警告。
    ```json
    {
        "host_permissions": [
            "https://www.developer.chrome.com/*"
        ],
    }
    ```

- optional_host_permissions 

    由用户在运行时（而不是安装时）授予。
    ```json
    {
        "optional_host_permissions":[
            "https://*/*",
            "http://*/*"
        ]
    }
    ```

## 最佳实践

权限警告描述了 API 授予的功能，但有些警告比其他警告更难理解。用户更有可能安装遵循以下准则的扩展程序：

- 请求相关权限

    扩展程序必须实现单一用途，并遵守权限的使用政策。请确保仅请求支持扩展程序主要功能的权限。

- 使用可选权限

    通过在运行时请求权限，改善新手入门体验。这样，您就可以围绕特定权限提供更多背景信息，并让用户选择要启用的功能。如需了解实现详情，请参阅 [Permissions API](https://developer.chrome.com/docs/extensions/reference/api/permissions)。

- 使用“activeTab”权限

    此权限不会显示权限警告。它会向用户所在的网站授予临时主机权限。如需了解详情，请参阅了解 [ActiveTab 权限](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab?hl=zh-cn)。


## 所有权限
```markdown
- ccessibilityFeatures.modify

    允许扩展程序在使用 chrome.accessibilityFeatures API 时修改无障碍功能状态。
    显示的警告：更改无障碍设置。

- accessibilityFeatures.read

    允许扩展程序在使用 chrome.accessibilityFeatures API 时读取无障碍功能状态。
    显示的警告：查看您的无障碍设置。

- activeTab

    通过用户手势授予对当前标签页的临时访问权限。如需了解详情，请参阅 activeTab。
    显示的警告：访问当前标签页。

- alarms

    授予对 chrome.alarms API 的访问权限。

- audio

    授予对 chrome.audio API 的访问权限。

- background

    使 Chrome 提前启动（用户登录计算机后立即启动，在用户启动 Chrome 之前），并延迟关闭（即使在其最后一个窗口关闭后，也要等到用户明确退出 Chrome）。 
    显示的警告：在 Chrome 启动时运行。

- bookmarks

    授予对 chrome.bookmarks API 的访问权限。
    显示的警告：读取和更改您的书签。

- browsingData

    授予对 chrome.browsingData API 的访问权限。
    显示的警告：删除您的浏览数据。

- certificateProvider

    授予对 chrome.certificateProvider API 的访问权限。
    显示的警告：管理您的证书。

- clipboardRead

    允许扩展程序使用 Web 平台 Clipboard API 粘贴剪贴板中的内容。
    显示的警告：读取您复制和粘贴的数据。

- clipboardWrite

    允许扩展程序使用 Web 平台 Clipboard API 剪切和复制内容到剪贴板。
    显示的警告：修改您复制和粘贴的数据。

- contentSettings

    授予对 chrome.contentSettings API 的访问权限。
    显示的警告：更改您用于控制以下权限的设置：网站对 Cookie、JavaScript、插件、地理位置信息、麦克风、摄像头等功能的使用权限。

- contextMenus

    授予对 chrome.contextMenus API 的访问权限。
    显示的警告：添加自定义上下文菜单。

- cookies

    授予对 chrome.cookies API 的访问权限。
    显示的警告：读取和更改您在所有网站上的所有 Cookie。

- debugger

    授予对 chrome.debugger API 的访问权限。
    显示的警告：
    访问页面调试程序后端。
    读取和更改您在所有网站上的所有数据。        

- declarativeContent

    授予对 chrome.declarativeContent API 的访问权限。
    显示的警告：根据页面内容显示或隐藏扩展程序图标。

- declarativeNetRequest

    授予对 chrome.declarativeNetRequest API 的访问权限。
    显示的警告：屏蔽所有页面上的内容。

- declarativeNetRequestWithHostAccess

    可访问 chrome.declarativeNetRequest API，但需要主机权限才能执行所有操作。
    显示的警告：屏蔽所有页面上的内容。

- declarativeNetRequestFeedback

    授予使用 chrome.declarativeNetRequest API 时将错误和警告写入开发者工具控制台的权限。此权限适用于未封装的扩展程序，系统会忽略通过 Chrome 应用商店安装的扩展程序。
    显示的警告：读取您的浏览记录。

- dns

    授予对 chrome.dns API 的访问权限。
    显示的警告：读取和更改您在所有网站上的所有 DNS 记录。

- desktopCapture

    授予对 chrome.desktopCapture API 的访问权限。
    显示的警告：截取屏幕内容。

- documentScan

    授予对 chrome.documentScan API 的访问权限。
    显示的警告：扫描文档。

- downloads

    授予对 chrome.downloads API 的访问权限。
    显示的警告：管理您的下载内容。

- downloads.open

    允许使用 chrome.downloads.open()。
    显示的警告：管理您的下载内容。
    
- downloads.ui

    允许使用 chrome.downloads.setUiOptions()。
    显示的警告：管理您的下载内容。

- enterprise.deviceAttributes

    授予对 chrome.enterprise.deviceAttributes API 的访问权限。

- enterprise.hardwarePlatform

    授予对 chrome.enterprise.hardwarePlatform API 的访问权限。

- enterprise.networkingAttributes

    授予对 chrome.enterprise.networkingAttributes API 的访问权限。

- enterprise.platformKeys

    授予对 chrome.enterprise.platformKeys API 的访问权限。

- favicon

    授予对 Favicon API 的访问权限。
    显示警告：查看您访问的网站的图标。

- fileBrowserHandler

    授予对 chrome.fileBrowserHandler API 的访问权限。
    显示警告：管理您的文件浏览器。

- fileSystemProvider

    授予对 chrome.fileSystemProvider API 的访问权限。
    显示警告：管理您的文件系统。

- fontSettings

    授予对 chrome.fontSettings API 的访问权限。
    显示警告：更改您用于控制字体设置的系统字体。

- gcm

    授予对 chrome.gcm 和 chrome.instanceID API 的访问权限。
    显示警告：发送和接收消息。

- geolocation

    允许扩展程序在不提示用户授予权限的情况下使用地理定位 API。
    显示的警告：检测您所在的地理位置。

- history

    授予对 chrome.history API 的访问权限。
    显示的警告：读取和更改您在所有已登录的设备上的浏览记录。

- identity

    授予对 chrome.identity API 的访问权限。

- identity.email

    通过 chrome.identity API 授予对用户电子邮件地址的访问权限。
    显示的警告：请注意您的电子邮件地址。

- idle

    授予对 chrome.idle API 的访问权限。
    显示的警告：检测用户是否空闲。

- loginState

    授予对 chrome.loginState API 的访问权限。
    显示的警告：读取您的登录状态。

- management

    授予对 chrome.management API 的访问权限。
    显示的警告：管理您的应用、扩展程序和主题背景。

- nativeMessaging

    授予对原生消息传递 API 的访问权限。
    显示的警告：与协作的原生应用进行通信。

- notifications

    授予对 chrome.notifications API 的访问权限。
    显示的警告：显示通知

- offscreen

    授予对 chrome.offscreen API 的访问权限。

- pageCapture

    授予对 chrome.pageCapture API 的访问权限。
    显示的警告：读取和更改您在所有网站上的所有数据。

- platformKeys

    授予对 chrome.platformKeys API 的访问权限。

- power

    授予对 chrome.power API 的访问权限。
    显示的警告：更改系统电源设置。

- printerProvider

    授予对 chrome.printerProvider API 的访问权限。
    显示的警告：管理您的打印机。

- printing

    授予对 chrome.printing API 的访问权限。
    显示的警告：打印文档。

- printingMetrics

    授予对 chrome.printingMetrics API 的访问权限。
    显示的警告：读取打印指标。

- privacy

    授予对 chrome.privacy API 的访问权限。
    显示的警告：更改与隐私权相关的设置。

- processes

    授予对 chrome.processes API 的访问权限。
    显示的警告：查看和管理系统进程。

- proxy

    授予对 chrome.proxy API 的访问权限。
    显示的警告：读取和更改您在所有网站上的所有数据。

- readingList

    授予对 chrome.readingList API 的访问权限。
    显示的警告：读取和更改阅读清单中的条目。

- runtime

    可访问 runtime.connectNative() 和 runtime.sendNativeMessage()。对于 runtime 命名空间的所有其他功能，无需任何权限。

- scripting

    授予对 chrome.scripting API 的访问权限。

- search

    授予对 chrome.search API 的访问权限。
    显示的警告：搜索您的设备。

- sessions

    授予对 chrome.sessions API 的访问权限。
    显示的警告：
    与 "history" 权限搭配使用时：读取和更改您在所有已登录的设备上的浏览记录。
    与 "tabs" 权限搭配使用时：读取您在所有已登录的设备上的浏览记录。

- sidePanel

    授予对 chrome.sidePanel API 的访问权限。
    显示的警告：查看和管理您的侧边面板。

- storage

    授予对 chrome.storage API 的访问权限。
    显示的警告：读取和更改您在所有网站上的所有数据。

- system.cpu

    授予对 chrome.system.cpu API 的访问权限。
    显示的警告：读取系统 CPU 信息。

- system.display

    授予对 chrome.system.display API 的访问权限。
    显示的警告：读取和更改系统显示设置。

- system.memory

    授予对 chrome.system.memory API 的访问权限。
    显示的警告：读取系统内存信息。

- system.storage

    授予对 chrome.system.storage API 的访问权限。
    显示的警告：识别并弹出存储设备。

- tabCapture

    授予对 chrome.tabCapture API 的访问权限。
    显示的警告：读取和更改您在所有网站上的所有数据。

- tabGroups

    授予对 chrome.tabGroups API 的访问权限。
    显示的警告：查看和管理您的标签页组。

- tabs

    授予对多个 API（包括 chrome.tabs 和 chrome.windows）使用的标签页对象的特许字段的访问权限。您通常不需要声明此权限即可使用这些 API。
    显示的警告：读取您的浏览记录。

- topSites

    授予对 chrome.topSites API 的访问权限。
    显示的警告：查看您最常访问的网站列表。

- tts

    授予对 chrome.tts API 的访问权限。
    显示的警告：使用合成语音朗读所说出的所有文字。

- ttsEngine

    授予对 chrome.ttsEngine API 的访问权限。
    显示的警告：使用合成语音朗读所说出的所有文字。

- unlimitedStorage

    为 chrome.storage.local、IndexedDB、Cache Storage 和 Origin Private File System 提供不限配额。如需了解详情，请参阅存储空间和 Cookie。

- userScripts

    授予对 chrome.userScripts API 的访问权限。注意：用户还必须明确启用用户脚本的使用。

- vpnProvider

    授予对 chrome.vpnProvider API 的访问权限。
    显示的警告：管理您的 VPN 连接。

- wallpaper

    授予对 chrome.wallpaper API 的访问权限。
    显示的警告：更改您的壁纸。

- webAuthenticationProxy

    授予对 chrome.webAuthenticationProxy API 的访问权限。
    显示的警告：读取和更改您在所有网站上的所有数据

- webNavigation

    授予对 chrome.webNavigation API 的访问权限。
    显示的警告：读取您的浏览记录。

- webRequest

    授予对 chrome.webRequest API 的访问权限。

- webRequestBlocking

    允许使用 chrome.webRequest API 进行屏蔽。
 
```

## 资料
```markdown
https://developer.chrome.com/docs/extensions/reference/permissions-list?hl=zh-cn
```