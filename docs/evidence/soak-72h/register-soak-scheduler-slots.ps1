# Registra Task Scheduler — amostras 001–012 nos horários exatos (America/Sao_Paulo, -03)
# Execute PowerShell como Administrador:
#   cd "C:\Users\RSV 360\Documents\s2-pr232-validate\docs\evidence\soak-72h"
#   .\register-soak-scheduler-slots.ps1
#   .\register-soak-close-scheduler.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Wrapper = Join-Path $Root 'run-soak-sample-wsl.ps1'
$CloseRegistrar = Join-Path $Root 'register-soak-close-scheduler.ps1'

# Horários locais -03 (máquina deve estar em horário de Brasília ou equivalente)
$Slots = @(
  @{ Id = '001'; At = '2026-06-01 16:12:00' }
  @{ Id = '002'; At = '2026-06-01 22:12:00' }
  @{ Id = '003'; At = '2026-06-02 04:12:00' }
  @{ Id = '004'; At = '2026-06-02 10:12:00' }
  @{ Id = '005'; At = '2026-06-02 16:12:00' }
  @{ Id = '006'; At = '2026-06-02 22:12:00' }
  @{ Id = '007'; At = '2026-06-03 04:12:00' }
  @{ Id = '008'; At = '2026-06-03 10:12:00' }
  @{ Id = '009'; At = '2026-06-03 16:12:00' }
  @{ Id = '010'; At = '2026-06-03 22:12:00' }
  @{ Id = '011'; At = '2026-06-04 04:12:00' }
  @{ Id = '012'; At = '2026-06-04 10:12:00' }
)

$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

# Remove tarefa repetitiva antiga (6h genérica)
Unregister-ScheduledTask -TaskName 'RSV360-Soak-72h-Sample' -Confirm:$false -ErrorAction SilentlyContinue

$ok = 0
$fail = 0
$manifest = [System.Collections.Generic.List[string]]::new()
[void]$manifest.Add('# Soak 72h - tarefas agendadas (America/Sao_Paulo -03)')
[void]$manifest.Add("Gerado: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')")
[void]$manifest.Add('')
[void]$manifest.Add('| Task | Sample | Data/Hora (-03) | Comando equivalente |')
[void]$manifest.Add('|------|--------|-----------------|---------------------|')

foreach ($slot in $Slots) {
  $taskName = "RSV360-Soak-72h-Sample-$($slot.Id)"
  $at = [DateTime]::ParseExact($slot.At, 'yyyy-MM-dd HH:mm:ss', $null)
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Wrapper`" -SampleId $($slot.Id)"
  $trigger = New-ScheduledTaskTrigger -Once -At $at

  try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
      -Settings $Settings -Principal $Principal `
      -Description "Soak 72h G4 amostra $($slot.Id) $($slot.At) -03" | Out-Null
    Write-Host "OK  $taskName -> $($slot.At)" -ForegroundColor Green
    $ok++
    $row = '| {0} | {1} | {2} | bash run-soak-sample.sh {1} periodic |' -f $taskName, $slot.Id, $slot.At
    [void]$manifest.Add($row)
  } catch {
    Write-Warning "FALHA ${taskName}: $($_.Exception.Message)"
    $fail++
    $rowFail = '| {0} | {1} | {2} | FALHOU REGISTRO |' -f $taskName, $slot.Id, $slot.At
    [void]$manifest.Add($rowFail)
  }
}

$manifestPath = Join-Path $Root 'SOAK-SCHEDULER-MANIFEST.md'
[void]$manifest.Add('')
[void]$manifest.Add('## Fechamento')
[void]$manifest.Add('')
[void]$manifest.Add('Apos 2026-06-04T10:12:40-03:00 (tarefa RSV360-Soak-72h-Close ou manual):')
[void]$manifest.Add('```powershell')
[void]$manifest.Add('powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\RSV 360\Documents\s2-pr232-validate\docs\evidence\soak-72h\run-soak-close-scheduled.ps1"')
[void]$manifest.Add('```')
$manifest | Set-Content -Path $manifestPath -Encoding utf8

Write-Host ""
Write-Host "Registradas: $ok  Falhas: $fail" -ForegroundColor Cyan
Write-Host "Manifesto: $manifestPath" -ForegroundColor Cyan

if ($fail -gt 0) {
  Write-Host ""
  Write-Host "Se houve 'Acesso negado', abra PowerShell como Administrador e rode este script novamente." -ForegroundColor Yellow
  Write-Host "Fallback manual (WSL) nos horários da tabela em SOAK-72H-PLAN.md" -ForegroundColor Yellow
  exit 1
}

if (Test-Path $CloseRegistrar) {
  Write-Host ""
  Write-Host "Registrando fechamento (RSV360-Soak-72h-Close)..." -ForegroundColor Cyan
  & $CloseRegistrar
}

Write-Host ""
Write-Host "Validar tarefas:" -ForegroundColor Cyan
Write-Host '  Get-ScheduledTask -TaskName "RSV360-Soak-72h-Sample-*" | Format-Table TaskName, State'
Write-Host '  Get-ScheduledTask -TaskName "RSV360-Soak-72h-Close" | Format-List'
