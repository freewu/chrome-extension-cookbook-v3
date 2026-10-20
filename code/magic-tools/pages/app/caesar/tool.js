/**
 * 凯撒加解密
 * 目录：pages/app/caesar/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

// ============================================================
// 古典密码
// ============================================================
const caesarTool = {
    id: "caesar",
    name: "凯撒加解密",
    category: "crypto",
    desc: "移位替换密码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "shift", label: "位移", type: "number", default: 3 },
        { name: "input", label: "输入", type: "textarea", default: "Hello World" },
    ],
    run(v) {
        let s = ((parseInt(v.shift, 10) % 26) + 26) % 26;
        if (v.mode === "decrypt") s = (26 - s) % 26;
        return v.input.replace(/[a-zA-Z]/g, (ch) => {
            const base = ch <= "Z" ? 65 : 97;
            return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
        });
    },
};

export default caesarTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(caesarTool);
