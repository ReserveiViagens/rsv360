# G1 dual-system — captura Windows (espelha run-g1-dual-system.sh)
$ErrorActionPreference = 'Continue'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root 'logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Ts = (Get-Date).ToString('o')
$Summary = Join-Path $LogDir 'G1-SUMMARY.tsv'
"id`tsystem`tcheck`thttp_or_rc`tverdict`tnote" | Set-Content $Summary -Encoding utf8

function Add-Row($id, $sys, $check, $code, $verdict, $note = '') {
  "$id`t$sys`t$check`t$code`t$verdict`t$note" | Add-Content $Summary -Encoding utf8
  Write-Host "$id $verdict ($code) $check"
}

function Probe-Http($id, $sys, $check, $url, $ok) {
  $log = Join-Path $LogDir "$id.log"
  @("[ID] $id", "[TS] $Ts", "[URL] $url", "---") | Set-Content $log
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
    $code = [int]$r.StatusCode
  } catch {
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode.value__ }
    else { $code = 0 }
  }
  "[HTTP] $code" | Add-Content $log
  $v = 'FAIL'
  if ($code -eq 0) { $v = 'SKIP' }
  elseif ($ok -contains $code) { $v = 'OK' }
  Add-Row $id $sys $check $code $v
}

Probe-Http 'G1-S2-01' 'S2' 'backend /health' 'http://127.0.0.1:3002/health' @(200)
Probe-Http 'G1-S2-02' 'S2' 'backend /health/security' 'http://127.0.0.1:3002/health/security' @(200)
Probe-Http 'G1-S2-03' 'S2' 'site-publico /' 'http://127.0.0.1:3000/' @(200)
Probe-Http 'G1-S1-01' 'S1' 'CRM root' 'http://127.0.0.1:5000/' @(200,301,302)
Probe-Http 'G1-S1-02' 'S1' 'CRM /health' 'http://127.0.0.1:5000/health' @(200)
Probe-Http 'G1-S1-03' 'S1' 'CRM /api/status' 'http://127.0.0.1:5000/api/status' @(200)

$pgH = docker inspect rsv360-postgres --format '{{.State.Health.Status}}' 2>$null
$vPg = if ($pgH -eq 'healthy') { 'OK' } else { 'FAIL' }
Add-Row 'G1-INFRA-01' 'infra' 'postgres healthy' $pgH $vPg

$spH = docker inspect rsv360-site-publico --format '{{.State.Health.Status}}' 2>$null
$vSp = if ($spH -eq 'healthy') { 'OK' } else { 'FAIL' }
Add-Row 'G1-INFRA-02' 'infra' 'site-publico health' $spH $vSp

$spNet = (docker inspect rsv360-site-publico --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>$null).Trim()
$pgNet = (docker inspect rsv360-postgres --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>$null).Trim()
$common = ($spNet.Split() | Where-Object { $pgNet.Split() -contains $_ }) -join ','
$vNet = if ($common) { 'OK' } else { 'GAP' }
Add-Row 'G1-INFRA-03' 'infra' 'docker network align' $vNet $vNet "sp=[$spNet] pg=[$pgNet]"

$redis = docker ps --filter 'name=rsv360-redis' --format '{{.Status}}' 2>$null | Select-Object -First 1
$vRd = if ($redis -like 'Up*') { 'OK' } else { 'FAIL' }
Add-Row 'G1-INFRA-04' 'infra' 'redis up' $redis $vRd 'backend REDIS_DISABLED=true'

Write-Host "`nSummary: $Summary"
Get-Content $Summary
