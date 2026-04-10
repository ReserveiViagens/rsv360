# Script simplificado para análise de @ts-nocheck

Write-Host "=== ANÁLISE DE @ts-nocheck NO RSV360 MONOREPO ==="
Write-Host ""

# Buscar arquivos com @ts-nocheck
$spFiles = Get-ChildItem -Path "apps/site-publico" -Recurse -Filter *.ts -ErrorAction SilentlyContinue |
    Where-Object { try { Get-Content $_.FullName -ErrorAction Stop | Select-String -Pattern "@ts-nocheck" } catch {} }

$turFiles = Get-ChildItem -Path "apps/turismo" -Recurse -Filter *.ts -ErrorAction SilentlyContinue |
    Where-Object { try { Get-Content $_.FullName -ErrorAction Stop | Select-String -Pattern "@ts-nocheck" } catch {} }

$totalFiles = ($spFiles + $turFiles).Count

Write-Host "RESULTADO DA ANÁLISE:"
Write-Host "- site-publico: $($spFiles.Count) arquivos com @ts-nocheck"
Write-Host "- turismo: $($turFiles.Count) arquivos com @ts-nocheck"
Write-Host "- TOTAL: $totalFiles arquivos com @ts-nocheck"
Write-Host ""

if ($totalFiles -eq 0) {
    Write-Host "✅ CONCLUSÃO: Nenhum arquivo com @ts-nocheck encontrado!"
    Write-Host "   O Batch 1 já foi concluído ou os arquivos foram reescritos."
    Write-Host ""

    # Criar CSV vazio para documentar
    $emptyReport = @([PSCustomObject]@{
        File = "Nenhum arquivo encontrado"
        Errors = 0
        Workspace = "N/A"
        Priority = 0
    })
    $emptyReport | Export-Csv -Path "C:\temp\ts-nocheck-priority.csv" -NoTypeInformation -Encoding UTF8

    Write-Host "RELATÓRIO FINAL:"
    Write-Host "PRIORITY 1 (0 erros): 0 arquivos"
    Write-Host "PRIORITY 2 (1-5 erros): 0 arquivos"
    Write-Host "PRIORITY 3 (6-20 erros): 0 arquivos"
    Write-Host "PRIORITY 4 (20+ erros): 0 arquivos"
    Write-Host ""
    Write-Host "Relatório salvo em C:\temp\ts-nocheck-priority.csv"
} else {
    Write-Host "⚠️  CONCLUSÃO: $totalFiles arquivos encontrados com @ts-nocheck"
    Write-Host "   Execute o script completo para análise detalhada de erros."
}