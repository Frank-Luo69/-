import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "大衍筮法 · 准确实现",
  description: "蓍草法三变成爻、六爻成卦的最优实现（含教学与可验证随机）。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#f6f7f9] text-black dark:bg-neutral-950 dark:text-neutral-100">{children}</body>
    </html>
  );
}
