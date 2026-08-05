// 点击检索整个书签层次结构
document.getElementById('get-tree-btn').addEventListener('click', () => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        console.log('bookmarkTreeNodes', bookmarkTreeNodes);
        document.getElementById('result-container').value = JSON.stringify(bookmarkTreeNodes, null, 2);
    });
});

// 点击检索最近添加N个书签
document.getElementById('get-recent-btn').addEventListener('click', () => {
    const val = document.getElementById('recent-count-select').value;
    let num = parseInt(val);
    num = (num > 10) ? num : 10;
    chrome.bookmarks.getRecent(num, (bookmarkNodes) => {
        console.log('bookmarkNodes', bookmarkNodes);
        document.getElementById('result-container').value = JSON.stringify(bookmarkNodes, null, 2);
    });
});

// 搜索与给定查询匹配的 BookmarkTreeNodes。使用对象指定的查询会生成与所有指定属性匹配的 BookmarkTreeNodes。
document.getElementById('search-btn').addEventListener('click', () => {
    const keyword = document.getElementById('search-keyword-input').value;
    if (!keyword) {
        document.getElementById('result-container').value = '请输入关键词';
        return;
    }
    // let query = {
    //     query: keyword, // 包含要与书签网址和标题进行匹配的字词和带引号的短语 模糊查询
    //     title: keyword, // 书签的标题；要求完全匹配
    //     url: keyword, // 书签的网址；完全匹配。请注意，文件夹没有网址
    // };
    let query = keyword;
    // 查询对象可以是 字符串 | 对象
    chrome.bookmarks.search(query, (bookmarkNodes) => {
        console.log('bookmarkNodes', bookmarkNodes);
        document.getElementById('result-container').value = JSON.stringify(bookmarkNodes, null, 2);
    });
});

// 点击检索指定书签
document.getElementById('get-bookmark-btn').addEventListener('click', () => {
    const val = document.getElementById('bookmark-ids-input').value;
    if (!val) {
        document.getElementById('result-container').value = '请输入书签ID';
        return;
    }
    let ids = val.split(',');
    chrome.bookmarks.get(ids, (bookmarkNodes) => {
        console.log('bookmarkNodes', bookmarkNodes);
        document.getElementById('result-container').value = JSON.stringify(bookmarkNodes, null, 2);
    });
});

// 点击检索书签层次结构的一部分
document.getElementById('get-subtree-btn').addEventListener('click', () => {
    const val = document.getElementById('subtree-id-input').value;
    if (!val) {
        document.getElementById('result-container').value = '请输入文件夹ID';
        return;
    }
    chrome.bookmarks.getSubTree(val, (bookmarkTreeNodes) => {
        console.log('bookmarkTreeNodes', bookmarkTreeNodes);
        document.getElementById('result-container').value = JSON.stringify(bookmarkTreeNodes, null, 2);
    });
});

// 点击检索指定文件夹的子级
document.getElementById('get-children-btn').addEventListener('click', () => {
    const val = document.getElementById('subtree-id-input').value;
    if (!val) {
        document.getElementById('result-container').value = '请输入文件夹ID';
        return;
    }
    chrome.bookmarks.getChildren(val, (bookmarkTreeNodes) => {
        console.log('bookmarkTreeNodes', bookmarkTreeNodes);
        document.getElementById('result-container').value = JSON.stringify(bookmarkTreeNodes, null, 2);
    });
});

// 点击创建书签
document.getElementById('create-btn').addEventListener('click', () => {
    let createDetails = {
        // index: 0, // 索引
        // parentId: "1", // 父文件夹ID 默认为“其他书签”文件夹。
        // title: "新书签", // 书签标题 
        // url: "https://www.baidu.com", // 书签网址  为空则创建在为文件夹
    };
    const index = document.getElementById('create-index-input').value;
    if (index) {
        createDetails.index = parseInt(index);
    }
    const parentId = document.getElementById('create-parentId-input').value;
    if (parentId) {
        createDetails.parentId = parentId;
    }
    const title = document.getElementById('create-title-input').value;
    if (title) {
        createDetails.title = title;
    }
    const url = document.getElementById('create-url-input').value;
    if (url) {
        createDetails.url = url;
    }
    if (!title) {
        document.getElementById('result-container').value = '请输入书签标题';
        return;
    }
    console.log('点击创建书签:', createDetails);
    chrome.bookmarks.create(createDetails, (node) => {
        console.log('node', node);
        console.log('BookmarkTreeNode.children', node.children); // BookmarkTreeNode[] 相应节点的子节点的有序列表
        console.log('BookmarkTreeNode.dateAdded', node.dateAdded); // number 相应节点创建的时间，以自纪元 (new Date(dateAdded)) 以来的毫秒数表示。
        console.log('BookmarkTreeNode.dateGroupModified', node.dateGroupModified); // number 相应文件夹的内容上次更改的时间（以自纪元以来经过的毫秒数表示）。
        console.log('BookmarkTreeNode.dateLastUsed', node.dateLastUsed); // number 相应节点上次打开的时间（以自纪元以来经过的毫秒数表示）。未针对文件夹设置。
        // bookmarks-bar 内容显示在浏览器窗口顶部的文件夹。
        // other 在所有平台的完整书签列表中显示的书签。
        // mobile 用户移动设备上通常可用的书签，但可通过扩展程序或在书签管理器中修改。
        // managed 如果受监督用户的系统管理员或监护人已配置书签，则可能会显示此顶级文件夹。
        console.log('BookmarkTreeNode.folderType', node.folderType); // 如果存在，则表示浏览器添加的文件夹，用户或扩展程序无法修改。如果此节点未设置 unmodifiable 属性，则可以修改子节点。如果节点可由用户和扩展程序修改，则省略此属性（默认）。
        console.log('BookmarkTreeNode.id', node.id); // 节点的唯一标识符。ID 在当前个人资料中是唯一的，即使在浏览器重启后仍保持有效。
        console.log('BookmarkTreeNode.index', node.index); // 相应节点在其父文件夹中的从零开始的位置。
        console.log('BookmarkTreeNode.parentId', node.parentId); // 父文件夹的 id。根节点可省略。 
        console.log('BookmarkTreeNode.syncing', node.syncing); // 相应节点是否已由浏览器与用户的远程账号存储空间同步。这可用于区分同一 FolderType 的账号级版本和仅限本地版本。现有节点上此属性的值可能会发生变化，例如，因用户操作而发生变化。
        console.log('BookmarkTreeNode.title', node.title); // 节点显示的文本
        console.log('BookmarkTreeNode.unmodifiable', node.unmodifiable); // 指明相应节点不可修改的原因。managed 值表示相应节点是由系统管理员或受监督用户的监护人配置的。如果节点可由用户和扩展程序修改，则省略此属性（默认）。
        console.log('BookmarkTreeNode.url', node.url); // 用户点击书签时导航到的网址。对于文件夹，此属性会被省略
        document.getElementById('result-container').value = JSON.stringify(node, null, 2);
    });
});

// 点击更新书签
document.getElementById('update-btn').addEventListener('click', () => {
    let obj = {};
    const id = document.getElementById('update-id-input').value;
    if (!id) {
        document.getElementById('result-container').value = '请输入书签ID';
        return;
    }
    const title = document.getElementById('update-title-input').value;
    if (title) {
        obj.title = title;
    } else {
        document.getElementById('result-container').value = '请输入书签标题';
        return;
    }
    const url = document.getElementById('update-url-input').value;
    if (url) {
        obj.url = url;
    }
    console.log('点击更新书签:', obj);
    chrome.bookmarks.update(id, obj, (bookmarkNode) => {
        console.log('bookmarkNode', bookmarkNode);
        document.getElementById('result-container').value = JSON.stringify(bookmarkNode, null, 2);
    });
});

// 移除书签或空书签文件夹
document.getElementById('remove-btn').addEventListener('click', () => {
    const id = document.getElementById('remove-id-input').value;
    if (!id) {
        document.getElementById('result-container').value = '请输入书签ID';
        return;
    }
    chrome.bookmarks.remove(id, () => {
        console.log('移除书签或空书签文件夹:', id);
        document.getElementById('result-container').value = `成功移除书签或空书签文件夹: ${id}`;
    });
});

// 将指定的 BookmarkTreeNode 移动到提供的位置
document.getElementById('move-btn').addEventListener('click', () => {
    const id = document.getElementById('move-id-input').value;
    if (!id) {
        document.getElementById('result-container').value = '请输入要移动的书签或空书签文件夹ID';
        return;
    }
    let obj = {};
    const index = document.getElementById('move-index-input').value;
    if (index !== '') {
        obj.index = parseInt(index);
    }
    const parentId = document.getElementById('move-parentId-input').value;
    if (!parentId) {
        document.getElementById('result-container').value = '请输入要移动的书签或空书签文件夹ID';
        return;
    }
    obj.parentId = parentId;
    console.log('点击移动书签:', obj);
    chrome.bookmarks.move(id, obj, (bookmarkNode) => {
        console.log('bookmarkNode', bookmarkNode);
        document.getElementById('result-container').value = JSON.stringify(bookmarkNode, null, 2);
    });
});