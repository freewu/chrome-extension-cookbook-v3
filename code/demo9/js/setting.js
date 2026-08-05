// 查询系统的基本 CPU 信息。
document.getElementById('get-cpu-btn').addEventListener('click', function () {
    chrome.system.cpu.getInfo((info) => {
        console.log("=== cpu 信息 chrome.system.cpu ================================");
        console.log('CPU 元数据(CpuInfo):', info);
        console.log("CpuInfo.archName 处理器的架构名称: ", info.archName); // 处理器的架构名称
        console.log("CpuInfo.features 功能: ", info.features); // 一组表示处理器部分功能的特征码。目前支持的代码包括 mmx | sse | sse2 | sse3 | ssse3 | sse4_1 | sse4_2 | avx
        console.log("CpuInfo.modelName 处理器的型号名称: ", info.modelName); // 处理器的型号名称
        console.log("CpuInfo.numOfProcessors 逻辑处理器的数量: ", info.numOfProcessors); // 逻辑处理器的数量
        console.log("CpuInfo.temperature 温度: ", info.temperature); // [] 来自 CPU 各个散热区的 CPU 温度读数列表。温度以摄氏度为单位。前仅在 ChromeOS 上受支持
        console.log("CpuInfo.processors 相应逻辑处理器的累计使用情况信息: ", info.processors); // 相应逻辑处理器的累计使用情况信息
        // info.processors.forEach((processor, index) => {
        //     // idle / kernel / total / user
        //     console.log(`处理器 ${index + 1}:`, processor);
        //     console.log(`CpuTime.idle: ${processor.usage.idle}`); // 相应处理器处于空闲状态的累计时间。
        //     console.log(`CpuTime.kernel: ${processor.usage.kernel}`); // 相应处理器上内核程序使用的累计时间
        //     console.log(`CpuTime.total: ${processor.usage.total}`); // 相应处理器的总累计时间。此值等于用户 + 内核 + 空闲
        //     console.log(`CpuTime.user: ${processor.usage.user}`); // 用户空间程序在此处理器上使用的累计时间
        // });
        document.getElementById('result-container').value = JSON.stringify(info, null, 2);
    });
});

// 查询系统的基本内存信息。
document.getElementById('get-memory-btn').addEventListener('click', function () {
    chrome.system.memory.getInfo((info) => {
        let result = [];
        result.availableCapacity = info.availableCapacity;
        result.availableCapacityGB = info.availableCapacity / 1024 / 1024 / 1024;
        result.capacity = info.capacity;
        result.capacityGB = info.capacity / 1024 / 1024 / 1024;
        console.log('内存元数据(MemoryInfo):', info);
        let availableCapacity = "MemoryInfo.availableCapacity 可用容量的大小（以字节为单位）: " + info.availableCapacity + " " + info.availableCapacity / 1024 / 1024 / 1024 + "GB";
        console.log(availableCapacity);
        result.push(availableCapacity);
        let capacity = "MemoryInfo.capacity 物理内存容量总大小（以字节为单位）: " + info.capacity + " " + info.capacity / 1024 / 1024 / 1024 + "GB";
        console.log(capacity);
        result.push(capacity);
        result.push("内存元数据(MemoryInfo):" + JSON.stringify(info, null, 2));
        document.getElementById('result-container').value = result.join("\n");
    });
});

// 查询系统的基本存储信息。
document.getElementById('get-storage-btn').addEventListener('click', function () {
    chrome.system.storage.getInfo((info) => {
            console.log("StorageUnitInfo[]:", info);
            console.log("存储设备的数量: ", info.length);
            info.forEach((storage, index) => {
                console.log(`存储设备 ${index + 1}:`, storage);
                console.log(`StorageUnitInfo.capacity 容量（以字节为单位）: ${storage.capacity}`, " ", storage.capacity / 1024 / 1024 / 1024 + "GB"); // 存储空间总量（以字节为单位）
                console.log(`StorageUnitInfo.id 存储设备ID: ${storage.id}`); // 唯一标识存储设备的临时 ID。此 ID 在单个应用的同一运行期间将保持不变。它不会成为应用的不同运行之间或不同应用之间的持久性标识符。
                console.log(`StorageUnitInfo.name 存储设备名称: ${storage.name.trim()}`); // 存储单元的名称
                console.log(`torageUnitInfo.type 设备类型: ${storage.type}`); // 存储单元的媒体类型。  fixed 存储介质固定，例如硬盘或 SSD | removable 存储设备可移除，例如 U 盘 | unknown  存储类型未知
            });
        document.getElementById('result-container').value = JSON.stringify(info, null, 2);
    });
});

// 查询系统的基本显示信息。
document.getElementById('get-display-btn').addEventListener('click', function () {
    let getInfoFlags = {
        singleUnified: false, // 如果设置为 true，则在统一桌面模式下，getInfo 将仅返回一个 DisplayUnitInfo（请参阅 enableUnifiedDesktop）。默认值为 false
    }
    chrome.system.display.getInfo(getInfoFlags, (info) => {
        console.log('显示元数据:', info);
        document.getElementById('result-container').value = JSON.stringify(info, null, 2);
        console.log("显示设备的数量: ", info.length);
        info.forEach((display, index) => {
            console.log(`显示设备 ${index + 1}:`, display);
            console.log(`DisplayUnitInfo.activeState 活动状态: ${display.activeState}`); // 如果系统检测到显示屏并使用它，则为有效。 active | inactive
            console.log(`DisplayUnitInfo.availableDisplayZoomFactors: ${display.availableDisplayZoomFactors}`); // 可为显示屏设置的缩放比例值列表。
            console.log(`DisplayUnitInfo.bounds: ${display.bounds}`);  // 显示屏的逻辑边界
            console.log(`DisplayUnitInfo.displayZoomFactor: ${display.displayZoomFactor}`); // 显示屏的当前缩放比例与默认缩放比例之间的比率。例如，值 1 相当于 100% 缩放，值 1.5 相当于 150% 缩放。
            console.log(`DisplayUnitInfo.dpiX: ${display.dpiX}`); // 沿 x 轴方向每英寸的像素数。
            console.log(`DisplayUnitInfo.dpiY: ${display.dpiY}`); // 沿 y 轴方向每英寸的像素数。
            console.log(`DisplayUnitInfo.edid: ${display.edid}`); // 注意：此功能仅适用于 ChromeOS Kiosk 应用和 Web 界面。
            console.log(`DisplayUnitInfo.hasTouchSupport: ${display.hasTouchSupport}`); // 如果此显示屏关联了触摸输入设备，则为 True
            console.log(`DisplayUnitInfo.id: ${display.id}`); // 显示屏的唯一标识符
            console.log(`DisplayUnitInfo.isEnabled: ${display.isEnabled}`);  // 如果相应显示处于启用状态，则为 true
            console.log(`DisplayUnitInfo.isPrimary: ${display.isPrimary}`);  // 如果这是主显示屏，则为 True。
            console.log(`DisplayUnitInfo.isUnified: ${display.isUnified}`);  // 在统一桌面模式下，所有显示屏均为 true。请参阅 enableUnifiedDesktop 的文档。
            console.log(`DisplayUnitInfo.mirroringDestinationIds: ${display.mirroringDestinationIds}`); // 仅限 ChromeOS。来源显示屏所镜像到的显示屏的标识符。如果未镜像任何显示屏，则为空。所有显示屏的此属性都将设置为相同的值。不得包含 mirroringSourceId。
            console.log(`DisplayUnitInfo.mirroringSourceId: ${display.mirroringSourceId}`); // 仅限 ChromeOS。如果启用了镜像，则为正在镜像的显示屏的标识符；否则为空。此设置将应用于所有显示屏（包括正在镜像的显示屏）。
            console.log(`DisplayUnitInfo.modes: ${display.modes}`); // DisplayMode 可用显示模式的列表。当前模式的 isSelected 将为 true。仅适用于 ChromeOS。在其他平台上，此属性将设置为一个空数组。
            console.log(`DisplayUnitInfo.name: ${display.name}`); // 易记名称（例如“HP LCD 显示器”）。
            console.log(`DisplayUnitInfo.overscan: ${display.overscan}`); // 显示屏在其屏幕边界内的边衬区。目前仅在 ChromeOS 上公开。在其他平台上将设置为空边衬区
            console.log(`DisplayUnitInfo.rotation: ${display.rotation}`); // 显示屏相对于竖屏位置的顺时针旋转角度（以度为单位）。目前仅在 ChromeOS 上公开。在其他平台上将设置为 0。如果值为 -1，则表示当设备处于实体平板电脑状态时，自动旋转屏幕。
            console.log(`DisplayUnitInfo.workArea: ${display.workArea}`); // 显示屏边界内的可用工作区。工作区不包括为操作系统预留的显示区域，例如任务栏和启动器。
            console.log();
        });
    });
});

// == chrome.system.storage.* =======================================================================================================================

// 获取指定存储设备的可用容量 (开发者渠道)
document.getElementById('get-storage-available-btn').addEventListener('click', function () {
    const id = document.getElementById('storage-id-input').value;
    if (!id) {
        alert('请输入存储设备ID');
        return;
    }
    chrome.system.storage.getAvailableCapacity(id, (info) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`StorageAvailableCapacityInfo: ${info}`);
        console.log(`StorageAvailableCapacityInfo.availableCapacity: ${info.availableCapacity}`); // 存储设备的可用容量（以字节为单位）。
        console.log(`StorageAvailableCapacityInfo.id: ${info.id}`); // 复制的 getAvailableCapacity 函数形参 id 的 id。 传入胡 id
        document.getElementById('result-container').value = JSON.stringify(info, null, 2);
    });
});

// 弹出可移除存储设备
document.getElementById('eject-storage-btn').addEventListener('click', function () {
    const storageId = document.getElementById('storage-id-input').value;
    if (!storageId) {
        alert('请输入存储设备ID');
        return;
    }
    chrome.system.storage.ejectDevice(storageId, (code) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        // success 弹出命令成功执行 - 应用可以提示用户移除设备。
        // in_use 设备正被其他应用使用。弹出失败；在其他应用完成对设备的操作之前，用户不应移除设备。
        // no_such_device 没有已知的此类设备。
        // failure 弹出命令失败
        console.log(`EjectDeviceResultCode: ${code}`);
        document.getElementById('result-container').value = `EjectDeviceResultCode: ${code}`;
    });
});

// == chrome.system.display.* =======================================================================================================================
// 通过清除与显示屏关联的所有触控校准数据，重置显示屏的触控校准并将其恢复为默认状态。
document.getElementById('clearTouchCalibration-btn').addEventListener('click', function () {
    console.log("重置显示屏的触控校准");
    const displayId = document.getElementById('display-id-input').value;
    if (!displayId) {
        alert('请输入显示设备ID');
        return;
    }
    chrome.system.display.clearTouchCalibration(displayId, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`ClearTouchCalibrationResultCode: ${displayId}`);
        document.getElementById('result-container').value = `ClearTouchCalibrationResultCode: ${displayId}`;
    });
});

// 调整显示器的当前过扫描边衬区。通常，这应该会使显示沿某个轴移动（例如，左侧和右侧具有相同的值），或者沿某个轴缩放（例如，顶部和底部具有相反的值）。自开始以来，每次 Adjust 调用都会累积之前调用的结果。
document.getElementById('overscanCalibrationAdjust-btn').addEventListener('click', function () {
    console.log("调整显示器的当前过扫描边衬区");
    const displayId = document.getElementById('display-id-input').value;
    if (!displayId) {
        alert('请输入显示设备ID');
        return;
    }
    let insets = {
        bottom: 10, // 与底部边界的 y 轴距离。
        left: 0, // 与左边界的 x 轴距离。
        right: 0, // 与右边界的 x 轴距离。
        top: 0, // 与顶部边界的 y 轴距离。
    };
    chrome.system.display.overscanCalibrationAdjust(displayId, insets,() => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`OverscanCalibrationAdjustResultCode: ${displayId}`, insets);
        document.getElementById('result-container').value = `OverscanCalibrationAdjustResultCode: ${displayId} ${insets}`;
    });
});

// 通过保存当前值并隐藏叠加层，完成显示屏的过扫描调整
document.getElementById('overscanCalibrationComplete-btn').addEventListener('click', function () {
    console.log("保存显示屏的过扫描调整");
    const displayId = document.getElementById('display-id-input').value;
    if (!displayId) {
        alert('请输入显示设备ID');
        return;
    }
    chrome.system.display.overscanCalibrationComplete(displayId, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`overscanCalibrationComplete: ${displayId}`);
        document.getElementById('result-container').value = `overscanCalibrationComplete: ${displayId}`;
    });
});

// 将显示屏的过扫描边衬区重置为上次保存的值（即在调用 Start 之前的值）。
document.getElementById('overscanCalibrationReset-btn').addEventListener('click', function () {
    console.log("将显示屏的过扫描边衬区重置为上次保存的值（即在调用 Start 之前的值）");
    const displayId = document.getElementById('display-id-input').value;
    if (!displayId) {
        alert('请输入显示设备ID');
        return;
    }
    chrome.system.display.overscanCalibrationReset(displayId, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`overscanCalibrationReset: ${displayId}`);
        document.getElementById('result-container').value = `overscanCalibrationReset: ${displayId}`;
    });
});

// 为显示屏启动过扫描校准。这会在屏幕上显示一个叠加层，指示当前过扫描边衬区。如果显示屏 id 的过扫描校准正在进行，此方法将重置校准。
document.getElementById('overscanCalibrationStart-btn').addEventListener('click', function () {
    console.log("为显示屏启动过扫描校准");
    const displayId = document.getElementById('display-id-input').value;
    if (!displayId) {
        alert('请输入显示设备ID');
        return;
    }
    chrome.system.display.overscanCalibrationStart(displayId, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`overscanCalibrationStart: ${displayId}`);
        document.getElementById('result-container').value = `overscanCalibrationStart: ${displayId}`;
    });
});

// 显示以 id 为显示屏 ID 的显示屏的原生触控校准用户体验。屏幕上会显示一个叠加层，其中包含有关如何继续操作的必要说明。只有在校准成功时才会调用回调。如果校准失败，则会抛出错误。
document.getElementById('showNativeTouchCalibration-btn').addEventListener('click', function () {
    console.log("显示以 id 为显示屏 ID 的显示屏的原生触控校准用户体验");
    const displayId = document.getElementById('display-id-input').value;
    if (!displayId) {
        alert('请输入显示设备ID');
        return;
    }
    chrome.system.display.showNativeTouchCalibration(displayId, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`showNativeTouchCalibration: ${displayId}`);
        document.getElementById('result-container').value = `showNativeTouchCalibration: ${displayId}`;
    });
});

// 为显示屏启动自定义触控校准。当使用自定义用户体验来收集校准数据时，应调用此方法。如果已在进行其他触控校准，则会抛出错误。
document.getElementById('startCustomTouchCalibration-btn').addEventListener('click', function () {
    console.log("为显示屏启动自定义触控校准");
    const displayId = document.getElementById('display-id-input').value;
    if (!displayId) {
        alert('请输入显示设备ID');
        return;
    }
    chrome.system.display.startCustomTouchCalibration(displayId, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        console.log(`startCustomTouchCalibration: ${displayId}`);
        document.getElementById('result-container').value = `startCustomTouchCalibration: ${displayId}`;
    });
});
