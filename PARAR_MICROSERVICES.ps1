# Script para parar todos os microserviços do RSV360
param(
    [switch]$Todos = $true,
    [string]$Microservico = "",
    [int]$Porta = 0
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PARANDO MICROSERVIÇOS RSV360" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Lista de todos os microserviços com suas portas
$microservices = @(
    @{Name="core-api"; Port=6000},
    @{Name="user-management"; Port=6001},
    @{Name="hotel-management"; Port=6002},
    @{Name="travel-api"; Port=6003},
    @{Name="booking-engine"; Port=6004},
    @{Name="finance-api"; Port=6005},
    @{Name="tickets-api"; Port=6006},
    @{Name="payments-gateway"; Port=6007},
    @{Name="ecommerce-api"; Port=6008},
    @{Name="attractions-api"; Port=6009},
    @{Name="vouchers-api"; Port=6010},
    @{Name="voucher-editor"; Port=6011},
    @{Name="giftcards-api"; Port=6012},
    @{Name="coupons-api"; Port=6013},
    @{Name="parks-api"; Port=6014},
    @{Name="maps-api"; Port=6015},
    @{Name="visa-processing"; Port=6016},
    @{Name="marketing-api"; Port=6017},
    @{Name="subscriptions"; Port=6018},
    @{Name="seo-api"; Port=6019},
    @{Name="multilingual"; Port=6020},
    @{Name="videos-api"; Port=6021},
    @{Name="photos-api"; Port=6022},
    @{Name="admin-panel"; Port=6023},
    @{Name="analytics-api"; Port=6024},
    @{Name="reports-api"; Port=6025},
    @{Name="data-management"; Port=6026},
    @{Name="notifications"; Port=6027},
    @{Name="reviews-api"; Port=6028},
    @{Name="rewards-api"; Port=6029},
    @{Name="loyalty-api"; Port=6030},
    @{Name="sales-api"; Port=6031}
)

$stopped = 0
$notFound = 0

# Filtrar microserviços se especificado
$servicesToStop = @()
if ($Microservico -ne "") {
    $servicesToStop = $microservices | Where-Object { $_.Name -eq $Microservico }
    if ($servicesToStop.Count -eq 0) {
        Write-Host "[ERRO] Microserviço '$Microservico' não encontrado!" -ForegroundColor Red
        exit 1
    }
} elseif ($Porta -gt 0) {
    $servicesToStop = $microservices | Where-Object { $_.Port -eq $Porta }
    if ($servicesToStop.Count -eq 0) {
        Write-Host "[ERRO] Nenhum microserviço encontrado na porta $Porta!" -ForegroundColor Red
        exit 1
    }
} else {
    $servicesToStop = $microservices
}

foreach ($ms in $servicesToStop) {
    Write-Host "Parando $($ms.Name) (porta $($ms.Port))..." -ForegroundColor Yellow
    
    try {
        # Encontrar processo usando a porta
        $connection = Get-NetTCPConnection -LocalPort $ms.Port -ErrorAction SilentlyContinue
        
        if ($connection) {
            $processId = $connection.OwningProcess | Select-Object -First 1 -Unique
            
            if ($processId) {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                
                if ($process) {
                    # Parar o processo
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 200
                    
                    # Verificar se foi parado
                    $stillRunning = Get-NetTCPConnection -LocalPort $ms.Port -ErrorAction SilentlyContinue
                    if (-not $stillRunning) {
                        $stopped++
                        Write-Host "  [OK] $($ms.Name) parado com sucesso" -ForegroundColor Green
                    } else {
                        Write-Host "  [AVISO] $($ms.Name) pode ainda estar rodando" -ForegroundColor Yellow
                    }
                } else {
                    $notFound++
                    Write-Host "  [AVISO] Processo não encontrado para $($ms.Name)" -ForegroundColor Yellow
                }
            } else {
                $notFound++
                Write-Host "  [AVISO] Nenhum processo encontrado na porta $($ms.Port)" -ForegroundColor Yellow
            }
        } else {
            $notFound++
            Write-Host "  [AVISO] $($ms.Name) não está rodando (porta $($ms.Port) não está em uso)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERRO] Erro ao parar $($ms.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Estatísticas:" -ForegroundColor Cyan
Write-Host "  Parados: $stopped" -ForegroundColor Green
Write-Host "  Não encontrados: $notFound" -ForegroundColor $(if ($notFound -gt 0) { "Yellow" } else { "Green" })
Write-Host "  Total processados: $($servicesToStop.Count)" -ForegroundColor Cyan
Write-Host ""

