param(
    [Parameter(Position = 0)]
    [string]$PatchPath,

    [switch]$DropStash
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info([string]$Message) { Write-Host "[INFO] $Message" }
function Write-Warn([string]$Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Err([string]$Message) { Write-Host "[ERRO] $Message" -ForegroundColor Red }

function Test-GitRepo {
    git rev-parse --is-inside-work-tree *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "Este diretório não é um repositório Git."
    }
}

function Get-SearchDirs {
    $dirs = @('.', '/workspace')
    if ($env:USERPROFILE) {
        $dirs += @(
            (Join-Path $env:USERPROFILE 'Downloads'),
            (Join-Path $env:USERPROFILE 'Desktop'),
            (Join-Path $env:USERPROFILE 'Documents')
        )
    }

    $dirs | Where-Object { Test-Path $_ }
}

function Find-PatchByExtension {
    $latest = $null

    foreach ($dir in (Get-SearchDirs)) {
        $files = Get-ChildItem -Path $dir -File -Recurse -Depth 4 -ErrorAction SilentlyContinue |
            Where-Object { $_.Extension -in @('.patch', '.diff') }

        foreach ($file in $files) {
            if (-not $latest -or $file.LastWriteTime -gt $latest.LastWriteTime) {
                $latest = $file
            }
        }
    }

    return $latest
}

function Find-PatchByContent {
    $latest = $null
    $pattern = '^(diff --git |\*\*\* Begin Patch)'

    foreach ($dir in (Get-SearchDirs)) {
        $files = Get-ChildItem -Path $dir -File -Recurse -Depth 4 -ErrorAction SilentlyContinue |
            Where-Object { $_.Extension -in @('.txt', '.md', '.log') }

        foreach ($file in $files) {
            try {
                $hasPatchContent = Select-String -Path $file.FullName -Pattern $pattern -Quiet
                if ($hasPatchContent) {
                    if (-not $latest -or $file.LastWriteTime -gt $latest.LastWriteTime) {
                        $latest = $file
                    }
                }
            }
            catch {
                # ignora arquivos sem permissão/encoding incompatível
            }
        }
    }

    return $latest
}

function Resolve-PatchPath([string]$Requested) {
    if ($Requested) {
        if (-not (Test-Path $Requested)) {
            throw "Arquivo de patch não encontrado: $Requested"
        }
        return (Resolve-Path $Requested).Path
    }

    $byExt = Find-PatchByExtension
    if ($byExt) {
        Write-Info "Patch localizado por extensão: $($byExt.FullName)"
        return $byExt.FullName
    }

    Write-Warn 'Nenhum .patch/.diff encontrado. Buscando por conteúdo de patch...'
    $byContent = Find-PatchByContent
    if ($byContent) {
        Write-Info "Patch localizado por conteúdo: $($byContent.FullName)"
        return $byContent.FullName
    }

    throw "Nenhum patch encontrado por extensão ou conteúdo. Informe o caminho manualmente."
}

function Invoke-ApplyPatch([string]$File) {
    Write-Info 'Tentando validação preliminar (git apply --check)...'
    git apply --check "$File" *> $null

    if ($LASTEXITCODE -eq 0) {
        Write-Info 'Patch passou em --check. Aplicando com --3way --whitespace=fix'
        git apply --3way --whitespace=fix "$File"
        if ($LASTEXITCODE -eq 0) { return }
    }
    else {
        Write-Warn 'Patch não passou em --check. Tentando aplicação robusta com --3way...'
        git apply --3way --whitespace=fix "$File"
        if ($LASTEXITCODE -eq 0) { return }
    }

    Write-Warn 'Aplicação com --3way falhou. Tentando fallback com --reject...'
    git apply --reject --whitespace=fix "$File"
    if ($LASTEXITCODE -ne 0) {
        throw 'Falha ao aplicar patch mesmo com fallback --reject.'
    }
}

function Get-StashRefByMessage([string]$Message) {
    $line = git stash list --format='%gd %s' | Where-Object { $_ -match [regex]::Escape($Message) } | Select-Object -First 1
    if (-not $line) { return $null }
    return ($line -split ' ')[0]
}

function Restore-Stash([string]$StashRef, [bool]$ShouldDrop) {
    Write-Info "Restaurando contexto local com git stash apply --index $StashRef"
    git stash apply --index "$StashRef" *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Falha ao restaurar stash automaticamente. Stash preservado: $StashRef"
        return 2
    }

    if ($ShouldDrop) {
        Write-Info "Removendo stash de segurança: $StashRef"
        git stash drop "$StashRef" *> $null
    }
    else {
        Write-Info "Stash de segurança preservado: $StashRef"
    }

    return 0
}

function Show-RejectsAndStatus {
    $rejFiles = Get-ChildItem -Path . -Filter '*.rej' -File -Recurse -ErrorAction SilentlyContinue
    if ($rejFiles.Count -gt 0) {
        Write-Warn "Foram gerados $($rejFiles.Count) arquivo(s) .rej:"
        $rejFiles | ForEach-Object { Write-Host $_.FullName }
    }
    else {
        Write-Info 'Nenhum arquivo .rej encontrado.'
    }

    Write-Info 'Status final resumido:'
    git status --short --branch
}

try {
    Test-GitRepo

    $resolvedPatch = Resolve-PatchPath -Requested $PatchPath
    Write-Info "Repo raiz: $(git rev-parse --show-toplevel)"
    Write-Info "Branch atual: $(git branch --show-current)"
    Write-Info "Patch selecionado: $resolvedPatch"

    $stashRef = $null
    $statusOutput = git status --porcelain
    $hasLocalChanges = -not [string]::IsNullOrWhiteSpace(($statusOutput | Out-String))
    if ($hasLocalChanges) {
        $stashName = "pre-reapply-patch-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-Info 'Salvando estado local (tracked + untracked) em stash...'
        git stash push -u -m "$stashName" *> $null
        if ($LASTEXITCODE -ne 0) {
            throw 'Falha ao criar stash de segurança.'
        }

        $stashRef = Get-StashRefByMessage -Message $stashName
        if (-not $stashRef) {
            throw 'Não foi possível localizar a referência do stash criado.'
        }
    }
    else {
        Write-Info 'Sem alterações locais para stash. Prosseguindo sem criar backup temporário.'
    }

    Invoke-ApplyPatch -File $resolvedPatch

    $restoreExit = 0
    if ($stashRef) {
        $restoreExit = Restore-Stash -StashRef $stashRef -ShouldDrop:$DropStash.IsPresent
    }

    Show-RejectsAndStatus
    exit $restoreExit
}
catch {
    Write-Err $_.Exception.Message
    if ($_.ScriptStackTrace) {
        Write-Warn $_.ScriptStackTrace
    }
    exit 1
}
