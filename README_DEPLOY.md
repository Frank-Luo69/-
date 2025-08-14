# 部署说明（Vercel 主站 + 国内镜像）

## 1) Vercel 部署（主站）
1. 把代码推到 GitHub/GitLab/Bitbucket。
2. 登录 Vercel，点 **New Project** → 选择仓库 → Framework: Next.js → 直接 Deploy。
3. 在项目 Settings → **Domains** 添加你的域名（如 `app.example.com`），按提示在 DNS 里加 CNAME 记录（一般指向 `cname.vercel-dns.com`）。
4. 把本目录下的 `vercel.json` 放到项目根目录（与 `package.json` 同级），用于设置缓存策略：
   - `sw.js` 设为 `no-cache`，便于 PWA 即时更新；
   - 静态 `js/css` 走 `immutable` 长缓存。
5. 首次部署后，浏览器打开 `https://app.example.com` 即可。

CLI 方式：
```bash
npm i -g vercel
vercel           # 首次初始化
vercel --prod    # 正式部署
```

## 2) 国内镜像（静态导出 + OSS/CDN）
> 需要**只读静态**镜像：本项目是纯前端，无服务端 API，可直接静态化。

1. 在 `next.config.js` 打开：
   ```js
   output: 'export',
   // images: { unoptimized: true }
   ```
2. 新增脚本（在 package.json 的 scripts 里）：
   ```json
   "build:static": "next build && next export -o out"
   ```
3. 构建：
   ```bash
   npm run build:static
   ```
   生成的 `out/` 目录即静态站点（包含 `index.html`、`verify.html`、`sw.js`、`manifest.json` 等）。
4. 任选其一：
   - **阿里云 OSS + CDN**：创建存储桶，上传 `out/` 全部文件；为域名开启 CDN 加速，按需设置缓存、Brotli/Gzip、HTTPS。
   - **腾讯云 COS + CDN**：同理。
5. 重要：若使用**中国大陆节点**为你的**自有域名**提供加速，通常需要 **ICP备案**。未备案可选香港节点/海外节点。

## 3) 双域名方案与文案
- 主站（Vercel）：`app.example.com`
- 国内镜像（CDN）：`app-cn.example.com`
建议在应用 About/帮助里提示：
> 中国大陆网络不佳时，可切换访问 `app-cn.example.com`。

## 4) PWA 注意事项
- `public/sw.js` 版本号变化才会触发即时更新（本项目已使用 `VERSION = 'v11-...'`）。
- `vercel.json` 已为 `sw.js` 设定 `no-cache`。

## 5) 常见问题
- SW 没更新？ → 确认 `sw.js` 版本号变更、`vercel.json` 生效、尝试强刷（Cmd/Ctrl+Shift+R）。
- 静态镜像路由 404？ → 使用 `next export` 只能有静态路由；本项目使用根路由，不受影响。

---
文档参考：Vercel Next.js 部署、CLI、绑定自定义域名、缓存控制等官方文档。
