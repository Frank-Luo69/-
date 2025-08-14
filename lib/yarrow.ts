import { RNG, randomInt } from "./random";

export type LineValue = 6 | 7 | 8 | 9;  // 6=老阴(动) 7=少阳 8=少阴 9=老阳(动)
export type YinYang = 0 | 1;            // 0=阴 1=阳
export type Lines = [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue];

/** 非零四余：n % 4，零按 4 计 */
export function remainderMod4NonZero(n: number): 1 | 2 | 3 | 4 {
  const r = n % 4;
  return (r === 0 ? 4 : (r as 1 | 2 | 3));
}

/** 将 n 束随机分作 A/B 两束（皆非 0） */
export function splitNonZero(total: number, rng: RNG) {
  if (total <= 1) throw new Error("total must be > 1");
  const A = randomInt(1, total - 1, rng); // 确保两堆非空
  const B = total - A;
  return [A, B] as const;
}

/** 单次变化（步骤 1/2/3）——返回下一轮剩余与细节 */
function nextChangeDetailed(
  n: number,
  rng: RNG,
  hangOne: 0 | 1
) {
  const [A, B] = splitNonZero(n, rng);
  const right = B - hangOne;
  const leftRem = remainderMod4NonZero(A);
  const rightRem = remainderMod4NonZero(right);
  const taken = hangOne + leftRem + rightRem; // 9/5 或 8/4
  const next = n - taken;
  return { from: n, to: next, taken, A, B, hangOne, leftRem, rightRem };
}

/** 计算一爻（三变），返回 6/7/8/9 与过程细节 */
function castOneLine(rng: RNG) {
  const s1 = nextChangeDetailed(49, rng, 1); // 第一次要挂一
  const s2 = nextChangeDetailed(s1.to, rng, 0);
  const s3 = nextChangeDetailed(s2.to, rng, 0);

  const final = s3.to; // ∈ {36,32,28,24}
  let value: LineValue;
  switch (final) {
    case 36: value = 6; break; // 老阴
    case 32: value = 7; break; // 少阳
    case 28: value = 8; break; // 少阴
    case 24: value = 9; break; // 老阳
    default:
      // 理论上不会到这里；兜底映射
      value = final <= 26 ? 9 : final <= 30 ? 8 : final <= 34 ? 7 : 6;
  }

  return { value, steps: [s1, s2, s3] as const };
}

/** 生成一卦（自下而上 6 爻） */
export function generateHexagramYarrow(rng: RNG) {
  const detail = Array.from({ length: 6 }, () => castOneLine(rng));
  const lines = detail.map(d => d.value) as Lines;

  // 之卦：动爻（6/9）取变，静爻（7/8）不变
  const relating = relatingFrom(lines) as Lines;

  const bits = toBinary(lines);
  const nuclear = nuclearHexagram(bits);
  const inverted = bits.slice().reverse();
  const opposite = bits.map(b => (b ? 0 : 1));

  return { lines, relating, detail, nuclear, inverted, opposite };
}

/** 将 6/7/8/9 转为 0/1（阴=0，阳=1），顺序自下而上 */
export function toBinary(lines: Lines): number[] {
  return lines.map(v => (v === 7 || v === 9 ? 1 : 0));
}

/** 阳性判断 */
export function isYang(v: LineValue): boolean {
  return v === 7 || v === 9;
}

/** 由动爻得到之卦 */
export function relatingFrom(lines: Lines): LineValue[] {
  return lines.map(v => (v === 6 ? 7 : v === 9 ? 8 : v));
}

/** 分上下卦（三位一组），bits 顺序自下而上 */
export function splitTrigrams(bits: number[]) {
  const lower: [number, number, number] = [bits[0] ?? 0, bits[1] ?? 0, bits[2] ?? 0];
  const upper: [number, number, number] = [bits[3] ?? 0, bits[4] ?? 0, bits[5] ?? 0];
  return { lower, upper };
}

/** 互卦：取第 2~4 爻为下卦，第 3~5 爻为上卦（均自下而上） */
function nuclearHexagram(bits: number[]): number[] {
  const lower = [bits[1], bits[2], bits[3]].map(x => x ?? 0);
  const upper = [bits[2], bits[3], bits[4]].map(x => x ?? 0);
  return [...lower, ...upper];
}

/** 八卦名录 */
export const TRIGRAM_NAMES: Record<
  "111" | "110" | "101" | "100" | "011" | "010" | "001" | "000",
  { zh: string; pinyin: string; en: string; symbol: string }
> = {
  "111": { zh: "乾", pinyin: "qián", en: "Force", symbol: "☰" },
  "110": { zh: "兑", pinyin: "duì",  en: "Lake",  symbol: "☱" },
  "101": { zh: "离", pinyin: "lí",   en: "Fire",  symbol: "☲" },
  "100": { zh: "震", pinyin: "zhèn", en: "Thunder", symbol: "☳" },
  "011": { zh: "巽", pinyin: "xùn",  en: "Wind",  symbol: "☴" },
  "010": { zh: "坎", pinyin: "kǎn",  en: "Water", symbol: "☵" },
  "001": { zh: "艮", pinyin: "gèn",  en: "Mountain", symbol: "☶" },
  "000": { zh: "坤", pinyin: "kūn",  en: "Earth", symbol: "☷" },
};

export function trigramKey(tri: [YinYang, YinYang, YinYang]) {
  return `${tri[0]}${tri[1]}${tri[2]}` as
    | "111" | "110" | "101" | "100" | "011" | "010" | "001" | "000";
}
