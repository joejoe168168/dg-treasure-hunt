@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 goto python_found

where python >nul 2>nul
if %errorlevel%==0 goto python_fallback

echo Python was not found on this computer.
echo Install Python, or run any local web server in this folder.
pause
exit /b 1

:python_found
start "DG V2 Server" /min py -m http.server 8000 --directory "%~dp0"
goto open_game

:python_fallback
start "DG V2 Server" /min python -m http.server 8000 --directory "%~dp0"

:open_game
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000/v2/"
exit /b 0
