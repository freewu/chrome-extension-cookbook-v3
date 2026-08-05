// 返回相应扩展程序的所有动态注册的用户脚本
document.getElementById('get-scripts-btn').addEventListener('click', async () => {
    let userScriptFilter = {
        // ids: [] // getScripts 仅返回具有此列表中指定 ID 的脚本
    }
    // getScripts 仅返回具有此列表中指定 ID 的脚本
    const scripts = await chrome.userScripts.getScripts(userScriptFilter);
    console.log("获取用户脚本:",scripts);
    document.getElementById('result-container').value = "获取用户脚本:" + JSON.stringify(scripts, null, 2);
});

// 检索所有已注册的世界配置
document.getElementById('get-world-configurations-btn').addEventListener('click', async () => {
    const worldConfigurations = await chrome.userScripts.getWorldConfigurations();
    console.log("检索所有已注册的世界配置:",worldConfigurations);
    document.getElementById('result-container').value = "检索所有已注册的世界配置:" + JSON.stringify(worldConfigurations, null, 2);
});

// 重置用户脚本世界的配置。任何注入到具有指定 ID 的世界中的脚本都将使用默认世界配置
document.getElementById('reset-world-configurations-btn').addEventListener('click', async () => {
    await chrome.userScripts.resetWorldConfiguration(
        // "worldId" // worldId 要重置的用户脚本世界的 ID。如果省略，则重置默认世界的配置
    );
    console.log("重置用户脚本世界的配置");
    document.getElementById('result-container').value = "重置用户脚本世界的配置";
});

// 配置 `USER_SCRIPT` 执行环境
document.getElementById('set-world-configurations-btn').addEventListener('click', async () => {
    await chrome.userScripts.configureWorld({
        csp: "MAIN", // 指定全球 CSP。默认值为 `ISOLATED` 全球 csp。 MAIN | ISOLATED    
        messaging: true, // 指定是否公开消息传递 API。默认值为 false。 
        //worldId: "default", // Chrome 133 及更高版本 指定要更新的特定用户脚本世界的 ID。如果未提供，则更新默认用户脚本世界的属性。以英文下划线 (_) 开头的值是预留值。
    });
    console.log("配置 `USER_SCRIPT` 执行环境");
    document.getElementById('result-container').value = "配置 `USER_SCRIPT` 执行环境";
});



// 为相应扩展程序注册一个或多个用户脚本
document.getElementById('register-baidu-btn').addEventListener('click', () => {
    let registeredUserScripts = [{
        allFrames: true, // 如果为 true，则会注入到所有框架中，即使该框架不是标签页中最顶层的框架。系统会针对每个框架单独检查网址要求；如果不满足网址要求，则不会注入到子框架中。默认值为 false，表示仅匹配顶部框架。
        //excludeGlobs: [], // 指定用户脚本不会注入到的网页的通配符模式。
        //excludeMatches: [], // 排除此用户脚本原本会注入到的网页。如需详细了解这些字符串的语法，请参阅匹配模式。
        id: "baidu-script", // API 调用中指定的用户脚本的 ID。此属性不得以“_”开头，因为该字符预留为生成的脚本 ID 的前缀。
        //includeGlobs: ["https://www.baidu.com/*"], // 指定用户脚本将注入到的网页的通配符模式。
        js: [ // ScriptSource 对象的列表，用于定义要注入到匹配网页中的脚本的来源。必须为 ${ref:register} 指定此属性，并且指定时必须是一个非空数组。

            {
                code: 'document.body.style.backgroundColor = "red";console.log("injection code!!!");', // 包含要注入的 JavaScript 代码的字符串。必须指定 file 或 code 中的一个
            },
            {
                file: './js/user-script.js', // 要注入的 JavaScript 文件的路径（相对于扩展程序的根目录）。必须指定 file 或 code 中的一个
            },
        ],

        matches: ["*://*.baidu.com/*"], // 指定此用户脚本将注入到哪些网页中。如需详细了解这些字符串的语法，请参阅匹配模式。必须为 ${ref:register} 指定此属性。
        runAt: "document_idle", // 指定何时将 JavaScript 文件注入到网页中。首选值和默认值为 document_idle。 document_start | document_end | document_idle
        world: "MAIN", // 用于运行脚本的 JavaScript 执行环境。默认值为 `USER_SCRIPT`。 MAIN | USER_SCRIPT
        //worldId: "default", // Chrome 133 及更高版本 指定要执行的用户脚本世界 ID。如果省略，脚本将在默认的用户脚本世界中执行。仅在省略 world 或 world 为 USER_SCRIPT 时有效。以英文下划线 (_) 开头的值是预留值。
    }]
    chrome.userScripts.register(registeredUserScripts,() => {
        console.log("为百度注册用户脚本成功");
        document.getElementById('result-container').value = "为百度注册用户脚本成功"; 
    });
});

// 注销相应扩展程序的用户脚本
document.getElementById('unregister-baidu-btn').addEventListener('click', () => {
    let userScriptFilter = {
        ids: ["baidu-script"], // getScripts 仅返回具有此列表中指定 ID 的脚本
    }
    chrome.userScripts.unregister().then((userScriptFilter) => {
        console.log("注销用户脚本:baidu-script");
        document.getElementById('result-container').value = "注销用户脚本:baidu-script";
    }).catch((error) => {
        console.error("注销用户脚本:baidu-script 失败:",error);
        document.getElementById('result-container').value = "注销用户脚本:baidu-script 失败:" + error.message;
    });
});

// 更新相应扩展程序的用户脚本
// 包含要更新的用户脚本的列表。仅当属性在此对象中指定时，才会针对现有脚本更新该属性。如果在脚本解析/文件验证期间出现错误，或者指定的 ID 与完全注册的脚本不对应，则不会更新任何脚本。
document.getElementById('update-baidu-btn').addEventListener('click', () => {
    let registeredUserScripts = [{
        allFrames: true, // 如果为 true，则会注入到所有框架中，即使该框架不是标签页中最顶层的框架。系统会针对每个框架单独检查网址要求；如果不满足网址要求，则不会注入到子框架中。默认值为 false，表示仅匹配顶部框架。
        //excludeGlobs: [], // 指定用户脚本不会注入到的网页的通配符模式。
        //excludeMatches: [], // 排除此用户脚本原本会注入到的网页。如需详细了解这些字符串的语法，请参阅匹配模式。
        id: "baidu-script", // API 调用中指定的用户脚本的 ID。此属性不得以“_”开头，因为该字符预留为生成的脚本 ID 的前缀。
        //includeGlobs: ["https://www.baidu.com/*"], // 指定用户脚本将注入到的网页的通配符模式。
        js: [ // ScriptSource 对象的列表，用于定义要注入到匹配网页中的脚本的来源。必须为 ${ref:register} 指定此属性，并且指定时必须是一个非空数组。

            {
                code: 'document.body.style.backgroundColor = "green";console.log("injection code update!!!");', // 包含要注入的 JavaScript 代码的字符串。必须指定 file 或 code 中的一个
            },
            {
                file: './js/user-script.js', // 要注入的 JavaScript 文件的路径（相对于扩展程序的根目录）。必须指定 file 或 code 中的一个
            },
        ],

        matches: ["*://*.baidu.com/*"], // 指定此用户脚本将注入到哪些网页中。如需详细了解这些字符串的语法，请参阅匹配模式。必须为 ${ref:register} 指定此属性。
        runAt: "document_idle", // 指定何时将 JavaScript 文件注入到网页中。首选值和默认值为 document_idle。 document_start | document_end | document_idle
        world: "MAIN", // 用于运行脚本的 JavaScript 执行环境。默认值为 `USER_SCRIPT`。 MAIN | USER_SCRIPT
        //worldId: "default", // Chrome 133 及更高版本 指定要执行的用户脚本世界 ID。如果省略，脚本将在默认的用户脚本世界中执行。仅在省略 world 或 world 为 USER_SCRIPT 时有效。以英文下划线 (_) 开头的值是预留值。
    }]
    chrome.userScripts.update(registeredUserScripts,() => {
        console.log("更新用户脚本:baidu-script");
        document.getElementById('result-container').value = "更新用户脚本:baidu-script";
    });
});