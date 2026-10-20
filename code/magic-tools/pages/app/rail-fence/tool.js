/**
 * 栅栏加解密
 * 目录：pages/app/rail-fence/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

const railFenceTool = {
    id: "rail-fence",
    name: "栅栏加解密",
    category: "crypto",
    desc: "栅栏（W 型）换位密码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "rails", label: "栏数", type: "number", default: 3 },
        { name: "input", label: "输入", type: "textarea", default: "Hello World" },
    ],
    run(v) {
        const rails = Math.max(2, parseInt(v.rails, 10));
        const text = v.input;
        if (v.mode === "encrypt") {
            const rows = Array.from({ length: rails }, () => []);
            let rail = 0, dir = 1;
            for (const ch of text) {
                rows[rail].push(ch);
                if (rail === 0) dir = 1;
                else if (rail === rails - 1) dir = -1;
                rail += dir;
            }
            return rows.map((r) => r.join("")).join("");
        }
        const len = text.length;
        const pattern = [];
        let rail = 0, dir = 1;
        for (let i = 0; i < len; i++) {
            pattern.push(rail);
            if (rail === 0) dir = 1;
            else if (rail === rails - 1) dir = -1;
            rail += dir;
        }
        const counts = Array(rails).fill(0);
        pattern.forEach((r) => counts[r]++);
        const rows = [];
        let idx = 0;
        for (let r = 0; r < rails; r++) {
            rows.push(text.slice(idx, idx + counts[r]).split(""));
            idx += counts[r];
        }
        const pos = Array(rails).fill(0);
        let out = "";
        for (const r of pattern) out += rows[r][pos[r]++];
        return out;
    },
};

export default railFenceTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(railFenceTool);
