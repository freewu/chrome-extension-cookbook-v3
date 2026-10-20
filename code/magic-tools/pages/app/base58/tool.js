/**
 * Base58 编解码
 * 目录：pages/app/base58/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { utf8ToBytes, bytesToUtf8, bytesToBaseX, baseXToBytes } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

// ---------- Base58 ----------
const base58Tool = {
    id: "base58",
    name: "Base58 编解码",
    category: "codec",
    desc: "比特币字母表",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "Hello" },
    ],
    run(v) {
        if (v.mode === "encode") return bytesToBaseX(utf8ToBytes(v.input), BASE58);
        return bytesToUtf8(baseXToBytes(v.input.trim(), BASE58));
    },
};

export default base58Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(base58Tool);
