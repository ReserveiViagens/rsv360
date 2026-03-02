# Script para criar ícones PWA básicos
# Cria placeholders SVG que podem ser convertidos para PNG depois

$RootPath = "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
$IconsDir = Join-Path $RootPath "apps\site-publico\public\icons"

# Garantir que a pasta existe
if (-not (Test-Path $IconsDir)) {
    New-Item -ItemType Directory -Path $IconsDir -Force | Out-Null
    Write-Host "Pasta icons criada" -ForegroundColor Green
}

# Função para criar SVG de ícone
function Create-IconSVG {
    param([int]$Size)
    
    $svg = @"
<svg width="$Size" height="$Size" viewBox="0 0 $Size $Size" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad$Size" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="$Size" height="$Size" rx="$($Size * 0.2)" fill="url(#grad$Size)"/>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="$($Size * 0.3)" font-weight="bold" text-anchor="middle" fill="white">RSV</text>
  <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="$($Size * 0.15)" font-weight="normal" text-anchor="middle" fill="rgba(255,255,255,0.8)">360</text>
  <circle cx="$($Size * 0.2)" cy="$($Size * 0.2)" r="$($Size * 0.05)" fill="rgba(255,255,255,0.3)"/>
  <circle cx="$($Size * 0.8)" cy="$($Size * 0.2)" r="$($Size * 0.05)" fill="rgba(255,255,255,0.3)"/>
  <circle cx="$($Size * 0.2)" cy="$($Size * 0.8)" r="$($Size * 0.05)" fill="rgba(255,255,255,0.3)"/>
  <circle cx="$($Size * 0.8)" cy="$($Size * 0.8)" r="$($Size * 0.05)" fill="rgba(255,255,255,0.3)"/>
</svg>
"@
    
    $svgPath = Join-Path $IconsDir "icon-${Size}x${Size}.svg"
    $svg | Out-File -FilePath $svgPath -Encoding UTF8 -NoNewline
    Write-Host "  [OK] Criado: icon-${Size}x${Size}.svg" -ForegroundColor Green
    
    # Criar um placeholder PNG (arquivo vazio que será substituído depois)
    # Em produção, use uma ferramenta como ImageMagick ou sharp para converter SVG->PNG
    $pngPath = Join-Path $IconsDir "icon-${Size}x${Size}.png"
    "# Placeholder - Converta o SVG correspondente para PNG usando uma ferramenta de conversão" | Out-File -FilePath $pngPath -Encoding UTF8
    Write-Host "  [INFO] Placeholder criado: icon-${Size}x${Size}.png (converta o SVG para PNG)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CRIANDO ÍCONES PWA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar os ícones necessários
$sizes = @(192, 512)

foreach ($size in $sizes) {
    Write-Host "Criando ícone ${size}x${size}..." -ForegroundColor Yellow
    Create-IconSVG -Size $size
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] ÍCONES CRIADOS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NOTA: Os arquivos PNG são placeholders." -ForegroundColor Yellow
Write-Host "Para criar PNGs reais, você pode:" -ForegroundColor Yellow
Write-Host "  1. Usar o favicon do Vercel Blob e redimensionar" -ForegroundColor White
Write-Host "  2. Converter os SVGs usando ImageMagick ou online tools" -ForegroundColor White
Write-Host "  3. Usar o script generate-pwa-icons.js (se tiver dependências instaladas)" -ForegroundColor White
Write-Host ""
Write-Host "Por enquanto, os SVGs estão prontos e os PNGs são placeholders." -ForegroundColor Cyan
Write-Host "O sistema funcionará, mas os ícones podem não aparecer até serem convertidos." -ForegroundColor Cyan
Write-Host ""

