"use client";
import React from "react";

type LineValue = 6|7|8|9;
type Lines = [LineValue,LineValue,LineValue,LineValue,LineValue,LineValue];

function LineView({v}:{v:LineValue}) {
  const isYang = v===7||v===9;
  const isMoving = v===6||v===9;
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-44">
          {!isYang ? (
            <div className="flex w-44 justify-between items-center">
              <div className="bg-black h-2 w-[42%] rounded" />
              <div className="w-[16%]" />
              <div className="bg-black h-2 w-[42%] rounded" />
            </div>
          ) : (
            <div className="bg-black h-2 w-44 rounded" />
          )}
        </div>
        {isMoving && (
          <div className="absolute -left-8 -top-2 text-xs text-gray-500">动</div>
        )}
      </div>
      <div className="text-xs text-gray-700">{v}</div>
    </div>
  );
}

export function HexagramCard({title, lines}:{title:string; lines:Lines}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-base font-semibold mb-3">{title}</div>
      <div className="flex flex-col gap-2">
        {([...lines].reverse() as LineValue[]).map((v, idx)=>(<LineView key={idx} v={v} />))}
      </div>
    </div>
  );
}
