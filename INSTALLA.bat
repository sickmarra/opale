@echo off
title Opale Studio - Installazione
echo.
echo  *** OPALE STUDIO - Prima installazione ***
echo.

echo  [1/2] Installazione dipendenze backend...
cd /d %~dp0backend
call npm install
if errorlevel 1 (
    echo  ERRORE durante installazione backend!
    pause
    exit /b 1
)

echo.
echo  [2/2] Installazione dipendenze frontend...
cd /d %~dp0frontend
call npm install
if errorlevel 1 (
    echo  ERRORE durante installazione frontend!
    pause
    exit /b 1
)

echo.
echo  *** Installazione completata! ***
echo  Esegui AVVIA.bat per avviare l'applicazione.
echo.
pause
