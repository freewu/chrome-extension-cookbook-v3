// 保存数据
document.getElementById('set-btn').addEventListener('click', () => {
    const key = document.getElementById('data-input-key').value;
    const value = document.getElementById('data-input-value').value;
    const type = document.getElementById('data-type').value;
    chrome.storage[type].set({[key]: value}, () => {
        console.log("数据保存成功");
    });
});

// 加载数据
document.getElementById('get-btn').addEventListener('click', () => {
    const key = document.getElementById('data-input-key').value;
    const type = document.getElementById('data-type').value;
    chrome.storage[type].get(key, (result) => {
        document.getElementById('data-result').value = JSON.stringify(result);
    });
});

// 删除数据
document.getElementById('remove-btn').addEventListener('click', () => {
    const key = document.getElementById('data-input-key').value;
    const type = document.getElementById('data-type').value;
    chrome.storage[type].remove(key, () => {
        console.log("数据删除成功");
    });
});

// 清空数据
document.getElementById('clear-btn').addEventListener('click', () => {
    const type = document.getElementById('data-type').value;
    chrome.storage[type].clear(() => {
        console.log("从存储空间中移除所有内容成功");
    });
});

// 获取所有 key
document.getElementById('get-all-keys-btn').addEventListener('click', () => {
    const type = document.getElementById('data-type').value;
    chrome.storage[type].get(null, (result) => {
        document.getElementById('data-result').value = JSON.stringify(Object.keys(result));
    });
});

// 获取存储空间量
document.getElementById('get-space-btn').addEventListener('click', () => {
    const type = document.getElementById('data-type').value;
    chrome.storage[type].getBytesInUse(null, (bytesInUse) => {
        document.getElementById('data-result').value = `当前占用空间: ${bytesInUse} 字节`;
    });
});