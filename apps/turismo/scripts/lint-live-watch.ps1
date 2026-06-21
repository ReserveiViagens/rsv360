# Lint #237 — painel ao vivo (atualiza HTML a cada 3s)
$turismo = Split-Path $PSScriptRoot -Parent
$repo = Split-Path $turismo -Parent
$outDir = Join-Path $repo "docs\evidence\issue-237"
$htmlPath = Join-Path $outDir "lint-live-dashboard.html"
$logPath = Join-Path $outDir "lint-live.log"

function Write-Log($msg) {
  $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
  Add-Content -Path $logPath -Value $line -Encoding UTF8
}

Write-Log "Watcher iniciado — repo: $repo"

while ($true) {
  try {
    Push-Location $repo
    $branch = git branch --show-current 2>$null
    $lastCommit = (git log -1 --oneline 2>$null)
    $recent = (git log --oneline -8 2>$null) -join "`n"

    $clustersJson = Get-Content (Join-Path $turismo "scripts\lint-237-clusters.json") -Raw | ConvertFrom-Json
    $done = @($clustersJson.clusters | Where-Object { $_.status -eq 'done' }).Count
    $pending = @($clustersJson.clusters | Where-Object { $_.status -eq 'pending' }).Count
    $next = $clustersJson.clusters | Where-Object { $_.status -eq 'pending' } | Select-Object -First 1

    Push-Location $turismo
    $warnTotal = "calculando..."
    try {
      $rankOut = node scripts/eslint-warnings-rank.cjs 2>&1 | Select-Object -First 1
      if ($rankOut -match '(\d+)') { $warnTotal = $Matches[1] }
    } catch { $warnTotal = "n/a" }
    Pop-Location

    $prs = ""
    try {
      $prs = (gh pr list --head "chore/lint-turismo" --limit 5 --json number,title,url,headRefName 2>$null | ConvertFrom-Json | ForEach-Object {
        "<li><a href=`"$($_.url)`" target=`"_blank`">#$($_.number)</a> — $($_.headRefName)</li>"
      }) -join ""
    } catch { $prs = "<li>gh não disponível</li>" }

    $nextFiles = if ($next) {
      ($next.files | ForEach-Object { "<code>$($_.path)</code> ($($_.warnings)w)" }) -join ", "
    } else { "nenhum — meta atingida!" }

    $html = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="3">
  <title>Lint #237 — Ao vivo</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; }
    h1 { margin: 0 0 8px; font-size: 1.5rem; color: #38bdf8; }
    .sub { color: #94a3b8; margin-bottom: 24px; font-size: 0.9rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #1e293b; border-radius: 12px; padding: 16px; border: 1px solid #334155; }
    .card h2 { margin: 0 0 8px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; }
    .card .val { font-size: 1.75rem; font-weight: 700; color: #f8fafc; }
    .card .val.small { font-size: 1rem; word-break: break-all; }
    pre { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; overflow-x: auto; font-size: 0.8rem; line-height: 1.5; }
    ul { margin: 0; padding-left: 20px; }
    a { color: #38bdf8; }
    .pulse { display: inline-block; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; animation: pulse 1.5s infinite; margin-right: 8px; vertical-align: middle; }
    @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1);} 50%{ opacity:.5; transform:scale(1.2);} }
    .bar { height: 8px; background: #334155; border-radius: 4px; overflow: hidden; margin-top: 8px; }
    .bar-fill { height: 100%; background: linear-gradient(90deg,#22c55e,#38bdf8); transition: width .3s; }
  </style>
</head>
<body>
  <h1><span class="pulse"></span>Lint #237 turismo — monitor ao vivo</h1>
  <p class="sub">Atualiza a cada 3s · $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')</p>

  <div class="grid">
    <div class="card"><h2>Warnings globais</h2><div class="val">$warnTotal</div></div>
    <div class="card"><h2>Clusters concluídos</h2><div class="val">$done / 120</div><div class="bar"><div class="bar-fill" style="width:$([math]::Round($done/120*100,1))%"></div></div></div>
    <div class="card"><h2>Pendentes</h2><div class="val">$pending</div></div>
    <div class="card"><h2>Branch atual</h2><div class="val small">$branch</div></div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <h2>Próximo cluster (#$($next.id)) — delta $($next.delta)</h2>
    <p style="margin:0">$nextFiles</p>
  </div>

  <div class="card" style="margin-bottom:16px">
    <h2>Último commit</h2>
    <pre>$lastCommit</pre>
  </div>

  <div class="card" style="margin-bottom:16px">
    <h2>Commits recentes</h2>
    <pre>$recent</pre>
  </div>

  <div class="card">
    <h2>PRs recentes (lint-turismo)</h2>
    <ul>$prs</ul>
    <p style="margin-top:12px"><a href="https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/pulls?q=is%3Apr+lint-turismo" target="_blank">Ver todas as PRs no GitHub →</a></p>
  </div>
</body>
</html>
"@

    Set-Content -Path $htmlPath -Value $html -Encoding UTF8
  } catch {
    Write-Log "Erro: $_"
  } finally {
    Pop-Location -ErrorAction SilentlyContinue
    Pop-Location -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 3
}
