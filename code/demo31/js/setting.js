// 获取扩展程序的当前权限集。
document.getElementById("get-all-btn").addEventListener("click", () => {
    chrome.permissions.getAll((permissions) => {
        console.log("扩展程序的当前权限集:", permissions);
        document.getElementById("result-container").textContent = JSON.stringify(permissions, null, 2);
    });
});

// 检查扩展程序是否具有指定权限。
document.getElementById("contain-btn").addEventListener("click", () => {
    const selectedPermission = document.getElementById("permission-item").value;
    chrome.permissions.contains({ 
        // origins: ["*://*/*"], // 主机权限列表，包括清单中 optional_permissions 或 permissions 键中指定的权限
        permissions: [selectedPermission] // 已命名的权限列表（不包括主机或来源）
    }, (result) => {
        console.log(`扩展程序是否具有 ${selectedPermission} 权限:`, result);
        document.getElementById("result-container").textContent = `扩展程序是否具有 ${selectedPermission} 权限: ${result}`;
    });
});

// 请求访问指定权限，并在必要时向用户显示提示。
// 这些权限必须在清单的 optional_permissions 字段中定义，或者是由用户拒绝的必需权限。源格式中的路径会被忽略。
// 您可以请求可选来源权限的子集；例如，如果您在清单的 optional_permissions 部分中指定 *://*\/*，则可以请求 http://example.com/。
// 如果请求权限时出现任何问题，系统会设置 runtime.lastError。
document.getElementById("request-btn").addEventListener("click", () => {
    const selectedPermission = document.getElementById("permission-item").value;
    chrome.permissions.request({ 
        // origins: ["*://*/*"], // 主机权限列表，包括清单中 optional_permissions 或 permissions 键中指定的权限
        permissions: [selectedPermission] // 已命名的权限列表（不包括主机或来源）
    }, (result) => {
        if (chrome.runtime.lastError) {
            console.error(`请求 ${selectedPermission} 权限时出错:`, chrome.runtime.lastError.message);
            document.getElementById("result-container").textContent = `请求 ${selectedPermission} 权限时出错: ${chrome.runtime.lastError.message}`;
            return;
        }
        console.log(`请求 ${selectedPermission} 权限的结果:`, result);
        document.getElementById("result-container").textContent = `请求 ${selectedPermission} 权限的结果: ${result}`;
    });
});

// 移除对指定权限的访问权限。如果移除权限时遇到任何问题，系统会设置 runtime.lastError。
document.getElementById("remove-btn").addEventListener("click", () => {
    const selectedPermission = document.getElementById("permission-item").value;
    chrome.permissions.remove({ 
        // origins: ["*://*/*"], // 主机权限列表，包括清单中 optional_permissions 或 permissions 键中指定的权限
        permissions: [selectedPermission] // 已命名的权限列表（不包括主机或来源）
    }, (result) => {
        if (chrome.runtime.lastError) {
            console.error(`移除 ${selectedPermission} 权限时出错:`, chrome.runtime.lastError.message);
            document.getElementById("result-container").textContent = `移除 ${selectedPermission} 权限时出错: ${chrome.runtime.lastError.message}`;
            return;
        }
        console.log(`移除 ${selectedPermission} 权限的结果:`, result);
        document.getElementById("result-container").textContent = `移除 ${selectedPermission} 权限的结果: ${result}`;
    });
});
