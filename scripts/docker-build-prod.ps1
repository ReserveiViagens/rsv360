# Build de imagens de produção (multi-stage) — Fase 5
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host 'Building production images...'
docker compose -f docker-compose.prod.yml build backend site-publico turismo admin guest

Write-Host 'Build concluido. Subir com: docker compose -f docker-compose.prod.yml up -d'
