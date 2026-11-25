@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel% equ 0 (
  start "" "http://127.0.0.1:8080"
  py -3 -m http.server 8080 --bind 127.0.0.1 --directory app/dist
  goto :fin
)
where python >nul 2>&1
if %errorlevel% equ 0 (
  start "" "http://127.0.0.1:8080"
  python -m http.server 8080 --bind 127.0.0.1 --directory app/dist
  goto :fin
)
echo Instala Python 3 y vuelve a abrir este archivo.
echo Tambien puedes usar el sitio publicado indicado en LEEME_PRIMERO.txt.
:fin
pause
