# G2/G3 post-security revalidation — S2 canonical worktree
param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
)

$LogDir = Join-Path $PSScriptRoot 'logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$G2Summary = Join-Path $LogDir 'G2-SUMMARY.tsv'
$G3Summary = Join-Path $LogDir 'G3-SUMMARY.tsv'
$Ts = (Get-Date).ToString('o')

"step`tstatus`tworkdir`tdetail`tlog_file" | Set-Content $G2Summary -Encoding utf8
"step`tstatus`tdetail`tartifact" | Set-Content $G3Summary -Encoding utf8

function Add-G2 {
  param($Step, $Status, $Workdir, $Detail, $LogFile)
  "$Step`t$Status`t$Workdir`t$Detail`t$LogFile" | Add-Content $G2Summary -Encoding utf8
  Write-Host "[G2 $Status] $Step - $Detail"
}

function Add-G3 {
  param($Step, $Status, $Detail, $Artifact)
  "$Step`t$Status`t$Detail`t$Artifact" | Add-Content $G3Summary -Encoding utf8
  Write-Host "[G3 $Status] $Step - $Detail"
}

function Invoke-G2Step {
  param($Step, $Workdir, $Command, [string[]]$DebtAccepted = @())
  $rel = $Workdir.Replace($Root, '').TrimStart('\','/')
  $logFile = Join-Path $LogDir ("g2_{0}.log" -f ($Step -replace '[^a-zA-Z0-9_]', '_'))
  $header = @(
    "[STEP] $Step",
    "[TS] $Ts",
    "[WORKDIR] $Workdir",
    "[CMD] $Command",
    "---"
  )
  $header | Set-Content $logFile -Encoding utf8
  Push-Location $Workdir
  try {
    cmd /c "$Command >> `"$logFile`" 2>&1"
    $exit = $LASTEXITCODE
  } finally {
    Pop-Location
  }
  $status = if ($exit -eq 0) { 'PASS' } elseif ($DebtAccepted -contains $Step) { 'DEBT' } else { 'FAIL' }
  $detail = "exit=$exit"
  Add-G2 $Step $status $rel $detail $logFile
}

$S2Steps = @(
  @{ Step = 's2_packages_shared_build'; Dir = 'packages\shared'; Cmd = 'npx -y npm@10.9.7 run build' },
  @{ Step = 's2_packages_shared_typecheck'; Dir = 'packages\shared'; Cmd = 'npx -y npm@10.9.7 run typecheck' },
  @{ Step = 's2_apps_guest_lint'; Dir = 'apps\guest'; Cmd = 'npx -y npm@10.9.7 run lint' },
  @{ Step = 's2_apps_guest_typecheck'; Dir = 'apps\guest'; Cmd = 'npx -y npm@10.9.7 run type-check' },
  @{ Step = 's2_apps_guest_build'; Dir = 'apps\guest'; Cmd = 'npx -y npm@10.9.7 run build' },
  @{ Step = 's2_apps_admin_lint'; Dir = 'apps\admin'; Cmd = 'npx -y npm@10.9.7 run lint'; Debt = @('s2_apps_admin_lint') },
  @{ Step = 's2_apps_admin_typecheck'; Dir = 'apps\admin'; Cmd = 'npx -y npm@10.9.7 run type-check' },
  @{ Step = 's2_apps_admin_build'; Dir = 'apps\admin'; Cmd = 'npx -y npm@10.9.7 run build' },
  @{ Step = 's2_apps_turismo_lint'; Dir = 'apps\turismo'; Cmd = 'npx -y npm@10.9.7 run lint' },
  @{ Step = 's2_apps_turismo_typecheck'; Dir = 'apps\turismo'; Cmd = 'npx -y npm@10.9.7 run type-check'; Debt = @('s2_apps_turismo_typecheck') },
  @{ Step = 's2_apps_turismo_build'; Dir = 'apps\turismo'; Cmd = 'npx -y npm@10.9.7 run build' },
  @{ Step = 's2_apps_site-publico_lint'; Dir = 'apps\site-publico'; Cmd = 'npx -y npm@10.9.7 run lint'; Debt = @('s2_apps_site-publico_lint') },
  @{ Step = 's2_apps_site-publico_typecheck'; Dir = 'apps\site-publico'; Cmd = 'npx -y npm@10.9.7 run type-check'; Debt = @('s2_apps_site-publico_typecheck') },
  @{ Step = 's2_apps_site-publico_build'; Dir = 'apps\site-publico'; Cmd = 'npx -y npm@10.9.7 run build' }
)

Write-Host "=== G2 capture === Root=$Root"
foreach ($s in $S2Steps) {
  $dir = Join-Path $Root $s.Dir
  Invoke-G2Step -Step $s.Step -Workdir $dir -Command $s.Cmd -DebtAccepted ($s.Debt)
}

# HTTP smoke (Docker)
$SmokeLog = Join-Path $LogDir 'smoke-http.tsv'
"service`turl`tcode`tstatus" | Set-Content $SmokeLog -Encoding utf8
$smokes = @(
  @{ Name = 'site-publico'; Url = 'http://127.0.0.1:3000' },
  @{ Name = 'backend-health'; Url = 'http://127.0.0.1:3002/health' },
  @{ Name = 'admin'; Url = 'http://127.0.0.1:3004' },
  @{ Name = 'turismo'; Url = 'http://127.0.0.1:3005' },
  @{ Name = 'guest'; Url = 'http://127.0.0.1:3006' }
)
foreach ($sm in $smokes) {
  try {
    $r = Invoke-WebRequest -Uri $sm.Url -UseBasicParsing -TimeoutSec 10
    $code = [int]$r.StatusCode
  } catch {
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { 0 }
  }
  $st = if ($code -eq 200) { 'PASS' } else { 'FAIL' }
  "$($sm.Name)`t$($sm.Url)`t$code`t$st" | Add-Content $SmokeLog -Encoding utf8
  Add-G3 "smoke_$($sm.Name)" $st "HTTP $code" $sm.Url
}

# Docker ps
$DockerLog = Join-Path $LogDir 'docker-ps.txt'
docker compose -p rsv360 ps 2>&1 | Set-Content $DockerLog -Encoding utf8
Add-G3 'docker_ps' 'PASS' 'snapshot rsv360' $DockerLog

# npm audit
$AuditTargets = @(
  @{ Step = 'npm_audit_root'; Dir = $Root; File = 'npm-audit-root.json' },
  @{ Step = 'npm_audit_backend'; Dir = (Join-Path $Root 'backend'); File = 'npm-audit-backend.json' },
  @{ Step = 'npm_audit_site_publico'; Dir = (Join-Path $Root 'apps\site-publico'); File = 'npm-audit-site-publico.json' },
  @{ Step = 'npm_audit_admin'; Dir = (Join-Path $Root 'apps\admin'); File = 'npm-audit-admin.json' },
  @{ Step = 'npm_audit_guest'; Dir = (Join-Path $Root 'apps\guest'); File = 'npm-audit-guest.json' },
  @{ Step = 'npm_audit_turismo'; Dir = (Join-Path $Root 'apps\turismo'); File = 'npm-audit-turismo.json' }
)
foreach ($a in $AuditTargets) {
  $out = Join-Path $LogDir $a.File
  Push-Location $a.Dir
  npx -y npm@10.9.7 audit --json 2>$null | Out-File $out -Encoding utf8
  Pop-Location
  $raw = Get-Content $out -Raw
  $total = 999
  if ($raw -match '"total"\s*:\s*(\d+)') { $total = [int]$Matches[1] }
  $st = if ($total -eq 0) { 'PASS' } else { 'FAIL' }
  Add-G3 $a.Step $st "total=$total" $out
}

# Dependabot open count
$depOpen = gh api "repos/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/dependabot/alerts?state=open" --paginate 2>$null | ConvertFrom-Json
$depCount = @($depOpen).Count
$depFile = Join-Path $LogDir 'dependabot-open-count.json'
@{ dependabot_open = $depCount; ts = $Ts } | ConvertTo-Json | Set-Content $depFile -Encoding utf8
Add-G3 'dependabot_open' $(if ($depCount -eq 0) { 'PASS' } else { 'FAIL' }) "open=$depCount" $depFile

# API P0
$ApiLogDir = Join-Path $LogDir 'api-p0'
New-Item -ItemType Directory -Force -Path $ApiLogDir | Out-Null
$ApiScript = Join-Path $Root 'docs\evidence\g4-kickoff\run-api-p0-round1.ps1'
& $ApiScript
$ApiSummarySrc = Join-Path (Join-Path $Root 'docs\evidence\g4-kickoff\logs') 'API-P0-SUMMARY.tsv'
$ApiSummaryDst = Join-Path $LogDir 'API-P0-SUMMARY.tsv'
Copy-Item $ApiSummarySrc $ApiSummaryDst -Force
$failP0 = (Import-Csv $ApiSummaryDst -Delimiter "`t" | Where-Object { $_.verdict -eq 'FAIL' }).Count
Add-G3 'api_p0' $(if ($failP0 -eq 0) { 'PASS' } else { 'FAIL' }) "fail=$failP0 ok=$((8-$failP0))" $ApiSummaryDst

Write-Host "`nG2: $G2Summary"
Write-Host "G3: $G3Summary"
