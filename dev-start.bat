@echo off
REM RSV360 Development Environment Quick Start
REM ===========================================

echo.
echo ===========================================
echo    RSV360 - Ambiente de Desenvolvimento
echo ===========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não encontrado. Instale o Docker Desktop primeiro.
    pause
    exit /b 1
)

echo Verificando Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose não encontrado.
    pause
    exit /b 1
)

echo.
echo ✅ Docker e Docker Compose encontrados!
echo.

:menu
echo ===========================================
echo           MENU DE OPÇÕES
echo ===========================================
echo.
echo [1] Iniciar ambiente completo
echo [2] Iniciar em background (detached)
echo [3] Parar ambiente
echo [4] Ver logs
echo [5] Ver status dos serviços
echo [6] Reconstruir e reiniciar
echo [7] Limpar ambiente (remove volumes)
echo [8] Health check completo
echo [9] Sair
echo.
set /p choice="Escolha uma opção (1-9): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto start_detached
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto status
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto clean
if "%choice%"=="8" goto health_check
if "%choice%"=="9" goto exit

echo ❌ Opção inválida. Tente novamente.
goto menu

:start
echo.
echo 🚀 Iniciando ambiente de desenvolvimento...
docker-compose up --build
goto menu

:start_detached
echo.
echo 🚀 Iniciando ambiente em background...
docker-compose up --build -d
echo.
echo ✅ Ambiente iniciado! Use a opção 5 para verificar status.
goto menu

:stop
echo.
echo 🛑 Parando ambiente...
docker-compose down
echo ✅ Ambiente parado.
goto menu

:logs
echo.
echo 📋 Mostrando logs (Ctrl+C para sair)...
docker-compose logs -f
goto menu

:status
echo.
echo 📊 Status dos serviços:
docker-compose ps
echo.
echo 🔍 Health checks:
echo.
echo Backend: http://localhost:3002/health
curl -s http://localhost:3002/health 2>nul || echo ❌ Backend não responde
echo.
echo Frontend: http://localhost:3000/api/health
curl -s http://localhost:3000/api/health 2>nul || echo ❌ Frontend não responde
echo.
goto menu

:rebuild
echo.
echo 🔄 Reconstruindo e reiniciando ambiente...
docker-compose down
docker-compose up --build
goto menu

:clean
echo.
echo ⚠️  ATENÇÃO: Isso irá remover TODOS os dados persistentes!
set /p confirm="Tem certeza? (digite 'SIM' para confirmar): "
if not "%confirm%"=="SIM" (
    echo Operação cancelada.
    goto menu
)
echo.
echo 🧹 Limpando ambiente completo...
docker-compose down -v
docker system prune -f
echo ✅ Ambiente limpo.
goto menu

:health_check
echo.
echo 🔍 Executando health check completo...
echo.

echo 📡 Verificando PostgreSQL...
docker-compose exec -T postgres pg_isready -U rsv360 -d rsv360_db >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL: Não saudável
) else (
    echo ✅ PostgreSQL: Saudável
)

echo 📡 Verificando Redis...
docker-compose exec -T redis redis-cli --raw incr ping >nul 2>&1
if errorlevel 1 (
    echo ❌ Redis: Não saudável
) else (
    echo ✅ Redis: Saudável
)

echo 📡 Verificando Backend...
curl -s http://localhost:3002/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend: Não responde
) else (
    echo ✅ Backend: Respondendo
)

echo 📡 Verificando Frontend...
curl -s http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend: Não responde
) else (
    echo ✅ Frontend: Respondendo
)

echo.
echo ✅ Health check concluído.
goto menu

:exit
echo.
echo 👋 Até logo!
exit /b 0