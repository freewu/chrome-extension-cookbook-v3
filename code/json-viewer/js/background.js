/**
 * ============================================================================
 * JSON Viewer —— 后台服务线程（js/background.js）
 * ============================================================================
 *
 * MV3 的 service worker 保持极简，只做一件事：
 *
 *   点击工具栏图标 → 给当前标签页里的内容脚本发一条 JV_TOGGLE_VIEW 消息，
 *   让页面在「格式化视图」和「原始视图」之间切换。
 *
 * 为什么不在 popup 里做？
 *   JSON 页面格式化是「所见即所得」的操作，点图标马上切换最顺手，
 *   也省掉一个弹窗界面。
 * ============================================================================
 */

/** 图标角标的默认颜色 */
const BADGE_COLOR = "#d93025";

/**
 * 点击工具栏图标时的处理。
 * @param {chrome.tabs.Tab} tab 当前激活的标签页
 */
async function onActionClicked(tab) {
    // 没有 tab.id（例如点了非标签页区域）时直接忽略
    if (!tab || typeof tab.id !== "number") {
        return;
    }

    try {
        // 消息由内容脚本接收，返回 { ok, action } 之类的回执
        const response = await chrome.tabs.sendMessage(tab.id, { type: "JV_TOGGLE_VIEW" });
        if (!response || !response.ok) {
            // 页面里没有内容脚本 / 不是 JSON 页面：给一个短暂的角标提示
            await flashBadge(tab.id, "✕");
        }
    } catch (err) {
        // sendMessage 抛错一般意味着「该标签页没有内容脚本」：
        //   - 当前页面不是 http/https（chrome://、扩展页等）
        //   - 扩展刚安装 / 刚重载，旧标签页还没注入脚本
        await flashBadge(tab.id, "✕");
    }
}

/**
 * 在扩展图标上闪一下角标，1.5 秒后自动清除。
 * 用来告诉用户「这个页面不是 JSON 页面，没东西可切换」。
 * @param {number} tabId
 * @param {string} text
 */
async function flashBadge(tabId, text) {
    try {
        await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
        await chrome.action.setBadgeText({ tabId, text });
        await chrome.action.setTitle({ tabId, title: "当前页面不是 JSON 页面" });
        setTimeout(async () => {
            try {
                await chrome.action.setBadgeText({ tabId, text: "" });
                await chrome.action.setTitle({ tabId, title: "JSON Viewer：切换 格式化 / 原始 视图" });
            } catch (err) {
                /* 标签页可能已经关闭，忽略 */
            }
        }, 1500);
    } catch (err) {
        /* 忽略 */
    }
}

// 注册图标点击事件（MV3 的 service worker 每次唤醒都会重新执行本文件，
// 所以监听器写在顶层即可，Chrome 会自动去重）
chrome.action.onClicked.addListener(onActionClicked);
