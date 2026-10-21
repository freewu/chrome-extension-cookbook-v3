import { temperatureTool } from "../shared/unitconv.js";
import { mountTool } from "../shared/page.js";

// 温标公式见 shared/unitconv.js 的 temperatureTool（与 React 版 lib.ts 一致）
const tool = temperatureTool({ id: "temperature-convert", name: "温度转换", desc: "摄氏度 / 华氏度 / 开尔文 / 兰金 / 德利尔 / 牛顿 / 列氏 / 罗氏" });

export default tool;
mountTool(tool);
