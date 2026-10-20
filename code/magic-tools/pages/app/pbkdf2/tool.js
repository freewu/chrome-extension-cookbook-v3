/**
 * PBKDF2 值计算
 * 目录：pages/app/pbkdf2/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { utf8ToBytes } from "../shared/utils.js";
import { C, wa } from "../shared/valuecalc-common.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// PBKDF2
// ============================================================
const pbkdf2Tool = {
    id: "pbkdf2",
    name: "PBKDF2 值计算",
    category: "value-calc",
    desc: "基于口令的密钥派生",
    fields: [
        { name: "hash", label: "Hash", type: "select", options: ["SHA1", "SHA256", "SHA512"], default: "SHA256" },
        { name: "password", label: "口令", type: "text", default: "password" },
        { name: "salt", label: "Salt", type: "text", default: "salt" },
        { name: "iterations", label: "迭代次数", type: "number", default: 10000 },
        { name: "bits", label: "输出位长", type: "number", default: 256 },
    ],
    run(v) {
        const hasher = { SHA1: C.algo.SHA1, SHA256: C.algo.SHA256, SHA512: C.algo.SHA512 }[v.hash];
        const bits = Math.max(8, parseInt(v.bits, 10) || 256);
        const derived = C.PBKDF2(wa(utf8ToBytes(v.password)), wa(utf8ToBytes(v.salt)), {
            keySize: bits / 32,
            iterations: Math.max(1, parseInt(v.iterations, 10) || 1),
            hasher,
        });
        return derived.toString(C.enc.Hex);
    },
};

export default pbkdf2Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(pbkdf2Tool);
