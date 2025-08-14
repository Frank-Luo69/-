import type { Lines } from "./yarrow";
import { toBinary, isYang, relatingFrom, splitTrigrams, TRIGRAM_NAMES } from "./yarrow";

// 位置名称（自下而上）
const POS = ["初","二","三","四","五","上"] as const;

function centralityScore(idx: number): number {
  // 中为贵：二、五优先；次三、四；后初、上
  // 分数越小优先级越高
  switch (idx) {
    case 1: return 0; // 二
    case 4: return 0; // 五
    case 2: return 1; // 三
    case 3: return 1; // 四
    case 0: return 2; // 初
    case 5: return 2; // 上
    default: return 3;
  }
}

function isCorrectPosition(idx: number, yang: boolean): boolean {
  // 得位（得正）：阳居阳位（奇位1,3,5 → idx 0,2,4），阴居阴位（偶位2,4,6 → idx 1,3,5）
  const isYangPos = (idx === 0 || idx === 2 || idx === 4);
  return (yang && isYangPos) || (!yang && !isYangPos);
}

function isCentral(idx: number): boolean {
  return idx === 1 || idx === 4; // 二、五为中
}

function isQian(bin: [0|1,0|1,0|1,0|1,0|1,0|1]) {
  return bin[0]===1 && bin[1]===1 && bin[2]===1 && bin[3]===1 && bin[4]===1 && bin[5]===1;
}
function isKun(bin: [0|1,0|1,0|1,0|1,0|1,0|1]) {
  return bin[0]===0 && bin[1]===0 && bin[2]===0 && bin[3]===0 && bin[4]===0 && bin[5]===0;
}

export interface ZhuXiAdvice {
  mode: "朱熹本义";
  summary: string;
  movingCount: number;
  primaryLines: number[]; // 建议重点看的动爻索引（自下而上0..5）
  lineNotes: Array<{
    index: number;
    label: string; // 初/二/三/四/五/上
    yinYang: "阳" | "阴";
    zhong: boolean;
    dewei: boolean;
  }>;
  reference: string[]; // 提示用户可参看的文本模块
  trigramInfo: { lower: string; upper: string; };
  special?: string; // 特例提示（如用九/用六）
}

export function adviseZhuXi(lines: Lines): ZhuXiAdvice {
  const bin = toBinary(lines);
  const movingIdxs: number[] = [];
  for (let i=0;i<6;i++){
    if (lines[i] === 6 || lines[i] === 9) movingIdxs.push(i);
  }
  const movingCount = movingIdxs.length;

  // 生成每爻属性
  const lineNotes = lines.map((v, i) => {
    const yang = (v === 7 || v === 9);
    return {
      index: i,
      label: POS[i],
      yinYang: yang ? "阳" : "阴",
      zhong: isCentral(i),
      dewei: isCorrectPosition(i, yang),
    };
  });

  // 朱熹法：本卦为主，以动爻爻辞为主；多动取中为先（二五），次三四；仍并列诸动爻以备参；兼看之卦，不舍本义
  let primaryLines: number[] = [];
  if (movingCount === 1) {
    primaryLines = [movingIdxs[0]];
  } else if (movingCount >= 2 && movingCount <= 5) {
    primaryLines = [...movingIdxs].sort((a,b)=>{
      const ca = centralityScore(a);
      const cb = centralityScore(b);
      if (ca !== cb) return ca - cb;
      // 次级排序：靠近中位者优先（距离{1,4}之和为小）
      const da = Math.min(Math.abs(a-1), Math.abs(a-4));
      const db = Math.min(Math.abs(b-1), Math.abs(b-4));
      if (da !== db) return da - db;
      // 再次：高位优先（上者为先）——便于决断时取后势
      return b - a;
    });
  } else if (movingCount === 0) {
    primaryLines = [];
  } else if (movingCount === 6) {
    primaryLines = [1,4]; // 二五为中，仅作标识
  }

  // 卦象信息
  const { lower, upper } = splitTrigrams(bin);
  const lowerName = TRIGRAM_NAMES[`${lower[0]}${lower[1]}${lower[2]}`];
  const upperName = TRIGRAM_NAMES[`${upper[0]}${upper[1]}${upper[2]}`];

  // 特例：六爻皆动
  let special: string | undefined;
  if (movingCount === 6) {
    if (isQian(bin)) {
      special = "本卦为乾，六爻皆动，宜读《用九》；兼参之卦。";
    } else if (isKun(bin)) {
      special = "本卦为坤，六爻皆动，宜读《用六》；兼参之卦。";
    } else {
      special = "六爻皆动：以本卦为主，兼读之卦卦辞与大象，仍当依事择义。";
    }
  }

  // 摘要
  const movingLabels = movingIdxs.map(i=>POS[i]).join("、") || "无";
  const primaryLabels = primaryLines.map(i=>POS[i]).join("、") || "（无动爻，读卦辞与大象）";

  const summary =
    movingCount === 0
      ? "无动爻：以本卦卦辞与大象为主，参互卦义。"
      : `动爻${movingCount}处（${movingLabels}），朱熹法主张本卦为主、以动爻为断；本卦之中，先取中位（有则优先${primaryLabels}），并列诸动爻以备参，之卦可参而不夺本义。`;

  return {
    mode: "朱熹本义",
    summary,
    movingCount,
    primaryLines,
    lineNotes,
    reference: movingCount === 0
      ? ["卦辞","大象","互卦"]
      : ["动爻爻辞","卦辞","大象","之卦（参）","互卦（参）"],
    trigramInfo: { lower: `${lowerName.symbol} ${lowerName.zh}`, upper: `${upperName.symbol} ${upperName.zh}` },
    special,
  };
}
