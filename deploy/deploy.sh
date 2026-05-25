#!/usr/bin/env bash
# 一键部署:在服务器仓库根目录执行 `bash deploy/deploy.sh`
# 镜像由 GitHub Actions 在 ARM64 runner 构建并推送到 GHCR,本机只拉取运行、不再本地构建。
# 前置:已装 docker + docker compose;仓库根目录有填好的【运行期】.env
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "✗ 缺少 .env(运行期环境变量),请先从 .env.example 复制并填写" >&2
  exit 1
fi

echo "==> 拉取最新代码(获取最新 docker-compose.yml)"
git pull --ff-only

# 若 GHCR 镜像包设为私有,需先登录(公开包可跳过):
#   echo "$GHCR_PAT" | docker login ghcr.io -u zxbdzh --password-stdin

echo "==> 拉取最新镜像"
docker compose pull

echo "==> 启动 / 滚动更新容器"
docker compose up -d

echo "==> 清理悬空镜像"
docker image prune -f

echo "==> 完成,当前状态:"
docker compose ps
