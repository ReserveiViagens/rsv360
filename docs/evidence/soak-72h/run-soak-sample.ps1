# Soak 72h — amostra periódica (Windows)
param(
  [string]$SampleId = '',
  [string]$Label = 'periodic',
  [switch]$Force
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root 'logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Project = if ($env:RSV360_DOCKER_PROJECT) { $env:RSV360_DOCKER_PROJECT } else { 'rsv360' }
$Kickoff = [DateTimeOffset]::Parse('2026-06-08T22:00:00-03:00')
$IntervalMinutes = 360
$ToleranceMinutes = 20
$Tz = [TimeZoneInfo]::FindSystemTimeZoneById('E. South America Standard Time')
$Ts = [TimeZoneInfo]::ConvertTimeFromUtc((Get-Date).ToUniversalTime(), $Tz).ToString('yyyy-MM-ddTHH:mm:sszzz')

if (-not $SampleId) {
  $n = (Get-Content (Join-Path $LogDir 'SOAK-SAMPLES.tsv') -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
  $SampleId = ('{0:D3}' -f [Math]::Max(0, $n - 1))
}

$Summary = Join-Path $LogDir 'SOAK-SAMPLES.tsv'
if (-not (Test-Path $Summary)) {
  "sample_id`tts_sp`th3002`th3000`tbackend_health`tsite_health`tpostgres_health`tbackend_restarts`tsite_restarts`tpostgres_restarts`terror_rate_note`tverdict" | Set-Content $Summary -Encoding utf8
}

$LogFile = Join-Path $LogDir "sample-$SampleId-$Label.log"
@(
  "[SAMPLE] $SampleId"
  "[LABEL] $Label"
  "[TS] $Ts"
  "---"
) | Set-Content $LogFile -Encoding utf8

# Guard: evita contaminação por tasks antigas fora dos slots da janela atual.
if (-not $Force -and $Label -eq 'periodic') {
  $now = [DateTimeOffset]::Parse($Ts)
  $delta = ($now - $Kickoff).TotalMinutes
  if ($delta -ge 0) {
    $mod = [Math]::Abs($delta % $IntervalMinutes)
    $distance = [Math]::Min($mod, $IntervalMinutes - $mod)
    if ($distance -gt $ToleranceMinutes) {
      "[SKIP] Fora do slot da janela atual (distancia=$([Math]::Round($distance,2)) min; tolerancia=$ToleranceMinutes)." | Add-Content $LogFile
      Write-Host "Soak sample $SampleId @ $Ts -> SKIP (fora do slot; use -Force para sobrescrever)"
      exit 0
    }
  }
}

function Get-HttpCode($url) {
  try { return [int](Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15).StatusCode }
  catch { return if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { 0 } }
}

$h2 = Get-HttpCode 'http://127.0.0.1:3002/health'
$h0 = Get-HttpCode 'http://127.0.0.1:3000/'
"HTTP :3002/health = $h2" | Add-Content $LogFile
"HTTP :3000/ = $h0" | Add-Content $LogFile

function Get-Health($svc) {
  docker inspect "${Project}-${svc}" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}' 2>$null
}
function Get-Restarts($svc) {
  docker inspect "${Project}-${svc}" --format '{{.RestartCount}}' 2>$null
}

$hb = Get-Health 'backend'
$hs = Get-Health 'site-publico'
$hp = Get-Health 'postgres'
$rb = Get-Restarts 'backend'
$rs = Get-Restarts 'site-publico'
$rp = Get-Restarts 'postgres'

docker ps --filter "name=${Project}-" --format '{{.Names}} {{.Status}}' 2>&1 | Add-Content $LogFile

$errNote = 'smoke-only; prometheus optional'
try {
  $prom = Invoke-WebRequest 'http://127.0.0.1:9090/-/healthy' -UseBasicParsing -TimeoutSec 5
  if ($prom.StatusCode -eq 200) { $errNote = 'prometheus_up; query 5xx in finalize' }
} catch { }

$verdict = 'OK'
if ($h2 -ne 200 -or $h0 -ne 200) { $verdict = 'FAIL' }
if ($hb -ne 'healthy' -or $hs -ne 'healthy' -or $hp -ne 'healthy') { $verdict = 'FAIL' }

"$SampleId`t$Ts`t$h2`t$h0`t$hb`t$hs`t$hp`t$rb`t$rs`t$rp`t$errNote`t$verdict" | Add-Content $Summary -Encoding utf8
"VERDICT=$verdict" | Add-Content $LogFile

Write-Host "Soak sample $SampleId @ $Ts -> $verdict"
Get-Content $Summary | Select-Object -Last 5
