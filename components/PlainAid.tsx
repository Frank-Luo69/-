"use client";
import React from "react";

const POS = ["初","二","三","四","五","上"];
import { genPlainForHexagram } from "@/lib/plainGen";
import type { Lines } from "@/lib/yarrow";

export function PlainAid({advice, lines}:{advice:any; lines: Lines}){
  if (!advice) return null;
  const hasMove = advice.movingCount>0; const paragraphs = genPlainForHexagram(lines, advice);
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-base font-semibold mb-2">白话助读</div>
      <div className="text-sm text-gray-800 space-y-2">{paragraphs.map((p,i)=>(<p key={i}>{p}</p>))}
        {hasMove ? (
          <p>
            本卦有 <b>{advice.movingCount}</b> 处动爻（位置：{advice.primaryLines.map((i:number)=>POS[i]).join("、") || "—"} 等）。
            按朱熹的读法：先读这些动爻的爻辞，再参看卦辞与大象；之卦只作参考，不改变本卦为主的判断。
          </p>
        ) : (
          <p>本卦<b>无动爻</b>：请先读<b>卦辞</b>，再读<b>大象</b>，结合互卦理解整体处境。</p>
        )}
        {advice.special && <p className="text-amber-700">特别提示：{advice.special}</p>}
        <p className="text-gray-600 text-xs">说明：此处为阅读引导，不替代个人裁断；不同流派会有差异。</p>
      </div>
    </div>
  );
}
