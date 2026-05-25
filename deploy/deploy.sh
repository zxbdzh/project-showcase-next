#!/usr/bin/env bash
# 一键部署:在服务器仓库根目录执行 `bash deploy/deploy.sh`
# 前置:已装 docker + docker compose;仓库根目录已有填好的 .env
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "✗ 缺少 .env(部署所需的环境变量),请先从 .env.example 复制并填写" >&2
  exit 1
fi

echo "==> 拉取最新代码"
git pull --ff-only

echo "==> 构建镜像(.env 作为构建密钥注入,NEXT_PUBLIC_* 在此内联)"
DOCKER_BUILDKIT=1 docker compose build

# 首次部署或改了 src/db/schema 后,同步数据库结构(取消注释执行):
#   docker compose run --rm migrate

echo "==> 启动 / 滚动更新容器"
docker compose up -d

echo "==> 清理悬空镜像"
docker image prune -f

echo "==> 完成,当前状态:"
docker compose ps
