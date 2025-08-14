"use client";
import React from "react";
import type { Lines } from "@/lib/types";

const POS = ["初","二","三","四","五","上"];
type Breakdown = {step:1|2|3; from:number; to:number; taken:number; A:number; B:number; leftRem:number; rightRem:number; hangOne?:1};

export function YarrowAnimator({result}:{result:any}){
  const [lineIndex, setLineIndex] = React.useState(0); // 动画哪一爻（默认初爻）
  const [phase, setPhase] = React.useState<0|1|2|3|4>(0); // 0=待机 1/2/3=演第1/2/3变 4=完成
  const detail = result?.detail?.find((d:any)=>d.lineIndex===lineIndex);
  const steps: Breakdown[] = detail?.breakdown || [];

  React.useEffect(()=>{ setPhase(0); }, [lineIndex, result]);

  const play = async ()=>{
    if (!steps?.length) return;
    setPhase(1);
    await new Promise(r=>setTimeout(r, 900));
    setPhase(2);
    await new Promise(r=>setTimeout(r, 900));
    setPhase(3);
    await new Promise(r=>setTimeout(r, 900));
    setPhase(4);
  };

  const renderStep = (s: Breakdown, active: boolean)=>{
    return (
      <div className={`rounded-xl border p-3 ${active? 'bg-indigo-50 border-indigo-300' : 'bg-white'}`}>
        <div className="font-medium mb-1">第{s.step}变</div>
        <div className="text-xs text-gray-700 grid grid-cols-2 gap-2">
          <div>起始：{s.from}</div>
          <div>分堆：A={s.A}，B={s.B}</div>
          {s.step===1 && <div>挂一：{s.hangOne}</div>}
          <div>左余（按四归奇）：{s.leftRem}</div>
          <div>右余（按四归奇）：{s.rightRem}</div>
          <div>本轮取走：<b>{s.taken}</b></div>
          <div>剩余：<b>{s.to}</b></div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-base font-semibold">教学动画：蓍草三变</div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">选择爻：</label>
          <select value={lineIndex} onChange={e=>setLineIndex(parseInt(e.target.value))} className="border rounded px-2 py-1 text-sm">
            {POS.map((p,i)=>(<option key={i} value={i}>{p}爻（自下而上第{i+1}爻）</option>))}
          </select>
          <button onClick={play} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50">播放</button>
        </div>
      </div>

      {!steps?.length ? (
        <div className="text-sm text-gray-600">请先点击“起卦”，再在这里播放某一爻的三变过程。</div>
      ) : (
        <div className="grid gap-3">
          {renderStep(steps[0], phase>=1)}
          {renderStep(steps[1], phase>=2)}
          {renderStep(steps[2], phase>=3)}
          {phase===4 && <div className="text-sm text-green-700">完成：三变后的剩余为 {steps[2].to} → 除以 4 得到当前爻值。</div>}
        </div>
      )}
    </div>
  );
}
