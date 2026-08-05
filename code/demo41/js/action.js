// 读取剪贴板内容
document.getElementById('clipboard-read-btn').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        console.log('剪贴板内容:', text);
        document.getElementById('result-container').value = text;
    } catch (error) {
        console.error('读取剪贴板内容失败:', error);
    }
});

// 设置剪贴板内容
document.getElementById('clipboard-write-btn').addEventListener('click', async () => {
    try {
        const text = document.getElementById('result-container').value;
        await navigator.clipboard.writeText(text);
        console.log('剪贴板内容已设置:', text);
    } catch (error) {
        console.error('设置剪贴板内容失败:', error);
    }
});