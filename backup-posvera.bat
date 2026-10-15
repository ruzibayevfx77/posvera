@echo off
set PG_BIN=C:\Program Files\PostgreSQL\18\bin
set BACKUP_DIR=C:\POSVERA-backup

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm"') do set STAMP=%%i

"%PG_BIN%\pg_dump.exe" -U postgres -h localhost -p 5432 -d posvera -F c -f "%BACKUP_DIR%\posvera_%STAMP%.backup"

if %errorlevel% neq 0 (
  echo XATO: zaxira nusxa olinmadi
  exit /b 1
)

echo Zaxira nusxa tayyor: %BACKUP_DIR%\posvera_%STAMP%.backup

rem 14 kundan eski nusxalarni o'chirish
forfiles /p "%BACKUP_DIR%" /m *.backup /d -14 /c "cmd /c del @path" 2>nul
exit /b 0