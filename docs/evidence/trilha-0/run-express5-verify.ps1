# E5 Express 5 verify — script reprodutivel (montanha D)
param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
)

$LogDir = Join-Path $PSScriptRoot 'logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

Push-Location (Join-Path $Root 'backend')
npx -y npm@10.9.7 ls express --depth=0 2>&1 | Tee-Object (Join-Path $LogDir 'express5-npm-ls.log')
node -e "require('fs').writeFileSync('$((Join-Path $LogDir 'express5-version.txt') -replace '\\','/')', require('express/package.json').version + '\n')"
Pop-Location

Push-Location $Root
docker compose -p rsv360 exec backend node -e "console.log(require('express/package.json').version)" 2>&1 |
  Add-Content (Join-Path $LogDir 'express5-version.txt')
& (Join-Path $Root 'docs\evidence\g4-kickoff\run-api-p0-round1.ps1')
Copy-Item (Join-Path $Root 'docs\evidence\g4-kickoff\logs\API-P0-SUMMARY.tsv') (Join-Path $LogDir 'express5-api-p0-summary.tsv') -Force
Pop-Location

Write-Host "Done. See $LogDir and E5-EXPRESS5-BACKEND-VERIFY.md"
