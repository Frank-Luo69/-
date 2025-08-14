/**
 * 运行：pnpm simulate
 * 作用：大量模拟生成单爻，统计 6/7/8/9 分布，验证是否接近 1/16, 5/16, 7/16, 3/16。
 */
import { mulberry32 } from "../lib/random";
import { generateLineYarrow } from "../lib/yarrow";

const N = 200_000; // 可调大一些
const rng = mulberry32(123456789);
const counts = {6:0,7:0,8:0,9:0} as Record<6|7|8|9, number>;

for (let i=0;i<N;i++){
  const { value } = generateLineYarrow(rng);
  counts[value]++;
}

function pct(x:number){ return (x/N*100).toFixed(3) + "%"; }

console.log("样本量:", N);
console.log("6(老阴):", counts[6], pct(counts[6]), "  期望≈", (1/16*100).toFixed(2)+"%");
console.log("7(少阳):", counts[7], pct(counts[7]), "  期望≈", (5/16*100).toFixed(2)+"%");
console.log("8(少阴):", counts[8], pct(counts[8]), "  期望≈", (7/16*100).toFixed(2)+"%");
console.log("9(老阳):", counts[9], pct(counts[9]), "  期望≈", (3/16*100).toFixed(2)+"%");
