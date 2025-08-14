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
            <b>2. 复现</b>：点击「复制复现链接」分享给朋友；对方打开后会带着
            <code>?seed</code> /
            <code>?q</code> 参数自动还原。
          </p>
          <p>
            <b>3. 历史</b>：历史面板可一键恢复某次占问（会自动回填并重新起卦）。
          </p>
          <p className="text-xs text-gray-500">
            注：本页更注重「计算与逻辑」的准确性；文献系统可逐步扩展。
          </p>
        </div>
      </details>
    </section>
  );
}
