"use client";
import React from "react";
import { loadHistory, clearHistory, HistoryItem } from "@/lib/history";

export function HistoryPanel({onRestore}:{onRestore:(seed:string, q?:string)=>void}){
  const [items, setItems] = React.useState<HistoryItem[]>([]);

  const refresh = ()=> setItems(loadHistory());
  React.useEffect(()=>{ refresh(); }, []);

  const doClear = ()=>{ if (confirm("确定清空起卦历史？")) { clearHistory(); refresh(); } };

  const exportJSON = ()=>{
    const blob = new Blob([JSON.stringify(items, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `yarrow-history-${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 500);
  };

  const copyLink = (seed:string, q?:string)=>{
    const url = new URL(window.location.href);
    url.searchParams.set("seed", seed);
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("autoplay", "1");
    navigator.clipboard.writeText(url.toString()).catch(()=>{});
  };

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-2">
        <div className="text-base font-semibold">起卦历史</div>
        <div className="flex gap-2">
          <button onClick={exportJSON} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">导出 JSON</button>
          <button onClick={doClear} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">清空</button>
        </div>
      </div>
      {items.length===0 ? (
        <div className="text-sm text-gray-600">暂无历史。点击“起卦”后，这里会记录最近结果（仅保存在本机）。</div>
      ) : (
        <div className="text-sm text-gray-800 dark:text-gray-200 divide-y">
          {items.map((it, idx)=>(
            <div key={idx} className="py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate"><span className="text-gray-500 text-xs">{new Date(it.ts).toLocaleString()}</span> · seed=<span className="font-mono">{it.seed||"(secure-random)"}</span>{it.question?` · ${it.question}`:""}</div>
                <div className="text-xs text-gray-500 truncate">本卦：[{it.lines.join(", ")}] → 之卦：[{it.relating.join(", ")}]</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={()=>copyLink(it.seed, it.question)} className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800">复制复现链接</button>
                <button onClick={()=>onRestore(it.seed, it.question)} className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800">复现</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
