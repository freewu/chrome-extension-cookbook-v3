/**
 * SM4 加解密
 * 目录：pages/app/sm4/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import {
    utf8ToBytes, bytesToHex, hexToBytes, bytesToBase64, base64ToBytes
} from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

const sm4Tool = {
    id: "sm4",
    name: "SM4 加解密",
    category: "crypto",
    desc: "国密 SM4 对称加密",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "keyFormat", label: "密钥格式", type: "select", options: [["hex", "Hex"], ["utf8", "文本"]], default: "hex" },
        { name: "key", label: "密钥 (16 字节)", type: "text", default: "0123456789abcdeffedcba9876543210" },
        { name: "iv", label: "IV (CBC, 16 字节 Hex)", type: "text", default: "00000000000000000000000000000000" },
        { name: "cipherMode", label: "分组模式", type: "select", options: [["ecb", "ECB"], ["cbc", "CBC"]], default: "ecb" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["hex", "Hex"], ["base64", "Base64"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const sm4 = window.sm4;
        if (!sm4) throw new Error("sm-crypto 未加载");
        const key = v.keyFormat === "hex" ? v.key : bytesToHex(utf8ToBytes(v.key));
        if (v.mode === "encrypt") {
            const out = sm4.encrypt(v.input, key, { mode: v.cipherMode, iv: v.iv });
            return v.outputFormat === "base64"
                ? bytesToBase64(hexToBytes(out))
                : out;
        }
        const cipherHex = v.outputFormat === "hex" ? v.input.trim() : bytesToHex(base64ToBytes(v.input.trim()));
        return sm4.decrypt(cipherHex, key, { mode: v.cipherMode, iv: v.iv });
    },
};

export default sm4Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(sm4Tool);
