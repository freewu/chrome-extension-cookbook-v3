/**
 * TEA 加解密
 * 目录：pages/app/tea/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { DELTA, blockCipherTool } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

function teaEncryptBlock(v0, v1, k, rounds = 32) {
    let sum = 0;
    for (let i = 0; i < rounds; i++) {
        sum = (sum + DELTA) >>> 0;
        v0 = (v0 + ((((v1 << 4) >>> 0) + k[0]) ^ ((v1 + sum) >>> 0) ^ (((v1 >>> 5) + k[1]) >>> 0))) >>> 0;
        v1 = (v1 + ((((v0 << 4) >>> 0) + k[2]) ^ ((v0 + sum) >>> 0) ^ (((v0 >>> 5) + k[3]) >>> 0))) >>> 0;
    }
    return [v0, v1];
}

function teaDecryptBlock(v0, v1, k, rounds = 32) {
    let sum = (DELTA * rounds) >>> 0;
    for (let i = 0; i < rounds; i++) {
        v1 = (v1 - ((((v0 << 4) >>> 0) + k[2]) ^ ((v0 + sum) >>> 0) ^ (((v0 >>> 5) + k[3]) >>> 0))) >>> 0;
        v0 = (v0 - ((((v1 << 4) >>> 0) + k[0]) ^ ((v1 + sum) >>> 0) ^ (((v1 >>> 5) + k[1]) >>> 0))) >>> 0;
        sum = (sum - DELTA) >>> 0;
    }
    return [v0, v1];
}

const teaTool = blockCipherTool("tea", "TEA 加解密", "Tiny Encryption Algorithm", teaEncryptBlock, teaDecryptBlock, 16);

export default teaTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(teaTool);
