/**
 * Cisco Type 7
 * 目录：pages/app/cisco-type7/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

const ciscoType7Tool = {
    id: "cisco-type7",
    name: "Cisco Type 7",
    category: "crypto",
    desc: "Cisco Type 7 口令（可逆混淆）",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "input", label: "输入", type: "textarea", default: "password" },
    ],
    run(v) {
        const KEY = "dsfd;kfoA,.iyewrkldJKDHSUB";
        if (v.mode === "encrypt") {
            const plain = v.input;
            const seed = Math.floor(Math.random() * 15) + 1;
            let out = String(seed).padStart(2, "0");
            for (let i = 0; i < plain.length; i++) {
                const x = plain.charCodeAt(i) ^ KEY.charCodeAt((seed + i) % KEY.length);
                out += x.toString(16).padStart(2, "0");
            }
            return out.toUpperCase();
        }
        const hex = v.input.replace(/\s+/g, "");
        const seed = parseInt(hex.slice(0, 2), 10);
        let out = "";
        for (let i = 2; i + 1 < hex.length; i += 2) {
            const x = parseInt(hex.slice(i, i + 2), 16) ^ KEY.charCodeAt((seed + (i - 2) / 2) % KEY.length);
            out += String.fromCharCode(x);
        }
        return out;
    },
};

export default ciscoType7Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(ciscoType7Tool);
