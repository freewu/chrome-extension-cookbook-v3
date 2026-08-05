# chrome.bookmarks 管理书签功能展示

## manifest.json 配置
```json
{
    "permissions": [
        "bookmarks"
    ],
    "chrome_url_overrides": {
        "bookmarks": "pages/bookmarks.html"
    }
}
```
## 方法
### create()
> 在指定的 parentId 下创建书签或文件夹。如果网址为 NULL 或缺失，则为文件夹
```javascript
let createDetails = {
    index: 0, // 索引
    parentId: "1", // 父文件夹ID 默认为“其他书签”文件夹。
    title: "新书签", // 书签标题 
    url: "https://www.baidu.com", // 书签网址  为空则创建在为文件夹
};
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
});
```

### get()
> 检索指定的 BookmarkTreeNode
```javascript
let id = "1"; // 单个字符串值 ID 或字符串值 ID 数组
// let id = ["1", "2"];
chrome.bookmarks.get(id, (nodes) => {
    console.log('node', nodes);
    for (let node of nodes) {
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
    }
});
```

### getChildren()
> 检索指定 BookmarkTreeNode ID 的子级
```javascript
let id = "1";
chrome.bookmarks.getChildren(id, (nodes) => {
    console.log('node', nodes);
    for (let node of nodes) {
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
    }
});
```

### getRecent()
> 检索最近添加的书签
```javascript
let numberOfItems = 10; // 需要返回的最大项数  最近添加的10个书签
chrome.bookmarks.getRecent(numberOfItems, (nodes) => {
    console.log('node', nodes);
    for (let node of nodes) {
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
    }
});
```

### getSubTree()
> 检索书签层次结构的一部分，从指定节点开始
```javascript
let id = "1"; // 要检索的子树的根的 ID
chrome.bookmarks.getSubTree(id, (nodes) => {
    console.log('node', nodes);
    for (let node of nodes) {
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
    }
});
```

### move()
> 将指定的 BookmarkTreeNode 移动到提供的位置
```javascript
let id = "1"; // 要移动的节点的 ID
let destination = {
    index: 0, // 新的 索引
    parentId: "1", // 新的 父文件夹ID 默认为“其他书签”文件夹。
};
chrome.bookmarks.move(id, destination, (node) => {
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
});
```

### remove()
> 移除书签或空书签文件夹
```javascript
let id = "1"; // 要移除的节点的 ID
chrome.bookmarks.remove(id, () => {
    console.log('移除书签或空书签文件夹:', id);
});
```

### removeTree()
> 递归移除书签文件夹及其所有子项
```javascript
let id = "1"; // 要移除的文件夹的 ID
chrome.bookmarks.removeTree(id, () => {
    console.log('递归移除书签文件夹及其所有子项:', id);
});
```

### search() 
> 搜索与给定查询匹配的 BookmarkTreeNodes。使用对象指定的查询会生成与所有指定属性匹配的 BookmarkTreeNodes
```javascript
let searchParam = {
    query: "搜索关键词", // 模糊查询包含要与书签网址和标题进行匹配的字词和带引号的短语。
    title: "完全匹配的书签标题", // 书签的标题；完全匹配 
    url: "https://www.baidu.com", // 书签的网址；完全匹配。注意，文件夹没有网址。
};
// let searchParam = "搜索关键词"; // 等同于 { query: "搜索关键词" }
chrome.bookmarks.search(searchParam, (nodes) => {
    console.log('搜索结果:', nodes);
    for (let node of nodes) {
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
    }
});
```

### update()
> 更新书签或文件夹的属性。仅指定要更改的属性；未指定的属性将保持不变。目前仅支持 title 和 url
```javascript
let id = "1"; // 要更新的节点的 ID
let changes = {
    title: "新的书签标题", // 要更新的书签的新标题
    url: "https://www.baidu.com", // 要更新的书签的新网址
};
chrome.bookmarks.update(id, changes, (node) => {
    console.log('更新后的书签节点:', node);
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
});
```



## 事件
### onChanged
> 在书签或文件夹发生更改时触发。目前，只有标题和网址更改会触发此操作
```javascript
chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
    console.log('书签或文件夹发生更改', id, changeInfo);
    console.log('标题:', changeInfo.title);
    console.log('网址:', changeInfo.url);
});
```

### onChildrenReordered
> 当文件夹的子项因在界面中排序而更改顺序时触发。不会因调用 move() 而调用
```javascript
chrome.bookmarks.onChildrenReordered.addListener((id, reorderInfo) => {
    console.log('文件夹子项排序发生更改', id, reorderInfo);
    console.log('reorderInfo.childIds:', reorderInfo.childIds); // 字符串[]
});
```

### onCreated
> 在创建书签或文件夹时触发
```javascript
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    console.log('在创建书签或文件夹时触发', id, bookmark);
    console.log('bookmark.children', bookmark.children); // 相应节点的子节点的有序列表 BookmarkTreeNode[]
    console.log('bookmark.dateAdded', bookmark.dateAdded); // 相应节点创建的时间，以自纪元 (new Date(dateAdded)) 以来的毫秒数表示。
    console.log('bookmark.dateGroupModified', bookmark.dateGroupModified); // 相应文件夹的内容上次更改的时间（以自纪元以来经过的毫秒数表示）。
    console.log('bookmark.dateLastUsed', bookmark.dateLastUsed); // 相应节点上次打开的时间（以自纪元以来经过的毫秒数表示）。未针对文件夹设置。  
    // bookmarks-bar 内容显示在浏览器窗口顶部的文件夹。
    // other 在所有平台的完整书签列表中显示的书签。
    // mobile 用户移动设备上通常可用的书签，但可通过扩展程序或在书签管理器中修改。
    // managed 如果受监督用户的系统管理员或监护人已配置书签，则可能会显示此顶级文件夹。
    console.log('bookmark.folderType', bookmark.folderType); // 如果存在，则表示浏览器添加的文件夹，用户或扩展程序无法修改。如果此节点未设置 unmodifiable 属性，则可以修改子节点。如果节点可由用户和扩展程序修改，则省略此属性（默认）。
    console.log('bookmark.id', bookmark.id); // 节点的唯一标识符。ID 在当前个人资料中是唯一的，即使在浏览器重启后仍保持有效
    console.log('bookmark.index', bookmark.index); // 相应节点在其父文件夹中的从零开始的位置。
    console.log('bookmark.parentId', bookmark.parentId); // 父文件夹的 id。根节点可省略。
    console.log('bookmark.syncing', bookmark.syncing); // 相应节点是否已由浏览器与用户的远程账号存储空间同步。这可用于区分同一 FolderType 的账号级版本和仅限本地版本。现有节点上此属性的值可能会发生变化，例如，因用户操作而发生变化。
    console.log('bookmark.title', bookmark.title); // 为节点显示的文本。
    console.log('bookmark.url', bookmark.url); // 用户点击书签时导航到的网址。对于文件夹，此属性会被省略。
    console.log('bookmark.unmodifiable', bookmark.unmodifiable); // 指明相应节点不可修改的原因。managed 值表示相应节点是由系统管理员或受监督用户的监护人配置的。如果节点可由用户和扩展程序修改，则省略此属性（默认）。
});
```

### onImportBegan
> 在开始书签导入会话时触发。在 onImportEnded 触发之前，开销大的观测器应忽略 onCreated 更新。观察者仍应立即处理其他通知。
```javascript
chrome.bookmarks.onImportBegan.addListener(function() {
    console.log('在开始书签导入会话时触发');
});
```

### onImportEnded
> 在书签导入会话结束时触发
```javascript
chrome.bookmarks.onImportEnded.addListener(function() {
    console.log('在书签导入会话结束时触发');
});
```

### onMoved
> 当书签或文件夹被移至其他父级文件夹时触发
```javascript
chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
    console.log('书签或文件夹被移至其他父级文件夹', id, moveInfo);
    console.log('moveInfo.oldIndex:', moveInfo.oldIndex);
    console.log('moveInfo.oldIndex:',moveInfo.oldParentId);
    console.log('moveInfo.oldIndex:',moveInfo.parentId);
});
```
### onRemoved
> 在移除书签或文件夹时触发。以递归方式移除文件夹时，系统会针对该文件夹触发一次通知，而不会针对其内容触发通知。
```javascript
chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    console.log('书签或文件夹被移除', id, removeInfo);
    console.log('removeInfo.node:', removeInfo.node); // 细节看  onCreated 
    console.log('removeInfo.parentId:', removeInfo.parentId);
    console.log('removeInfo.index:', removeInfo.index);
});
```

## 项目
> https://github.com/freewu/plugin-demo/blob/main/chrome-extension-demo/demo28/
![bookmarks](./images/api/bookmarks-setting.png)

## 资料
```markdown
https://developer.chrome.com/docs/extensions/reference/api/bookmarks?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/bookmarks
```