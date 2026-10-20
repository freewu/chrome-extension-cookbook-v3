/**
 * 维吉尼亚加解密
 * 目录：pages/app/vigenere/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

const vigenereTool = {
    id: "vigenere",
    name: "维吉尼亚加解密",
    category: "crypto",
    desc: "多表替换密码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "key", label: "密钥(字母)", type: "text", default: "KEY" },
        { name: "input", label: "输入", type: "textarea", default: "Hello World" },
    ],
    run(v) {
        const key = v.key.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (!key) throw new Error("密钥不能为空");
        let ki = 0;
        return v.input.replace(/[a-zA-Z]/g, (ch) => {
            const base = ch <= "Z" ? 65 : 97;
            const shift = key.charCodeAt(ki % key.length) - 65;
            ki++;
            const delta = v.mode === "encrypt" ? shift : -shift;
            return String.fromCharCode(((ch.charCodeAt(0) - base + delta + 26) % 26) + base);
        });
    },
};

export default vigenereTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(vigenereTool);
