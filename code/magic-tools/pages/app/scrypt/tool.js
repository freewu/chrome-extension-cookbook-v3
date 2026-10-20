/**
 * Scrypt
 * 目录：pages/app/scrypt/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { utf8ToBytes, bytesToHex } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// Scrypt
// ============================================================
const scryptTool = {
    id: "scrypt",
    name: "Scrypt",
    category: "value-calc",
    desc: "scrypt KDF",
    fields: [
        { name: "password", label: "口令", type: "text", default: "password" },
        { name: "salt", label: "Salt", type: "text", default: "salt" },
        { name: "n", label: "N (CPU/内存代价)", type: "number", default: 16384 },
        { name: "r", label: "r (块大小)", type: "number", default: 8 },
        { name: "p", label: "p (并行度)", type: "number", default: 1 },
        { name: "dkLen", label: "输出字节数", type: "number", default: 32 },
    ],
    async run(v) {
        const lib = window.scrypt;
        if (!lib) throw new Error("scrypt 库未加载");
        const bytes = await lib.scrypt(
            utf8ToBytes(v.password), utf8ToBytes(v.salt),
            parseInt(v.n, 10), parseInt(v.r, 10), parseInt(v.p, 10), parseInt(v.dkLen, 10)
        );
        return bytesToHex(bytes);
    },
};

export default scryptTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(scryptTool);
