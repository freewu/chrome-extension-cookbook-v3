// 点击按钮将当前标签页另存为 MHTML
document.getElementById('save-btn').addEventListener('click', () => {
    console.log('点击了将当前标签页另存为 MHTML 按钮');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let tabId = tabs[0].id;
        chrome.pageCapture.saveAsMHTML(
        { 
            tabId: tabId  // 要另存为 MHTML 的标签页的 ID
        }, 
        (mhtmlBlob) => {
            console.log(mhtmlBlob);
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            // 将 Blob 转换为下载链接
            const url = URL.createObjectURL(mhtmlBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = tabId + ".mhtml"; // 文件名
            a.click();
            URL.revokeObjectURL(url); // 释放资源
        });
    });
});