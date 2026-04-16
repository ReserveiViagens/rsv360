# RSV360 - Start All Services Script
# Comprehensive startup script for RSV360 production-ready system

param(
    [switch]$SkipDatabase,
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$Verbose
)

# Configuration
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackendPort = 4000
$FrontendPort = 3000
$TurismoPort = 3001
$AdminPort = 3002
$GuestPort = 3003

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$White = "White"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n[STEP] $Message" $Cyan
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" $Green
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" $Red
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" $Yellow
}

function Test-Port {
    param([int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

function Wait-ForService {
    param([string]$Url, [string]$ServiceName, [int]$TimeoutSeconds = 30)

    Write-ColorOutput "Waiting for $ServiceName to be ready..." $Yellow

    $startTime = Get-Date
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "$ServiceName is ready!"
                return $true
            }
        } catch {
            # Service not ready yet
        }
        Start-Sleep -Seconds 2
        $elapsed = (Get-Date) - $startTime
        $elapsed = $elapsed.TotalSeconds
    }

    Write-Error "$ServiceName failed to start within $TimeoutSeconds seconds"
    return $false
}

function Start-PostgreSQL {
    if ($SkipDatabase) {
        Write-Warning "Skipping PostgreSQL startup"
        return
    }

    Write-Step "Starting PostgreSQL Database"

    # Check if PostgreSQL is already running on port 5432
    if (Test-Port 5432) {
        Write-Success "PostgreSQL is already running on port 5432"
        return
    }

    # Try to start PostgreSQL service
    try {
        $pgServices = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue
        if ($pgServices) {
            foreach ($service in $pgServices) {
                if ($service.Status -ne "Running") {
                    Start-Service $service.Name
                    Write-Success "PostgreSQL service '$($service.Name)' started"
                    return
                }
            }
            Write-Success "PostgreSQL service is already running"
            return
        }
    } catch {
        Write-Warning "Could not start PostgreSQL service: $_"
    }

    # If service approach failed, try to start PostgreSQL manually
    try {
        # Try common PostgreSQL installation paths
        $pgPaths = @(
            "C:\Program Files\PostgreSQL\*\bin\pg_ctl.exe",
            "C:\Program Files (x86)\PostgreSQL\*\bin\pg_ctl.exe",
            "$env:ProgramFiles\PostgreSQL\*\bin\pg_ctl.exe"
        )

        foreach ($path in $pgPaths) {
            $pgCtl = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($pgCtl) {
                Write-ColorOutput "Found PostgreSQL at: $($pgCtl.FullName)" $Yellow
                Write-Warning "PostgreSQL found but manual startup not implemented. Please start PostgreSQL manually."
                return
            }
        }
    } catch {
        # Ignore errors
    }

    # If Docker is available, try to start PostgreSQL via Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-ColorOutput "Docker found. Attempting to start PostgreSQL via Docker..." $Yellow

            # Check if container already exists
            $containerExists = docker ps -a --filter "name=rsv360-postgres" --format "{{.Names}}" 2>$null
            if ($containerExists) {
                docker start rsv360-postgres 2>$null | Out-Null
                Write-Success "PostgreSQL Docker container started"
                return
            } else {
                Write-Warning "PostgreSQL Docker container not found. Please ensure PostgreSQL is running manually."
                return
            }
        }
    } catch {
        # Docker not available
    }

    Write-Warning "PostgreSQL not found or could not be started. Please ensure PostgreSQL is installed and running on port 5432"
    Write-ColorOutput "You can skip database startup with: .\start-all.ps1 -SkipDatabase" $Yellow
}

function Start-Backend {
    if ($SkipBackend) {
        Write-Warning "Skipping Backend startup"
        return
    }

    Write-Step "Starting RSV360 Backend API"

    # Check if backend is already running
    if (Test-Port $BackendPort) {
        Write-Success "Backend is already running on port $BackendPort"
        return
    }

    # Navigate to backend directory
    Push-Location "$ProjectRoot\backend"

    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-ColorOutput "Installing backend dependencies..." $Yellow
            npm install
        }

        # Start backend in background
        Write-ColorOutput "Starting backend server..." $Yellow
        $backendJob = Start-Job -ScriptBlock {
            param($workingDir)
            Set-Location $workingDir
            npm start
        } -ArgumentList $PWD.Path

        # Wait for backend to start
        if (Wait-ForService "http://localhost:$BackendPort/health" "Backend API") {
            Write-Success "Backend started successfully on port $BackendPort"
        } else {
            throw "Backend failed to start"
        }

    } catch {
        Write-Error "Failed to start backend: $_"
        throw
    } finally {
        Pop-Location
    }
}

function Start-FrontendApp {
    param([string]$AppName, [string]$AppDir, [int]$Port)

    if ($SkipFrontend) {
        Write-Warning "Skipping $AppName startup"
        return
    }

    Write-Step "Starting $AppName"

    # Check if app is already running
    if (Test-Port $Port) {
        Write-Success "$AppName is already running on port $Port"
        return
    }

    # Navigate to app directory
    Push-Location "$ProjectRoot\$AppDir"

    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-ColorOutput "Installing $AppName dependencies..." $Yellow
            npm install
        }

        # Start app in background
        Write-ColorOutput "Starting $AppName..." $Yellow
        $appJob = Start-Job -ScriptBlock {
            param($workingDir)
            Set-Location $workingDir
            npm run dev
        } -ArgumentList $PWD.Path

        # Wait for app to start
        if (Wait-ForService "http://localhost:$Port" $AppName) {
            Write-Success "$AppName started successfully on port $Port"
        } else {
            Write-Warning "$AppName may have started but health check failed"
        }

    } catch {
        Write-Error "Failed to start $AppName`: $_"
    } finally {
        Pop-Location
    }
}

function Show-Status {
    Write-Step "Service Status Check"

    $services = @(
        @{Name = "PostgreSQL"; Port = 5432; Url = $null},
        @{Name = "Backend API"; Port = $BackendPort; Url = "http://localhost:$BackendPort/health"},
        @{Name = "Site Público"; Port = $FrontendPort; Url = "http://localhost:$FrontendPort"},
        @{Name = "Turismo App"; Port = $TurismoPort; Url = "http://localhost:$TurismoPort"},
        @{Name = "Admin Panel"; Port = $AdminPort; Url = "http://localhost:$AdminPort"},
        @{Name = "Guest App"; Port = $GuestPort; Url = "http://localhost:$GuestPort"}
    )

    foreach ($service in $services) {
        $status = if ($service.Port -eq 5432) {
            # Special check for PostgreSQL
            try {
                $tcpClient = New-Object System.Net.Sockets.TcpClient
                $tcpClient.Connect("localhost", $service.Port)
                $tcpClient.Close()
                "Running"
            } catch {
                "Not Running"
            }
        } elseif (Test-Port $service.Port) {
            if ($service.Url) {
                try {
                    $response = Invoke-WebRequest -Uri $service.Url -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
                    if ($response.StatusCode -eq 200) { "Running" } else { "Port Open" }
                } catch {
                    "Port Open"
                }
            } else {
                "Port Open"
            }
        } else {
            "Not Running"
        }

        $color = if ($status -eq "Running") { $Green } elseif ($status -eq "Port Open") { $Yellow } else { $Red }
        Write-ColorOutput ("{0,-15} : {1}" -f $service.Name, $status) $color
    }
}

function Show-Help {
    Write-ColorOutput @"

RSV360 Start All Services Script

USAGE:
    .\start-all.ps1 [options]

OPTIONS:
    -SkipDatabase    Skip PostgreSQL startup
    -SkipFrontend    Skip all frontend apps startup
    -SkipBackend     Skip backend API startup
    -Verbose         Show detailed output

SERVICES STARTED:
    - PostgreSQL Database (port 5432)
    - Backend API (port $BackendPort)
    - Site Público (port $FrontendPort)
    - Turismo App (port $TurismoPort)
    - Admin Panel (port $AdminPort)
    - Guest App (port $GuestPort)

EXAMPLES:
    .\start-all.ps1                          # Start all services
    .\start-all.ps1 -SkipFrontend           # Start only backend and database
    .\start-all.ps1 -SkipDatabase -Verbose  # Start frontend and backend only with verbose output

"@ $White
}

# Main execution
try {
    Write-ColorOutput @"
╔══════════════════════════════════════════════════════════════╗
║                    🚀 RSV360 START ALL                      ║
║              Sistema de Gestão de Viagens e Turismo         ║
╚══════════════════════════════════════════════════════════════╝
"@ $Cyan

    if ($args -contains "-h" -or $args -contains "--help") {
        Show-Help
        exit 0
    }

    # Start services in order
    Start-PostgreSQL
    Start-Backend
    Start-FrontendApp "Site Público" "apps\site-publico" $FrontendPort
    Start-FrontendApp "Turismo App" "apps\turismo" $TurismoPort
    Start-FrontendApp "Admin Panel" "apps\admin" $AdminPort
    Start-FrontendApp "Guest App" "apps\guest" $GuestPort

    # Show final status
    Show-Status

    Write-ColorOutput @"

╔══════════════════════════════════════════════════════════════╗
║                    ✅ ALL SERVICES STARTED                  ║
║                                                              ║
║  🌐 Site Público: http://localhost:$FrontendPort              ║
║  🏢 Admin Panel:  http://localhost:$AdminPort                 ║
║  ✈️  Turismo App:  http://localhost:$TurismoPort              ║
║  🏠 Guest App:    http://localhost:$GuestPort                ║
║  🔧 Backend API:  http://localhost:$BackendPort              ║
║                                                              ║
║  📊 Health Check: http://localhost:$BackendPort/health       ║
║  🔄 Ready Check:  http://localhost:$BackendPort/ready        ║
╚══════════════════════════════════════════════════════════════╝
"@ $Green

} catch {
    Write-Error "Startup failed: $_"
    Write-ColorOutput "`nTo troubleshoot, check the individual service logs or run with -Verbose flag" $Yellow
    exit 1
}