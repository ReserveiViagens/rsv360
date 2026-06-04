# Agenda fechamento automático em end_at + 2 minutos (janela atual)
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Script = Join-Path $Root 'run-soak-close-scheduled.ps1'
$TaskName = 'RSV360-Soak-72h-Close'
# 2 min após amostra 012 e end_at (2026-06-04T10:12:40-03:00)
$At = [datetime]::ParseExact('2026-06-04 10:14:40', 'yyyy-MM-dd HH:mm:ss', $null)

$Action = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Script`""
$Trigger = New-ScheduledTaskTrigger -Once -At $At
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

try {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings `
    -Description 'Soak 72h — fechamento + API P0 (RSV360)' | Out-Null
  Write-Host "OK: '$TaskName' agendada para $At"
} catch {
  Write-Warning $_.Exception.Message
}
