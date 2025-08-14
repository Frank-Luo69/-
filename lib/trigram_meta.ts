export type TrigramMeta = {
  zh: string; symbol: string;
  element: "金" | "木" | "水" | "火" | "土";
  direction: "北" | "南" | "东" | "西" | "东北" | "东南" | "西北" | "西南";
  image: string; // 取象
  virtue: string; // 德性关键词
  actions: string[]; // 建议方向词
};

export const TRIGRAM_META: Record<"111"|"110"|"101"|"100"|"011"|"010"|"001"|"000", TrigramMeta> = {
  "111": { zh:"乾", symbol:"☰", element:"金", direction:"西北", image:"天", virtue:"健", actions:["开创","担当","升级","进取"] },
  "110": { zh:"兑", symbol:"☱", element:"金", direction:"西", image:"泽", virtue:"悦", actions:["协调","沟通","庆贺","分享"] },
  "101": { zh:"离", symbol:"☲", element:"火", direction:"南", image:"火", virtue:"明", actions:["昭示","审视","学习","宣传"] },
  "100": { zh:"震", symbol:"☳", element:"木", direction:"东", image:"雷", virtue:"动", actions:["启动","出发","惊醒","决断"] },
  "011": { zh:"巽", symbol:"☴", element:"木", direction:"东南", image:"风（木）", virtue:"入", actions:["渗透","协商","长期经营","顺势"] },
  "010": { zh:"坎", symbol:"☵", element:"水", direction:"北", image:"水", virtue:"险", actions:["防守","探查","调研","保全"] },
  "001": { zh:"艮", symbol:"☶", element:"土", direction:"东北", image:"山", virtue:"止", actions:["止损","定界","收敛","沉淀"] },
  "000": { zh:"坤", symbol:"☷", element:"土", direction:"西南", image:"地", virtue:"顺", actions:["承载","配合","培育","后勤"] },
};
