// LeetCode 助手 - 内容脚本（注入到 leetcode.cn / leetcode.com 的题目页）
// 职责：抓取当前题目的「标题 / 题目内容 / 各语言代码模板」，响应 popup 的请求。
//
// 数据来源优先级：
//   1. LeetCode 官方 GraphQL（最新、最全，同源请求，自动带 Cookie）
//   2. 页面内嵌的 __NEXT_DATA__（仅当 its slug 与当前 URL 一致时才用，避免 SPA 切换后拿到旧数据）
//   3. 直接读取 DOM（标题 / 内容一定是最新的，但没有代码模板）

(() => {
    // 防止 popup 手动注入时重复注册监听
    if (window.__LC_HELPER_READY__) {
        return;
    }
    window.__LC_HELPER_READY__ = true;

    // ---------------- 通用工具 ----------------

    // 解析当前页面所在的题目上下文，支持普通题目页与竞赛题目页：
    //   /problems/<slug>/                             -> 普通题目
    //   /contest/<contest>/problems/<slug>/           -> 竞赛题目（如 biweekly-contest-123）
    //   /contest/<contest>/problems                   -> 竞赛题目列表页（还没有具体题目）
    function getContext() {
        const pathname = location.pathname;

        const contestProblem = pathname.match(/^\/contest\/([^/]+)\/problems\/([^/]+)/);
        if (contestProblem) {
            return { slug: contestProblem[2], contest: contestProblem[1] };
        }

        const problem = pathname.match(/^\/problems\/([^/]+)/);
        if (problem) {
            return { slug: problem[1], contest: "" };
        }

        const contestList = pathname.match(/^\/contest\/([^/]+)\/problems\/?$/);
        if (contestList) {
            return { slug: "", contest: contestList[1] };
        }

        return { slug: "", contest: "" };
    }

    // 把题目内容 HTML 转成可读纯文本（保留代码块缩进与列表）
    function htmlToText(html) {
        const root = document.createElement("div");
        root.innerHTML = html || "";

        const BLOCK = /^(P|DIV|SECTION|ARTICLE|BLOCKQUOTE|H1|H2|H3|H4|H5|H6|TABLE|TR|HR|FIGURE|FIGCAPTION|UL|OL)$/;

        function walk(node, listCtx) {
            let out = "";
            for (const child of node.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    out += child.nodeValue.replace(/\s+/g, " ");
                    continue;
                }
                if (child.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }
                const tag = child.tagName;

                if (tag === "BR") {
                    out += "\n";
                    continue;
                }
                if (tag === "PRE") {
                    out += "\n" + (child.textContent || "").replace(/^\n+|\n+$/g, "") + "\n";
                    continue;
                }
                if (tag === "IMG") {
                    // 保留 <img> 标签：题目里的示意图 / 公式图片不能丢
                    out += child.outerHTML || "";
                    continue;
                }
                if (tag === "SUP") {
                    // 上标转成 Markdown/LaTeX 风格：10<sup>9</sup> -> 10^{9}
                    out += "^{" + walk(child, listCtx).trim() + "}";
                    continue;
                }
                if (tag === "SUB") {
                    // 下标同理：a<sub>i</sub> -> a_{i}
                    out += "_{" + walk(child, listCtx).trim() + "}";
                    continue;
                }
                if (tag === "LI") {
                    const marker = listCtx && listCtx.ordered ? `${listCtx.index++}. ` : "- ";
                    out += "\n" + marker + walk(child, listCtx).trim() + "\n";
                    continue;
                }
                if (tag === "UL" || tag === "OL") {
                    const ctx = { ordered: tag === "OL", index: 1 };
                    out += "\n" + walk(child, ctx) + "\n";
                    continue;
                }

                const isBlock = BLOCK.test(tag);
                if (isBlock) {
                    out += "\n";
                }
                out += walk(child, listCtx);
                if (isBlock) {
                    out += "\n";
                }
            }
            return out;
        }

        return walk(root, null)
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    // ---------------- 归一化：标签 / 提示 ----------------

    // topicTags 在不同来源里可能是 [{ name, slug, translatedName }] 或字符串数组
    function normalizeTags(raw, preferZh) {
        if (!Array.isArray(raw)) {
            return [];
        }
        const names = raw
            .map((tag) => {
                if (typeof tag === "string") {
                    return tag;
                }
                if (!tag) {
                    return "";
                }
                return preferZh
                    ? tag.translatedName || tag.name
                    : tag.name || tag.translatedName;
            })
            .map((name) => (name || "").trim())
            .filter(Boolean);

        return [...new Set(names)];
    }

    // hints 是 HTML 字符串数组（个别来源里是 JSON 字符串），统一转成纯文本
    function normalizeHints(raw) {
        let value = raw;
        if (typeof value === "string") {
            try {
                value = JSON.parse(value);
            } catch (error) {
                value = [value];
            }
        }
        if (!Array.isArray(value)) {
            return [];
        }
        return value
            .map((hint) => htmlToText(String(hint == null ? "" : hint)).trim())
            .filter(Boolean);
    }

    // ---------------- 来源 1：GraphQL ----------------

    // withExtras 为 false 时不查询 topicTags / hints：
    // 万一某个站点版本的 GraphQL schema 没有这些字段，整条查询会报错，
    // 此时降级重试，至少保住标题 / 内容 / 代码模板。
    async function fetchByGraphQL(slug, withExtras = true) {
        const extras = withExtras
            ? `
                topicTags { name slug translatedName }
                hints`
            : "";

        const query = `query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionFrontendId
                title
                translatedTitle
                difficulty
                content
                translatedContent
                codeSnippets { lang langSlug code }${extras}
            }
        }`;

        const csrf = (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1];

        const response = await fetch(`${location.origin}/graphql/`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {})
            },
            body: JSON.stringify({
                operationName: "questionData",
                query,
                variables: { titleSlug: slug }
            })
        });

        if (!response.ok) {
            throw new Error(`GraphQL HTTP ${response.status}`);
        }

        const json = await response.json();
        const question = json && json.data && json.data.question;
        if (!question) {
            throw new Error("GraphQL 未返回 question 数据");
        }
        return question;
    }

    // ---------------- 来源 2：__NEXT_DATA__ ----------------

    function findQuestion(node, slug) {
        const seen = new Set();
        const stack = [node];
        while (stack.length) {
            const current = stack.pop();
            if (!current || typeof current !== "object" || seen.has(current)) {
                continue;
            }
            seen.add(current);
            if (current.titleSlug === slug && Array.isArray(current.codeSnippets)) {
                return current;
            }
            for (const key of Object.keys(current)) {
                const value = current[key];
                if (value && typeof value === "object") {
                    stack.push(value);
                }
            }
        }
        return null;
    }

    function readNextDataQuestion(slug) {
        const el = document.getElementById("__NEXT_DATA__");
        if (!el || !el.textContent) {
            return null;
        }
        try {
            return findQuestion(JSON.parse(el.textContent), slug);
        } catch (error) {
            return null;
        }
    }

    // ---------------- 来源 3：DOM ----------------

    // 题目描述下方会把标签渲染成链接，作为 GraphQL / 内嵌数据都拿不到时的兜底
    function readTagsFromDom() {
        const nodes = document.querySelectorAll('a[href*="/tag"], a[href*="topicSlugs="]');
        const tags = [];
        const seen = new Set();
        for (const node of nodes) {
            // 路径里带 tag 的链接基本只有标签，再限制一下文本长度避免误抓
            const text = (node.textContent || "").replace(/\s+/g, " ").trim();
            if (!text || text.length > 40 || seen.has(text)) {
                continue;
            }
            seen.add(text);
            tags.push(text);
            if (tags.length >= 15) {
                break;
            }
        }
        return tags;
    }

    function readFromDom() {
        const titleEl =
            document.querySelector('[data-cy="question-title"]') ||
            document.querySelector("div.text-title-large a") ||
            document.querySelector("div.text-title-large") ||
            document.querySelector("h1");

        const contentEl =
            document.querySelector('[data-track-load="description_content"]') ||
            document.querySelector("div.elfjS") ||
            document.querySelector("#qd-content");

        let title = titleEl ? titleEl.textContent.trim() : "";
        let frontendId = "";

        const match = title.match(/^\s*(\d+)\s*[.、]\s*(.+)$/);
        if (match) {
            frontendId = match[1];
            title = match[2];
        }

        return {
            title,
            frontendId,
            contentHtml: contentEl ? contentEl.innerHTML : "",
            tags: readTagsFromDom()
        };
    }

    // ---------------- 汇总 ----------------

    async function collect() {
        const { slug, contest } = getContext();
        if (!slug) {
            if (contest) {
                return { ok: false, error: `当前是竞赛「${contest}」的题目列表页，请先点进具体题目` };
            }
            return { ok: false, error: "当前页面不是 LeetCode 题目页" };
        }

        const errors = [];
        const preferZh = location.hostname.endsWith("leetcode.cn");
        let question = null;

        try {
            question = await fetchByGraphQL(slug, true);
        } catch (error) {
            // 带标签 / 提示字段的查询失败时，降级成不含这两个字段的查询
            try {
                question = await fetchByGraphQL(slug, false);
                errors.push(`标签 / 提示不可用：${error.message}`);
            } catch (retryError) {
                errors.push(`GraphQL 失败：${retryError.message}`);
            }
        }

        if (!question) {
            question = readNextDataQuestion(slug);
            if (!question) {
                errors.push("页面内嵌数据不可用");
            }
        }

        const dom = readFromDom();

        const title = (question && question.title) || dom.title || "";
        const translatedTitle = (question && question.translatedTitle) || "";
        const frontendId = (question && question.questionFrontendId) || dom.frontendId || "";
        const difficulty = (question && question.difficulty) || "";
        const codeSnippets = (question && question.codeSnippets) || [];

        const graphTags = normalizeTags(question && question.topicTags, preferZh);
        const tags = graphTags.length ? graphTags : dom.tags || [];
        const hints = normalizeHints(question && question.hints);

        const contentHtml =
            (preferZh
                ? (question && question.translatedContent) || (question && question.content)
                : (question && question.content) || (question && question.translatedContent)) ||
            dom.contentHtml ||
            "";

        return {
            ok: true,
            data: {
                slug,
                contest,
                url: location.href,
                frontendId,
                title,
                translatedTitle,
                difficulty,
                language: preferZh ? "zh" : "en",
                contentHtml,
                contentText: htmlToText(contentHtml),
                tags,
                hints,
                codeSnippets,
                currentLangSlug: localStorage.getItem("global_lang") || "",
                errors
            }
        };
    }

    // ---------------- 消息入口 ----------------

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!message || message.type !== "LC_GET_PROBLEM") {
            return;
        }
        collect()
            .then(sendResponse)
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        // 返回 true 表示异步响应
        return true;
    });
})();
