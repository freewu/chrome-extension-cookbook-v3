// 返回有关已安装的扩展程序和应用的信息列表
document.getElementById("get-all-btn").addEventListener("click", async () => {
    const extensions = await chrome.management.getAll();
    console.log('getAll:', extensions);
    document.getElementById("result-container").value = JSON.stringify(extensions, null, 2);
});

// 返回有关调用扩展程序、应用或主题的信息。注意：使用此函数时，无需在清单中请求“管理”权限
document.getElementById("get-self-btn").addEventListener("click", async () => {
    const extensionInfo = await chrome.management.getSelf();
    console.log('getSelf:', extensionInfo);
    document.getElementById("result-container").value = JSON.stringify(extensionInfo, null, 2);
});

// 卸载调用扩展程序。注意：使用此函数时，无需在清单中请求“管理”权限。但若用户无法卸载指定的扩展程序/应用，此函数在受管理环境中将无法执行
document.getElementById("uninstall-self-btn").addEventListener("click", async () => {
    await chrome.management.uninstallSelf({
        showConfirmDialog: true  // 是否应提示用户显示确认卸载对话框。自行卸载时，默认值为 false。如果扩展程序卸载其他扩展程序，系统会忽略此参数，并始终显示对话框
    });
    console.log('uninstallSelf: 卸载成功');
    document.getElementById("result-container").value = '卸载成功';
});

// 返回有关具有指定 ID 的已安装扩展程序、应用或主题的信息
document.getElementById("get-extension-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    chrome.management.get(extensionId).then((info) => {
        console.log('get:', info);
        document.getElementById("result-container").value = JSON.stringify(info, null, 2);
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

// 返回有关具有指定 ID 的已安装扩展程序、应用或主题的权限警告列表
document.getElementById("get-permissions-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    chrome.management.getPermissionWarningsById(extensionId).then((warnings) => {
        console.log('getPermissionsWarnings:', warnings);
        document.getElementById("result-container").value = JSON.stringify(warnings, null, 2);
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
}); 

// createAppShortcut 显示为应用创建快捷方式的选项。在 Mac 上仅支持为打包应用创建  只有 app 类型才允许
document.getElementById("create-shortcut-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    chrome.management.createAppShortcut(extensionId).then((shortcutInfo) => {
        console.log('createAppShortcut:', shortcutInfo);
        document.getElementById("result-container").value = JSON.stringify(shortcutInfo, null, 2);
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

// 启动应用  只有 app 类型才允许
document.getElementById("launch-app-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    chrome.management.launchApp(extensionId).then(() => {
        console.log('launchApp:', extensionId);
        document.getElementById("result-container").value = '应用启动成功';
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

// 启用或停用应用或扩展程序。在大多数情况下，此函数必须在用户手势（如按钮的 onclick 处理程序）上下文中调用，并且可能会向用户展示原生确认界面以防止滥用
document.getElementById("enable-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    chrome.management.setEnabled(extensionId, true).then(() => {
        console.log('setEnabled:', extensionId, true);
        document.getElementById("result-container").value = '应用启用成功';
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

document.getElementById("disable-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    chrome.management.setEnabled(extensionId, false).then(() => {
        console.log('setEnabled:', extensionId, false);
        document.getElementById("result-container").value = '应用停用成功';
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

// 卸载当前安装式应用或扩展程序。注意：在用户未被授权卸载指定扩展程序/应用的受管理环境中，此功能将无法执行。
// 若卸载失败（如用户取消对话框），系统将拒绝 promise 或回调将被调用，同时设置 runtime.lastError。
document.getElementById("uninstall-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    let options = {
        showConfirmDialog: true, // 是否应提示用户显示确认卸载对话框。自行卸载时，默认值为 false。如果扩展程序卸载其他扩展程序，系统会忽略此参数，并始终显示对话框。
    };
    chrome.management.uninstall(extensionId,options).then(() => {
        console.log('uninstall:', extensionId);
        document.getElementById("result-container").value = '应用卸载成功';
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

// 为网址生成应用。返回生成的书签应用。generateAppForLink
document.getElementById("create-app-btn").addEventListener("click", async () => {
    const url = document.getElementById("url-input").value;
    if (!url) {
        document.getElementById("result-container").value = '请输入网址';
        return;
    }
    const title = document.getElementById("title-input").value;
    if (!title) {
        document.getElementById("result-container").value = '请输入应用名称';
        return;
    }
    chrome.management.generateAppForLink(url, title).then((appInfo) => {
        console.log('createApp:', appInfo);
        document.getElementById("result-container").value = JSON.stringify(appInfo, null, 2);
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

// 设置应用的启动类型 需要 app 类型才可以
document.getElementById("set-launch-type-btn").addEventListener("click", async () => {
    const extensionId = document.getElementById("set-extension-id-input").value;
    if (!extensionId) {
        document.getElementById("result-container").value = '请输入扩展程序ID';
        return;
    }
    const launchType = document.getElementById("set-launch-type-select").value;
    if (!launchType) {
        document.getElementById("result-container").value = '请选择应用启动类型';
        return;
    }
    // 目标启动类型。请务必检查并确保此启动类型位于 ExtensionInfo.availableLaunchTypes 中，因为可用的启动类型因平台和配置而异。
    chrome.management.setLaunchType(extensionId, launchType).then(() => {
        console.log('setLaunchType:', extensionId, launchType);
        document.getElementById("result-container").value = '应用启动类型设置成功';
    }).catch((error) => {
        document.getElementById("result-container").value = error.message;
    });
});

// // 启动清单中指定的 replacement_web_app。若未安装，提示用户安装
// document.getElementById("install-replacement-web-app-btn").addEventListener("click", async () => {
//     chrome.management.installReplacementWebApp().then(() => {
//         document.getElementById("result-container").value = '应用启动成功';
//     }).catch((error) => {
//         document.getElementById("result-container").value = error.message;
//     });
// });