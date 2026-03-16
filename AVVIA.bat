@echo off
title Opale Studio
echo.
echo  *** OPALE STUDIO ***
echo.
echo  Avvio backend e frontend...
echo.

:: Start backend
start "Opale Backend" cmd /k "cd /d %~dp0backend && node server.js"

:: Wait a moment then start frontend dev server
timeout /t 2 /nobreak > nul
start "Opale Frontend" cmd /k "cd /d %~dp0frontend && npx vite"

:: Wait for frontend to start then open browser
timeout /t 4 /nobreak > nul
start http://localhost:5173

echo.
echo  App avviata su http://localhost:5173
echo  Admin: admin@opalestudio.it / Opale2024!
echo.
pause
