"use client";
import React from "react";
import { getTextsByPattern, patternFromLines } from "@/lib/texts";
import { TRIGRAM_NAMES } from "@/lib/yarrow";
import { hexagramNameFromTrigrams, wikisourceSlug } from "@/lib/hexanames";
import { withGlossary } from "@/lib/glossary";
import { OFFLINE_ONLY } from "@/lib/config";

const POS = ["初","二","三","四","五","上"];
type LineValue = 6|7|8|9;
type Lines = [LineValue,LineValue,LineValue,LineValue,LineValue,LineValue];

export function ClassicTexts({lines, primary, allMoving}:{lines:Lines; primary:number[]; allMoving:boolean}){
  const pattern = patternFromLines(lines);
  const t = getTextsByPattern(pattern);

  const bin = `${Number(lines[0]===7||lines[0]===9)}${Number(lines[1]===7||lines[1]===9)}${Number(lines[2]===7||lines[2]===9)}${Number(lines[3]===7||lines[3]===9)}${Number(lines[4]===7||lines[4]===9)}${Number(lines[5]===7||lines[5]===9)}` as string;
  const lowerKey = bin.slice(0,3) as keyof typeof TRIGRAM_NAMES;
  const upperKey = bin.slice(3,6) as keyof typeof TRIGRAM_NAMES;
  const lowerName = TRIGRAM_NAMES[lowerKey];
  const upperName = TRIGRAM_NAMES[upperKey];
  const guessName = hexagramNameFromTrigrams(lowerName.zh, upperName.zh);
  const wsName = guessName ? wikisourceSlug(guessName) : null;
  const wsUrl = wsName ? `https://zh.wikisource.org/wiki/周易/${wsName}` : null;

    const [view, setView] = React.useState<"original"|"plain">("original");
  const plain = (t && (t as any).texts && (t as any).texts.plain) ? (t as any).texts.plain : null;

  if (!t || (!t.texts.gua && !t.texts.yao.some(Boolean))) {
    return (
      <div className="rounded-2xl border p-4 shadow-sm bg-white">
        <div className="text-base font-semibold mb-2">经典原文（公版）</div>
        <div className="text-sm text-gray-700">该卦的全文资料尚未内置。当前版本已完整提供计算逻辑与解读路径；如需我补齐 64 卦文本库，可另行合入。</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-base font-semibold mb-2">经典原文（公版）</div>
      <div className="space-y-3 text-sm text-gray-800">
        <div><b>卦辞：</b>{view==="plain" && plain?.gua ? withGlossary(plain.gua) : withGlossary(t.texts.gua || "（缺）")}</div>
        <div><b>彖曰：</b>{view==="plain" && plain?.tuan ? withGlossary(plain.tuan) : withGlossary(t.texts.tuan || "（缺）")}</div>
        <div><b>象曰：</b>{view==="plain" && plain?.xiang ? withGlossary(plain.xiang) : withGlossary(t.texts.xiang || "（缺）")}</div>
        {allMoving && t.texts.yong && (
          <div><b>用辞：</b>{view==="plain" && plain?.yong ? withGlossary(plain.yong) : withGlossary(t.texts.yong)}</div>
        )}
        {!allMoving && primary?.length>0 && (
          <div>
            <div className="font-semibold">动爻爻辞：</div>
            <ul className="list-disc ml-5 space-y-1">
              {primary.map((i)=>(
                <li key={i}><b>{POS[i]}：</b>{view==="plain" && plain?.yao?.[i] ? withGlossary(plain.yao[i]) : withGlossary(t.texts.yao[i] || "（缺）")}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
