/**
 * XTEA 加解密
 * 目录：pages/app/xtea/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { DELTA, blockCipherTool } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

function xteaEncryptBlock(v0, v1, k, rounds = 32) {
    let sum = 0;
    for (let i = 0; i < rounds; i++) {
        v0 = (v0 + (((((v1 << 4) >>> 0) ^ (v1 >>> 5)) + v1) ^ (sum + k[sum & 3]))) >>> 0;
        sum = (sum + DELTA) >>> 0;
        v1 = (v1 + (((((v0 << 4) >>> 0) ^ (v0 >>> 5)) + v0) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
    }
    return [v0, v1];
}

function xteaDecryptBlock(v0, v1, k, rounds = 32) {
    let sum = (DELTA * rounds) >>> 0;
    for (let i = 0; i < rounds; i++) {
        v1 = (v1 - (((((v0 << 4) >>> 0) ^ (v0 >>> 5)) + v0) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
        sum = (sum - DELTA) >>> 0;
        v0 = (v0 - (((((v1 << 4) >>> 0) ^ (v1 >>> 5)) + v1) ^ (sum + k[sum & 3]))) >>> 0;
    }
    return [v0, v1];
}

const xteaTool = blockCipherTool("xtea", "XTEA 加解密", "eXtended TEA", xteaEncryptBlock, xteaDecryptBlock, 16);

export default xteaTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(xteaTool);
