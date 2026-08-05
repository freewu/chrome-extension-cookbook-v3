# 第一个 Hello World

## 创建扩展
### 创建目录
```bash
  mkdir demo1
```

### 创建清单文件 manifest.json
```json
{
    "name": "Hello World Chrome Extension",
    "description": "第一个简单的扩展",
    "version": "1.0",
    "manifest_version": 3,
    "action": {
        "default_popup": "pages/popup.html",
        "default_icon": "images/icon.png"
    }
}
```

### 创建 pages/popup.html 文件
```html
<html>
  <body>
    <h1>Hello Chrome Extension</h1>
  </body>
</html>
```

### 找个 .png 图片 放到 images/icon.png
```bash
cp icon.png ./demo1/images/icon.png
```

## 目录说明
```markdown
├── Readme.md     // 项目说明
├── images
│   └── icon.png  // icon图片
├── manifest.json // 清单文件(必须)
└── pages
    └── popup.html // popup 页面
```

## 运行扩展
### 进入 扩展程序  面页（三种方法）

  *  在新标签页中输入 `chrome://extensions` 即可前往 “扩展程序” 页面 
    <img src=".\docs\1-1.png" alt="1-1" style="zoom:50%;" />

  *  点击“扩展程序”菜单拼图按钮，然后选择菜单底部的**管理扩展程序** 
    <img src=".\docs\1-2.png" style="zoom: 25%;" />

  *  点击 Chrome 菜单，将鼠标悬停在 **更多工具**上，然后选择**扩展程序** 
  	​	  <img src=".\docs\1-3.png" style="zoom: 33%;" />
  
### 开启开发者模式
   <img src=".\docs\2-1.png" style="zoom: 33%;" />

### 加载扩展( 打开 清单文件  **manifest.json** 所在目录)
   <img src=".\docs\2-2.png" style="zoom: 33%;" />

### 查看扩展信息
   <img src=".\docs\2-3.png" style="zoom: 33%;" />

### 固定扩展（方便查看调试）
  <img src=".\docs\2-4.png" style="zoom: 33%;" />

### 查看 popup.html (点击图标)
  <img src=".\docs\2-5.png" style="zoom: 33%;" />

## 调试扩展
### 修改 **manifest.json**
``` json
{
    "name": "Hello World Chrome Extension",
    "description": "第一个简单的扩展, 112233",
    "version": "1.0",
    "manifest_version": 3,
    "action": {
        "default_popup": "pages/popup.html",
        "default_icon": "images/icon.png"
    }
}
```

### 修改 popup.html 
```html
<html>
  <body>
    <h1>Hello Chrome Extension 11223344</h1>
  </body>
</html>
```
### 重新加载扩展页

  * 修改了 清单文件 **manifest.json** 需要 重新加载扩展
  * 如果只是修改其它文件 **管理扩展程序** 页面刷新即可
  <img src=".\docs\3-1.png" style="zoom: 33%;" />

### 验证
<img src=".\docs\3-2.png" style="zoom: 33%;" />   
<img src=".\docs\3-3.png" style="zoom: 33%;" />

## 资料
```
https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=zh-cn 
```