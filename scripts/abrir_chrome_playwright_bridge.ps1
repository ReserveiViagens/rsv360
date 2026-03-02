param(
  [string]$ChromePath = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  [string]$ExtensionDir = "C:\Users\RSV\Downloads\playwright-mcp-bridge\playwright-mcp-extension-0.0.64",
  [string]$ProfileDir = "$env:TEMP\playwright-mcp-bridge-profile",
  [switch]$Headed
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ChromePath)) {
  $alt = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  if (Test-Path $alt) {
    $ChromePath = $alt
  } else {
    throw "Chrome nao encontrado. Informe -ChromePath com o executavel correto."
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
  "https://google.com"
)

if (-not $Headed) {
  # Keep normal window by default for bridge approval UI.
}

Write-Host "Abrindo Chrome com perfil isolado e somente a bridge do Playwright..."
Write-Host "Chrome: $ChromePath"
Write-Host "Extensao: $ExtensionDir"
Write-Host "Perfil: $ProfileDir"

Start-Process -FilePath $ChromePath -ArgumentList $args | Out-Null

Write-Host ""
Write-Host "Proximo passo no Chrome:"
Write-Host "1) Acesse chrome://extensions e confirme a bridge habilitada."
Write-Host "2) Abra a pagina da extensao e copie o token (PLAYWRIGHT_MCP_EXTENSION_TOKEN), se aparecer."
Write-Host "3) Volte ao Cursor e rode 'Developer: Reload Window'."
