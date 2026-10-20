/**
 * CMAC 计算
 * 目录：pages/app/cmac/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { bytesToHex, hexToBytes, inputToBytes } from "../shared/utils.js";
import { C } from "../shared/valuecalc-common.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// CMAC (AES-128)
// ============================================================
const RB = 0x87;

function xorBlock(a, b) {
    const out = new Uint8Array(16);
    for (let i = 0; i < 16; i++) out[i] = a[i] ^ b[i];
    return out;
}

function leftShiftBlock(block) {
    const out = new Uint8Array(16);
    let carry = 0;
    for (let i = 15; i >= 0; i--) {
        out[i] = ((block[i] << 1) | carry) & 0xff;
        carry = (block[i] & 0x80) ? 1 : 0;
    }
    return { out, overflow: carry };
}

function aesEcbBlock(keyBytes, blockBytes) {
    const key = C.enc.Hex.parse(bytesToHex(keyBytes));
    const msg = C.enc.Hex.parse(bytesToHex(blockBytes));
    const encrypted = C.AES.encrypt(msg, key, {
        mode: C.mode.ECB,
        padding: C.pad.NoPadding,
    });
    return hexToBytes(encrypted.ciphertext.toString(C.enc.Hex));
}

function aesCmac(keyBytes, message) {
    if (![16, 24, 32].includes(keyBytes.length)) throw new Error("AES 密钥长度必须为 16/24/32 字节");
    const L = aesEcbBlock(keyBytes, new Uint8Array(16));
    const k1raw = leftShiftBlock(L);
    const K1 = k1raw.overflow ? (() => { const t = k1raw.out.slice(); t[15] ^= RB; return t; })() : k1raw.out;
    const k2raw = leftShiftBlock(K1);
    const K2 = k2raw.overflow ? (() => { const t = k2raw.out.slice(); t[15] ^= RB; return t; })() : k2raw.out;

    const n = Math.ceil(message.length / 16) || 1;
    const lastComplete = message.length > 0 && message.length % 16 === 0;
    let lastBlock = new Uint8Array(16);
    if (lastComplete) {
        lastBlock = xorBlock(message.slice((n - 1) * 16, n * 16), K1);
    } else {
        const rem = message.slice((n - 1) * 16);
        lastBlock = new Uint8Array(16);
        lastBlock.set(rem);
        lastBlock[rem.length] = 0x80;
        lastBlock = xorBlock(lastBlock, K2);
    }

    let x = new Uint8Array(16);
    for (let i = 0; i < n - 1; i++) {
        x = aesEcbBlock(keyBytes, xorBlock(x, message.slice(i * 16, i * 16 + 16)));
    }
    return aesEcbBlock(keyBytes, xorBlock(x, lastBlock));
}

const cmacTool = {
    id: "cmac",
    name: "CMAC 计算",
    category: "value-calc",
    desc: "基于 AES 的消息认证码（RFC 4493）",
    fields: [
        { name: "keyFormat", label: "密钥格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "utf8" },
        { name: "key", label: "密钥", type: "text", default: "0123456789abcdef" },
        { name: "inputFormat", label: "消息格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "utf8" },
        { name: "input", label: "消息", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const key = inputToBytes(v.key, v.keyFormat);
        const msg = inputToBytes(v.input, v.inputFormat);
        return bytesToHex(aesCmac(key, msg));
    },
};

export default cmacTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(cmacTool);
