# Registra Task Scheduler — amostra soak a cada 6 h
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Script = Join-Path $Root 'run-soak-sample.ps1'
$TaskName = 'RSV360-Soak-72h-Sample'

$Action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Script`""

$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddHours(6) `
  -RepetitionInterval (New-TimeSpan -Hours 6) `
  -RepetitionDuration (New-TimeSpan -Hours 72)

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

try {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings `
    -Description 'Soak 72h G4 — amostra a cada 6h (RSV360)' | Out-Null
  Write-Host "OK: tarefa '$TaskName' registrada (primeira execução em ~6h, repetição 6h por 72h)."
  Get-ScheduledTask -TaskName $TaskName | Format-List TaskName, State
} catch {
  Write-Warning "Falha ao registrar tarefa (execute PowerShell como Administrador): $($_.Exception.Message)"
  Write-Host "Coleta manual: a cada 6h execute:"
  Write-Host "  powershell -File `"$Script`""
}
