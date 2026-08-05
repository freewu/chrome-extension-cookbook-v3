// 点击搜索按钮
document.getElementById('search-btn').addEventListener('click', () => {
    const keyword = document.getElementById('search-keyword').value;
    const disposition = document.getElementById('disposition').value;
    chrome.search.query({
        text: keyword,
        disposition: disposition,
        // tabId: chrome.tabs.TAB_ID_NONE,可以指定 tabId 打开搜索结果， 与 disposition 互斥
    });
});