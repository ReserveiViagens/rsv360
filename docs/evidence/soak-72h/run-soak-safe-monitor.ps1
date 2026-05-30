# SOAK SAFE — monitoramento somente leitura (não altera runtime)
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root 'logs'
$ObsLog = Join-Path $LogDir 'SOAK-SAFE-OBSERVATIONS.log'
$Project = if ($env:RSV360_DOCKER_PROJECT) { $env:RSV360_DOCKER_PROJECT } else { 'rsv360' }
$Tz = [TimeZoneInfo]::FindSystemTimeZoneById('E. South America Standard Time')
$Ts = [TimeZoneInfo]::ConvertTimeFromUtc((Get-Date).ToUniversalTime(), $Tz).ToString('yyyy-MM-ddTHH:mm:ss')

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$lines = @("[$Ts] SOAK-SAFE monitor")

foreach ($t in @('RSV360-Soak-72h-Sample', 'RSV360-Soak-72h-Close')) {
  $st = (Get-ScheduledTask -TaskName $t -ErrorAction SilentlyContinue).State
  $lines += "  task $t : $st"
}

foreach ($url in @('http://127.0.0.1:3002/health', 'http://127.0.0.1:3000/')) {
  try { $c = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10).StatusCode }
  catch { $c = 'ERR' }
  $lines += "  $url -> $c"
}

foreach ($svc in @('backend', 'site-publico', 'postgres')) {
  $h = docker inspect "${Project}-${svc}" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}' 2>$null
  $r = docker inspect "${Project}-${svc}" --format '{{.RestartCount}}' 2>$null
  $lines += "  ${svc}: health=$h restarts=$r"
}

$sum = Join-Path $LogDir 'SOAK-SAMPLES.tsv'
if (Test-Path $sum) {
  $n = (Get-Content $sum | Measure-Object -Line).Lines - 1
  $lines += "  SOAK-SAMPLES.tsv rows=$n"
}

$lines | Add-Content $ObsLog -Encoding utf8
$lines | ForEach-Object { Write-Host $_ }
