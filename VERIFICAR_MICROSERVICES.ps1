# Script para verificar o status de todos os microserviços
param(
    [switch]$Detalhado = $false
)

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"

Set-Location $RootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO STATUS DOS MICROSERVIÇOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

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

$online = 0
$offline = 0
$portInUse = 0
$onlineServices = @()
$offlineServices = @()

foreach ($ms in $microservices) {
    $url = "http://localhost:$($ms.Port)/health"
    
    # Verificar se a porta está em uso
    $connection = Get-NetTCPConnection -LocalPort $ms.Port -ErrorAction SilentlyContinue
    $isPortInUse = $null -ne $connection
    
    if ($isPortInUse) {
        $portInUse++
    }
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -ErrorAction Stop
        $jsonContent = $response.Content | ConvertFrom-Json
        $status = $jsonContent.status
        
        if ($status -eq "healthy") {
            $statusText = "ONLINE"
            $color = "Green"
            $online++
            $onlineServices += $ms.Name
            
            if ($Detalhado) {
                $processId = $connection.OwningProcess | Select-Object -First 1 -Unique
                Write-Host "[OK] $($ms.Name) (porta $($ms.Port)) - $statusText [PID: $processId]" -ForegroundColor $color
            } else {
                Write-Host "[OK] $($ms.Name) (porta $($ms.Port)) - $statusText" -ForegroundColor $color
            }
        } else {
            Write-Host "[AVISO] $($ms.Name) (porta $($ms.Port)) - RESPONDEU MAS STATUS: $status" -ForegroundColor Yellow
            $offline++
            $offlineServices += $ms.Name
        }
    } catch {
        if ($isPortInUse) {
            Write-Host "[ERRO] $($ms.Name) (porta $($ms.Port)) - PORTA EM USO MAS NÃO RESPONDE" -ForegroundColor Red
        } else {
            Write-Host "[ERRO] $($ms.Name) (porta $($ms.Port)) - OFFLINE" -ForegroundColor Red
        }
        $offline++
        $offlineServices += $ms.Name
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Online: $online" -ForegroundColor Green
Write-Host "Offline: $offline" -ForegroundColor $(if ($offline -gt 0) { "Red" } else { "Green" })
Write-Host "Portas em uso: $portInUse" -ForegroundColor $(if ($portInUse -gt 0) { "Yellow" } else { "Cyan" })
Write-Host "Total: $($microservices.Count)" -ForegroundColor Cyan

if ($Detalhado -and $onlineServices.Count -gt 0) {
    Write-Host ""
    Write-Host "Microserviços Online:" -ForegroundColor Green
    $onlineServices | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
}

if ($offlineServices.Count -gt 0) {
    Write-Host ""
    Write-Host "Microserviços Offline:" -ForegroundColor Red
    $offlineServices | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "Para ver detalhes, execute: .\VERIFICAR_MICROSERVICES.ps1 -Detalhado" -ForegroundColor Cyan
Write-Host ""

