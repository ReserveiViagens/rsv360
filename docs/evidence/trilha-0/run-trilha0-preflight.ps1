# Trilha 0 preflight — Windows
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root 'logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Project = if ($env:RSV360_DOCKER_PROJECT) { $env:RSV360_DOCKER_PROJECT } else { 'rsv360' }
$Summary = Join-Path $LogDir 'TRILHA0-PREFLIGHT.tsv'
"id`tcheck`tvalue`tverdict" | Set-Content $Summary -Encoding utf8

function Add-Row($id, $check, $val, $verdict) {
  "$id`t$check`t$val`t$verdict" | Add-Content $Summary
  Write-Host "$id $verdict - $check ($val)"
}

foreach ($t in @(
  @{id='T0-01'; url='http://127.0.0.1:3002/health'},
  @{id='T0-02'; url='http://127.0.0.1:3000/'}
)) {
  try { $c = [int](Invoke-WebRequest -Uri $t.url -UseBasicParsing -TimeoutSec 15).StatusCode }
  catch { $c = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { 0 } }
  $v = if ($c -eq 200) { 'OK' } else { 'FAIL' }
  Add-Row $t.id $t.url $c $v
}

foreach ($svc in @('postgres','backend','site-publico')) {
  $st = docker inspect "${Project}-${svc}" --format '{{.State.Health.Status}}' 2>$null
  $v = if ($st -eq 'healthy') { 'OK' } else { 'FAIL' }
  Add-Row "T0-h-$svc" "health $svc" $st $v
}

$spNet = (docker inspect "${Project}-site-publico" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>$null).Trim()
$pgNet = (docker inspect "${Project}-postgres" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>$null).Trim()
$common = ($spNet.Split() | Where-Object { $pgNet.Split() -contains $_ }) -join ','
$vNet = if ($common) { 'OK' } else { 'GAP' }
Add-Row 'T0-net' 'network align' "common=[$common]" $vNet

foreach ($svc in @('prometheus','grafana')) {
  $st = docker ps --filter "name=${Project}-${svc}" --format '{{.Status}}' 2>$null | Select-Object -First 1
  $v = if ($st -like 'Up*') { 'OK' } else { 'FAIL' }
  Add-Row "T2-$svc" "$svc up" $st $v
}

Write-Host "`n$Summary"
Get-Content $Summary
