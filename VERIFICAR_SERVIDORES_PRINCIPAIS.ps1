# Script para verificar e iniciar os servidores principais
$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO SERVIDORES PRINCIPAIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar portas
$portas = @(
    @{Nome="Site Público"; Porta=3000; URL="http://localhost:3000"},
    @{Nome="Dashboard Turismo"; Porta=3005; URL="http://localhost:3005"},
    @{Nome="Backend API"; Porta=5000; URL="http://localhost:5000"}
)

foreach ($servidor in $portas) {
    Write-Host "Verificando $($servidor.Nome) (porta $($servidor.Porta))..." -ForegroundColor Yellow
    
    # Verificar se a porta está em uso
    $portaEmUso = Get-NetTCPConnection -LocalPort $servidor.Porta -ErrorAction SilentlyContinue
    
    if ($portaEmUso) {
        Write-Host "  [OK] Porta $($servidor.Porta) está em uso" -ForegroundColor Green
        
        # Tentar fazer requisição HTTP
        try {
            $response = Invoke-WebRequest -Uri $servidor.URL -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  [OK] $($servidor.Nome) está respondendo - Status: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "  [AVISO] Porta em uso mas não está respondendo HTTP: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [ERRO] Porta $($servidor.Porta) não está em uso - Servidor não está rodando" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTRUÇÕES PARA INICIAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar os servidores, execute:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Site Público (porta 3000):" -ForegroundColor White
Write-Host "   cd apps\site-publico" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Dashboard Turismo (porta 3005):" -ForegroundColor White
Write-Host "   cd apps\turismo" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Ou iniciar todos de uma vez:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

