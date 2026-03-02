param(
  [string]$EdgePath = "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe",
  [string]$ExtensionDir = "C:\Users\RSV\Downloads\playwright-mcp-bridge\playwright-mcp-extension-0.0.64",
  [string]$ProfileDir = "$env:TEMP\playwright-mcp-bridge-edge-profile"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EdgePath)) {
  $alt = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  if (Test-Path $alt) {
    $EdgePath = $alt
  } else {
    throw "Edge nao encontrado. Informe -EdgePath com o executavel correto."
  }
}

if (-not (Test-Path $ExtensionDir)) {
  throw "Diretorio da extensao nao encontrado: $ExtensionDir"
}

New-Item -ItemType Directory -Force -Path $ProfileDir | Out-Null

$args = @(
  "--user-data-dir=$ProfileDir",
  "--disable-extensions-except=$ExtensionDir",
  "--load-extension=$ExtensionDir",
  "--no-first-run",
  "--no-default-browser-check",
  "--new-window",
  "https://bing.com"
)

Write-Host "Abrindo Edge com perfil isolado e somente a bridge do Playwright..."
Write-Host "Edge: $EdgePath"
Write-Host "Extensao: $ExtensionDir"
Write-Host "Perfil: $ProfileDir"

Start-Process -FilePath $EdgePath -ArgumentList $args | Out-Null
