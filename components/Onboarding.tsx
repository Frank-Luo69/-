"use client";
import React from "react";

export function Onboarding(){
  const [open, setOpen] = React.useState(true);
  React.useEffect(()=>{
    try {
      const v = localStorage.getItem("onboarding.v1");
      if (v === "dismissed") setOpen(false);
    } catch {}
  }, []);
  const dismiss = ()=>{
    setOpen(false);
    try { localStorage.setItem("onboarding.v1", "dismissed"); } catch {}
  };
  if (!open) return null;
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">快速上手（3步）</div>
        <button onClick={dismiss} aria-label="关闭引导" className="rounded-lg border px-2 py-0.5 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800">关闭</button>
      </div>
      <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-gray-800 dark:text-gray-200">
        <li>在「问题/占问」里写上你要问的事（可留空）。</li>
        <li>点击「起卦」，查看本卦与动爻（动爻读爻辞为主）。</li>
        <li>展开「经典原文」区，可切换原文/白话并查看术语提示（带虚线下划线，悬停可看解释）。</li>
      </ol>
      <div className="text-xs text-gray-500 mt-2">提示：本应用用于文化学习与研究，不构成现实决策建议。</div>
    </div>
  );
}
