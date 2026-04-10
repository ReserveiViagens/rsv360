$results = @()

# Buscar arquivos com @ts-nocheck em ambos os apps
$spFiles = Get-ChildItem -Path "apps/site-publico" -Recurse -Filter *.ts |
    Where-Object { try { Get-Content $_.FullName -ErrorAction Stop | Select-String -Pattern "@ts-nocheck" } catch {} }

$turFiles = Get-ChildItem -Path "apps/turismo" -Recurse -Filter *.ts |
    Where-Object { try { Get-Content $_.FullName -ErrorAction Stop | Select-String -Pattern "@ts-nocheck" } catch {} }

$allFiles = $spFiles + $turFiles

Write-Host "Encontrados $($allFiles.Count) arquivos com @ts-nocheck"

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $cleaned = $content -replace '// @ts-nocheck\r?\n', ''
    Set-Content $file.FullName -Value $cleaned -NoNewline

    # Compilar e contar erros deste arquivo
    $workspace = if ($file.FullName -match 'site-publico') { 'apps/site-publico' } else { 'apps/turismo' }
    Push-Location $workspace
    try {
        $errorOutput = npx tsc -p tsconfig.json --noEmit 2>&1
        $errorCount = ($errorOutput | Select-String $file.Name | Measure-Object).Count
    } catch {
        $errorCount = -1
    }
    Pop-Location

    $results += [PSCustomObject]@{
        File = $file.FullName -replace '.*apps\\', 'apps/'
        Errors = $errorCount
        Workspace = $workspace
    }

    # Restaurar @ts-nocheck
    Set-Content $file.FullName -Value $content -NoNewline
    Write-Host "$($file.Name): $errorCount erros"
}

# Gerar relatório de prioridades
$results | ForEach-Object {
    if ($_.Errors -eq 0) {
        $priority = 1
    } elseif ($_.Errors -ge 1 -and $_.Errors -le 5) {
        $priority = 2
    } elseif ($_.Errors -ge 6 -and $_.Errors -le 20) {
        $priority = 3
    } elseif ($_.Errors -gt 20) {
        $priority = 4
    } else {
        $priority = 5
    }
    $_ | Add-Member -MemberType NoteProperty -Name Priority -Value $priority -Force
}

$results | Export-Csv -Path "C:\temp\ts-nocheck-priority.csv" -NoTypeInformation -Encoding UTF8

$count1 = ($results | Where-Object { $_.Priority -eq 1 }).Count
$count2 = ($results | Where-Object { $_.Priority -eq 2 }).Count
$count3 = ($results | Where-Object { $_.Priority -eq 3 }).Count
$count4 = ($results | Where-Object { $_.Priority -eq 4 }).Count

Write-Host "`nRELATÓRIO FINAL:"
Write-Host "PRIORITY 1 (0 erros): $count1 arquivos"
Write-Host "PRIORITY 2 (1-5 erros): $count2 arquivos"
Write-Host "PRIORITY 3 (6-20 erros): $count3 arquivos"
Write-Host "PRIORITY 4 (20+ erros): $count4 arquivos"

Write-Host "`nRelatório salvo em C:\temp\ts-nocheck-priority.csv"