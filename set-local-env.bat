@echo off
REM ============================================================
REM Ugur'um Cafe QR Menu — LOCAL environment activator
REM ============================================================
REM Copies local env templates into active .env files for
REM both server and client.
REM ============================================================

setlocal

set "ROOT=%~dp0"
set "SERVER_SRC=%ROOT%server\env\local.env"
set "SERVER_DST=%ROOT%server\.env"
set "CLIENT_SRC=%ROOT%client\env\local.env"
set "CLIENT_DST=%ROOT%client\.env"

echo.
echo === Activating LOCAL environment ===
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
echo [OK]    server\.env      ^<-- server\env\local.env

copy /Y "%CLIENT_SRC%" "%CLIENT_DST%" >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy client env.
    exit /b 1
)
echo [OK]    client\.env      ^<-- client\env\local.env

echo.
echo LOCAL environment is now active.
echo   - DB:        postgresql://postgres:12345@localhost:5432/QRMenu
echo   - API:       http://localhost:5000
echo   - Frontend:  http://localhost:5173
echo.

endlocal
