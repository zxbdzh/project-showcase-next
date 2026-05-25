# syntax=docker/dockerfile:1.7

# ---- base:统一基础镜像(Node 22 + pnpm via corepack) ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- build:就地安装依赖并产出 standalone 运行产物 ----
# 不拆分独立的 deps 阶段:pnpm 的 node_modules 含海量小文件(.pnpm 虚拟 store + 符号链接),
# 跨阶段 COPY 在慢速磁盘(如 NAS)上极慢(可达十几分钟)。同阶段安装即可消除该巨型拷贝;
# 依赖未变时 install 层仍命中 Docker 层缓存,缓存效率与拆分阶段相当。
FROM base AS build
# pnpm-workspace.yaml 必须一起复制:其中的 allowBuilds 声明了 esbuild/sharp/unrs-resolver
# 允许执行构建脚本;缺它则 pnpm 10+ 会拦截这些原生依赖的构建并以 exit 1 失败。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
# .env 通过 BuildKit secret 注入(不会写进镜像层):
#  1) NEXT_PUBLIC_* 会在构建时内联进客户端 bundle —— 必须在 build 阶段就正确;
#  2) cacheComponents/PPR 的静态生成会连数据库 —— 构建期也需要 DATABASE_URL。
RUN --mount=type=secret,id=dotenv,target=/app/.env \
    pnpm build

# ---- tools:执行 db:push / db:seed(保留源码与全量依赖) ----
FROM build AS tools
CMD ["pnpm", "db:push"]

# ---- runner:最小运行镜像,仅含 standalone 产物 ----
FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
