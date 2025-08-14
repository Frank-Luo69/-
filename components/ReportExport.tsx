"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Props = {
  result: any;
  advice: any;
  seed: string;
};

export function ReportExport({ result, advice, seed }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // 生成带参数的复现链接（若你不想暴露 question，可去掉）
  const shareUrl = useMemo(() => {
    try {
      const url = new URL(typeof window !== "undefined" ? window.location.href : "https://example.com");
      if (seed) url.searchParams.set("seed", seed);
      else url.searchParams.delete("seed");
      return url.toString();
    } catch {
      return "";
    }
  }, [seed]);

  // 动态导入 qrcode，仅在客户端执行
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!shareUrl) return;
        const QR = await import("qrcode");
        const dataUrl = await QR.default.toDataURL(shareUrl, { margin: 1 });
        if (mounted) setQrDataUrl(dataUrl);
      } catch (e) {
        console.warn("QR generation failed:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [shareUrl]);

  const handleExportPNG = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "yarrow-report.png";
    a.click();
  };

  const handleExportPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    // A4 纵向
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // 按宽铺满，等比缩放
    const imgWidth = pageWidth - 20; // 左右各留 10mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const y = Math.max(10, (pageHeight - imgHeight) / 2);
    pdf.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
    pdf.save("yarrow-report.pdf");
  };

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white md:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base font-semibold">导出报告</div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPNG}
            className="rounded-xl border px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            导出 PNG
          </button>
          <button
            onClick={handleExportPDF}
            className="rounded-xl border px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            导出 PDF
          </button>
        </div>
      </div>

      {/* 导出卡片主体（会被截图） */}
      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <div className="text-sm text-gray-700">
            <div className="font-medium">复现种子：</div>
            <div className="break-all">{seed || "(secure-random)"}</div>
          </div>

          <div className="text-sm text-gray-700">
            <div className="font-medium">本卦 / 之卦：</div>
            <pre className="whitespace-pre-wrap text-xs">
{JSON.stringify(
  {
    lines: result?.lines,
    relating: result?.relating
  },
  null,
  2
)}
            </pre>
          </div>

          <div className="text-sm text-gray-700">
            <div className="font-medium">建议（朱熹取义）：</div>
            <pre className="whitespace-pre-wrap text-xs">
{JSON.stringify(advice, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-sm text-gray-600">复现链接二维码</div>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="复现链接二维码"
              className="w-40 h-40 border rounded-md"
            />
          ) : (
            <div className="w-40 h-40 border rounded-md grid place-items-center text-xs text-gray-500">
              正在生成…
            </div>
          )}
          <a
            className="text-xs text-blue-600 underline break-all"
            href={shareUrl || "#"}
            target="_blank"
            rel="noreferrer"
          >
            {shareUrl || "（无链接）"}
          </a>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        注：报告仅用于学习研究；二维码与链接用于结果复现。
      </div>
    </div>
  );
}
