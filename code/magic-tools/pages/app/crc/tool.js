/**
 * CRC 校验
 * 目录：pages/app/crc/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { inputToBytes, crcReflected } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// CRC 校验
// ============================================================
// [name, width, poly, init, xorout, refin, refout]
const CRC_VARIANTS = {
    "CRC-8": [8, 0x07, 0x00, 0x00, false, false],
    "CRC-8/MAXIM": [8, 0x31, 0x00, 0x00, true, true],
    "CRC-16/ARC": [16, 0x8005, 0x0000, 0x0000, true, true],
    "CRC-16/CCITT-FALSE": [16, 0x1021, 0xffff, 0x0000, false, false],
    "CRC-16/XMODEM": [16, 0x1021, 0x0000, 0x0000, false, false],
    "CRC-16/MODBUS": [16, 0x8005, 0xffff, 0x0000, true, true],
    "CRC-16/USB": [16, 0x8005, 0xffff, 0xffff, true, true],
    "CRC-32": [32, 0x04c11db7, 0xffffffff, 0xffffffff, true, true],
    "CRC-32/MPEG-2": [32, 0x04c11db7, 0xffffffff, 0x00000000, false, false],
    "CRC-32C": [32, 0x1edc6f41, 0xffffffff, 0xffffffff, true, true],
};

const crcTool = {
    id: "crc",
    name: "CRC 校验",
    category: "value-calc",
    desc: "CRC-8 / CRC-16 / CRC-32 多种参数",
    fields: [
        { name: "variant", label: "参数模型", type: "select", options: Object.keys(CRC_VARIANTS), default: "CRC-32" },
        { name: "inputFormat", label: "输入格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"], ["base64", "Base64"]], default: "utf8" },
        { name: "input", label: "输入", type: "textarea", default: "123456789" },
    ],
    run(v) {
        const [width, poly, init, xorout, refin, refout] = CRC_VARIANTS[v.variant];
        const bytes = inputToBytes(v.input, v.inputFormat);
        const value = crcReflected(bytes, width, poly, init, xorout, refin, refout);
        const hexWidth = width / 4;
        const unsigned = value >>> 0;
        return {
            Dec: String(unsigned),
            Hex: "0x" + unsigned.toString(16).padStart(hexWidth, "0").toUpperCase(),
        };
    },
};

export default crcTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(crcTool);
