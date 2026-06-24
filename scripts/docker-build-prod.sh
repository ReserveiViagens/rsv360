#!/usr/bin/env bash
# Build de imagens de produção (multi-stage) — Fase 5
set -euo pipefail
cd "$(dirname "$0")/.."

echo "🔨 Building production images..."
docker compose -f docker-compose.prod.yml build \
  backend site-publico turismo admin guest

echo "✅ Build concluído. Subir com:"
echo "   docker compose -f docker-compose.prod.yml up -d"
