@echo off
REM RSV360 SSL Certificate Generator
REM Generates self-signed certificates for development/testing

echo.
echo ===========================================
echo    RSV360 SSL Certificate Generator
echo ===========================================
echo.

echo Verificando OpenSSL...
openssl version >nul 2>&1
if errorlevel 1 (
    echo ❌ OpenSSL não encontrado.
    echo.
    echo Para instalar OpenSSL no Windows:
    echo 1. Instalar Git for Windows (inclui OpenSSL): https://gitforwindows.org/
    echo 2. Ou instalar OpenSSL diretamente: https://slproweb.com/products/Win32OpenSSL.html
    echo 3. Ou usar Chocolatey: choco install openssl
    echo.
    echo Após instalar, execute este script novamente.
    pause
    exit /b 1
)

set CERT_DIR=docker\nginx\ssl
set CERT_FILE=%CERT_DIR%\cert.pem
set KEY_FILE=%CERT_DIR%\key.pem

if not exist "%CERT_DIR%" (
    mkdir "%CERT_DIR%"
    echo ✅ Created SSL directory: %CERT_DIR%
)

echo Generating self-signed SSL certificate...
echo This may take a few seconds...
echo.

REM Generate private key
openssl genrsa -out "%KEY_FILE%" 2048 2>nul
if errorlevel 1 (
    echo ❌ Failed to generate private key
    pause
    exit /b 1
)

REM Generate certificate
openssl req -new -x509 -key "%KEY_FILE%" -out "%CERT_FILE%" -days 365 -subj "/C=BR/ST=SP/L=Sao Paulo/O=RSV360/OU=Dev/CN=localhost" 2>nul
if errorlevel 1 (
    echo ❌ Failed to generate certificate
    pause
    exit /b 1
)

echo.
echo ✅ SSL certificates generated successfully!
echo.
echo Certificate: %CERT_FILE%
echo Private Key: %KEY_FILE%
echo.
echo ⚠️  WARNING: These are self-signed certificates for development only!
echo    Do not use in production. Replace with proper SSL certificates.
echo.
echo Next steps:
echo 1. Copy .env.example to .env and configure your environment variables
echo 2. Run: docker-compose -f docker-compose.prod.yml up --build
echo 3. Access: https://localhost (accept the self-signed certificate warning)
echo.
pause