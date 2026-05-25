import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 自托管 Docker 部署:产出 .next/standalone 最小运行产物(自带 server.js)
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  // 静态生成 / 取数阶段默认按 CPU 起多 worker(本机 19 个),每 worker 各建一个
  // DB 连接池;叠加 Neon 连接上限会间歇性 "too many clients"。这里把构建并发收敛到
  // 个位数(站点页数少,几乎无损构建速度),与 db 池的构建期 max:1 共同把并发连接压低。
  experimental: {
    cpus: 3,
    staticGenerationMinPagesPerWorker: 25,
  },
};

export default nextConfig;
