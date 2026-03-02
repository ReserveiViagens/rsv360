# Script para baixar o favicon do Vercel Blob e criar ícones PWA
# Requer PowerShell 5.1+ ou PowerShell Core

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$IconsDir = Join-Path $RootPath "apps\site-publico\public\icons"
$FaviconUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"

# Garantir que a pasta existe
if (-not (Test-Path $IconsDir)) {
    New-Item -ItemType Directory -Path $IconsDir -Force | Out-Null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BAIXANDO FAVICON E CRIANDO ÍCONES PWA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Baixar o favicon
Write-Host "1. Baixando favicon do Vercel Blob..." -ForegroundColor Yellow
$faviconPath = Join-Path $IconsDir "favicon-original.png"

try {
    Invoke-WebRequest -Uri $FaviconUrl -OutFile $faviconPath -ErrorAction Stop
    Write-Host "  [OK] Favicon baixado: $faviconPath" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Não foi possível baixar o favicon: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  [INFO] Usando placeholders SVG existentes" -ForegroundColor Yellow
    exit 1
}

# Verificar se o arquivo foi baixado
if (-not (Test-Path $faviconPath)) {
    Write-Host "  [ERRO] Favicon não foi baixado corretamente" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Criando ícones PWA a partir do favicon..." -ForegroundColor Yellow

# Tamanhos necessários
$sizes = @(192, 512)

foreach ($size in $sizes) {
    $outputPath = Join-Path $IconsDir "icon-${size}x${size}.png"
    
    # Tentar usar ImageMagick se disponível
    $magickPath = Get-Command magick -ErrorAction SilentlyContinue
    
    if ($magickPath) {
        Write-Host "  Redimensionando para ${size}x${size} usando ImageMagick..." -ForegroundColor Gray
        & magick $faviconPath -resize "${size}x${size}" $outputPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Criado: icon-${size}x${size}.png" -ForegroundColor Green
        } else {
            Write-Host "  [AVISO] Erro ao redimensionar com ImageMagick" -ForegroundColor Yellow
            Copy-Item $faviconPath $outputPath -Force
            Write-Host "  [INFO] Copiado favicon original como placeholder" -ForegroundColor Yellow
        }
    } else {
        # Se ImageMagick não estiver disponível, copiar o favicon original
        Write-Host "  [INFO] ImageMagick não encontrado. Copiando favicon original..." -ForegroundColor Yellow
        Copy-Item $faviconPath $outputPath -Force
        Write-Host "  [OK] Copiado: icon-${size}x${size}.png (mesmo tamanho do original)" -ForegroundColor Green
        Write-Host "  [AVISO] Para redimensionar corretamente, instale ImageMagick:" -ForegroundColor Yellow
        Write-Host "    choco install imagemagick" -ForegroundColor White
        Write-Host "    ou baixe de: https://imagemagick.org/script/download.php" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] ÍCONES CRIADOS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ícones criados em: $IconsDir" -ForegroundColor Cyan
Write-Host ""

