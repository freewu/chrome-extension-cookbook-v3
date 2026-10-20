/**
 * Blowfish 加解密
 * 目录：pages/app/blowfish/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import {
    utf8ToBytes, bytesToUtf8, latin1ToBytes, bytesToHex, hexToBytes, bytesToBase64, base64ToBytes
} from "../shared/utils.js";
import { MODE } from "../shared/crypto-common.js";
import { Blowfish } from "../../../lib/blowfish.mjs";
import { mountTool } from "../shared/page.js";

// ============================================================
// Blowfish
// ============================================================
const blowfishTool = {
    id: "blowfish",
    name: "Blowfish 加解密",
    category: "crypto",
    desc: "Blowfish (ECB/CBC)",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "cipherMode", label: "分组模式", type: "select", options: ["ECB", "CBC"], default: "ECB" },
        { name: "key", label: "密钥", type: "text", default: "secret-key" },
        { name: "iv", label: "IV (CBC, 8 字节)", type: "text", default: "12345678" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "inputFormat", label: "密文输入格式(解密)", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const mode = v.cipherMode === "CBC" ? Blowfish.MODE.CBC : Blowfish.MODE.ECB;
        const bf = new Blowfish(v.key, mode, Blowfish.PADDING.PKCS5);
        if (mode === Blowfish.MODE.CBC) {
            bf.setIv(latin1ToBytes(v.iv.padEnd(8, "\0").slice(0, 8)));
        }
        if (v.mode === "encrypt") {
            const out = bf.encode(utf8ToBytes(v.input));
            return v.outputFormat === "hex" ? bytesToHex(out) : bytesToBase64(out);
        }
        const data = v.inputFormat === "hex" ? hexToBytes(v.input) : base64ToBytes(v.input.trim());
        return bytesToUtf8(bf.decode(data, Blowfish.TYPE.UINT8_ARRAY));
    },
};

export default blowfishTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(blowfishTool);
