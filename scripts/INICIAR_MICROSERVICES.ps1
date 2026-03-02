# Script para iniciar todos os microserviços RSV360 (portas 6000-6031)
# Execute antes do testar-todas-rotas.ps1 para garantir que todos os microserviços respondam

$ErrorActionPreference = "SilentlyContinue"
$projectRoot = Split-Path -Parent $PSScriptRoot
$microservicesPath = Join-Path $projectRoot "backend\microservices"

if (-not (Test-Path $microservicesPath)) {
    Write-Host "ERRO: Diretório microserviços não encontrado: $microservicesPath" -ForegroundColor Red
    exit 1
}

Write-Host "=== INICIAR MICROSERVIÇOS RSV360 ===" -ForegroundColor Cyan
Write-Host ""

$folders = Get-ChildItem -Path $microservicesPath -Directory | Where-Object { Test-Path (Join-Path $_.FullName "server.js") }
$started = 0
$failed = 0

foreach ($folder in $folders) {
    $name = $folder.Name
    $serverPath = Join-Path $folder.FullName "server.js"
    if (Test-Path $serverPath) {
        try {
            $proc = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $folder.FullName -WindowStyle Hidden -PassThru
            if ($proc) {
                Write-Host "  Iniciado: $name (PID $($proc.Id))" -ForegroundColor Green
                $started++
            } else {
                Write-Host "  Falha: $name" -ForegroundColor Red
                $failed++
            }
        } catch {
            Write-Host "  Erro ao iniciar $name : $_" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "Iniciados: $started | Falhas: $failed | Total: $($folders.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Microserviços rodando nas portas 6000-6031. Aguarde 5 segundos para estabilização." -ForegroundColor Yellow
Write-Host "Para testar: .\scripts\testar-todas-rotas.ps1" -ForegroundColor White
Write-Host ""
