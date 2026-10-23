@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "Satellite Ops Intelligence" cmd /k "py -m http.server 8080"
) else (
  start "Satellite Ops Intelligence" cmd /k "python -m http.server 8080"
)
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"
endlocal
