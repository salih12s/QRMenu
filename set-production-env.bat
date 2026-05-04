@echo off
REM ============================================================
REM Ugur'um Cafe QR Menu — PRODUCTION environment activator
REM ============================================================
REM Copies production env templates into active .env files for
REM both server and client. Edit server\env\production.env and
REM client\env\production.env BEFORE running this script.
REM ============================================================

setlocal

set "ROOT=%~dp0"
set "SERVER_SRC=%ROOT%server\env\production.env"
set "SERVER_DST=%ROOT%server\.env"
set "CLIENT_SRC=%ROOT%client\env\production.env"
set "CLIENT_DST=%ROOT%client\.env"

echo.
echo === Activating PRODUCTION environment ===
echo.

if not exist "%SERVER_SRC%" (
    echo [ERROR] Missing %SERVER_SRC%
    exit /b 1
)
if not exist "%CLIENT_SRC%" (
    echo [ERROR] Missing %CLIENT_SRC%
    exit /b 1
)

copy /Y "%SERVER_SRC%" "%SERVER_DST%" >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy server env.
    exit /b 1
)
echo [OK]    server\.env      ^<-- server\env\production.env

copy /Y "%CLIENT_SRC%" "%CLIENT_DST%" >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy client env.
    exit /b 1
)
echo [OK]    client\.env      ^<-- client\env\production.env

echo.
echo PRODUCTION environment is now active.
echo Make sure secrets in server\env\production.env are real values
echo and that server\uploads is mapped to a persistent disk/volume.
echo.

endlocal
