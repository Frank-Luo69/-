"use client";
import React from "react";

export function HelpPanel() {
  return (
    <section className="rounded-2xl border p-4 shadow-sm bg-white">
      <details>
        <summary className="cursor-pointer text-base font-semibold">
          使用说明与提示
        </summary>
        <div className="mt-3 text-sm text-gray-800 space-y-2">
          <p>
            <b>1. 起卦</b>：点击「起卦」。种子留空即用安全随机；输入任意文字作为“种子”可复现场景。
          </p>
          <p>
            <b>2. 蓍草法流程</b>：每爻三变——第1变「分两堆、挂一、按四取余」，第2/3变「分两堆、按四取余」。
          </p>
          <p>
            <b>3. 读卦路径（朱熹）</b>：本卦为主、动爻为断；多动先取中位（二、五），次三、四；之卦可参不夺。
          </p>
          <p>
            <b>4. 过程明细</b>：页面展示每一爻三变的取走与剩余，便于验算与教学。
          </p>
          <p>
            <b>5. 随机与复现</b>：默认系统级安全随机；填入种子时使用可复现 PRNG，便于分享同一结果。
          </p>
          <p className="text-xs text-gray-500">
            注：本应用用于文化学习与研究，不构成现实决策建议。
          </p>
        </div>
      </details>
    </section>
  );
}
