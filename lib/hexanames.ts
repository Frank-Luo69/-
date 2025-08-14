export const TRIGRAM_ORDER = ["乾","兑","离","震","巽","坎","艮","坤"] as const;

export const HEXAGRAM_NAME_MATRIX: Record<string, Record<string, string>> = {
  "乾": { "乾":"乾","兑":"夬","离":"大有","震":"大壮","巽":"小畜","坎":"需","艮":"大畜","坤":"泰" },
  "兑": { "乾":"履","兑":"兑","离":"睽","震":"归妹","巽":"中孚","坎":"节","艮":"损","坤":"临" },
  "离": { "乾":"同人","兑":"革","离":"离","震":"丰","巽":"家人","坎":"既济","艮":"贲","坤":"明夷" },
  "震": { "乾":"无妄","兑":"随","离":"噬嗑","震":"震","巽":"益","坎":"屯","艮":"颐","坤":"复" },
  "巽": { "乾":"姤","兑":"大过","离":"鼎","震":"恒","巽":"巽","坎":"井","艮":"蛊","坤":"升" },
  "坎": { "乾":"讼","兑":"困","离":"未济","震":"解","巽":"涣","坎":"坎","艮":"蒙","坤":"师" },
  "艮": { "乾":"遯","兑":"咸","离":"旅","震":"小过","巽":"渐","坎":"蹇","艮":"艮","坤":"谦" },
  "坤": { "乾":"否","兑":"萃","离":"晋","震":"豫","巽":"观","坎":"比","艮":"剥","坤":"坤" },
};

export function hexagramNameFromTrigrams(lowerZh: string, upperZh: string): string | null {
  const row = HEXAGRAM_NAME_MATRIX[lowerZh];
  if (!row) return null;
  return row[upperZh] ?? null;
}

export function wikisourceSlug(nameZh: string): string {
  // Wikisource uses traditional titles; map simplified -> traditional for known variants
  const map: Record<string,string> = {
    "兑":"兌","颐":"頤","蛊":"蠱","涣":"渙","谦":"謙","观":"觀","贲":"賁","复":"復","剥":"剝","讼":"訟",
    "丰":"豐","渐":"漸","离":"離","坎":"坎","咸":"咸","夬":"夬","晋":"晉","遗":"遺",
    "随":"隨","噬嗑":"噬嗑","归妹":"歸妹","节":"節","无妄":"无妄","困":"困","豫":"豫","观":"觀",
    "既济":"既濟","未济":"未濟","渙":"渙","蹇":"蹇","谦":"謙","贲":"賁","萃":"萃","颐":"頤","渐":"漸",
  };
  // First try identity; if not, try mapped traditional
  return map[nameZh] ?? nameZh;
}
