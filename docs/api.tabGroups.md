# chrome.tabGroups 标签页分组系统进行交互

> 使用 `chrome.tabGroups` API 与浏览器的标签页分组系统交互：查询分组、修改分组的标题、颜色、折叠状态、移动分组等。
> 该 API 需要 `tabGroups` 权限。通常与 `chrome.tabs.group()` / `chrome.tabs.ungroup()` 配合使用。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "标签页分组 展示 (chrome.tabGroups)",
    "permissions": [
        "tabGroups",
        "tabs"
    ]
}
```

## TabGroup 对象

```javascript
{
    id: 1,               // 分组 ID
    collapsed: false,    // 是否折叠
    color: "blue",       // grey | blue | red | yellow | green | pink | purple | cyan | orange
    title: "工作",       // 分组标题
    windowId: 1          // 所在窗口 ID
}
```

## 方法

### get()
> 获取指定分组
```javascript
const group = await chrome.tabGroups.get(1);
console.log("标题:", group.title);
console.log("颜色:", group.color);
console.log("是否折叠:", group.collapsed);
```

### query()
> 查询分组
```javascript
// 查询所有折叠的分组
const collapsedGroups = await chrome.tabGroups.query({ collapsed: true });

// 查询指定窗口中的分组
const windowGroups = await chrome.tabGroups.query({ windowId: 1 });

// 按标题查询
const titled = await chrome.tabGroups.query({ title: "工作" });
```

### update()
> 更新分组属性
```javascript
await chrome.tabGroups.update(1, {
    title: "阅读列表",
    color: "green",
    collapsed: true
});
```

### move()
> 移动分组
```javascript
await chrome.tabGroups.move(1, {
    index: 0,        // 目标位置
    windowId: 1      // 目标窗口，-1 表示当前窗口
});
```

## 与 chrome.tabs 配合

### 创建分组并设置属性
```javascript
// 1. 将标签页加入新组
const groupId = await chrome.tabs.group({
    tabIds: [123, 124]
});

// 2. 设置分组属性
await chrome.tabGroups.update(groupId, {
    title: "我的分组",
    color: "blue",
    collapsed: false
});
```

### 查询某分组内的标签页
```javascript
const tabs = await chrome.tabs.query({ groupId: groupId });
console.log("分组内的标签页:", tabs.map((t) => t.title));
```

### 把标签页移出分组
```javascript
await chrome.tabs.ungroup([123]);
```

## 事件

### onCreated
> 创建分组时触发
```javascript
chrome.tabGroups.onCreated.addListener((group) => {
    console.log("分组已创建:", group.id, group.title);
});
```

### onUpdated
> 分组属性变化时触发
```javascript
chrome.tabGroups.onUpdated.addListener((group) => {
    console.log("分组已更新:", group.id, group.title, group.color);
});
```

### onMoved
> 分组移动时触发
```javascript
chrome.tabGroups.onMoved.addListener((group) => {
    console.log("分组已移动:", group.id);
});
```

### onRemoved
> 分组删除时触发
```javascript
chrome.tabGroups.onRemoved.addListener((group) => {
    console.log("分组已删除:", group.id);
});
```

## 项目
> https://github.com/freewu/plugin-demo/blob/main/chrome-extension-demo/demo10/
![debug](./images/api/tabGroups-debug.png)

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/tabGroups?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=zh-cn
```
