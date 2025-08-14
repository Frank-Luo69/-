// lib/yarrow.ts
// 大衍筮法（蓍草法）严谨实现：每爻三变 -> 6/7/8/9
// 参考规则：
//  - 初变：从右束取一，左右各按“四取余（零当四）”，taken = 1 + leftRem + rightRem ∈ {9,5}
//  - 二/三变：不取“挂一”，各按“四取余（零当四）”，taken ∈ {8,4}
//  - 49 - (9|5) - (8|4) - (8|4) ∈ {36,32,28,24} 映射为 {6,7,8,9}

export type RNG = () => number;

/** 非零四余：n % 4，零按 4 计 */
function remainderMod4NonZero(n: number): number {
  const r = n % 4;
  return r === 0 ? 4 : r;
}

/** 将 n 束随机分作 A/B 两束（皆非 0） */
function splitAB(n: number, rng: RNG): { A: number; B: number } {
  // A ∈ [1, n-1]，B = n - A
  const A = 1 + Math.floor(rng() * (n - 1));
  const B = n - A;
  // 极小概率保护（理论上不会 0）
  if (A <= 0) return { A: 1, B: n - 1 };
  if (B <= 0) return { A: n - 1, B: 1 };
  return { A, B };
}

/** 单次变化（step 1/2/3），返回下一轮剩余数与细节 */
function nextChange(
  n: number,
  rng: RNG,
  options: { hangOne: 0 | 1 }
): {
  next: number;
  taken: number;
  leftRem: number;
  rightRem: number;
  A: number;
  B: number;
  hangOne: 0 | 1;
} {
  const { A, B } = splitAB(n, rng);
  const right = B - options.hangOne;
  const leftRem = remainderMod4NonZero(A);
  const rightRem = remainderMod4NonZero(right);
  const taken = options.hangOne + leftRem + rightRem; // 9/5 或 8/4
  const next = n - taken;
  return { next, taken, leftRem, rightRem, A, B, hangOne: options.hangOne };
}

/** 计算一爻（三变），返回 6/7/8/9 与过程细节 */
function castOneLine(rng: RNG): {
  value: 6 | 7 | 8 | 9;
  steps: Array<ReturnType<typeof nextChange>>;
  buckets: [number, number, number]; // 每次剩余
} {
  const buckets: [number, number, number] = [49, 0, 0];

  const s1 = nextChange(buckets[0], rng, { hangOne: 1 }); // 第一次要挂一
  buckets[1] = s1.next;
  const s2 = nextChange(buckets[1], rng, { hangOne: 0 });
  buckets[2] = s2.next;
  const s3 = nextChange(buckets[2], rng, { hangOne: 0 });

  const final = s3.next; // ∈ {36,32,28,24}
  let value: 6 | 7 | 8 | 9;
  switch (final) {
    case 36:
      value = 6; // 老阴
      break;
    case 32:
      value = 7; // 少阳
      break;
    case 28:
      value = 8; // 少阴
      break;
    case 24:
      value = 9; // 老阳
      break;
    default:
      // 理论上不会到这里；做一次兜底
      value = final <= 26 ? 9 : final <= 30 ? 8 : final <= 34 ? 7 : 6;
  }

  return { value, steps: [s1, s2, s3], buckets: [49, s1.next, s2.next] };
}

/** 生成一卦（自下而上 6 爻） */
export function generateHexagramYarrow(rng: RNG): {
  lines: Array<6 | 7 | 8 | 9>;
  relating: Array<6 | 7 | 8 | 9>;
  detail: Array<ReturnType<typeof castOneLine>>;
  nuclear: number[]; // 互卦（bits）
  inverted: number[]; // 综卦（bits 反序）
  opposite: number[]; // 错卦（bits 取反）
} {
  const detail = Array.from({ length: 6 }, () => castOneLine(rng));
  const lines = detail.map((d) => d.value) as Array<6 | 7 | 8 | 9>;

  // 之卦：动爻（6/9）取变，静爻（7/8）不变
  const relating = lines.map((v) => {
    if (v === 6) return 7; // 阴动 -> 阳
    if (v === 9) return 8; // 阳动 -> 阴
    return v; // 静爻不变
  }) as Array<6 | 7 | 8 | 9>;

  const bits = toBinary(lines);
  const nuclear = nuclearHexagram(bits);
  const inverted = bits.slice().reverse();
  const opposite = bits.map((b) => (b ? 0 : 1));

  return { lines, relating, detail, nuclear, inverted, opposite };
}

/** 将 6/7/8/9 转为 0/1（阴=0，阳=1），顺序自下而上 */
export function toBinary(lines: Array<6 | 7 | 8 | 9>): number[] {
  return lines.map((v) => (v === 7 || v === 9 ? 1 : 0));
}

/** 分上下卦（三位一组），bits 顺序自下而上 */
export function splitTrigrams(bits: number[]): {
  lower: [number, number, number];
  upper: [number, number, number];
} {
  const lower: [number, number, number] = [
    bits[0] ?? 0,
    bits[1] ?? 0,
    bits[2] ?? 0,
  ];
  const upper: [number, number, number] = [
    bits[3] ?? 0,
    bits[4] ?? 0,
    bits[5] ?? 0,
  ];
  return { lower, upper };
}

/** 互卦：取第 2~4 爻为下卦，第 3~5 爻为上卦（均自下而上） */
function nuclearHexagram(bits: number[]): number[] {
  // bits: [L1, L2, L3, L4, L5, L6] 自下而上
  const lower = [bits[1], bits[2], bits[3]].map((x) => (x ?? 0));
  const upper = [bits[2], bits[3], bits[4]].map((x) => (x ?? 0));
  return [...lower, ...upper];
}

/** 八卦名录（简表） */
export const TRIGRAM_NAMES: Record<
  "111" | "110" | "101" | "100" | "011" | "010" | "001" | "000",
  { zh: string; pinyin: string; symbol: string }
> = {
  "111": { zh: "乾", pinyin: "qián", symbol: "☰" },
  "110": { zh: "兑", pinyin: "duì", symbol: "☱" },
  "101": { zh: "离", pinyin: "lí", symbol: "☲" },
  "100": { zh: "震", pinyin: "zhèn", symbol: "☳" },
  "011": { zh: "巽", pinyin: "xùn", symbol: "☴" },
  "010": { zh: "坎", pinyin: "kǎn", symbol: "☵" },
  "001": { zh: "艮", pinyin: "gèn", symbol: "☶" },
  "000": { zh: "坤", pinyin: "kūn", symbol: "☷" },
};
