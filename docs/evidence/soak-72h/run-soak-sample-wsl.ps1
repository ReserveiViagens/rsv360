# Executa run-soak-sample.sh via WSL (horários agendados 001–012)
param(
  [Parameter(Mandatory = $true)][string]$SampleId,
  [string]$Label = 'periodic'
)

$ErrorActionPreference = 'Continue'
$RepoWin = 'C:\Users\RSV 360\Documents\s2-pr232-validate'
$RepoWsl = '/mnt/c/Users/RSV 360/Documents/s2-pr232-validate'
$LogDir = Join-Path $RepoWin 'docs\evidence\soak-72h\logs'
$SchedulerLog = Join-Path $LogDir 'SOAK-SCHEDULER-RUN.log'

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
"[${stamp}] START sample=$SampleId label=$Label" | Add-Content -Path $SchedulerLog -Encoding utf8

if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
  "[${stamp}] ERROR wsl.exe nao encontrado" | Add-Content -Path $SchedulerLog -Encoding utf8
  Write-Error 'WSL nao instalado. Use run-soak-sample.ps1 ou instale WSL.'
  exit 1
}

$bashCmd = "cd '$RepoWsl' && bash docs/evidence/soak-72h/run-soak-sample.sh $SampleId $Label"
& wsl.exe -e bash -lc $bashCmd
$exitCode = $LASTEXITCODE

$stamp2 = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
"[${stamp2}] END sample=$SampleId exit=$exitCode" | Add-Content -Path $SchedulerLog -Encoding utf8

$tsv = Join-Path $LogDir 'SOAK-SAMPLES.tsv'
if (Test-Path $tsv) {
  Write-Host '--- tail SOAK-SAMPLES.tsv ---' -ForegroundColor Cyan
  Get-Content $tsv -Tail 3
  "[${stamp2}] TAIL recorded in scheduler log" | Add-Content -Path $SchedulerLog -Encoding utf8
} else {
  Write-Warning "SOAK-SAMPLES.tsv ausente: $tsv"
}

exit $exitCode
