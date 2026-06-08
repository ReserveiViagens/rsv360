# Inventario React/Next — Trilha 0 T0.1
param(
  [string]$Root = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = 'Stop'
$logDir = Join-Path $Root 'docs\evidence\trilha-0\logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$tsv = Join-Path $logDir 'T0.1-INVENTORY.tsv'
$md = Join-Path $Root 'docs\evidence\trilha-0\T0.1-REACT-NEXT-INVENTORY.md'

$meta = @{
  'apps/site-publico' = @{ port = '3000'; next = '^15.5.18'; react = '19.2.5' }
  'apps/admin'        = @{ port = '3004'; next = '^15.5.16'; react = '^19.2.3' }
  'apps/guest'        = @{ port = '3006'; next = '^15.5.16'; react = '^19.2.3' }
  'apps/turismo'      = @{ port = '3005'; next = '^15.5.16'; react = '^19.2.3' }
  'packages/shared'   = @{ port = '-'; next = '-'; react = '-' }
  'backend'           = @{ port = '3002'; next = '-'; react = '-' }
}

function Get-Resolved($dir, $pkg) {
  Push-Location $dir
  try {
    $line = npm ls $pkg --depth=0 2>$null | Select-String "${pkg}@" | Select-Object -First 1
    if (-not $line) { return '-' }
    return ($line.ToString() -replace ".*@${pkg}@", '' -replace ' extraneous', '').Trim()
  } finally { Pop-Location }
}

"workspace`tport`tdev`tnext_decl`treact_decl`tnext_resolved`treact_resolved`treact_dom_resolved`ttypescript_resolved" | Set-Content $tsv -Encoding utf8

Push-Location $Root
try {
  foreach ($ws in @('root') + $meta.Keys) {
    $dir = if ($ws -eq 'root') { '.' } else { $ws }
    $m = if ($ws -eq 'root') { @{ port='-'; next='-'; react='^19.2.3' } } else { $meta[$ws] }
    $nr = if ($m.next -eq '-') { '-' } else { Get-Resolved $dir 'next' }
    $rr = Get-Resolved $dir 'react'
    $rd = Get-Resolved $dir 'react-dom'
    $ts = Get-Resolved $dir 'typescript'
    "$ws`t$($m.port)`t$($m.next)`t$($m.react)`t$nr`t$rr`t$rd`t$ts" | Add-Content $tsv
  }
} finally { Pop-Location }

Write-Host "Wrote $tsv"
Write-Host "Node: $(node -v)  npm: $(npm -v)"
Write-Host "Report: $md"
