# syntax=docker/dockerfile:1.7

# ---- base:统一基础镜像(Node 22 + pnpm via corepack) ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps:安装全部依赖(含 dev,构建需要) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---- build:产出 standalone 运行产物 ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
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
