export type HistoryItem = {
  ts: string;
  seed: string;
  question?: string;
  lines: (6|7|8|9)[];
  relating: (6|7|8|9)[];
};

const KEY = "yarrow.history.v1";
const LIMIT = 50;

export function loadHistory(): HistoryItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return [];
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}

export function saveHistory(item: HistoryItem){
  if (typeof localStorage === "undefined") return;
  const arr = loadHistory();
  arr.unshift(item);
  while (arr.length > LIMIT) arr.pop();
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function clearHistory(){
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
