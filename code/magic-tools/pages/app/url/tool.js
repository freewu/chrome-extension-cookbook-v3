/**
 * URL 编解码
 * 目录：pages/app/url/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { mountTool } from "../shared/page.js";

// ---------- URL ----------
const urlTool = {
    id: "url",
    name: "URL 编解码",
    category: "codec",
    desc: "encodeURIComponent / decodeURIComponent",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "component", label: "仅编码 URI 组件（否则保留 :/?#[]@ 等）", type: "checkbox", default: true },
        { name: "input", label: "输入", type: "textarea", default: "https://example.com/?q=中文&a=1" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return v.component ? encodeURIComponent(v.input) : encodeURI(v.input);
        }
        try {
            return v.component ? decodeURIComponent(v.input) : decodeURI(v.input);
        } catch {
            return decodeURI(v.input);
        }
    },
};

export default urlTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(urlTool);
