# 清单文件格式  (manifest.json)

> 每个扩展程序的根目录中都必须有一个 manifest.json 文件，其中列出了与该扩展程序的结构和行为相关的重要信息

## 示例
### 最小清单
```json
{
    "manifest_version": 3,
    "name": "Minimal Manifest",
    "version": "1.0.0",
    "description": "A basic example extension with only required keys",
    "icons": {
        "48": "images/icon-48.png",
        "128": "images/icon-128.png"
    }
}
```

### 注册内容脚本
```json
{
    "manifest_version": 3,
    "name": "Run script automatically",
    "description": "Runs a script on www.example.com automatically when user installs the extension",
    "version": "1.0",
    "icons": {
        "16": "images/icon-16.png",
        "32": "images/icon-32.png",
        "48": "images/icon-48.png",
        "128": "images/icon-128.png"
    },
    "content_scripts": [
        {
            "js": [
                "content-script.js"
            ],
            "matches": [
                "http://*.example.com//"
            ]
        }
    ]
}
```

### 注入内容脚本
```json
{
    "manifest_version": 3,
    "name": "Click to run",
    "description": "Runs a script when the user clicks the action toolbar icon.",
    "version": "1.0",
    "icons": {
        "16": "images/icon-16.png",
        "32": "images/icon-32.png",
        "48": "images/icon-48.png",
        "128": "images/icon-128.png"
    },
    "background": {
        "service_worker": "service-worker.js"
    },
    "action": {
        "default_icon": {
            "16": "images/icon-16.png",
            "32": "images/icon-32.png",
            "48": "images/icon-48.png",
            "128": "images/icon-128.png"
        }
    },
    "permissions": ["scripting", "activeTab"]
}
```

### 带权限的弹出式窗口
```json
{
    "manifest_version": 3,
    "name": "Popup extension that requests permissions",
    "description": "Extension that includes a popup and requests host permissions and storage permissions .",
    "version": "1.0",
    "icons": {
        "16": "images/icon-16.png",
        "32": "images/icon-32.png",
        "48": "images/icon-48.png",
        "128": "images/icon-128.png"
    },
    "action": {
        "default_popup": "popup.html"
    },
    "host_permissions": [
        "https://*.example.com/"
    ],
    "permissions": [
        "storage"
    ]
}
```

### 侧边栏
```json
{
    "manifest_version": 3,
    "name": "Side panel extension",
    "version": "1.0",
    "description": "Extension with a default side panel.",
    "icons": {
        "16": "images/icon-16.png",
        "48": "images/icon-48.png",
        "128": "images/icon-128.png"
    },
    "side_panel": {
        "default_path": "sidepanel.html"
    },
    "permissions": ["sidePanel"]
}
```

## 清单属性 (Manifest keys)
### 扩展程序平台所需的密钥
- manifest_version

    指定扩展程序使用的清单文件格式的版本。唯一支持的值是 3

- name
    
    用于在 Chrome 应用商店、安装对话框和用户的“Chrome 扩展程序”页面 (chrome://extensions) 中标识扩展程序。
    此字符串的长度不得超过 75 个字符。如需了解如何使用特定于语言区域的名称，请参阅[国际化](https://developer.chrome.com/docs/extensions/reference/api/i18n?hl=zh-cn)。

- version
    
    用于标识扩展程序版本号的字符串。如需了解版本号格式设置，请参阅[版本](https://developer.chrome.com/docs/extensions/reference/manifest/version?hl=zh-cn)。


### Chrome 应用商店所需的属性(Required keys for the Chrome Web Store)
- description

    用于在 Chrome 应用商店和用户的扩展程序管理页面上描述扩展程序。
    长度上限为 132 个字符。如需了解如何本地化说明，请参阅[国际化](https://developer.chrome.com/docs/extensions/reference/api/i18n?hl=zh-cn)。

- icons

    一个或多个表示您的扩展程序的图标。如需了解最佳实践，请参阅[图标](https://developer.chrome.com/docs/extensions/reference/manifest/icons?hl=zh-cn)


### 可选属性(Optional keys)

- action

    >  action 是可选的。如果未包含此元素，扩展程序仍会显示在工具栏中，以便用户访问扩展程序的菜单。因此，我们建议您始终至少包含 action 和 default_icon 键

    定义 Google 工具栏中扩展程序图标的外观和行为
    ```json
    {
        "action": {
            "default_icon": {  // optional
                "16": "images/icon16.png",   // optional
                "24": "images/icon24.png",   // optional
                "32": "images/icon32.png"    // optional
            },
            "default_title": "Click Me",   // optional, shown in tooltip
            "default_popup": "popup.html"  // optional
        },
    }
    ```
    - default_icon

        扩展程序工具栏上的主要图片，由清单的 "action" 键中的 "default_icon" 键设置。图标的宽度和高度必须为 16 个与设备无关的像素 (DIP)

        default_icon 可以椒包含大小到图片路径的字典。Chrome 会使用这些图标来选择要使用的图片缩放比例。如果找不到完全匹配的图片，Chrome 会选择最接近的可用图片并将其缩放为适合的尺寸，这可能会影响图片质量
        ```json
        {
            "action": {
                "default_icon": {
                    "16": "images/icon16.png",
                    "24": "images/icon24.png",
                    "32": "images/icon32.png"
                }
            }
        }
        ```

        可以将 default_icon 键设置为指向单个图标路径的字符串
        ```json
        {
            "action": {
                "default_icon": "images/icon16.png"
            }
        }
        ```

        也可以使用 chrome.action.setIcon 方法动态设置图标。例如，您可以根据用户交互或扩展程序状态更改图标。
        ```javascript
        chrome.action.setIcon({
            path: {
                "16": "images/icon16.png",
                "24": "images/icon24.png",
                "32": "images/icon32.png"
            }
        });
        ```

    - default_title

        当用户将鼠标指针悬停在工具栏中的扩展程序图标上时，系统会显示提示或标题。当按钮获得焦点时，屏幕阅读器朗读的无障碍文本中也会包含该文本。
        ```json
        {
            "action": {
                "default_title": "Click Me"
            }
        }
        ```
        可以通过调用 action.setTitle() 方法动态设置标题
        ```javascript
        chrome.action.setTitle({
            title: "New Title"
        });
        ```

    - default_popup

        当用户点击工具栏中的扩展程序操作按钮时，系统会显示相应操作的弹出式窗口。弹出式窗口可以包含您喜欢的任何 HTML 内容，并且会自动调整大小以适应其内容。弹出式窗口的尺寸必须介于 25x25 像素和 800x600 像素之间
        ```json
        {
            "action": {
                "default_popup": "popup.html"
            }
        }
        ```

        可以使用 action.setPopup() 方法动态更新该属性，使其指向其他相对路径
        ```javascript
        chrome.action.setPopup({
            popup: "new_popup.html"
        });
        ```

    - 徽章(badge)

        操作可以选择性地显示“徽章”，即叠加在图标上的一小段文字。这样，您就可以更新操作，以显示有关扩展程序状态的少量信息，例如计数器。徽章包含文本组件和背景颜色。由于空间有限，我们建议徽章文字不超过 4 个字符。

        如需创建徽章，请通过调用 action.setBadgeBackgroundColor() 和 action.setBadgeText() 以编程方式进行设置。清单中没有默认的徽章设置。徽章颜色值可以是介于 0 到 255 之间的四个整数组成的数组，用于构成徽章的 RGBA 颜色，也可以是具有 CSS 颜色值的字符串

- background

    包含扩展程序的服务工件的 JavaScript 文件，该文件充当事件处理脚本
    ```json
    {
        "background": {
            "service_worker": "js/background.js" // 定义处理扩展程序事件的脚本
        }
    }
    ```

- chrome_settings_overrides

    为所选 Chrome 设置定义替换首页、搜索服务提供商和启动页
    search_provider、homepage 和 startup_pages 属性的所有值都可以本地化 使用 chrome.i18n API
    ```json
    {
        "chrome_settings_overrides": {
            "homepage": "https://www.homepage.com",
            "search_provider": {
                "name": "name.__MSG_url_domain__",
                "keyword": "keyword.__MSG_url_domain__",
                "search_url": "https://www.foo.__MSG_url_domain__/s?q={searchTerms}",
                "favicon_url": "https://www.foo.__MSG_url_domain__/favicon.ico",
                "suggest_url": "https://www.foo.__MSG_url_domain__/suggest?q={searchTerms}",
                "instant_url": "https://www.foo.__MSG_url_domain__/instant?q={searchTerms}",
                "image_url": "https://www.foo.__MSG_url_domain__/image?q={searchTerms}",
                "search_url_post_params": "search_lang=__MSG_url_domain__",
                "suggest_url_post_params": "suggest_lang=__MSG_url_domain__",
                "instant_url_post_params": "instant_lang=__MSG_url_domain__",
                "image_url_post_params": "image_lang=__MSG_url_domain__",
                "alternate_urls": [
                    "https://www.moo.__MSG_url_domain__/s?q={searchTerms}",
                    "https://www.noo.__MSG_url_domain__/s?q={searchTerms}"
                ],
                "encoding": "UTF-8",
                "is_default": true
            },
            "startup_pages": ["https://www.startup.com"]
        }
    }
    ```
    属性说明
    - `homepage` 定义 Chrome 启动时显示的首页 URL。如果未指定，则使用 Chrome 默认值。

    - `startup_pages` 定义 Chrome 启动时显示的启动页 URL 列表。如果未指定，则使用 Chrome 默认值。

     - `search_provider` 定义 Chrome 搜索服务提供商的属性。如果未指定，则使用 Chrome 默认值。
        - `name` 定义搜索服务提供商的名称。
        - `keyword` 定义搜索服务提供商的搜索关键词。
        - `search_url` 定义搜索服务提供商的搜索 URL。
        - `favicon_url` 定义搜索服务提供商的 favicon URL。
        - `suggest_url` 定义搜索服务提供商的建议 URL。
        - `instant_url` 定义搜索服务提供商的即时 URL。
        - `image_url` 定义搜索服务提供商的图像 URL。
        - `search_url_post_params` 定义搜索服务提供商的搜索 URL 后参数。
        - `suggest_url_post_params` 定义搜索服务提供商的建议 URL 后参数。
        - `instant_url_post_params` 定义搜索服务提供商的即时 URL 后参数。
        - `image_url_post_params` 定义搜索服务提供商的图像 URL 后参数。
        - `alternate_urls` 定义搜索服务提供商的替代 URL 列表。
        - `encoding` 定义搜索服务提供商的编码。
        - `is_default` 定义搜索服务提供商是否为默认值。

- chrome_url_overrides

    扩展程序可以使用 HTML 替换页面来替换 Google Chrome 通常提供的页面。扩展程序可以包含对以下任一网页的替换项，
    但每个扩展程序只能替换一个网页

    - `bookmarks` 书签管理器
        用户从 Chrome 菜单中选择“书签管理器”菜单项或在 Mac 上从“书签”菜单中选择“书签管理器”菜单项时显示的页面。
        可以输入网址 chrome://bookmarks 前往此页面。
        ```json
        {
            "chrome_url_overrides": {
                "bookmarks": "bookmarks.html"
            }
        }
        ```
    - `history` 历史记录
        用户从 Chrome 菜单中选择“历史记录”菜单项或在 Mac 上从“历史记录”菜单中选择“显示完整历史记录”菜单项时显示的页面。
        可以输入网址 chrome://history 前往此页面。
        ```json
        {
            "chrome_url_overrides": {
                "history": "history.html"
            }
        }
        ```
    - `newtab` 打开新的标签页
        用户创建新标签页或新窗口时显示的页面。
        可以输入网址 chrome://newtab 前往此页面。
        ```json
        {
            "chrome_url_overrides": {
                "newtab": "newtab.html"
            }
        }
        ```

- `commands` 命令

        ```json
        {
            "commands": {
                "run-foo": { // 设置的命令名称 通过 chrome.commands.onCommand.addListener((command) => {});
                    "suggested_key": { // 触发命令的组合键 可以是个数组定义在不同系统下 按键可以不一样
                        "default": "Ctrl+Shift+Y",
                        "mac": "Command+Shift+Y"
                    },
                    "description": "Run \"foo\" on the current page." // optional 命令描述
                },
                "_execute_action": {
                    "suggested_key": {
                        "windows": "Ctrl+Shift+Y",
                        "mac": "Command+Shift+Y",
                        "chromeos": "Ctrl+Shift+U",
                        "linux": "Ctrl+Shift+J"
                    }
                }
            }
        }
        ```

    - 预留命令
        - `_execute_action` 触发操作（V3）
        - `_execute_browser_action` 触发浏览器操作(V2)
        - `_execute_page_action` 触发网页操作(V2)

    - 支持的键 
        以下键可用作命令快捷键。键定义区分大小写。尝试加载 key 大小写不正确的扩展程序会导致安装时出现清单解析错误。
        ```markdown
        - Alpha 
        
            A … Z

        - 数字键
            0 … 9
        
        - 标准 key 字符串
        
            常规 - Comma、Period、Home、End、PageUp、PageDown、Space、Insert、Delete

            箭头键 - Up、Down、Left、Right

            媒体键 - MediaNextTrack、MediaPlayPause、MediaPrevTrack、MediaStop

        - 辅助键字符串

            Ctrl、Alt、Shift、MacCtrl（仅限 macOS）、Command（仅限 macOS）、Search（仅限 ChromeOS）
        ```
    - 组合键要求
        ```markdown
        - 扩展命令快捷方式必须包含 Ctrl 或 Alt。

            - 修饰键不能与媒体键结合使用。

            - 在许多 macOS 键盘上，Alt 指的是 Option 键。

            - 在 macOS 上，Command 或 MacCtrl 也可用于代替 Ctrl 或 Alt（请参阅下一个项目符号）。

        - 在 macOS 上，Ctrl 会自动转换为 Command。

            - Command 还可用于 "mac" 快捷方式，以明确指代 Command 键。

            - 如需在 macOS 上使用 Control 键，请在定义 "mac" 快捷方式时将 Ctrl 替换为 MacCtrl。

            - 在其他平台的组合中使用 MacCtrl 会导致验证错误，并阻止安装扩展程序。

        - Shift 是所有平台上的可选修饰符。

        - Search 是 ChromeOS 独有的可选修饰符。

        - 某些操作系统和 Chrome 快捷键（例如窗口管理）始终优先于扩展程序命令快捷键，并且无法被替换。
        ```
- content_scripts

    指定用户打开特定网页时要使用的 JavaScript 或 CSS 文件
    ```json
    {
        "content_scripts": [
            {
                "matches": ["https://*.bluefrog.com/*"],
                "css": ["css/styles.css"],
                "js": ["js/content-script.js"],
                "run_at": "document_end", // document_start | document_end | document_idle
                "world": "MAIN", // ISOLATED 指定隔离的世界 |  MAIN  指定 DOM 的主要世界
                "match_about_blank": false,
                "match_origin_as_fallback": false,
            }
        ]
    }
    ```
    - matches required 必须
    
        指定此内容脚本将注入到哪些网页中。如需详细了解这些字符串的语法，请参阅[匹配模式](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns?hl=zh-cn)；如需了解如何排除网址，请参阅[匹配模式和 Glob](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns?hl=zh-cn#glob)。

    - css  optional 可选

        要注入到匹配页面中的 CSS 文件列表。这些资源会按其在此数组中出现的顺序注入，在为网页构建或显示任何 DOM 之前注入

    - js optional 可选
        
        要注入到匹配网页中的 JavaScript 文件列表。文件会按照它们在此数组中显示的顺序注入。此列表中的每个字符串都必须包含扩展程序根目录中资源的相对路径。系统会自动去除开头的斜杠 (`/`)。

    - run_at optional 可选 默认值为 document_idle
        
        指定脚本应何时注入到网页中
        
        - document_start

            脚本在任何 CSS 文件之后注入，但在构建任何其他 DOM 或运行任何其他脚本之前注入。

        - document_end

            在 DOM 完成后立即注入脚本，但在图片和框架等子资源加载之前注入。

        - document_idle
            
            浏览器会选择一个时间在“document_end”和 window.onload 事件触发后立即注入脚本。
            注入的确切时间取决于文档的复杂程度和加载所需的时间，并针对网页加载速度进行了优化。
            以“document_idle”运行的内容脚本无需监听 window.onload 事件；它们保证在 DOM 完成后运行。
            如果脚本确实需要在 window.onload 之后运行，扩展程序可以使用 document.readyState 属性检查 onload 是否已触发
    
    - match_about_blank	 optional 可选  默认值为 false

        脚本是否应注入到父框架或打开程序框架与 matches 中声明的某个模式匹配的 about:blank 框架中

    - match_origin_as_fallback optional 可选  默认值为 false
        
        脚本是否应注入到由匹配来源创建的框架中，但这些框架的网址或来源可能无法直接与模式匹配。
        这些帧包括采用不同方案的帧，例如 about:、data:、blob: 和 filesystem:。另请参阅[在相关帧中注入。](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts?hl=zh-cn#injecting-in-related-frames)

    - world	ExecutionWorld	ptional 可选  默认值为 ISOLATED
    
        脚本要在其中执行的 JavaScript 世界 另请参阅[在隔离的世界中工作](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts?hl=zh-cn#isolated-worlds)

        - ISOLATED

            指定隔离的世界，即此扩展程序独有的执行环境。

        - MAIN

            指定 DOM 的主要世界，即与宿主网页的 JavaScript 共享的执行环境

- content_security_policy

    对扩展程序可以使用的脚本、样式和其他资源施加限制
    如果用户未在清单中定义内容安全政策，则扩展程序页面和沙盒化扩展程序页面将使用默认属性
    ```json
    {
        "content_security_policy": {
            "extension_pages": "script-src 'self'; object-src 'self';",
            "sandbox": "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'unsafe-inline' 'unsafe-eval'; child-src 'self';"
        }
    }
    ```

- cross_origin_embedder_policy

    为 Cross-Origin-Embedder-Policy HTTP 标头指定值，用于配置在扩展程序页面中嵌入跨源资源
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy

    ```json
    {
        "cross_origin_embedder_policy": "require-corp" // unsafe-none | require-corp | credentialless
    }   
    ```

- cross_origin_opener_policy

    为 Cross-Origin-Opener-Policy HTTP 标头指定值，以便确保顶级扩展程序页面不会与跨源文档共享浏览上下文组
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy

    ```json
    {
        "cross_origin_opener_policy": "unsafe-none" // unsafe-none | same-origin-allow-popups | same-origin | noopener-allow-popups
    }   
    ```

- declarative_net_request

    为 declarativeNetRequest API 定义静态规则，允许屏蔽和修改网络请求
    https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest?hl=zh-cn#rules
    ```json
    {
        "declarative_net_request": {
            "rule_resources": [{
                "id": "ruleset_1",
                "enabled": true,
                "path": "rules_1.json"
            }, {
                "id": "ruleset_2",
                "enabled": false,
                "path": "rules_2.json"
            }]
        }
    }
    ```

- default_locale

    用于定义支持多语言区域的扩展程序的默认语言。例如“en”和“pt_BR”。
    此键是本地化扩展程序的必需键，不得在未本地化的扩展程序中使用。如需了解详情，请参阅[国际化](https://developer.chrome.com/docs/extensions/develop/concepts/i18n?hl=zh-cn)
    ```json
    {
        "default_locale": "en"
    }
    ```

- devtools_page

    必须指向 HTML 页面。由于 DevTools 页面必须是扩展程序的本地页面，因此我们建议您使用相对网址指定该页面
    ```json
    {
        "devtools_page": "pages/devtools.html"
    }
    ```

- export"

    > Chrome 应用商店不允许提交共享模块

    表示扩展程序是导出其资源的共享模块 配合 导出给其他扩展程序使用
    ```json
    {
        "export": {
            "allowlist": [ // 允许导入资源的扩展程序ID列表
                "shared_module_dir_1",
                "shared_module_dir_2"
            ]
        }
    }
    ```

    > 访问导出的共享模块 chrome-extension://<extension_id>/_modules/<shared_module_dir_1>/xxx.js

- externally_connectable

    用于声明哪些扩展程序和网页可以 使用 runtime.connect() 和 runtime.sendMessage() 连接到您的扩展程序 跨扩展调用
    ```json
    {
        "externally_connectable": {
            "ids": [ // 获得连接的扩展程序的 ID。如果留空或未指定，任何扩展程序或应用都无法连接。通配符 "*" 将允许所有扩展程序和应用进行连接。
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            ],
            // 允许连接的网页的网址格式。如果留空或未指定，任何网页都无法连接。格式不得包含通配符网域或（有效）顶级网域的子网域
            "matches": [
                "https://*.google.com/*",
                "*://*.chromium.org/*",
            ],
            // 允许扩展程序使用与其连接的网页的 TLS 通道 ID。网页还必须选择向扩展程序发送 TLS 通道 ID，
            // 具体方法是： 在 Runtime.connect 的 connectInfo 或 runtime.sendMessage 的选项中将 includeTlsChannelId 设置为 true。
            // 如果设为 false， 在任何情况下，都绝不会设置 runtime.MessageSender.tlsChannelId。
            "accepts_tls_channel_id": false
        }
    }
    ```
- homepage_url

    指定扩展程序首页的网址。如果未定义此属性，首页将默认为扩展程序的 Chrome 应用商店页面。如果您在自己的网站上托管扩展程序，此字段尤其有用。
    ```json
    {
        "homepage_url": "https://freewu.github.io/"
    }
    ```

- host_permissions

    列出您的扩展程序可以与之互动的网页，这些网页是使用网址匹配模式定义的。系统会在安装时请求用户授予对这些网站的权限。如需了解详情，请参阅[主机权限](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions?hl=zh-cn#host-permissions)。
    ```json
    {
        "host_permissions": [
            "https://*.google.com/*",
            "*://*.chromium.org/*",
        ]
    }
    ```

- import

    允许将资源导入扩展程序 参看 export

    ```json
    {
        "import": [
            {
                "id": "module1"
            },
            {
                "id": "module2"
                "minimum_version": "0.5" // optional
            },
        ]
    }

    # 引用
    <script src="_modules/module1/foo.js">
    ```
    
- incognito
    
    定义扩展程序在无痕模式下的行为方式。支持的值包括  spanning | split | not_allowed 
    ```json
    {
        "incognito": "spanning" // spanning | split | not_allowed 
    }
    ```
    - spanning 跨越模式
        默认模式为 "spanning"，表示扩展程序将在单个共享进程中运行。
        来自无痕式标签页的任何事件或消息都将发送到共享进程，并使用 无痕模式标志来指示它们的来源。
        由于无痕式标签页无法使用此共享进程，因此使用 "spanning" 无痕模式的扩展程序将无法将其扩展程序软件包中的页面加载到无痕式标签页的主框架中

    - split
        意味着无痕式窗口中的所有网页都将在自己的无痕进程中运行。
        如果扩展程序包含后台网页，该网页也会在无痕模式进程中运行。 此无痕模式进程与常规进程一起运行，但具有单独的内存纯 Cookie 存储。
        每个进程都只能查看来自自身上下文的事件和消息（例如，无痕模式进程只会看到无痕式标签页更新）。这些进程无法相互通信。

    - not_allowed
        在无痕模式下无法启用此扩展程序
    
- key

    为各种开发用例指定扩展程序的 ID Chrome 开发者信息中心 分配的公钥 
    ```json
    {
        "key": "Chrome 开发者信息中心 分配的公钥"
    }
    ```

- minimum_chrome_version

    定义可安装您的扩展程序的最旧 Chrome 版本。该值必须是现有 Chrome 浏览器版本字符串的子字符串，例如 "107" 或 "107.0.5304.87"。
    如果用户使用的 Chrome 版本低于最低版本，则会在 Chrome 应用商店中看到“不兼容”警告，并且无法安装您的扩展程序。
    如果您将此属性添加到现有扩展程序，则 Chrome 版本较低的用户将不会收到扩展程序的自动更新。
    ```json
    {
        "minimum_chrome_version": "107"
    }
    ```
- oauth2

    允许使用 OAuth 2.0 安全 ID。此键的值必须是具有 "client_id" 和 "scopes" 属性的对象。如需了解详情，请参阅 [OAuth 2.0 教程](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth?hl=zh-cn)。
    ```json
    {
        "oauth2": {
            "client_id": "Chrome 开发者信息中心 分配的客户端 ID",
            "scopes": [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ]
        }
    }
    ```

- "omnibox"
    
    允许扩展程序在 Chrome 的地址栏中注册关键字
    ```json
    {
        "omnibox": {
            "keyword": "bluefrog"
        }
    }
    ```

- optional_host_permissions

    为您的扩展程序声明可选的主机权限。
    ```json
    {
        "optional_host_permissions": [
            "https://*.google.com/*",
            "*://*.chromium.org/*",
        ]
    }
    ```

- optional_permissions

    为您的扩展程序声明可选权限。 配合 chrome.permissions API 做权限请求。
    ```json
    {
        "optional_permissions": [
            "tabs",
            "unlimitedStorage",
        ]
    }
    ```

- options_page

    指定 options.html 文件的路径，以供扩展程序用作选项页面, 在扩展详情提供打开选项页面的item tab 打开
    ```json
    {
        "options_page": "pages/options.html"
    }
    ```

- options_ui

    指定 options.html 文件的路径，以便用户从 Chrome“扩展程序”页面更改扩展程序选项 弹窗打开 
    ```json
    {
        "options_ui": {
            "page": "pages/options.html", // 指定相对于扩展程序根目录的选项页面路径
            "open_in_tab": false // 指示扩展程序的选项页面是否会在新标签页中打开。如果设为 false，该扩展程序的选项页面会嵌入到 chrome://extensions 中，而不会在新标签页中打开。
        },
    }
    ```

- permissions

    为您的扩展程序声明权限。
    ```json
    {
        "permissions": [
            "tabs",
            "unlimitedStorage",
        ]
    }
    ```

- requirements

    > 自 Chrome 45 版起，我们已停止为扩展程序提供 NPAPI 插件支持。在此过程中，“插件” 要求已被弃用，无法再在清单文件中使用。

    列出使用该扩展程序所需的技术。如需查看支持的要求列表，
    ```json
    {
        "requirements": {
            "3D": { // "3D" 要求表示 GPU 硬件加速，并采用 "webgl" 或 "css3d" 作为有效值。"webgl" 要求是指 WebGL API。有关 Chrome 浏览器 3D 图形支持的详情
                "features": [
                    "webgl"
                ]
            }
        }
    }
    ```

- sandbox

    定义一组不具有扩展程序 API 访问权限或对非沙盒化网页的直接访问权限的扩展程序网页。如需了解详情，请参阅沙盒。
    ```json
    {
        "content_security_policy": {
            "sandbox": "sandbox allow-scripts; script-src 'self' https://example.com"
        },
        "sandbox": {
            "pages": [
                "page1.html",
                "directory/page2.html"
            ]
        },
    }
    ```

    处于沙盒中有两个影响：

        - 沙盒化网页无法访问扩展程序 API，也无法直接访问 未经过沙盒屏蔽的网页（可以使用 postMessage() 与这些网页进行通信）。
        - 沙盒化页面不受其余组件使用的内容安全政策 (CSP) 的约束 扩展名（它有自己单独的 CSP 值）。也就是说，它可以 使用内嵌脚本和 eval()。

- short_name

    包含扩展程序名称的缩写版本，用于字符空间有限时。长度上限为 12 个字符。如果未定义此值，系统会改为显示“name”键的截断版本。

    ```json
    {
        "short_name": "ext short name"
    }
    ```
- side_panel

    用于标识要在 sidePanel 中显示的 HTML 文件。
    ```json
    {
        "side_panel": {
            "default_path": "pages/side-panel.html"
        }
    }
    ```

- storage

    为受管理的存储区域声明 JSON 架构。如需了解详情，请参阅[存储区域清单](https://developer.chrome.com/docs/extensions/reference/manifest/storage?hl=zh-cn)。
    ```json
    {
        "storage": {
            "managed_schema": "schemas/managed.json"
        }
    }
    ```

- tts_engine

    将扩展程序注册为文字转语音引擎。如需了解详情，请参阅 ttsEngine API。
    ```json
    {
        "tts_engine": {
            "voices": [
                {
                    "voice_name": "BlueFrog",
                    "lang": "en-US",
                    "gender": "male"
                }
            ]
        }
    }
    ```

- update_url

    扩展程序的更新页面的网址。如果您在 Chrome 应用商店之外托管扩展程序，请使用此属性。
    ```json
    {
        "update_url": "https://example.com/extension/update.xml"
    }
    ```

- version_name

    用于描述扩展程序的版本。例如 "1.0 beta" 和 "build rc2"。如果未指定此值，则“版本”值会显示在扩展程序管理页面上

    ```json
    {
        "version_name": "1.0 beta"
    }
    ```

- web_accessible_resources

    定义扩展程序中可供网页或其他扩展程序访问的文件。如需了解详情，请参阅[适用于网络的无障碍资源](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources?hl=zh-cn)。
    ```json
    {
        "web_accessible_resources": [
            {
                "resources": [
                    "images/*.png"
                ],
                "matches": [
                    "<all_urls>"
                ]
            }
        ]
    }
    ```

## 资料
```markdown
https://developer.chrome.com/docs/extensions/reference/manifest?hl=zh-cn
```