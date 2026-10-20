/**
 * 摩斯码编解码
 * 目录：pages/app/morse/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { mountTool } from "../shared/page.js";

// ---------- 摩斯码 ----------
const MORSE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
    5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
    ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
    '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
};

const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

const morseTool = {
    id: "morse",
    name: "摩斯码编解码",
    category: "codec",
    desc: "字母间用空格，单词间用 /",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "文本→摩斯"], ["decode", "摩斯→文本"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "SOS HELLO" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return v.input
                .toUpperCase()
                .split("")
                .map((ch) => (ch === " " ? "/" : MORSE[ch] || ""))
                .filter(Boolean)
                .join(" ");
        }
        return v.input
            .trim()
            .split(/\s+/)
            .map((code) => (code === "/" ? " " : MORSE_REV[code] || ""))
            .join("");
    },
};

export default morseTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(morseTool);
