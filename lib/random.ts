export interface RNG {
  next(): number; // [0,1)
}

// Web Crypto 优先，Node 兜底
export const cryptoRNG: RNG = {
  next() {
    const buf = new Uint32Array(1);
    if (typeof globalThis !== "undefined" && typeof globalThis.crypto !== "undefined" && "getRandomValues" in globalThis.crypto) {
      globalThis.crypto.getRandomValues(buf);
      return (buf[0] >>> 0) / 2 ** 32;
    } else {
      // Node 环境
      const { randomBytes } = require("crypto");
      const n = randomBytes(4).readUInt32BE(0);
      return (n >>> 0) / 2 ** 32;
    }
  },
};

// 可复现 PRNG：Mulberry32
export function mulberry32(seed: number): RNG {
  let t = seed >>> 0;
  return {
    next() {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 2 ** 32;
    },
  };
}

export function randomInt(min: number, max: number, rng: RNG = cryptoRNG): number {
  const u = rng.next();
  return Math.floor(u * (max - min + 1)) + min; // [min,max]
}
