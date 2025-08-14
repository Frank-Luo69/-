import { RNG, randomInt, cryptoRNG } from "./random";

export type LineValue = 6 | 7 | 8 | 9;  // 6=老阴(动) 7=少阳 8=少阴 9=老阳(动)
export type YinYang = 0 | 1;            // 0=阴 1=阳
export type Lines = [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue];

export function remainderMod4NonZero(x: number): 1|2|3|4 {
  const r = x % 4;
  return (r === 0 ? 4 : (r as 1|2|3));
}

export function splitNonZero(total: number, rng: RNG) {
  if (total <= 1) throw new Error("total must be > 1");
  const A = randomInt(1, total - 1, rng); // 确保两堆非空
  const B = total - A;
  return [A, B] as const;
}

// 第1变：取 5 或 9
export function firstChangeDetailed(n: number, rng: RNG) {
  const [A, B] = splitNonZero(n, rng);
  const hangOne = 1;
  const leftRem = remainderMod4NonZero(A);
  const rightRem = remainderMod4NonZero(B - hangOne);
  const taken = (hangOne + leftRem + rightRem) as 5|9;
  const to = n - taken;
  return { from:n, to, taken, A, B, hangOne, leftRem, rightRem };
}
export function firstChange(n: number, rng: RNG): number {
  const d = firstChangeDetailed(n, rng);
  return d.to;
}
  const [A, B] = splitNonZero(n, rng);
  const hangOne = 1; // 挂一
  const leftRem = remainderMod4NonZero(A);
  const rightRem = remainderMod4NonZero(B - hangOne);
  const taken = hangOne + leftRem + rightRem; // 5 或 9
  return n - taken;
}

// 第2/3变：取 4 或 8
export function nextChangeDetailed(n: number, rng: RNG) {
  const [A, B] = splitNonZero(n, rng);
  const leftRem = remainderMod4NonZero(A);
  const rightRem = remainderMod4NonZero(B);
  const taken = (leftRem + rightRem) as 4|8;
  const to = n - taken;
  return { from:n, to, taken, A, B, leftRem, rightRem };
}
export function nextChange(n: number, rng: RNG): number {
  const d = nextChangeDetailed(n, rng);
  return d.to;
}
  const [A, B] = splitNonZero(n, rng);
  const taken = remainderMod4NonZero(A) + remainderMod4NonZero(B);
  return n - taken;
}

export function remainingToLineValue(remaining: number): LineValue {
  switch (remaining) {
    case 24: return 6;
    case 28: return 7;
    case 32: return 8;
    case 36: return 9;
    default: throw new Error(`Unexpected remaining ${remaining}`);
  }
}

export function generateLineYarrow(rng: RNG = cryptoRNG) {
  const steps: { step:number; from:number; to:number; taken:number; }[] = []; const breakdown: any[] = [];
  let n = 49;

  const d1 = firstChangeDetailed(n, rng); const n1 = d1.to; breakdown.push({step:1, ...d1});
  steps.push({ step:1, from:n, to:n1, taken:n - n1 });
  n = n1;

  const d2 = nextChangeDetailed(n, rng); const n2 = d2.to; breakdown.push({step:2, ...d2});
  steps.push({ step:2, from:n, to:n2, taken:n - n2 });
  n = n2;

  const d3 = nextChangeDetailed(n, rng); const n3 = d3.to; breakdown.push({step:3, ...d3});
  steps.push({ step:3, from:n, to:n3, taken:n - n3 });
  n = n3;

  const value = remainingToLineValue(n);
  return { value, steps, breakdown };
}

export function isYang(v: LineValue): YinYang {
  return (v === 7 || v === 9) ? 1 : 0;
}
export function isMoving(v: LineValue): boolean {
  return v === 6 || v === 9;
}
export function toBinary(lines: Lines): [YinYang,YinYang,YinYang,YinYang,YinYang,YinYang] {
  return lines.map(isYang) as any;
}
export function flip(v: YinYang): YinYang { return v ? 0 : 1; }

// 之卦：动爻取反（6→阳 9→阴），静爻不变
export function relatingFrom(lines: Lines): Lines {
  const out = [...lines] as Lines;
  for (let i=0;i<6;i++){
    if (isMoving(lines[i])) {
      out[i] = (lines[i] === 6) ? 7 : 8;
    }
  }
  return out;
}

// 互卦（二三四为下，三四五为上）
export function nuclearFromBinary(bin: [YinYang,YinYang,YinYang,YinYang,YinYang,YinYang]) {
  return [
    bin[1], bin[2], bin[3],
    bin[2], bin[3], bin[4],
  ] as [YinYang,YinYang,YinYang,YinYang,YinYang,YinYang];
}

// 综卦：上下倒置
export function invertedFromBinary(bin: [YinYang,YinYang,YinYang,YinYang,YinYang,YinYang]) {
  return [
    bin[5], bin[4], bin[3], bin[2], bin[1], bin[0],
  ] as typeof bin;
}

// 错卦：阴阳全反
export function oppositeFromBinary(bin: [YinYang,YinYang,YinYang,YinYang,YinYang,YinYang]) {
  return bin.map(flip) as typeof bin;
}

export function generateHexagramYarrow(rng: RNG = cryptoRNG) {
  const lines = [] as unknown as Lines;
  const detail: any[] = [];
  for (let i=0;i<6;i++){
    const { value, steps, breakdown } = generateLineYarrow(rng);
    (lines as any)[i] = value;
    detail.push({ lineIndex: i, value, steps, breakdown });
  }
  const bin = toBinary(lines);
  const relating = relatingFrom(lines);
  const nucl = nuclearFromBinary(bin);
  const inv = invertedFromBinary(bin);
  const opp = oppositeFromBinary(bin);

  return {
    lines,
    relating,
    binary: bin,
    nuclear: nucl,
    inverted: inv,
    opposite: opp,
    detail,
  };
}

// 工具：把二进制六爻拆成上下卦三画
export function splitTrigrams(bin: [YinYang,YinYang,YinYang,YinYang,YinYang,YinYang]) {
  const lower = [bin[0], bin[1], bin[2]] as [YinYang,YinYang,YinYang];
  const upper = [bin[3], bin[4], bin[5]] as [YinYang,YinYang,YinYang];
  return { lower, upper };
}

// 八卦命名映射（0=阴，1=阳；顺序为自下而上三画）
export const TRIGRAM_NAMES: Record<string, {zh:string; pinyin:string; en:string; symbol:string}> = {
  "111": { zh:"乾", pinyin:"qián", en:"Force", symbol:"☰" },
  "110": { zh:"兑", pinyin:"duì",  en:"Lake",  symbol:"☱" },
  "101": { zh:"离", pinyin:"lí",   en:"Fire",  symbol:"☲" },
  "100": { zh:"震", pinyin:"zhèn", en:"Thunder", symbol:"☳" },
  "011": { zh:"巽", pinyin:"xùn",  en:"Wind",  symbol:"☴" },
  "010": { zh:"坎", pinyin:"kǎn",  en:"Water", symbol:"☵" },
  "001": { zh:"艮", pinyin:"gèn",  en:"Mountain", symbol:"☶" },
  "000": { zh:"坤", pinyin:"kūn",  en:"Earth", symbol:"☷" },
};

export function trigramKey(tri: [YinYang,YinYang,YinYang]) {
  return `${tri[0]}${tri[1]}${tri[2]}`;
}
