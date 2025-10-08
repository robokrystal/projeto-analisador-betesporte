@echo off
echo ========================================
echo    ROBOZINHO DA TROPA - INICIANDO
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Iniciando servidor WebSocket...
start "Servidor WebSocket" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando Ngrok...
start "Ngrok Tunnel" cmd /k "ngrok http 3000"
timeout /t 5 /nobreak >nul

echo [3/3] Iniciando scraper...
start "Scraper Multi-Plataforma" cmd /k "node index.js"

echo.
echo ========================================
echo    SISTEMA INICIADO!
echo ========================================
echo.
echo 3 janelas foram abertas:
echo   - Servidor WebSocket (porta 3000)
echo   - Ngrok Tunnel
echo   - Scraper Multi-Plataforma
echo.
echo Para parar: Feche as janelas ou pressione Ctrl+C
echo.
pause
