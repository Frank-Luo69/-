import texts from "@/data/zhouyi_texts.json";
import type { LineValue } from "./types";
import { toBinary } from "./yarrow";

export type ZhouyiTexts = {
  name: { zh:string; pinyin:string; en:string };
  texts: {
    gua: string;
    tuan: string;
    xiang: string;
    yao: [string, string, string, string, string, string];
    yong: string;
  };
};

export function patternFromLines(lines: [LineValue,LineValue,LineValue,LineValue,LineValue,LineValue]){
  // bottom->top binary string
  const bin = toBinary(lines);
  return `${bin[0]}${bin[1]}${bin[2]}${bin[3]}${bin[4]}${bin[5]}`;
}

export function getTextsByPattern(pattern: string): ZhouyiTexts | null {
  const t = (texts as any)[pattern];
  return t ?? null;
}
