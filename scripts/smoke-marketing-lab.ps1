# Smoke — modo marketing-lab (:3000) + redirect B2C para S1 (:5000)
$ErrorActionPreference = "Stop"
$lab = "http://localhost:3000"
$s1 = "http://localhost:5000"

function Get-RedirectLocation {
  param([string]$Url)
  $out = curl.exe -sI $Url 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "curl failed for $Url`: $out"
  }
  $loc = ($out | Select-String -Pattern '^location:\s*(.+)$' -CaseSensitive:$false |
    ForEach-Object { $_.Matches[0].Groups[1].Value.Trim() }) | Select-Object -First 1
  $status = ($out | Select-String -Pattern '^HTTP/\S+\s+(\d+)' |
    ForEach-Object { $_.Matches[0].Groups[1].Value }) | Select-Object -First 1
  return @{ Status = [int]$status; Location = $loc }
}

Write-Host "=== Marketing Lab smoke ===" -ForegroundColor Cyan

$r = Get-RedirectLocation "$lab/"
if ($r.Status -notin 301, 302, 307, 308) {
  throw "Expected redirect from /, got $($r.Status)"
}
if ($r.Location -notmatch "/lab") {
  throw "Expected /lab redirect, got $($r.Location)"
}
Write-Host "OK / -> $($r.Location)" -ForegroundColor Green

$r2 = Get-RedirectLocation "$lab/hoteis"
if ($r2.Status -notin 301, 302, 307, 308) {
  throw "Expected redirect from /hoteis, got $($r2.Status)"
}
if ($r2.Location -notmatch ":5000/hoteis") {
  throw "Expected :5000/hoteis, got $($r2.Location)"
}
Write-Host "OK /hoteis -> $($r2.Location)" -ForegroundColor Green

$r3 = curl.exe -s -o NUL -w "%{http_code}" "$lab/lab"
if ($r3 -ne "200") {
  throw "/lab returned $r3"
}
Write-Host "OK /lab -> 200" -ForegroundColor Green

$html = (curl.exe -s "$lab/analytics" | Out-String)
if ($html -notmatch "B2C e reservas") {
  throw "/analytics missing LabShell banner"
}
Write-Host "OK /analytics has LabShell" -ForegroundColor Green

$mkt = (curl.exe -s "$lab/marketing" | Out-String)
if ($mkt -match "Em construção") {
  throw "/marketing still shows stub"
}
if ($mkt -notmatch "Campanhas") {
  throw "/marketing missing hub modules"
}
Write-Host "OK /marketing hub MVP" -ForegroundColor Green

$mktCamp = (curl.exe -s -o NUL -w "%{http_code}" "$lab/marketing/campaigns")

if ($mktCamp -ne "200") {
  throw "/marketing/campaigns returned $mktCamp"
}
Write-Host "OK /marketing/campaigns -> 200" -ForegroundColor Green

$s = curl.exe -s -o NUL -w "%{http_code}" "$s1/health"
if ($s -eq "200") {
  Write-Host "OK S1 health -> 200" -ForegroundColor Green
} else {
  Write-Host "WARN S1 :5000 not reachable (start Crm-RSV-360)" -ForegroundColor Yellow
}

Write-Host "=== All checks passed ===" -ForegroundColor Cyan

# Cross-platform: npm run smoke:marketing-lab (Node)
