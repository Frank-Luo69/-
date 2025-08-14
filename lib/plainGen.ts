import type { Lines } from "./yarrow";
import { toBinary, splitTrigrams } from "./yarrow";
import { TRIGRAM_META } from "./trigram_meta";

const POS = ["初","二","三","四","五","上"] as const;

export function genPlainForHexagram(lines: Lines, advice: any) {
  const bin = toBinary(lines);
  const { lower, upper } = splitTrigrams(bin);
  const lowerKey = `${lower[0]}${lower[1]}${lower[2]}` as keyof typeof TRIGRAM_META;
  const upperKey = `${upper[0]}${upper[1]}${upper[2]}` as keyof typeof TRIGRAM_META;
  const L = TRIGRAM_META[lowerKey];
  const U = TRIGRAM_META[upperKey];

  const hasMove = advice?.movingCount > 0;
  const focus = hasMove ? `重点看动爻：${(advice.primaryLines || []).map((i:number)=>POS[i]).join("、") || "—"}；` : "本卦无动爻：先读卦辞与大象；";
  const special = advice?.special ? `特例提示：${advice.special}` : "";

  const theme = `上卦${U.zh}（${U.image}，德为“${U.virtue}”，方位${U.direction}，五行${U.element}），下卦${L.zh}（${L.image}，德为“${L.virtue}”，方位${L.direction}，五行${L.element}）。此卦之象：${U.image}在上、${L.image}在下。`;

  const suggestActs = Array.from(new Set([
    ...(U.actions.slice(0,2)),
    ...(L.actions.slice(0,2))
  ])).slice(0,4);

  const readingPath = hasMove
    ? "读法：以本卦为主，依动爻爻辞裁断；再参卦辞、象曰；之卦可作旁证而不夺本义。"
    : "读法：以卦辞和象曰为主，辅以互卦体会细节。";

  return [
    theme,
    `行事倾向：宜${suggestActs.join("、")}（因应卦象，不必拘泥）。`,
    `${focus}${readingPath}`,
    special
  ].filter(Boolean);
}
