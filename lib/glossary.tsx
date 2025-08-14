import glossData from "@/data/glossary.json";
import React from "react";

type GlossEntry = string | {
  def: string;
  pinyin?: string;
  en?: string;
  example?: string;
};

const raw: Record<string, GlossEntry> = glossData as any;
const terms = Object.keys(raw).sort((a,b)=>b.length-a.length); // 长词优先

function renderTip(term: string){
  const v = raw[term];
  if (typeof v === "string") return v;
  const parts = [];
  if (v.pinyin) parts.push(`【${v.pinyin}】`);
  if (v.en) parts.push(`(${v.en})`);
  parts.push(v.def);
  if (v.example) parts.push(`例：${v.example}`);
  return parts.join(" ");
}

export function withGlossary(text: string) {
  if (!text) return text;
  let parts: Array<string|JSX.Element> = [text];
  for (const term of terms) {
    const next: Array<string|JSX.Element> = [];
    for (const chunk of parts) {
      if (typeof chunk !== "string") { next.push(chunk); continue; }
      const split = chunk.split(term);
      for (let i=0; i<split.length; i++) {
        if (i>0) {
          next.push(<span key={term+"-"+i} className="underline decoration-dotted decoration-1" title={renderTip(term)}>{term}</span>);
        }
        next.push(split[i]);
      }
    }
    parts = next;
  }
  return <>{parts}</>;
}

export function GlossaryList(){
  const [q, setQ] = React.useState(""); // 搜索
  const list = React.useMemo(()=>{
    const arr = terms.map(t=>({term:t, entry: raw[t]}));
    if (!q) return arr;
    const s = q.trim().toLowerCase();
    return arr.filter(x=>{
      const v = x.entry;
      const within = (txt?:string)=> txt && txt.toLowerCase().includes(s);
      if (typeof v === "string") return within(x.term) || within(v);
      return within(x.term) || within(v.def) || within(v.pinyin) || within(v.en) || within(v.example);
    });
  }, [q]);

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-2">
        <div className="text-base font-semibold">术语小词典</div>
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="搜索术语/拼音/英文…"
          className="rounded-lg border px-2 py-1 text-sm w-48 dark:bg-neutral-800"
          aria-label="搜索术语"
        />
      </div>
      {list.length===0 ? (
        <div className="text-sm text-gray-600">未找到匹配术语。</div>
      ) : (
        <ul className="text-sm text-gray-800 dark:text-gray-200 list-disc ml-5 space-y-1">
          {list.map(x=>{
            const v = x.entry;
            const tip = renderTip(x.term);
            return (
              <li key={x.term}>
                <b title={tip}>{x.term}</b>：
                {typeof v === "string" ? v : (
                  <>
                    <span>{v.def}</span>
                    {v.pinyin && <span className="text-gray-500">　【{v.pinyin}】</span>}
                    {v.en && <span className="text-gray-500">（{v.en}）</span>}
                    {v.example && <span className="text-gray-500">　例：{v.example}</span>}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
