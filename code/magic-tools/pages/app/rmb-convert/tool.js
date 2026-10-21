import { mountTool } from "../shared/page.js";

// 人民币金额小写转大写（与 React 版 RMBConvert/lib.ts 的算法一致）
const cnNums = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
const cnIntRadice = ["", "拾", "佰", "仟"];
const cnIntUnits = ["", "万", "亿", "兆"];
const cnDecUnits = ["角", "分", "毫", "厘"];
const cnInteger = "整";
const cnIntLast = "元";
const maxNum = 999999999999999.9999;

function convertCurrency(money) {
    if (money === "") return "";
    const m = parseFloat(money);
    if (m >= maxNum) return "";
    if (m === 0) return cnNums[0] + cnIntLast + cnInteger;

    money = money.toString();
    let integerNum;
    let decimalNum;
    if (money.indexOf(".") === -1) {
        integerNum = money;
        decimalNum = "";
    } else {
        const parts = money.split(".");
        integerNum = parts[0];
        decimalNum = parts[1].substr(0, 4);
    }

    let chineseStr = "";
    // 整数部分
    if (parseInt(integerNum, 10) > 0) {
        let zeroCount = 0;
        const IntLen = integerNum.length;
        for (let i = 0; i < IntLen; i++) {
            const n = integerNum.substr(i, 1);
            const p = IntLen - i - 1;
            const q = p / 4;
            const mm = p % 4;
            if (n === "0") {
                zeroCount++;
            } else {
                if (zeroCount > 0) chineseStr += cnNums[0];
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n, 10)] + cnIntRadice[mm];
            }
            if (mm === 0 && zeroCount < 4) chineseStr += cnIntUnits[q];
        }
        chineseStr += cnIntLast;
    }
    // 小数部分
    if (decimalNum !== "") {
        for (let i = 0; i < decimalNum.length; i++) {
            const n = decimalNum.substr(i, 1);
            if (n !== "0") chineseStr += cnNums[Number(n)] + cnDecUnits[i];
        }
    }
    if (chineseStr === "") chineseStr += cnNums[0] + cnIntLast + cnInteger;
    else if (decimalNum === "") chineseStr += cnInteger;
    return chineseStr;
}

const tool = {
    id: "rmb-convert",
    name: "人民币大写",
    category: "convert",
    desc: "把金额数字转成中文大写金额（支持到兆位，含角分毫厘）",
    fields: [
        { name: "input", label: "金额", type: "text", default: "1234567.89", placeholder: "如 1234567.89" },
        { name: "negative", label: "负数金额（前置「负」）", type: "checkbox", default: false },
    ],
    run(v) {
        const raw = String(v.input).trim().replace(/[,，\s]/g, "");
        if (!/^-?[0-9.]+$/.test(raw)) throw new Error("请输入纯数字金额");
        const isNegative = v.negative || raw.startsWith("-");
        const text = raw.replace(/^-/, "");
        const result = convertCurrency(text);
        if (!result) throw new Error("金额超出可处理范围（最大 999 万亿元，即 999999999999999.9999）");
        return {
            大写金额: (isNegative ? "负" : "") + result,
            输入金额: (isNegative ? "-" : "") + text,
        };
    },
};

export default tool;
mountTool(tool);
