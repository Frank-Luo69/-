"use client";
import React, { useMemo, useState } from "react";
import { HexagramCard } from "@/components/HexagramCard";
import { adviseZhuXi } from "@/lib/zhuxi";
import { AdviceCard } from "@/components/AdviceCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Onboarding } from "@/components/Onboarding";
import { PWARegister } from "@/components/PWARegister";
import { ClassicTexts } from "@/components/ClassicTexts";
import { PlainAid } from "@/components/PlainAid";
import { GlossaryList } from "@/lib/glossary";
import { YarrowAnimator } from "@/components/YarrowAnimator";
import { ReportExport } from "@/components/ReportExport";
import { HistoryPanel } from "@/components/HistoryPanel";
import { SWUpdateToast } from "@/components/SWUpdateToast";
import { saveHistory } from "@/lib/history";
import { HelpPanel } from "@/components/HelpPanel";
import {
  generateHexagramYarrow,
  toBinary,
  splitTrigrams,
  TRIGRAM_NAMES,
  trigramKey,
} from "@/lib/yarrow";
import { cryptoRNG, mulberry32 } from "@/lib/random";

export default function Page() {
  const [seedText, setSeedText] = useState<string>
      <PWARegister />
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">大衍筮法 · 准确实现</h1>
        <ThemeToggle />
      </div>("");
  const [question, setQuestion] = useState<string>(\"\");
  const [result, setResult] = useState<any>(null);
  const advice = useMemo(()=> result ? adviseZhuXi(result.lines) : null, [result]);

  const rng = useMemo(()=>{
    if (!seedText) return cryptoRNG;
    let seed = 0;
    for (let i=0;i<seedText.length;i++){
      seed = (seed * 131 + seedText.charCodeAt(i)) >>> 0;
    }
    return mulberry32(seed || 1);
  }, [seedText]);

  const handleCast = ()=>{
    const r = generateHexagramYarrow(rng);
    setResult(r);
    try {
      saveHistory({ ts: new Date().toISOString(), seed: seedText || "(secure-random)", question, lines: r.lines as any, relating: r.relating as any });
    } catch {}
  };

  const lowerInfo = React.useMemo(()=>{
    if (!result) return null;
    const bin = toBinary(result.lines);
    const { lower, upper } = splitTrigrams(bin);
    const lowerName = TRIGRAM_NAMES[`${lower[0]}${lower[1]}${lower[2]}`];
    const upperName = TRIGRAM_NAMES[`${upper[0]}${upper[1]}${upper[2]}`];
    return { lowerName, upperName };
  }, [result]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold mb-1">大衍筮法 · 准确实现</h1>
      <p className="text-gray-600 mb-6">蓍草法“三变成一爻、六爻成卦”严谨复现。留空使用安全随机；输入种子以复现结果。</p>

      <Onboarding />
          <HelpPanel />

      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">可选种子（留空=安全随机）</label>
          <input
            value={seedText}
            onChange={e=>setSeedText(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="例如：my-seed-2025-08-14"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">问题/占问（可选）</label>
          <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="例如：求学业/求职/创业…" className="w-full rounded-xl border px-3 py-2" />
          <div className="flex gap-2">
            <button onClick={handleCast} className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90">起卦</button>
            <button onClick={copyReproduceLink} className="rounded-xl border px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800">复制复现链接</button>
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HexagramCard title="本卦" lines={result.lines} />
          <HexagramCard title="之卦" lines={result.relating} />
          <div className="rounded-2xl border p-4 shadow-sm bg-white md:col-span-2">
            <div className="text-base font-semibold mb-3">八卦信息</div>
            <div className="text-sm text-gray-700">
              <div>下卦：{lowerInfo?.lowerName.symbol} {lowerInfo?.lowerName.zh} ({lowerInfo?.lowerName.pinyin})</div>
              <div>上卦：{lowerInfo?.upperName.symbol} {lowerInfo?.upperName.zh} ({lowerInfo?.upperName.pinyin})</div>
              <div className="mt-2 text-xs text-gray-500">注：本页侧重“计算与逻辑”的准确实现。卦名/卦序库可后续扩展。</div>
            </div>
          </div>
          <div className="rounded-2xl border p-4 shadow-sm bg-white md:col-span-2">
            <div className="text-base font-semibold mb-3">过程明细（每爻三变）</div>
            <pre className="whitespace-pre-wrap text-xs text-gray-700">
{JSON.stringify(result.detail, null, 2)}
            </pre>
          </div>
          <div className="rounded-2xl border p-4 shadow-sm bg-white md:col-span-2">
            <div className="text-base font-semibold mb-3">互卦 / 综卦 / 错卦（二进制展示）</div>
            <pre className="whitespace-pre-wrap text-xs text-gray-700">
{JSON.stringify({
  nuclear: result.nuclear,
  inverted: result.inverted,
  opposite: result.opposite
}, null, 2)}
            </pre>
          </div>
                  <AdviceCard advice={advice} />
          <PlainAid advice={advice} lines={result.lines} />
          <ClassicTexts lines={result.lines} primary={advice?.primaryLines||[]} allMoving={(advice?.movingCount||0)===6} />
          <GlossaryList />
          <HistoryPanel onRestore={(s,q)=>{ setSeedText(s); setQuestion(q||""); setTimeout(()=>handleCast(),0); }} />
          <SWUpdateToast />
          <YarrowAnimator result={result} />
          <ReportExport result={result} advice={advice} seed={seedText} />
        </div>
      )}
    </main>
  );
}
