# Agenda fechamento automático em 2026-06-02 09:05 -03
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Script = Join-Path $Root 'run-soak-close-scheduled.ps1'
$TaskName = 'RSV360-Soak-72h-Close'
$At = [datetime]::ParseExact('2026-06-02T09:05:00', 'yyyy-MM-ddTHH:mm:ss', $null)

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
