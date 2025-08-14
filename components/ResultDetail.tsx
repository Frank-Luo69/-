"use client";
import React from "react";
import type { LineValue } from "@/lib/types";

export function ResultDetail({detail}:{detail:any[]}){
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-base font-semibold mb-3">过程明细（教学/验算）</div>
      <pre className="whitespace-pre-wrap text-xs text-gray-700">
        {JSON.stringify(detail, null, 2)}
      </pre>
    </div>
  );
}
