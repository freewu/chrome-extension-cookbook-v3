// 在文件管理器中显示默认的“下载”文件夹
document.getElementById('show-default-folder-btn').addEventListener('click', function () {
    console.log('show-default-folder-btn clicked');
    chrome.downloads.showDefaultFolder();
});

// 搜索下载历史记录
document.getElementById('search-btn').addEventListener('click', function () {
    console.log('search-btn clicked');
    let downloadQuery = {
        // bytesReceived: 0, // 目前从主机收到的字节数，不考虑文件压缩。
        // danger: 'url', // 指示相应下载内容是否被认为是安全的，或者是否已知为可疑。file / url / content /uncommon / host / unwanted / safe / accepted  还有很多 https://developer.chrome.com/docs/extensions/reference/api/downloads?hl=zh-cn#type-DangerType
        // endTime: new Date().toISOString(), // 下载结束时间，采用 ISO 8601 格式。
        // endedAfter: new Date().toISOString(),  // 将结果限制为在指定毫秒数之后结束的 DownloadItem（采用 ISO 8601 格式） 在 某下载记录之后的下载记录
        // endedBefore: new Date().toISOString(), // 将结果限制为在指定毫秒数之前结束的 DownloadItem（采用 ISO 8601 格式）
        // error: 'NETWORK_TIMEOUT', // 下载中断的原因 HTTP 错误可能会归为以 SERVER_ 开头的某个错误。与网络相关的错误以 NETWORK_ 开头，与将文件写入文件系统的过程相关的错误以 FILE_ 开头，用户发起的中断以 USER_ 开头 自行看 https://developer.chrome.com/docs/extensions/reference/api/downloads#type-InterruptReason
        // exists: true, // 下载的文件是否存在
        // fileSize: 1024 * 1024, // 下载的文件大小 1MB 整个文件解压缩后的字节数，如果未知，则为 -1。
        // filename: 'test.txt', // 绝对本地路径
        // filenameRegex: 'test.txt', // 将结果限制为 DownloadItem，其中 filename 与给定的正则表达式匹配。
        // finalUrl: 'https://www.baidu.com/test.txt', // Chrome 54 及更高版本 此下载的绝对网址（在所有重定向之后）。
        // finalUrlRegex: 'https://www.baidu.com/test.txt', // Chrome 54 及更高版本 将结果限制为 DownloadItem，其中 finalUrl 与给定的正则表达式匹配。
        // id: 123456, // 要查询的 DownloadItem 的 id。
        limit: 100, // 返回的匹配 DownloadItem 的数量上限。默认值为 1000。设置为 0 可返回所有匹配的 DownloadItem。如需了解如何浏览结果，请参阅 search。
        // mime: 'text/plain', // 将结果限制为 DownloadItem，其中 mime 与给定的 MIME 类型匹配。 文件的 MIME 类型
        // orderBy: ['-startTime'], // 将此数组的元素设置为 DownloadItem 属性，以便对搜索结果进行排序。例如，将 orderBy=['startTime'] 设置为 true 会按开始时间升序对 DownloadItem 进行排序。如需指定降序，请在前面加上连字符：“-startTime”。
        // paused: true, // 如果下载已停止从主机读取数据，但保持连接处于打开状态，则为 True。
        // startTime: new Date().toISOString(), // 下载开始时间，采用 ISO 8601 格式。
        // startedAfter: new Date().toISOString(), // 将结果限制为 DownloadItem，这些 DownloadItem 的开始时间晚于指定毫秒数（采用 ISO 8601 格式）。
        // startedBefore: new Date().toISOString(), // 将结果限制为开始时间早于指定毫秒数（采用 ISO 8601 格式）的 DownloadItem。  
        // totalBytes: 1024 * 1024, // 整个文件中的字节数，不考虑文件压缩，如果未知则为 -1。
        // totalBytesGreater: 1024 * 1024, // 将结果限制为 totalBytes 大于指定整数的 DownloadItem。
        // totalBytesLess: 1024 * 1024 * 10, // 将结果限制为 totalBytes 小于指定整数的 DownloadItem。
        // url: 'https://www.baidu.com/test.txt', // 此下载操作的初始绝对网址（在任何重定向之前）。
        // urlRegex: 'https://www.baidu.com/test.txt', // 将结果限制为 DownloadItem，其中 url 与给定的正则表达式匹配。
    };
    const keyword = document.getElementById('search-keyword-input').value;
    if (keyword) {
        downloadQuery.query = [keyword]; // 此搜索字词数组会将结果限制为 DownloadItem，其 filename 或 url 或 finalUrl 包含所有不以短划线“-”开头的搜索字词，但不包含任何以短划线开头的搜索字词。
    }
    const status = document.getElementById('search-status-select').value;
    if (status !== 'all') {
        downloadQuery.state = status; // 指示下载是正在进行、已中断还是已完成。 in_progress |  interrupted | complete
    }
    chrome.downloads.search(downloadQuery, function (downloadItems) {
        console.log('downloadItems', downloadItems);
        document.getElementById('result-container').value = JSON.stringify(downloadItems, null, 2);
    });
});

// 在文件管理器的文件夹中显示下载的文件
document.getElementById('show-btn').addEventListener('click', function () {
    console.log('show-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = '请输入下载ID';
        return;
    }
    chrome.downloads.show(parseInt(downloadId));
});

// 获取下载记录
document.getElementById('get-download-btn').addEventListener('click', function () {
    console.log('get-download-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = '请输入下载ID';
        return;
    }
    chrome.downloads.search({ id: parseInt(downloadId) }, function (downloadItems) {
        console.log('downloadItems', downloadItems);
        document.getElementById('result-container').value = JSON.stringify(downloadItems, null, 2);
    });
});

// 更改与当前浏览器个人资料关联的每个窗口的下载界面。只要至少有一个扩展程序将 UiOptions.enabled 设置为 false，下载界面就会隐藏。
// 如果将 UiOptions.enabled 设置为 true，但至少有一个其他扩展程序已将其停用，则会通过 runtime.lastError 返回错误。
// 除了 "downloads" 权限之外，还需要 "downloads.ui" 权限
document.getElementById('hide-ui-btn').addEventListener('click', function () {
    console.log('hide-ui-btn clicked');
    chrome.downloads.setUiOptions({ enabled: false });
    if (chrome.runtime.lastError) {
        console.error('hide-ui-btn error:', chrome.runtime.lastError.message);
        document.getElementById('result-container').value = "隐藏下载界面失败：" + chrome.runtime.lastError.message;
    }
});
document.getElementById('show-ui-btn').addEventListener('click', function () {
    console.log('show-ui-btn clicked');
    chrome.downloads.setUiOptions({ enabled: true });
    if (chrome.runtime.lastError) {
        console.error('show-ui-btn error:', chrome.runtime.lastError.message);
        document.getElementById('result-container').value = "显示下载界面失败：" + chrome.runtime.lastError.message;
    }
});

// 暂停下载。如果请求成功，下载将处于暂停状态。否则，runtime.lastError 会包含错误消息。如果下载未处于活动状态，则请求会失败。
document.getElementById('pause-btn').addEventListener('click', function () {
    console.log('pause-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = '请输入下载ID';
        return;
    }
    chrome.downloads.pause(parseInt(downloadId), function () {
        if (chrome.runtime.lastError) {
            console.error('pause-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "暂停下载失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "暂停下载成功";
        }
    }); 
});

// 恢复已暂停的下载。如果请求成功，则下载正在进行且未暂停。否则，runtime.lastError 会包含错误消息。如果下载未处于活动状态，则请求会失败。
document.getElementById('resume-btn').addEventListener('click', function () {
    console.log('resume-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = '请输入下载ID';
        return;
    }
    chrome.downloads.resume(parseInt(downloadId), function () {
        if (chrome.runtime.lastError) {
            console.error('resume-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "恢复下载失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "恢复下载成功";
        }
    }); 
});

// 检索指定下载的图标。对于新下载的文件，在收到 onCreated 事件后，系统会显示文件图标。在下载进行期间，此函数返回的图片可能与下载完成后返回的图片不同。
// 图标检索是通过查询底层操作系统或工具包（具体取决于平台）完成的。因此，返回的图标将取决于多种因素，包括下载状态、平台、注册的文件类型和视觉主题。
// 如果无法确定文件图标，runtime.lastError 将包含一条错误消息
document.getElementById('get-icon-btn').addEventListener('click', function () {
    console.log('get-icon-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = '请输入下载ID';
        return;
    }
    chrome.downloads.getFileIcon(parseInt(downloadId), function (iconUrl) {
        if (chrome.runtime.lastError) {
            console.error('get-icon-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "获取图标失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "图标URL：" + iconUrl;
            //创建一个img元素
            const img = document.createElement('img');
            img.src = iconUrl;
            //将img元素添加到页面中
            document.body.appendChild(img);
        }
    });
});

// 取消下载。当运行 callback 时，下载已取消、完成、中断或不再存在。
document.getElementById('cancel-btn').addEventListener('click', function () {
    console.log('cancel-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = '请输入下载ID';
        return;
    }
    chrome.downloads.cancel(parseInt(downloadId), function () {
        if (chrome.runtime.lastError) {
            console.error('cancel-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "取消下载失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "取消下载成功";
        }
    }); 
});

// 从历史记录中清除匹配的 DownloadItem，而不删除已下载的文件。对于与 query 匹配的每个 DownloadItem，系统都会触发 onErased 事件，然后调用 callback。
// 如果 query 为空，则清除所有下载历史记录。
document.getElementById('clear-btn').addEventListener('click', function () {
    console.log('clear-btn clicked');
    let downloadQuery = {
        // bytesReceived: 0, // 目前从主机收到的字节数，不考虑文件压缩。
        // danger: 'url', // 指示相应下载内容是否被认为是安全的，或者是否已知为可疑。file / url / content /uncommon / host / unwanted / safe / accepted  还有很多
        // endTime: new Date().toISOString(), // 下载结束时间，采用 ISO 8601 格式。
        // endedAfter: new Date().toISOString(),  // 将结果限制为在指定毫秒数之后结束的 DownloadItem（采用 ISO 8601 格式） 在 某下载记录之后的下载记录
        // endedBefore: new Date().toISOString(), // 将结果限制为在指定毫秒数之前结束的 DownloadItem（采用 ISO 8601 格式）
        // error: 'NETWORK_TIMEOUT', // 下载中断的原因 太多 自行看 https://developer.chrome.com/docs/extensions/reference/api/downloads#type-InterruptReason
        // exists: true, // 下载的文件是否存在
        // fileSize: 1024 * 1024, // 下载的文件大小 1MB 整个文件解压缩后的字节数，如果未知，则为 -1。
        // filename: 'test.txt', // 绝对本地路径
        // filenameRegex: 'test.txt', // 将结果限制为 DownloadItem，其中 filename 与给定的正则表达式匹配。
        // finalUrl: 'https://www.baidu.com/test.txt', // Chrome 54 及更高版本 此下载的绝对网址（在所有重定向之后）。
        // finalUrlRegex: 'https://www.baidu.com/test.txt', // Chrome 54 及更高版本 将结果限制为 DownloadItem，其中 finalUrl 与给定的正则表达式匹配。
        // id: 123456, // 要查询的 DownloadItem 的 id。
        limit: 100, // 返回的匹配 DownloadItem 的数量上限。默认值为 1000。设置为 0 可返回所有匹配的 DownloadItem。如需了解如何浏览结果，请参阅 search。
        // mime: 'text/plain', // 将结果限制为 DownloadItem，其中 mime 与给定的 MIME 类型匹配。 文件的 MIME 类型
        // orderBy: ['-startTime'], // 将此数组的元素设置为 DownloadItem 属性，以便对搜索结果进行排序。例如，将 orderBy=['startTime'] 设置为 true 会按开始时间升序对 DownloadItem 进行排序。如需指定降序，请在前面加上连字符：“-startTime”。
        // paused: true, // 如果下载已停止从主机读取数据，但保持连接处于打开状态，则为 True。
        // startTime: new Date().toISOString(), // 下载开始时间，采用 ISO 8601 格式。
        // startedAfter: new Date().toISOString(), // 将结果限制为 DownloadItem，这些 DownloadItem 的开始时间晚于指定毫秒数（采用 ISO 8601 格式）。
        // startedBefore: new Date().toISOString(), // 将结果限制为开始时间早于指定毫秒数（采用 ISO 8601 格式）的 DownloadItem。  
        // totalBytes: 1024 * 1024, // 整个文件中的字节数，不考虑文件压缩，如果未知则为 -1。
        // totalBytesGreater: 1024 * 1024, // 将结果限制为 totalBytes 大于指定整数的 DownloadItem。
        // totalBytesLess: 1024 * 1024 * 10, // 将结果限制为 totalBytes 小于指定整数的 DownloadItem。
        // url: 'https://www.baidu.com/test.txt', // 此下载操作的初始绝对网址（在任何重定向之前）。
        // urlRegex: 'https://www.baidu.com/test.txt', // 将结果限制为 DownloadItem，其中 url 与给定的正则表达式匹配。
    };
    const keyword = document.getElementById('search-keyword-input').value;
    if (keyword) {
        downloadQuery.query = [keyword]; // 此搜索字词数组会将结果限制为 DownloadItem，其 filename 或 url 或 finalUrl 包含所有不以短划线“-”开头的搜索字词，但不包含任何以短划线开头的搜索字词。
    }
    const status = document.getElementById('search-status-select').value;
    if (status !== 'all') {
        downloadQuery.state = status; // 指示下载是正在进行、已中断还是已完成。 in_progress |  interrupted | complete
    }
    chrome.downloads.erase(downloadQuery, function () {
        if (chrome.runtime.lastError) {
            console.error('clear-history-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "清除下载历史记录失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "清除下载历史记录成功";
        }
    }); 
});

// 如果 DownloadItem 完成，则立即打开下载的文件；否则通过 runtime.lastError 返回错误。
// 此方法除了需要 "downloads" 权限之外，还需要 "downloads.open" 权限。
// 当商品首次打开时，系统会触发 onChanged 事件。此方法只能在响应用户手势时调用。
document.getElementById('open-btn').addEventListener('click', function () {
    console.log('open-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = "请输入下载ID";
        return;
    }
    chrome.downloads.open(parseInt(downloadId),function() {
        if (chrome.runtime.lastError) {
            console.error('open-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "打开下载的文件失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "打开下载的文件成功";
        }
    });
 });

// 如果下载的文件存在且 DownloadItem 已完成，则移除下载的文件；否则通过 runtime.lastError 返回错误。
document.getElementById('delete-btn').addEventListener('click', function () {
    console.log('delete-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = "请输入下载ID";
        return;
    }
    chrome.downloads.removeFile(parseInt(downloadId), function () {
        if (chrome.runtime.lastError) {
            console.error('delete-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "删除下载文件失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "删除下载文件成功";
        }
    });
});

// 提示用户接受危险下载。只能从可见的上下文（标签页、窗口或页面/浏览器操作弹出式窗口）中调用。
// 不会自动接受危险的下载内容。如果接受下载，系统会触发 onChanged 事件，否则不会发生任何情况。当所有数据都提取到临时文件中，
// 并且下载不危险或危险已被接受时，临时文件会被重命名为目标文件名，state 会更改为“complete”，并触发 onChanged。
document.getElementById('accept-dangerous-btn').addEventListener('click', function () {
    console.log('accept-dangerous-btn clicked');
    const downloadId = document.getElementById('download-id-input').value;
    if (!downloadId) {
        document.getElementById('result-container').value = "请输入下载ID";
        return;
    }
    chrome.downloads.acceptDanger(parseInt(downloadId), function () {
        if (chrome.runtime.lastError) {
            console.error('accept-dangerous-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "提示用户接受危险下载失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "提示用户接受危险下载成功";
        }
    });
});

// 下载网址
// 如果网址使用 HTTP[S] 协议，则请求将包含当前为其主机名设置的所有 Cookie。
// 如果同时指定了 filename 和 saveAs，系统将显示“另存为”对话框，并预先填充指定的 filename。
// 如果下载成功开始，系统将使用新 DownloadItem 的 downloadId 调用 callback。
// 如果启动下载时出错，系统将使用 downloadId=undefined 调用 callback，并且 runtime.lastError 将包含描述性字符串。
// 不保证错误字符串在不同版本之间保持向后兼容。扩展程序不得解析该属性。
document.getElementById('download-btn').addEventListener('click', function () {
    console.log('download-btn clicked');
    const url = document.getElementById('url-input').value;
    if (!url) {
        document.getElementById('result-container').value = "请输入下载URL";
        return;
    }
    chrome.downloads.download({
        // body: "", // 正文
        // conflictAction: "uniquify", // 如果 filename 已存在，则执行的操作 uniquify | overwrite |  prompt
        // filename: "downloaded-file", // 相对于“下载”目录的文件路径，用于包含下载的文件，可能包含子目录。绝对路径、空路径和包含反向引用“..”的路径会导致错误。onDeterminingFilename 允许在确定文件的 MIME 类型和临时文件名后建议文件名。
        // headers: [ // 如果网址使用 HTTP[s] 协议，则要随请求发送的额外 HTTP 标头。每个标头都表示为一个字典，其中包含键 name 和 value 或 binaryValue，且仅限于 XMLHttpRequest 允许的标头。
        //     { name: "Authorization", value: "Bearer <token>" }, 
        // ],
        // method: "GET", // 如果网址使用 HTTP[S] 协议，则要使用的 HTTP 方法。 GET | POST
        url: url, // 要下载的网址。
        saveAs: true // 使用文件选择器，允许用户选择文件名，无论 filename 是否已设置或已存在。
    }, function (downloadId) {
        if (chrome.runtime.lastError) {
            console.error('download-btn error:', chrome.runtime.lastError.message);
            document.getElementById('result-container').value = "下载文件失败：" + chrome.runtime.lastError.message;
        } else {
            document.getElementById('result-container').value = "下载文件成功，下载ID：" + downloadId;
        }
    });
});
