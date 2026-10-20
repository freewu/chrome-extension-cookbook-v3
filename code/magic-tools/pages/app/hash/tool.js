/**
 * Hash 值计算
 * 目录：pages/app/hash/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { utf8ToBytes } from "../shared/utils.js";
import { C, wa } from "../shared/valuecalc-common.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// Hash 值计算
// ============================================================
const HASH_FUNCS = {
    MD5: (s) => C.MD5(s),
    SHA1: (s) => C.SHA1(s),
    SHA224: (s) => C.SHA224(s),
    SHA256: (s) => C.SHA256(s),
    SHA384: (s) => C.SHA384(s),
    SHA512: (s) => C.SHA512(s),
    RIPEMD160: (s) => C.RIPEMD160(s),
};

const hashTool = {
    id: "hash",
    name: "Hash 值计算",
    category: "value-calc",
    desc: "MD5 / SHA-1 / SHA-2 / RIPEMD160 摘要",
    fields: [
        {
            name: "algorithm", label: "算法", type: "select",
            options: Object.keys(HASH_FUNCS), default: "MD5",
        },
        { name: "format", label: "输出格式", type: "select", options: [["hex", "Hex"], ["base64", "Base64"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const hasher = HASH_FUNCS[v.algorithm];
        const digest = hasher(wa(utf8ToBytes(v.input)));
        return v.format === "base64" ? digest.toString(C.enc.Base64) : digest.toString(C.enc.Hex);
    },
};

export default hashTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(hashTool);
