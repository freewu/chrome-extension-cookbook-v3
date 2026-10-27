// LeetCode 助手 - 本地缓存（localStorage）
//
// 设计：
//   · 每道题一条完整记录：lc_helper:problem:<origin>|<slug> -> JSON
//   · 一份轻量索引：lc_helper:index -> [{ key, title, difficulty, ... }]
//     索引只放列表需要的字段，渲染「历史题目」时不必解析体积很大的题目内容。
//   · 超出条数 / 空间不足时，按「最近访问时间」淘汰最旧的记录。

const INDEX_KEY = "lc_helper:index";
const RECORD_PREFIX = "lc_helper:problem:";
const MAX_ENTRIES = 30;

// 缓存键：同一道题在 leetcode.cn 与 leetcode.com 上是两份数据（中英文不同）
export function problemKey(target) {
    return `${target.origin}|${target.slug}`;
}

function parseJSON(raw, fallback) {
    if (!raw) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}

// 轻量索引，按最近访问时间倒序
export function readIndex() {
    const list = parseJSON(localStorage.getItem(INDEX_KEY), []);
    if (!Array.isArray(list)) {
        return [];
    }
    return list.filter((item) => item && item.key).sort((a, b) => (b.visitedAt || 0) - (a.visitedAt || 0));
}

function writeIndex(list) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}

function removeRecord(key) {
    try {
        localStorage.removeItem(RECORD_PREFIX + key);
    } catch (error) {
        // ignore
    }
}

export function getCached(key) {
    return parseJSON(localStorage.getItem(RECORD_PREFIX + key), null);
}

export function removeCached(key) {
    removeRecord(key);
    writeIndex(readIndex().filter((item) => item.key !== key));
}

export function clearAll() {
    for (const item of readIndex()) {
        removeRecord(item.key);
    }
    writeIndex([]);
}

// 命中缓存时刷新「最近访问时间」，让历史列表按最近使用排序
export function touchMeta(key) {
    const index = readIndex();
    const meta = index.find((item) => item.key === key);
    if (!meta) {
        return null;
    }
    meta.visitedAt = Date.now();
    writeIndex([meta, ...index.filter((item) => item.key !== key)]);
    return meta;
}

function toMeta(key, data) {
    return {
        key,
        slug: data.slug || "",
        url: data.url || "",
        origin: data.origin || "",
        contest: data.contest || "",
        frontendId: data.frontendId || "",
        title: data.title || "",
        translatedTitle: data.translatedTitle || "",
        difficulty: data.difficulty || "",
        // 列表里只展示前几个标签，完整标签仍在记录里
        tags: Array.isArray(data.tags) ? data.tags.slice(0, 4) : [],
        visitedAt: Date.now()
    };
}

// 写入缓存：先写记录再写索引；遇到 QuotaExceededError 就淘汰最旧记录重试。
// 返回写入的 meta；彻底失败（如空间实在不够）返回 null，不影响主流程。
export function saveProblem(key, data) {
    const record = { ...data, cachedAt: Date.now() };
    const meta = toMeta(key, record);
    const others = readIndex().filter((item) => item.key !== key);

    for (let attempt = 0; attempt <= others.length; attempt++) {
        try {
            localStorage.setItem(RECORD_PREFIX + key, JSON.stringify(record));

            const kept = others.slice(0, MAX_ENTRIES - 1);
            writeIndex([meta, ...kept]);

            // 超额的旧记录不再被索引引用，顺手清掉
            for (const extra of others.slice(MAX_ENTRIES - 1)) {
                removeRecord(extra.key);
            }
            return meta;
        } catch (error) {
            const evicted = others.pop();
            if (!evicted) {
                removeRecord(key);
                return null;
            }
            removeRecord(evicted.key);
        }
    }

    removeRecord(key);
    return null;
}
