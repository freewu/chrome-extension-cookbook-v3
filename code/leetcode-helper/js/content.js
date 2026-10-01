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

    function getSlug() {
        const match = location.pathname.match(/\/problems\/([^/]+)/);
        return match ? match[1] : "";
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
                    const alt = child.getAttribute("alt");
                    if (alt) {
                        out += alt;
                    }
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

    // ---------------- 来源 1：GraphQL ----------------

    async function fetchByGraphQL(slug) {
        const query = `query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionFrontendId
                title
                translatedTitle
                difficulty
                content
                translatedContent
                codeSnippets { lang langSlug code }
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
            contentHtml: contentEl ? contentEl.innerHTML : ""
        };
    }

    // ---------------- 汇总 ----------------

    async function collect() {
        const slug = getSlug();
        if (!slug) {
            return { ok: false, error: "当前页面不是 LeetCode 题目页" };
        }

        const errors = [];
        let question = null;

        try {
            question = await fetchByGraphQL(slug);
        } catch (error) {
            errors.push(`GraphQL 失败：${error.message}`);
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

        const preferZh = location.hostname.endsWith("leetcode.cn");
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
                url: location.href,
                frontendId,
                title,
                translatedTitle,
                difficulty,
                language: preferZh ? "zh" : "en",
                contentHtml,
                contentText: htmlToText(contentHtml),
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
