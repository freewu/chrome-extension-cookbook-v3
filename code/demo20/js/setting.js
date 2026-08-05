// 点击 查询 Cookie 按钮
document.getElementById('search-btn').addEventListener('click', function() {
    let params = {};
    // 获取 查询 Cookie 表单 所有输入框的值
    const searchDomain = document.getElementById('search-domain-input').value;
    if (searchDomain) {
        params.domain = searchDomain;
    }
    const searchName = document.getElementById('search-name-input').value;
    if (searchName) {
        params.name = searchName;
    }
    // const searchPartitionKey = document.getElementById('search-partition-key-input').value;
    //const searchTopLevelSite = document.getElementById('search-top-level-site-input').value;
    const searchUrl = document.getElementById('search-url-input').value;
    if (searchUrl) {
        params.url = searchUrl;
    }
    const searchSecure = document.getElementById('search-secure-input').checked;
    if (searchSecure) {
        params.secure = true;
    }
    const searchSession = document.getElementById('search-session-input').checked;
    if (searchSession) {
        params.session = true;
    }
    const storeId = document.getElementById('search-store-id-input').value;
    if (storeId) {
        params.storeId = storeId;
    }
    const path = document.getElementById('search-path-input').value;
    if (path) {
        params.path = path;
    }
    // 从单个 Cookie 存储区检索与给定信息匹配的所有 Cookie。返回的 Cookie 将按路径长度进行排序，路径最长的 Cookie 排在最前面。
    // 如果多个 Cookie 的路径长度相同，则创建时间最早的 Cookie 会排在前面。此方法仅检索扩展程序具有主机权限的网域的 Cookie。
    chrome.cookies.getAll(params, function(cookies) {
        // 处理查询到的 Cookie
        console.log('查询到的 Cookie:', cookies);
        // 渲染 Cookie 到页面
        document.getElementById('search-result-container').innerHTML = JSON.stringify(cookies, null, 2);
    });
});

// 点击 查询 单个Cookie 按钮
document.getElementById('get-btn').addEventListener('click', function() {
    let params = {};
    // 获取 查询 单个Cookie 表单 所有输入框的值
    const storeId = document.getElementById('get-store-id-input').value;
    if (storeId) {
        params.storeId = storeId;
    }
    const url = document.getElementById('get-url-input').value;
    if (url) {
        params.url = url;
    }
    const name = document.getElementById('get-name-input').value;
    if (name) {
        params.name = name;
    }
    // 从单个 Cookie 存储区检索与给定信息匹配的 Cookie。
    chrome.cookies.get(params, function(cookie) {
        // 处理查询到的 Cookie
        console.log('查询到的 Cookie:', cookie);
        // 渲染 Cookie 到页面
        document.getElementById('get-result-container').innerHTML = JSON.stringify(cookie, null, 2);
    });
});

// 点击 列出所有现有的 Cookie 存储区 按钮
document.getElementById('cookies-store-btn').addEventListener('click', function() {
    // 列出所有现有的 Cookie 存储区
    chrome.cookies.getAllCookieStores(function(cookieStores) {
        // 处理查询到的 Cookie 存储区
        console.log('查询到的 Cookie 存储区:', cookieStores);
        for (const store of cookieStores) {
            console.log('id:', store.id); // Cookie 存储区的唯一标识符
            console.log('tabIds:', store.tabIds); // 共享此 Cookie 存储区的所有浏览器标签页的标识符
        }
        // 渲染 Cookie 存储区到页面
        document.getElementById('cookies-store-container').innerHTML = JSON.stringify(cookieStores, null, 2);
    });
});

// 点击 设置 Cookie 按钮
document.getElementById('set-btn').addEventListener('click', async function() {
    let params = {};
    // 获取 设置 Cookie 表单 所有输入框的值
    const name = document.getElementById('set-name-input').value;
    if (name) {
        params.name = name;
    }
    const value = document.getElementById('set-value-input').value;
    if (value) {
        params.value = value;
    }
    const domain = document.getElementById('set-domain-input').value;
    if (domain) {
        params.domain = domain;
    }
    const path = document.getElementById('set-path-input').value;
    if (path) {
        params.path = path;
    }
    const url = document.getElementById('set-url-input').value;
    if (url) {
        params.url = url;
    }
    const expirationDate = document.getElementById('set-expirationDate-input').value;
    if (expirationDate > 0) {
        params.expirationDate = Date.now() / 1000 + Number(expirationDate);
    }
    const secure = document.getElementById('set-secure-input').checked;
    if (secure) {
        params.secure = true;
    }
    const httpOnly = document.getElementById('set-http-only-input').checked;
    if (httpOnly) {
        params.httpOnly = true; 
    }
    const sameSite = document.getElementById('set-same-site-input').value;
    if (sameSite) {
        params.sameSite = sameSite;
    }
    // 使用给定的 Cookie 数据设置 Cookie；如果存在等效的 Cookie，可能会覆盖这些 Cookie
    let res = await chrome.cookies.set(params, function(cookie) {
        // 处理设置的 Cookie
        console.log('设置的 Cookie:', cookie);
    });
    console.log("设置 Cookie 结果:", res);
});

// 点击 删除 Cookie 按钮
document.getElementById('delete-btn').addEventListener('click', async function() {
    let params = {};
    // 获取 删除 Cookie 表单 所有输入框的值
    const name = document.getElementById('delete-name-input').value;
    if (name) {
        params.name = name;
    }
    const url = document.getElementById('delete-url-input').value;
    if (url) {
        params.url = url;
    }
    // 使用给定的 Cookie 数据删除 Cookie
    let res = await chrome.cookies.remove(params, function(cookie) {
        // 处理删除的 Cookie
        console.log('删除的 Cookie:', cookie);
        // 渲染 删除 Cookie 结果 到页面
        document.getElementById('delete-result-container').innerHTML = JSON.stringify(cookie, null, 2);
    });
    console.log("删除 Cookie 结果:", res);
});