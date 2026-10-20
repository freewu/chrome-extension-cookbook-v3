/**
 * 值计算分类的公共 helper（被多个工具目录共用）
 */
import { bytesToHex } from "./utils.js";

const C = window.CryptoJS;

// lib/sha3.min.js 把 sha3_256 / keccak256 / kmac128 等函数直接挂在 window 上
const S = window;

// 字节 -> CryptoJS WordArray
function wa(bytes) {
    return C.enc.Hex.parse(bytesToHex(bytes));
}

export { C, S, wa };
