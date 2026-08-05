let lock = false;
// 打开离屏文档
document.getElementById('open-btn').addEventListener('click', () => {
    console.log('点击了打开离屏文档按钮');
    // 加上锁，一次只能打开一个离屏文档 ，如果已经打开了一个离屏文档，就不打开了
    if (lock) {
        console.log('已经打开了一个离屏文档');
        return;
    }
    lock = true;
    chrome.offscreen.createDocument(
        {
            url: chrome.runtime.getURL('pages/offscreen.html'), // 要在文档中加载的（相对）网址
            reasons: [ // 扩展程序创建屏幕外文档的原因
                //'TESTING',               // 仅用于测试目的的原因。
                'AUDIO_PLAYBACK', // 指定离屏文档负责播放音频。
                'IFRAME_SCRIPTING', // 指定离屏文档需要嵌入 iframe 并通过脚本修改 iframe 的内容。
                'DOM_SCRAPING',     // 指定离屏文档需要嵌入 iframe 并抓取其 DOM 以提取信息。
                'BLOBS',                   // 指定离屏文档需要与 Blob 对象（包括 URL.createObjectURL()）互动。
                'DOM_PARSER',         // 指定离屏文档需要使用 DOMParser API。
                'USER_MEDIA',         // 指定离屏文档需要与来自用户媒体（例如 getUserMedia()）的媒体流进行交互。
                'DISPLAY_MEDIA',   // 指定离屏文档需要与来自展示媒体（例如 getDisplayMedia()）的媒体流进行互动。
                'WEB_RTC',               // 指定了离屏文档需要使用 WebRTC API。
                'CLIPBOARD',           // 指定屏幕外文档需要与 Clipboard API 互动
                'LOCAL_STORAGE',   // 指定屏幕外文档需要访问 localStorage。
                'WORKERS',               // 指定了离屏文档需要衍生工作器。
                'BATTERY_STATUS', // 指定了离屏文档需要使用 navigator.getBattery。
                'MATCH_MEDIA',       // 指定离屏文档需要使用 window.matchMedia。
                'GEOLOCATION'        // 指定离屏文档需要使用 navigator.geolocation。
            ], 
            justification: '为了展示 chrome.offscreen API 相关功能' // 开发者提供的字符串，用于更详细地说明需要背景信息的原因
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            console.log('成功创建离屏文档');
        }
    );
});

// 关闭离屏文档
document.getElementById('close-btn').addEventListener('click', () => {
    console.log('点击了关闭离屏文档按钮');
    chrome.offscreen.closeDocument(
        () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            console.log('成功关闭离屏文档');
        }
    );
    lock = false;
});

// 在 action 页面中监听消息，获取离屏文档传递的结果，然后通过 DOM 渲染展示。
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'CANVAS_RESULT') {
        const img = document.createElement('img');
        img.src = message.data; // 显示离屏文档生成的图像
        document.body.appendChild(img);
    }
});