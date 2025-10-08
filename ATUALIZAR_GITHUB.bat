@echo off
echo ========================================
echo    ATUALIZANDO GITHUB
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Adicionando arquivos alterados...
git add .

echo.
echo [2/3] Criando commit...
set /p mensagem="Digite a mensagem do commit (ou Enter para usar 'Atualização'): "
if "%mensagem%"=="" set mensagem=Atualização

git commit -m "%mensagem%"

echo.
echo [3/3] Enviando para GitHub...
git push origin main

echo.
echo ========================================
echo    CONCLUÍDO!
echo ========================================
echo.
echo O GitHub e o Netlify serão atualizados automaticamente!
echo.
pause
