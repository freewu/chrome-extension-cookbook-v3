// 检索给定标签页的所有框架的相关信息
document.getElementById('get-all-frames-btn').addEventListener('click', async () => {
    console.log('get-all-frames-btn clicked');
    // 获取当前激活在前台的标签页
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('activeTab', activeTab);
    // 使用当前激活的标签页的 ID 来获取所有框架的信息
    const result = await chrome.webNavigation.getAllFrames({ tabId: activeTab.id });
    console.log('result', result);
    document.getElementById('result-container').value = JSON.stringify(result, null, 2);
});

// 检索有关指定帧的信息
document.getElementById('get-frame-btn').addEventListener('click', async () => {
    console.log('get-frame-btn clicked');
    // 获取当前激活在前台的标签页
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('activeTab', activeTab);
    // 使用当前激活的标签页的 ID 来获取所有框架的信息
    const result = await chrome.webNavigation.getFrame({ tabId: activeTab.id, frameId: 0 });
    console.log('result', result);
    document.getElementById('result-container').value = JSON.stringify(result, null, 2);
});