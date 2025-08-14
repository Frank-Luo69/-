/**
 * 抓取维基文库《周易》六十四卦原文，写入 data/zhouyi_texts.json
 * 运行：npm run fetch-texts
 * 说明：遵循维基文库 CC BY-SA 4.0；仅作学习研究用途。
 */
import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { TRIGRAM_NAMES } from "../lib/yarrow";
import { HEXAGRAM_NAME_MATRIX } from "../lib/hexanames";
import { toBinary } from "../lib/yarrow";

type LineValue = 6|7|8|9;
type Lines = [LineValue,LineValue,LineValue,LineValue,LineValue,LineValue];

const POS = ["初","二","三","四","五","上"] as const;
const HOST = "https://zh.wikisource.org";
const ROOT = "/wiki/周易"; // 页面前缀

function slugFromName(nameZh: string): string {
  // 直接使用简体名尝试，Wikisource 会自动重定向到繁体标题
  return `${ROOT}/${encodeURIComponent(nameZh)}`;
}

function normalize(s: string): string {
  return s
    .replace(/\[\d+\]/g, "")              // 删除脚注标号
    .replace(/\s+/g, " ")
    .replace(/：\s*/g, "：")
    .trim();
}

function idxFromYaoLabel(label: string): number | null {
  // 匹配“初六/初九/九二/六五/上九/上六”等
  for (let i=0;i<POS.length;i++){
    if (label.includes(POS[i])) return i;
  }
  return null;
}

async function fetchOne(nameZh: string) {
  const url = HOST + slugFromName(nameZh);
  const res = await fetch(url, { headers: { "user-agent": "yarrow-app/1.0" } });
  if (!res.ok) {
    throw new Error(`Fetch ${url} failed: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  const $root = $(".mw-parser-output").first();
  const out = {
    name: { zh: nameZh, pinyin: "", en: "" },
    texts: { gua: "", tuan: "", xiang: "", yao: ["","","","","",""] as [string,string,string,string,string,string], yong: "" }
  };

  let section: "gua"|"tuan"|"xiang"|"yao"|null = null;

  $root.children().each((_, el)=>{
    const node = $(el);
    const text = normalize(node.text() || "");
    if (!text) return;

    // 识别段落/小节标题
    const tag = (el.tagName || "").toLowerCase();
    const isHeading = tag.startsWith("h");

    if (isHeading) {
      if (/卦辞|卦辭/.test(text)) { section = "gua"; return; }
      if (/彖曰/.test(text)) { section = "tuan"; return; }
      if (/象曰/.test(text)) { section = "xiang"; return; }
      // 文言另行处理，不强制解析
    }

    // 用九/用六
    if (/^用九：/.test(text)) {
      out.texts.yong = text.replace(/^用九：/, "用九：").trim();
      return;
    }
    if (/^用六：/.test(text)) {
      out.texts.yong = text.replace(/^用六：/, "用六：").trim();
      return;
    }

    // 爻辞（常见以“初六：”等开头）
    if (/^(初六|初九|九二|六二|九三|六三|九四|六四|九五|六五|上九|上六)：/.test(text)) {
      const m = text.match(/^(初六|初九|九二|六二|九三|六三|九四|六四|九五|六五|上九|上六)：/);
      if (m) {
        const label = m[1];
        const idx = idxFromYaoLabel(label);
        if (idx !== null) {
          out.texts.yao[idx] = text;
        }
      }
      return;
    }

    // 按当前 section 填充
    if (section === "gua") {
      if (!out.texts.gua) out.texts.gua = text;
      return;
    }
    if (section === "tuan") {
      if (!out.texts.tuan) out.texts.tuan = text;
      return;
    }
    if (section === "xiang") {
      if (!out.texts.xiang) out.texts.xiang = text;
      return;
    }
  });

  return out;
}

function keyFromTrigrams(lowerZh: string, upperZh: string): string {
  // 将上下卦确定为二进制模式 key：底→顶
  // TRIGRAM_NAMES 的 key 是 "111" 等，需要反推当前卦的上下三画
  // 这里仅用于生成 JSON 索引，可直接返回名称组合
  return `${lowerZh}-${upperZh}`;
}

async function main() {
  // 构造 64 卦名表（按后天八卦顺序映射）
  const trigramOrder = ["乾","兑","离","震","巽","坎","艮","坤"];
  const names: Array<{lower:string; upper:string; hex:string}> = [];
  for (const lower of trigramOrder) {
    for (const upper of trigramOrder) {
      const hex = HEXAGRAM_NAME_MATRIX[lower][upper];
      names.push({ lower, upper, hex });
    }
  }

  const result: any = {};
  for (const item of names) {
    try {
      const rec = await fetchOne(item.hex);
      result[`${item.lower}-${item.upper}`] = rec;
      console.log("OK:", item.hex);
      await new Promise(r=>setTimeout(r, 300)); // 轻缓请求
    } catch (e:any) {
      console.error("FAIL:", item.hex, e?.message || e);
      result[`${item.lower}-${item.upper}`] = { name: { zh: item.hex, pinyin:"", en:"" }, texts: { gua:"", tuan:"", xiang:"", yao:["","","","","",""], yong:"" } };
    }
  }

  const outPath = path.join(process.cwd(), "data", "zhouyi_texts.json");
  await fs.writeFile(outPath, JSON.stringify(result, null, 2), "utf-8");
  console.log("已写入", outPath);
}

main().catch(err=>{ console.error(err); process.exit(1); });
