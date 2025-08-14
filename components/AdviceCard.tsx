"use client";
import React from "react";

export function AdviceCard({advice}:{advice:any}){
  if (!advice) return null;
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-base font-semibold mb-2">解读建议 · {advice.mode}</div>
      <div className="text-sm text-gray-800 mb-3">{advice.summary}</div>
      {advice.special && <div className="text-sm text-amber-700 mb-2">特别提示：{advice.special}</div>}
      <div className="text-xs text-gray-600 mb-2">
        参考顺序：{advice.reference.join(" → ")}
      </div>
      {advice.primaryLines?.length>0 && (
        <div className="text-sm text-gray-800 mb-2">
          建议重点动爻：{advice.primaryLines.map((i:number)=>["初","二","三","四","五","上"][i]).join("、")}
        </div>
      )}
      <div className="text-xs text-gray-500">
        卦象：下卦 {advice.trigramInfo.lower} · 上卦 {advice.trigramInfo.upper}
      </div>
    </div>
  );
}
