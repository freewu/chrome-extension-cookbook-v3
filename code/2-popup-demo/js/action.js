// 打开设置页面
document.getElementById('setting-btn').addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/setting.html') });
});