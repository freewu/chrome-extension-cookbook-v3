/**
 * Rabbit 加解密
 * 目录：pages/app/rabbit/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { C, symmetricFields, runCryptoJs } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

const rabbitTool = {
    id: "rabbit",
    name: "Rabbit 加解密",
    category: "crypto",
    desc: "Rabbit 流密码",
    fields: symmetricFields({ noMode: true }),
    run: (v) => runCryptoJs(C.Rabbit, v, { noMode: true }),
};

export default rabbitTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(rabbitTool);
