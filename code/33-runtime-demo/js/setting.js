// getContexts 提取与此扩展程序关联的有效上下文的相关信息
document.getElementById('get-contexts-btn').addEventListener('click', () => {
    console.log('get-contexts-btn 点击事件触发');
    chrome.runtime.getContexts(
        // https://developer.chrome.com/docs/extensions/reference/api/runtime?hl=zh-cn#type-ContextFilter
        { 
            // extensionIds: [chrome.runtime.id] 
        }, 
        (contexts) => {
            // https://developer.chrome.com/docs/extensions/reference/api/runtime?hl=zh-cn#type-ExtensionContext
            console.log('getContexts', contexts);
            document.getElementById('result-container').value = JSON.stringify(contexts, null, 2);
        }
    );
});

// 从清单中返回有关应用或扩展程序的详细信息。返回的对象是完整清单文件的序列化。
document.getElementById('get-manifest-btn').addEventListener('click', () => {
    console.log('get-manifest-btn 点击事件触发');
    let manifest = chrome.runtime.getManifest();
    console.log('getManifest', manifest);
    document.getElementById('result-container').value = JSON.stringify(manifest, null, 2);
});

// 返回软件包目录的 DirectoryEntry 仅限在前台运行时获取位置信息
document.getElementById('get-PackageDirectoryEntry-btn').addEventListener('click', () => {
    console.log('get-PackageDirectoryEntry-btn 点击事件触发');
    chrome.runtime.getPackageDirectoryEntry((directoryEntry) => {
        console.log('getPackageDirectoryEntry:', directoryEntry);
        document.getElementById('result-container').value = JSON.stringify(directoryEntry, null, 2);
    });
});

// 返回有关当前平台的信息
document.getElementById('get-platform-info-btn').addEventListener('click', () => {
    console.log('get-platform-info-btn 点击事件触发');
    chrome.runtime.getPlatformInfo((platformInfo) => {
        // https://developer.chrome.com/docs/extensions/reference/api/runtime?hl=zh-cn#type-PlatformInfo
        console.log('getPlatformInfo:', platformInfo);
        document.getElementById('result-container').value = JSON.stringify(platformInfo, null, 2);
    });
});

// 清单中声明的扩展程序版本
document.getElementById('get-version-btn').addEventListener('click', () => {
    console.log('get-version-btn 点击事件触发');
    let version = chrome.runtime.getManifest().version;
    console.log('version:', version);
    document.getElementById('result-container').value = version;
});

// 重新加载应用或扩展程序。自助服务终端模式不支持此方法。对于自助服务终端模式，请使用 chrome.runtime.restart() 方法。
document.getElementById('reload-btn').addEventListener('click', () => {
    console.log('reload-btn 点击事件触发');
    chrome.runtime.reload();
});

// 请求立即为此应用/扩展程序执行更新检查。
// 重要提示：大多数扩展程序/应用都不应使用此方法，因为 Chrome 已经每隔几个小时自动检查一次，并且您可以监听 runtime.onUpdateAvailable 事件，而无需调用 requestUpdateCheck。
// 此方法仅在极少数情况下适合调用，例如，如果您的扩展程序与后端服务通信，并且后端服务已确定客户端扩展程序版本非常过时，而您想提示用户进行更新，则适合调用此方法。
// requestUpdateCheck 的大多数其他用途（例如基于重复计时器无条件调用它）可能只会浪费客户端、网络和服务器资源。
// 注意：如果使用回调调用此函数，此函数不会返回对象，而是将这两个属性作为单独的实参传递给回调。
document.getElementById('request-update-check-btn').addEventListener('click', () => {
    console.log('request-update-check-btn 点击事件触发');
    chrome.runtime.requestUpdateCheck((status, details) => {
        console.log('requestUpdateCheck:', status, details);
        document.getElementById('result-container').value = JSON.stringify({status, details}, null, 2);
    });
});

// 打开扩展程序的选项页面（如果可以）。
// 具体行为可能取决于清单的 options_ui 或 options_page 键，或者 Chrome 在当时支持的内容。
// 例如，该网页可能会在新标签页中、在 chrome://extensions 中、在应用中打开，或者可能只是聚焦于已打开的选项页面。它永远不会导致调用方页面重新加载。
// 如果您的扩展程序未声明选项页面，或者 Chrome 因其他原因而未能创建选项页面，则回调将设置 lastError。
document.getElementById('open-options-page-btn').addEventListener('click', () => {
    console.log('open-options-page-btn 点击事件触发');
    chrome.runtime.openOptionsPage(() => {
        if (chrome.runtime.lastError) {
            console.error('openOptionsPage:', chrome.runtime.lastError);
            document.getElementById('result-container').value = JSON.stringify({error: chrome.runtime.lastError.message}, null, 2);
        } else {
            console.log('openOptionsPage: 成功打开选项页面');
            document.getElementById('result-container').value = '成功打开选项页面';
        }
    });
});

// 获取扩展程序安装目录中的相对路径
document.getElementById('get-extension-url-btn').addEventListener('click', () => {
    console.log('get-extension-url-btn 点击事件触发');
    let path = 'pages/options.html';
    // 将 "pages/options.html" 转换为 "chrome-extension://<extension_id>/pages/options.html"
    let url = chrome.runtime.getURL(path);
    console.log('getExtensionURL:', url);
    document.getElementById('result-container').value = url;
});

// 获取扩展程序ID
document.getElementById('get-id-btn').addEventListener('click', () => {
    console.log('get-id-btn 点击事件触发');
    let id = chrome.runtime.id;
    console.log('id:', id);
    document.getElementById('result-container').value = id;
});

// 获取最新错误
document.getElementById('get-last-error-btn').addEventListener('click', () => {
    console.log('get-last-error-btn 点击事件触发');
    let lastError = chrome.runtime.lastError;
    console.log('lastError:', lastError);
    document.getElementById('result-container').value = JSON.stringify({error: lastError}, null, 2);
});

// 向扩展程序内或不同扩展程序/应用中的事件监听器发送一条消息。与 runtime.connect 类似，但仅发送一条消息，并可选择性地发送响应。
// 如果发送到您的扩展程序，则 runtime.onMessage 事件将在扩展程序的每个帧（发送者的帧除外）中触发，
// 如果是其他扩展程序，则为 runtime.onMessageExternal。请注意，扩展程序无法使用此方法向内容脚本发送消息。
// 如需向内容脚本发送消息，请使用 tabs.sendMessage。
document.getElementById('send-message-btn').addEventListener('click', async () => {
    console.log('send-message-btn 点击事件触发');
    const response = await chrome.runtime.sendMessage({greeting: "hello"});
    // do something with response here, not outside the function
    console.log( "收到的回复:", response);
    document.getElementById('result-container').value = JSON.stringify(response, null, 2);
});

// 尝试连接扩展程序（例如后台网页）或其他扩展程序/应用中的监听器。这对于连接到扩展程序进程的内容脚本、应用/扩展程序间通信和网页消息传递非常有用。
// 请注意，这不会连接到内容脚本中的任何监听器。扩展程序可以通过 tabs.connect 连接到嵌入在标签页中的内容脚本。
const port = chrome.runtime.connect({name: "knockknock"});
port.onMessage.addListener(function(msg) {
    console.log('setting 收到的消息:', msg);
    if (msg.question === "Who's there?") {
        port.postMessage({answer: "Madame"});
    } else if (msg.question === "Madame who?") {
        port.postMessage({answer: "Madame... Bovary"});
    }
});
port.postMessage({joke: "Knock knock"});
document.getElementById('connect-btn').addEventListener('click', () => {
    console.log('connect-btn 点击事件触发');
    port.postMessage({answer: "Madame"});
});