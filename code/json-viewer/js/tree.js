/**
 * ============================================================================
 * JSON Viewer —— 树形渲染核心（js/tree.js）
 * ============================================================================
 *
 * 这个文件只干一件事：把 `JSON.parse()` 之后得到的 JS 值，渲染成一棵
 * 「可以逐层折叠 / 展开」的 DOM 树，并给出几个操作这棵树的小方法。
 *
 * 它不关心：
 *   - 页面是不是 JSON（那是 content.js 的活）；
 *   - 工具栏、搜索框、主题切换（也是 content.js 的活）。
 *
 * 为什么拆成独立文件：
 *   1. 渲染逻辑和页面交互逻辑解耦，读代码时互不干扰；
 *   2. 内容脚本之间共享**同一个「隔离世界」的全局变量**，
 *      所以这里把 JsonTree 挂到 window 上，content.js 直接拿来用即可
 *      （MV3 的 content_scripts 不支持 ES Module，无法用 import）。
 *
 * 对外 API：
 *   const tree = JsonTree.create(data, { expandDepth: 3 });
 *   container.appendChild(tree.root);   // 拿到渲染结果（一棵 DOM 树）
 *   tree.expandAll();                   // 全部展开
 *   tree.collapseAll();                 // 全部折叠
 *   tree.expandTo(depth);               // 只展开到第 N 层
 *   tree.setIndent(2 | 4 | "tab");       // 每层缩进宽度
 *   tree.expandAncestors(el);           // 展开 el 所在节点的所有父级（搜索定位用）
 *   tree.nodeCount;                     // 树里一共有多少个 JSON 节点
 *
 * 渲染出来的 DOM 结构（以 { "a": [1, 2] } 为例）：
 *
 *   div.jv-tree
 *   └── div.jv-node                      ← 一个「节点」= 头部行 + 子节点容器 + 结束行
 *       ├── div.jv-row                   ← 头部行：▾ "a": [ 2 项
 *       │   ├── span.jv-toggle           ← 折叠箭头（点它折叠/展开）
 *       │   ├── span.jv-key              ← 键名
 *       │   ├── span.jv-punc             ← 冒号
 *       │   ├── span.jv-bracket          ← 左括号 [
 *       │   ├── span.jv-meta             ← 展开时显示的「2 项」
 *       │   ├── span.jv-summary          ← 折叠时显示的「[…] 2 项」
 *       │   └── span.jv-punc.jv-comma--collapsed  ← 折叠时才露出的逗号
 *       ├── div.jv-children              ← 子节点容器（缩进就靠它的 padding-left）
 *       │   ├── div.jv-node ...
 *       │   └── div.jv-node ...
 *       └── div.jv-row.jv-row--close     ← 结束行：]（折叠时整行隐藏）
 *
 * 「折叠 / 展开」完全靠 CSS 类切换实现（.jv-node.is-collapsed），
 * 所有节点一次渲染完成，所以展开全部 / 折叠全部只是改 class，速度很快。
 * ============================================================================
 */

(function (global) {
    "use strict";

    /** 展开状态下的箭头 */
    const ARROW_EXPANDED = "▾";
    /** 折叠状态下的箭头 */
    const ARROW_COLLAPSED = "▸";

    /**
     * 单个字符串值的最大展示长度。
     * 超长字符串（比如 base64 图片、整段 HTML）会先截断显示，点击后再展开，
     * 避免一次性往 DOM 里塞几十万个字符导致卡顿。
     */
    const MAX_STRING_LENGTH = 2000;

    // ========================================================================
    // 一、通用小工具
    // ========================================================================

    /**
     * 创建元素的小帮手。
     * @param {string} tag        标签名，例如 "div" / "span"
     * @param {string} [className] CSS 类名（全部以 jv- 开头，避免污染页面样式）
     * @param {string} [text]      文本内容
     * @returns {HTMLElement}
     */
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined) {
            // 统一用 textContent 而不是 innerHTML：JSON 里的内容是不可信的，
            // 绝不能当成 HTML 解析（XSS 风险）。
            node.textContent = text;
        }
        return node;
    }

    /**
     * 判断值的 JSON 类型。
     * JSON 只有 6 种类型：object / array / string / number / boolean / null，
     * 这里按渲染需要归并成这 6 类。
     * @param {*} value
     * @returns {"object"|"array"|"string"|"number"|"boolean"|"null"}
     */
    function typeOf(value) {
        if (value === null) {
            return "null";
        }
        if (Array.isArray(value)) {
            return "array";
        }
        return typeof value; // "object" / "string" / "number" / "boolean"
    }

    /** 容器（对象 / 数组）里的条目数量 */
    function sizeOf(value) {
        return Array.isArray(value) ? value.length : Object.keys(value).length;
    }

    /** 是否是需要折叠箭头的「非空容器」 */
    function isCollapsible(value) {
        const type = typeOf(value);
        return (type === "object" || type === "array") && sizeOf(value) > 0;
    }

    /**
     * 折叠状态下显示在括号后面的摘要。
     * 例如：`[…] 5 项`、`{…} 3 个键`——一眼就能看出里面装了多少东西。
     */
    function summaryOf(value) {
        return Array.isArray(value) ? `[…] ${value.length} 项` : `{…} ${Object.keys(value).length} 个键`;
    }

    /** 展开状态下显示在左括号后面的计数说明，例如 `5 项` / `3 个键` */
    function metaOf(value) {
        return Array.isArray(value) ? `${value.length} 项` : `${Object.keys(value).length} 个键`;
    }

    /**
     * 递归统计整份数据一共有多少个节点（对象、数组、基础值都算 1 个）。
     * 用来在工具栏上显示「共 N 个节点」，也方便判断数据规模。
     */
    function countNodes(value) {
        const type = typeOf(value);
        if (type !== "object" && type !== "array") {
            return 1;
        }
        let total = 1; // 容器自身算 1 个
        if (type === "array") {
            for (let i = 0; i < value.length; i += 1) {
                total += countNodes(value[i]);
            }
        } else {
            const keys = Object.keys(value);
            for (let i = 0; i < keys.length; i += 1) {
                total += countNodes(value[keys[i]]);
            }
        }
        return total;
    }

    // ========================================================================
    // 二、折叠 / 展开
    // ========================================================================

    /**
     * 设置某个节点的折叠状态。
     * 只做两件事：切 class（CSS 负责隐藏子节点）、换箭头方向。
     * @param {HTMLElement} nodeEl    .jv-node 元素
     * @param {boolean} collapsed     true = 折叠
     */
    function setCollapsed(nodeEl, collapsed) {
        if (!nodeEl.classList.contains("jv-collapsible")) {
            return; // 基础值 / 空容器没有可折叠的内容
        }
        nodeEl.classList.toggle("is-collapsed", collapsed);

        const arrow = nodeEl.firstElementChild.querySelector(".jv-toggle");
        if (arrow) {
            arrow.textContent = collapsed ? ARROW_COLLAPSED : ARROW_EXPANDED;
            arrow.setAttribute("aria-expanded", String(!collapsed));
        }
    }

    /** 切换某个节点的折叠状态 */
    function toggleCollapsed(nodeEl) {
        setCollapsed(nodeEl, !nodeEl.classList.contains("is-collapsed"));
    }

    // ========================================================================
    // 三、基础值渲染
    // ========================================================================

    /**
     * 渲染一个「基础值」（字符串 / 数字 / 布尔 / null）。
     * 不同类型挂不同的 class，由 CSS 决定颜色，实现语法高亮。
     * @param {*} value
     * @returns {HTMLElement}
     */
    function renderPrimitive(value) {
        const type = typeOf(value);

        if (type === "string") {
            // JSON.stringify 会顺便处理引号与转义，保证显示的就是合法 JSON 片段
            const full = JSON.stringify(value);
            const span = el("span", "jv-value jv-string");

            if (full.length <= MAX_STRING_LENGTH) {
                span.textContent = full;
                return span;
            }

            // —— 超长字符串：先截断，点击展开 ——
            const short = full.slice(0, MAX_STRING_LENGTH) + '…"';
            let expanded = false;
            span.classList.add("jv-string--cut");
            span.textContent = short;
            span.title = `字符串共 ${full.length} 个字符，点击展开 / 收起`;
            span.addEventListener("click", () => {
                expanded = !expanded;
                span.textContent = expanded ? full : short;
            });
            return span;
        }

        if (type === "number") {
            return el("span", "jv-value jv-number", String(value));
        }
        if (type === "boolean") {
            return el("span", "jv-value jv-boolean", String(value));
        }
        // 剩下的只有 null
        return el("span", "jv-value jv-null", "null");
    }

    // ========================================================================
    // 四、递归渲染节点
    // ========================================================================

    /**
     * 创建一个节点（可折叠容器 / 基础值都走这里）。
     *
     * @param {*} value        该节点的值
     * @param {string|undefined} key      键名；根节点和数组元素传 undefined
     * @param {number} depth   当前深度（根节点是 0），用于决定默认是否展开
     * @param {object} ctx     渲染上下文 { expandDepth, nodeCount }
     * @param {boolean} isLast 是否是父容器里的最后一项，决定末尾要不要画逗号
     * @returns {HTMLElement}  .jv-node 元素
     */
    function createNode(value, key, depth, ctx, isLast) {
        const type = typeOf(value);
        const container = type === "object" || type === "array";

        const nodeEl = el("div", "jv-node");
        nodeEl.dataset.type = type;
        nodeEl.dataset.depth = String(depth);

        // ---------------- 头部行 ----------------
        const row = el("div", "jv-row");
        nodeEl.appendChild(row);

        // 1) 折叠箭头（先占位：基础值 / 空容器不需要箭头，文本留空）
        const toggle = el("span", "jv-toggle jv-toggle--empty");
        row.appendChild(toggle);

        // 2) 键名（根节点没有键名）
        if (key !== undefined) {
            row.appendChild(el("span", "jv-key", JSON.stringify(key)));
            row.appendChild(el("span", "jv-punc", ":"));
        }

        // ---------------- 基础值：一行直接渲染完 ----------------
        if (!container) {
            ctx.nodeCount += 1;
            row.appendChild(renderPrimitive(value));
            // 不是最后一项时补一个逗号，让视图看起来和真实 JSON 一样
            if (!isLast) {
                row.appendChild(el("span", "jv-punc", ","));
            }
            return nodeEl;
        }

        // ---------------- 容器（对象 / 数组） ----------------
        ctx.nodeCount += 1;
        const isEmpty = sizeOf(value) === 0;
        const openBracket = type === "array" ? "[" : "{";
        const closeBracket = type === "array" ? "]" : "}";

        row.appendChild(el("span", "jv-bracket", openBracket));

        // 空容器：{} / [] 一行搞定，没有箭头、没有子节点
        if (isEmpty) {
            row.appendChild(el("span", "jv-punc", closeBracket));
            row.appendChild(el("span", "jv-meta", type === "array" ? " 空数组" : " 空对象"));
            if (!isLast) {
                row.appendChild(el("span", "jv-punc", ","));
            }
            return nodeEl;
        }

        // 非空容器：给箭头「解禁」，并挂上点击折叠事件
        toggle.classList.remove("jv-toggle--empty");
        toggle.textContent = ARROW_EXPANDED;
        toggle.setAttribute("role", "button");
        toggle.setAttribute("tabindex", "0");
        nodeEl.classList.add("jv-collapsible");
        toggle.addEventListener("click", (event) => {
            // 阻止冒泡：有些页面在 document 上监听点击事件，别让它们误会
            event.stopPropagation();
            toggleCollapsed(nodeEl);
        });
        toggle.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleCollapsed(nodeEl);
            }
        });

        // 展开时显示的计数说明，例如「3 个键」
        row.appendChild(el("span", "jv-meta", metaOf(value)));

        // 折叠时显示的摘要，例如「{…} 3 个键」，点击摘要也能展开
        const summary = el("span", "jv-summary", summaryOf(value));
        summary.addEventListener("click", (event) => {
            event.stopPropagation();
            setCollapsed(nodeEl, false);
        });
        row.appendChild(summary);

        // 折叠时露出的逗号（展开时由 CSS 隐藏，逗号改画在结束行上）
        if (!isLast) {
            row.appendChild(el("span", "jv-punc jv-comma jv-comma--collapsed", ","));
        }

        // ---------------- 子节点 ----------------
        const children = el("div", "jv-children");
        if (type === "array") {
            for (let i = 0; i < value.length; i += 1) {
                children.appendChild(createNode(value[i], undefined, depth + 1, ctx, i === value.length - 1));
            }
        } else {
            const keys = Object.keys(value);
            keys.forEach((childKey, index) => {
                children.appendChild(createNode(value[childKey], childKey, depth + 1, ctx, index === keys.length - 1));
            });
        }
        nodeEl.appendChild(children);

        // ---------------- 结束行 ----------------
        const closeRow = el("div", "jv-row jv-row--close");
        closeRow.appendChild(el("span", "jv-toggle jv-toggle--empty"));
        closeRow.appendChild(el("span", "jv-bracket", closeBracket));
        if (!isLast) {
            closeRow.appendChild(el("span", "jv-punc jv-comma", ","));
        }
        nodeEl.appendChild(closeRow);

        // ---------------- 默认折叠状态 ----------------
        // 深度小于 expandDepth 的层次默认展开，更深的默认折叠，
        // 这样既能看到整体结构，又不会被超大 JSON 淹没。
        setCollapsed(nodeEl, depth >= ctx.expandDepth);

        return nodeEl;
    }

    // ========================================================================
    // 五、对外 API
    // ========================================================================

    /**
     * 渲染一份 JSON 数据。
     *
     * @param {*} data       JSON.parse 之后的值
     * @param {object} [options]
     * @param {number} [options.expandDepth=3] 默认展开到第几层
     * @returns {{
     *   root: HTMLElement,
     *   nodeCount: number,
     *   expandAll: Function,
     *   collapseAll: Function,
     *   expandTo: Function,
     *   setIndent: Function,
     *   expandAncestors: Function
     * }}
     */
    function create(data, options) {
        const opts = Object.assign({ expandDepth: 3 }, options || {});
        const ctx = { expandDepth: Math.max(0, opts.expandDepth), nodeCount: 0 };

        const root = el("div", "jv-tree");
        root.appendChild(createNode(data, undefined, 0, ctx, true));

        /** 取出所有可折叠节点 */
        function collapsibleNodes() {
            return root.querySelectorAll(".jv-node.jv-collapsible");
        }

        return {
            /** 渲染结果，直接 appendChild 到页面即可 */
            root: root,

            /** 节点总数（对象 + 数组 + 基础值） */
            nodeCount: ctx.nodeCount,

            /** 全部展开 */
            expandAll() {
                collapsibleNodes().forEach((nodeEl) => setCollapsed(nodeEl, false));
            },

            /** 全部折叠（只留下根节点的第一行） */
            collapseAll() {
                collapsibleNodes().forEach((nodeEl) => setCollapsed(nodeEl, true));
                // 根节点自己也要折叠，否则第一层子节点还是露着的
                const rootNode = root.firstElementChild;
                if (rootNode) {
                    setCollapsed(rootNode, true);
                }
            },

            /**
             * 只展开到第 depth 层（0 = 只显示根节点）。
             * 常用于「恢复默认视图」。
             */
            expandTo(depth) {
                collapsibleNodes().forEach((nodeEl) => {
                    const nodeDepth = Number(nodeEl.dataset.depth || 0);
                    setCollapsed(nodeEl, nodeDepth >= depth);
                });
            },

            /**
             * 设置每层缩进宽度。
             * 只改一个 CSS 变量，视觉上立刻生效，不用重新渲染。
             * @param {number|"tab"} indent 2 / 4 个空格，或 "tab"
             */
            setIndent(indent) {
                const width = indent === "tab" ? 24 : Math.max(1, Number(indent) || 2) * 8;
                root.style.setProperty("--jv-indent", `${width}px`);
            },

            /**
             * 展开某个元素的所有祖先节点。
             * 搜索命中项时用：命中项可能藏在折叠的容器里，
             * 先把它沿途的父节点全都展开，再滚动过去才看得见。
             * @param {HTMLElement} element 树内任意元素
             */
            expandAncestors(element) {
                let current = element;
                while (current && current !== root) {
                    if (current.classList && current.classList.contains("jv-node")) {
                        setCollapsed(current, false);
                    }
                    current = current.parentElement;
                }
            },
        };
    }

    // 挂到 window 上，供 content.js / 其它内容脚本使用
    global.JsonTree = { create, countNodes };
})(window);
