// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 如果希望生成纯静态镜像用于国内 CDN，请取消下一行注释：
  // output: 'export',
  reactStrictMode: true,
  // images: { unoptimized: true }, // 如果使用 export 模式且用到了 next/image，请取消注释
};
module.exports = nextConfig;
