/**
 * UUencode 编解码
 * 目录：pages/app/uuencode/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { utf8ToBytes, bytesToUtf8 } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ---------- UUencode ----------
function uuencode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 45) {
        const chunk = bytes.slice(i, i + 45);
        out += String.fromCharCode(chunk.length + 32);
        for (let j = 0; j < chunk.length; j += 3) {
            const b0 = chunk[j], b1 = chunk[j + 1] ?? 0, b2 = chunk[j + 2] ?? 0;
            const c = [b0 >> 2, ((b0 & 3) << 4) | (b1 >> 4), ((b1 & 15) << 2) | (b2 >> 6), b2 & 63];
            for (const x of c) out += x === 0 ? "`" : String.fromCharCode(x + 32);
        }
        out += "\n";
    }
    out += "`\n";
    return out;
}

function uudecode(text) {
    const lines = text.split(/\r?\n/);
    const out = [];
    for (const line of lines) {
        if (!line || line === "`") continue;
        if (line.startsWith("begin") || line.startsWith("end")) continue;
        const len = line.charCodeAt(0) - 32;
        const data = line.slice(1);
        let count = 0;
        for (let j = 0; j + 3 < data.length; j += 4) {
            const c = [0, 1, 2, 3].map((k) => data.charCodeAt(j + k) - 32);
            const bytes = [
                (c[0] << 2) | (c[1] >> 4),
                ((c[1] & 15) << 4) | (c[2] >> 2),
                ((c[2] & 3) << 6) | c[3],
            ];
            for (const b of bytes) {
                if (count < len) {
                    out.push(b & 0xff);
                    count++;
                }
            }
        }
    }
    return new Uint8Array(out);
}

const uuencodeTool = {
    id: "uuencode",
    name: "UUencode 编解码",
    category: "codec",
    desc: "Unix-to-Unix 编码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "Hello UUencode" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return "begin 644 data.txt\n" + uuencode(utf8ToBytes(v.input));
        }
        return bytesToUtf8(uudecode(v.input));
    },
};

export default uuencodeTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(uuencodeTool);
