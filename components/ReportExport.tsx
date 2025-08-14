
"use client";
import React from "react";
import { getTextsByPattern, patternFromLines } from "@/lib/texts";
import { APP_VERSION, KERNEL_SHA256, BUILD_TIME_ISO } from "@/lib/version";

const POS = ["初","二","三","四","五","上"];
type LineValue = 6|7|8|9;

function LinesView({lines}:{lines:[LineValue,LineValue,LineValue,LineValue,LineValue,LineValue]}){
  const row = (v:LineValue, k:number)=>{
    const isYang = v===7||v===9;
    const isMoving = v===6||v===9;
    return (
      <div key={k} className="flex items-center gap-2">
        <div className="relative">
          <div className="w-36">
            {!isYang ? (
              <div className="flex w-36 justify-between items-center">
                <div className="bg-black h-2 w-[42%] rounded" />
                <div className="w-[16%]" />
                <div className="bg-black h-2 w-[42%] rounded" />
              </div>
            ) : (
              <div className="bg-black h-2 w-36 rounded" />
            )}
          </div>
          {isMoving && <div className="absolute -left-7 -top-2 text-xs text-gray-500">动</div>}
        </div>
        <div className="text-xs text-gray-700">{v}</div>
      </div>
    );
  };
  return <div className="flex flex-col gap-1">{([...lines].reverse() as any[]).map(row)}</div>;
}

async function sha256Hex(s: string){
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export function ReportExport({result, advice, seed}:{result:any; advice:any; seed:string}){
  const ref = React.useRef<HTMLDivElement|null>(null);
  const [busy, setBusy] = React.useState(false);
  const [commit, setCommit] = React.useState<string>("");
  const [qrUrl, setQrUrl] = React.useState<string>("");
  const [payload, setPayload] = React.useState<string>("");

  const ts = React.useMemo(()=> new Date().toISOString(), []);
  const movingIdxs: number[] = React.useMemo(()=>{
    if (!result) return [];
    const arr:number[] = [];
    (result.lines as LineValue[]).forEach((v,i)=>{ if (v===6||v===9) arr.push(i); });
    return arr;
  }, [result]);

  const pattern = React.useMemo(()=> result ? patternFromLines(result.lines) : "", [result]);
  const texts = React.useMemo(()=>{
    if (!result) return null;
    return getTextsByPattern(pattern);
  }, [pattern, result]);

  const movingTexts = React.useMemo(()=>{
    if (!texts) return [];
    return movingIdxs.map(i=>({ i, label: POS[i], yao: (texts as any).texts?.yao?.[i] || "（本地未内置，可抓取/在线查看）" }));
  }, [texts, movingIdxs]);

  React.useEffect(()=>{
    (async ()=>{
      if (!result) return;
      const reportFingerprint = { appVersion: APP_VERSION, kernelSha256: KERNEL_SHA256, buildTime: BUILD_TIME_ISO,
        ts,
        seed: seed || "(secure-random)",
        lines: result.lines,
        relating: result.relating,
        movingIdxs,
        pattern,
      };
      const json = JSON.stringify(reportFingerprint);
      setPayload(json);
      const h = await sha256Hex(json);
      setCommit(h);
      try {
        const { default: QRCode } = await import("qrcode");
        const url = await QRCode.toDataURL(JSON.stringify({t:ts, c:h}).slice(0, 400));
        setQrUrl(url);
      } catch(e){
        setQrUrl(""); // 忽略 QR 错误
      }
    })();
  }, [result, seed, ts, pattern, movingIdxs]);

  const doExport = async (fmt:"png"|"pdf")=>{
    if (!ref.current || !result) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const dataUrl = canvas.toDataURL("image/png");

      if (fmt === "png") {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `卦象报告-${new Date().toISOString().slice(0,19)}.png`;
        a.click();
      } else {
        const pdf = new jsPDF({orientation: "portrait", unit: "pt", format: "a4"});
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 64;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        pdf.addImage(dataUrl, "PNG", 32, 32, imgWidth, Math.min(imgHeight, pageHeight-64));
        pdf.save(`卦象报告-${new Date().toISOString().slice(0,19)}.pdf`);
      }
    } finally {
      setBusy(false);
    }
  };

  const copyPayload = async ()=>{
    try {
      await navigator.clipboard.writeText(payload);
    } catch {}
  };

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-base font-semibold">导出报告（含爻辞原文与二维码校验）</div>
        <div className="flex gap-2">
          <button onClick={()=>doExport("png")} disabled={busy || !result} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50">导出 PNG</button>
          <button onClick={()=>doExport("pdf")} disabled={busy || !result} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50">导出 PDF</button>
        </div>
      </div>

      <div ref={ref} className="bg-white p-4 rounded-xl border">
        <div className="text-lg font-semibold mb-2">起卦报告</div>
        <div className="text-xs text-gray-500 mb-3">{new Date().toLocaleString()} · 指纹校验哈希（SHA-256）：<span className="font-mono">{commit.slice(0,16)}…</span><br/>版本：<span className="font-mono">{APP_VERSION}</span> · 内核：<span className="font-mono">{KERNEL_SHA256.slice(0,16)}…</span></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="font-medium mb-2">本卦</div>
            <LinesView lines={result.lines} />
          </div>
          <div>
            <div className="font-medium mb-2">之卦</div>
            <LinesView lines={result.relating} />
          </div>

          <div className="md:col-span-2">
            <div className="font-medium mb-2">动爻爻辞原文</div>
            {movingTexts.length === 0 ? (
              <div className="text-sm text-gray-600">无动爻：以卦辞与大象为主。</div>
            ) : (
              <ul className="text-sm text-gray-800 list-disc ml-5 space-y-1">
                {movingTexts.map(m => (<li key={m.i}><b>{m.label}：</b>{m.yao}</li>))}
              </ul>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="font-medium mb-1">解读建议（朱熹本义）</div>
            <div className="text-sm text-gray-800">{advice?.summary}</div>
            {advice?.special && <div className="text-sm text-amber-700 mt-1">特别提示：{advice.special}</div>}
          </div>

          <div className="md:col-span-2">
            <div className="font-medium mb-1">二维码校验</div>
            <div className="text-xs text-gray-700 mb-1">二维码携带本次起卦的时间与哈希摘要；任意人可据下方“校验负载”与算法离线重算 SHA-256，与哈希比对即可验证。</div>
            <div className="flex items-center gap-6">
              {qrUrl ? <img src={qrUrl} alt="qr" className="w-28 h-28 border rounded" /> : <div className="text-xs text-gray-500">二维码生成中或暂不可用</div>}
              <div className="text-xs text-gray-600">
                校验负载（可复制）：<br />
                <textarea readOnly value={payload} className="w-96 h-16 border rounded p-1 font-mono text-[11px]" />
                <div className="mt-1">
                  <button onClick={copyPayload} className="rounded border px-2 py-0.5 text-xs hover:bg-gray-50">复制</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-500 mt-4">
          注：本报告用于文化学习与研究；“校验负载”为 JSON：{ts, seed, lines, relating, movingIdxs, pattern}。校验算法为浏览器 SubtleCrypto 的 SHA-256。若未输入种子，seed 记为 "(secure-random)"。
        </div>
      </div>
    </div>
  );
}
