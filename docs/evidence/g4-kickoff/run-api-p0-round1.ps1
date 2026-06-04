# G4 API P0 — smoke (Windows, espelha run-api-p0-round1.sh)
$LogDir = Join-Path $PSScriptRoot 'logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Ts = (Get-Date).ToString('o')
$Summary = Join-Path $LogDir 'API-P0-SUMMARY.tsv'
"id`tmethod`turl`thttp_code`tverdict`tnote" | Set-Content $Summary -Encoding utf8

function Invoke-P0 {
  param($Id, $Method, $Url, $Body = $null, $Auth = $null)
  $log = Join-Path $LogDir "$Id.log"
  @("[ID] $Id", "[TS] $Ts", "[METHOD] $Method", "[URL] $Url", "---") | Set-Content $log
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($Auth) { $headers['Authorization'] = $Auth.Replace('Authorization: ', '') }
  try {
    $params = @{ Uri = $Url; Method = $Method; Headers = $headers; TimeoutSec = 15; UseBasicParsing = $true }
    if ($Body -and $Method -ne 'GET') { $params['Body'] = $Body }
    $r = Invoke-WebRequest @params
    $code = [int]$r.StatusCode
    Add-Content $log "--- body ---`n$($r.Content.Substring(0, [Math]::Min(2048, $r.Content.Length)))"
  } catch {
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { 0 }
    Add-Content $log "[HTTP] $code`n$($_.Exception.Message)"
  }
  $verdict = 'FAIL'
  switch ($Id) {
    { $_ -in 'A1','A2' } { if ($code -eq 200) { $verdict = 'OK' } }
    'A3' { if ($code -in 400,401,429) { $verdict = 'OK' } }
    'A4' { if ($code -in 400,401) { $verdict = 'OK' } }
    'A5g' { if ($code -in 200,400,401) { $verdict = 'OK' } }
    'A5p' { if ($code -eq 400) { $verdict = 'OK' } }
    'A6' { if ($code -eq 200) { $verdict = 'OK' } elseif ($code -eq 401) { $verdict = 'GAP' } }
    { $_ -in 'A7g','A7p' } { if ($code -eq 200) { $verdict = 'OK' } }
  }
  if ($code -eq 0) { $verdict = 'FAIL' }
  if ($code -eq 404 -and $Id -eq 'A2') { $verdict = 'GAP' }
  "$Id`t$Method`t$Url`t$code`t$verdict`t" | Add-Content $Summary
  Write-Host "$Id $verdict HTTP $code"
}

Invoke-P0 A1 GET 'http://127.0.0.1:3002/health'
Invoke-P0 A2 GET 'http://127.0.0.1:3002/health/security'
Invoke-P0 A3 POST 'http://127.0.0.1:3000/api/auth/login' '{"email":"g4-smoke@reserveiviagens.com.br","password":"invalid-password"}'
Invoke-P0 A4 POST 'http://127.0.0.1:3000/api/auth/refresh' '{}'
Invoke-P0 A5g GET 'http://127.0.0.1:3000/api/bookings'
Invoke-P0 A5p POST 'http://127.0.0.1:3000/api/bookings' '{}'
Invoke-P0 A6 GET 'http://127.0.0.1:3000/api/admin/website/pages' $null 'Authorization: Bearer admin-token-123'
Invoke-P0 A7g GET 'http://127.0.0.1:3002/api/v1/payments/payments?enterpriseId=ent_1'
Invoke-P0 A7p POST 'http://127.0.0.1:3002/api/v1/payments/payments' '{"enterpriseId":"ent_1","amount":1,"currency":"BRL","customerId":"cus_g4","paymentMethod":"pix"}'
Write-Host "`n$Summary"; Get-Content $Summary
