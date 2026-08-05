// getVisits 检索有关网址访问的信息
document.getElementById('get-visits-btn').addEventListener('click', function () {
    const url = document.getElementById('get-visits-url-input').value;
    if (!url) {
        document.getElementById('result-container').innerHTML = '请输入要检索的网址';
        return;
    }
    chrome.history.getVisits({ url: url }, function (visits) {
        console.log(visits);
        if (visits.length > 0) {
            console.log("id",visits[0].id); // 相应 history.HistoryItem 的唯一标识符
            console.log("isLocal",visits[0].isLocal); // 如果相应访问源自此设备，则为 True。如果该内容是从其他设备同步的，则为 False。
            console.log("referringVisitId",visits[0].referringVisitId); // 引荐来源的访问 ID
            // link                 用户通过点击其他网页上的链接到达此网页
            // typed                用户通过在地址栏中输入网址到达此网页。此属性还用于其他明确的导航操作。
            // auto_bookmark        用户通过界面中的建议（例如通过菜单项）到达此页面。
            // auto_subframe        用户是通过他们未请求的子框架导航到达此网页的，例如通过在上一网页的框架中加载的广告到达此网页。这些操作不一定会生成“后退”和“前进”菜单中的新导航条目。
            // manual_subframe      用户通过在子框架中选择内容到达此网页
            // generated            用户在地址栏中输入内容并选择看起来不像网址的条目（例如 Google 搜索建议）后到达此网页。例如，匹配项可能包含 Google 搜索结果页面的网址，但向用户显示为“在 Google 上搜索…”。这些与输入型导航不同，因为用户没有输入或看到目标网址。它们还与关键字导航相关。
            // auto_toplevel        网页是在命令行中指定的，或者是起始网页。
            // form_submit          用户通过填写表单中的值并提交表单来访问此网页。并非所有表单提交都使用此过渡类型。
            // reload               用户重新加载了网页，可能是通过点击重新加载按钮或在地址栏中按 Enter 键完成的。会话恢复和“重新打开关闭的标签页”功能也使用此过渡类型。 
            // keyword              此网页的网址是从可替换的关键字（而非默认搜索服务提供商）生成的。
            // keyword_generated    与为关键字生成的访问相对应。
            console.log("transition",visits[0].transition); // 相应访问从其引荐来源网址开始的过渡类型。
            console.log("visitId",visits[0].visitId); // 相应访问的唯一标识符。
            console.log("visitTime",visits[0].visitTime); // 相应访问发生的时间，以自纪元开始计算的毫秒数表示
        }
        document.getElementById('result-container').innerHTML = JSON.stringify(visits, null, 2);
    });
});

// search 搜索历史记录
document.getElementById('search-btn').addEventListener('click', function () {
    let obj = {};
    const keyword = document.getElementById('search-keyword-input').value;
    obj.text = keyword; // 针对历史记录服务的自由文本查询。留空可检索所有网页
    const count = document.getElementById('search-count').value;
    obj.maxResults = parseInt(count); // 返回的最大结果数。默认值为 100。
    const day = document.getElementById('search-day').value;
    if (day) {
        obj.startTime = Date.now() - day * 24 * 60 * 60 * 1000; // 要包含在结果中的最早时间。默认值为 0（无下限）。 将结果限制为在此日期之后访问过的网页，以自纪元开始算起的毫秒数表示。如果未指定该属性，则默认值为 24 小时。
        obj.endTime = Date.now(); // 要包含在结果中的最新时间。默认值为当前时间。 将结果限制为在此日期之前访问过的网页，以自纪元开始算起的毫秒数表示。
    }
    chrome.history.search(obj, function (results) {
        console.log(results);
        if (results.length > 0) {
            let  historyItem = results[0];
            console.log('HistoryItem.id', historyItem.id); // 唯一标识符
            console.log('HistoryItem.lastVisitTime', historyItem.lastVisitTime); // 相应网页上次加载的时间（以自纪元以来经历的毫秒数表示）。
            console.log('HistoryItem.title', historyItem.title); // 网页上次加载时的标题。  
            console.log('HistoryItem.url', historyItem.url); // 用户访问的网址。  
            console.log('HistoryItem.typedCount', historyItem.typedCount); // 用户通过输入地址访问此页面的次数。
            console.log('HistoryItem.visitCount', historyItem.visitCount); // 用户访问相应页面的次数。
        }
        document.getElementById('result-container').innerHTML = JSON.stringify(results, null, 2);
    });
});

// 在当前时间向历史记录添加一个网址，并指定“link”的过渡类型
document.getElementById('add-btn').addEventListener('click', function () {
    let url = document.getElementById('add-url-input').value;
    if (!url) {
        document.getElementById('result-container').innerHTML = '请输入要添加的网址';
        return;
    }
    chrome.history.addUrl({
        url: url
    }, function () {
        console.log('添加成功:' + url);
        document.getElementById('result-container').innerHTML = '添加成功: ' + url;
    });
});

// 从历史记录中移除指定网址的所有出现情况
document.getElementById('delete-url-btn').addEventListener('click', function () {
    let url = document.getElementById('delete-url-input').value;
    if (!url) {
        document.getElementById('result-container').innerHTML = '请输入要移除的网址';
        return;
    }
    chrome.history.deleteUrl({
        url: url
    }, function () {
        console.log('移除成功:' + url);
        document.getElementById('result-container').innerHTML = '移除成功: ' + url;
    });
});

// 从历史记录中移除指定日期范围内的所有内容。除非所有访问都位于该范围内，否则网页不会从历史记录中移除。
document.getElementById('delete-range-btn').addEventListener('click', function () {
    let day = document.getElementById('delete-day').value;
    if (!day) {
        document.getElementById('result-container').innerHTML = '请选择要移除的时间范围';
        return;
    }
    chrome.history.deleteRange({
        startTime: Date.now() - day * 24 * 60 * 60 * 1000, // 在此日期之后添加到历史记录中的项目（以自纪元开始算起的毫秒数表示）
        endTime: Date.now() // 在此日期之前添加到历史记录中的项目（以毫秒为单位，从 Epoch 起算）
    }, function () {
        console.log('移除成功:' + day + '天内的所有内容');
        document.getElementById('result-container').innerHTML = '移除成功:' + day + '天内的所有内容';
    });
});

// 从历史记录中移除所有内容。
document.getElementById('delete-all-btn').addEventListener('click', function () {
    chrome.history.deleteAll(function () {
        console.log('移除成功:所有历史记录');
        document.getElementById('result-container').innerHTML = '移除成功:所有历史记录';
    });
});