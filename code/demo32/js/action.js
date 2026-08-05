function faviconURL(u) {
    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set('pageUrl', u); // this encodes the URL as well
    url.searchParams.set('size', '32');
    return url.toString();
}

// const img = document.createElement('img');
// // chrome-extension://EXTENSION_ID/_favicon/?pageUrl=https%3A%2F%2Fwww.google.com&size=32
// img.src = faviconURL('https://www.google.com');
// document.getElementById('result-container').appendChild(img);

// 监听按钮点击事件
document.getElementById('get-favicon-btn').addEventListener('click', () => {
    const urlInput = document.getElementById('url-input').value;
    if (urlInput) {
        const img = document.createElement('img');
        img.src = faviconURL(urlInput);
        document.getElementById('result-container').appendChild(img);
    } else {
        document.getElementById('result-container').textContent = '请输入网站 URL';
    }
});