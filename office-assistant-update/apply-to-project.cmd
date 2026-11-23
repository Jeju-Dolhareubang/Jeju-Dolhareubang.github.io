@echo off
setlocal

set "SOURCE_DIR=%~dp0"
set "TARGET_DIR=D:\my_project\portfolio"

if not exist "%TARGET_DIR%\package.json" (
  echo [ERROR] React project was not found at:
  echo %TARGET_DIR%
  pause
  exit /b 1
)

for /f "tokens=1-4 delims=/-. " %%a in ("%date%") do set "DATE_STAMP=%%a%%b%%c%%d"
for /f "tokens=1-4 delims=:., " %%a in ("%time%") do set "TIME_STAMP=%%a%%b%%c%%d"
set "BACKUP_DIR=%TARGET_DIR%\.codex-backups\office-assistant-%DATE_STAMP%-%TIME_STAMP%"

mkdir "%BACKUP_DIR%" 2>nul
copy /y "%TARGET_DIR%\src\App.jsx" "%BACKUP_DIR%\App.jsx" >nul

mkdir "%TARGET_DIR%\src\components" 2>nul
copy /y "%SOURCE_DIR%src\App.jsx" "%TARGET_DIR%\src\App.jsx" >nul
copy /y "%SOURCE_DIR%src\components\OfficeMascot.jsx" "%TARGET_DIR%\src\components\OfficeMascot.jsx" >nul
copy /y "%SOURCE_DIR%src\components\mascotActions.js" "%TARGET_DIR%\src\components\mascotActions.js" >nul
copy /y "%SOURCE_DIR%src\components\OfficeMascot.css" "%TARGET_DIR%\src\components\OfficeMascot.css" >nul
copy /y "%SOURCE_DIR%public\office-actions-reference.png" "%TARGET_DIR%\public\office-actions-reference.png" >nul

if errorlevel 1 (
  echo [ERROR] Some files could not be copied.
  echo Backup: %BACKUP_DIR%
  pause
  exit /b 1
)

pushd "%TARGET_DIR%"
call npm run build
set "BUILD_RESULT=%ERRORLEVEL%"
popd

if not "%BUILD_RESULT%"=="0" (
  echo [ERROR] Files were applied, but the production build failed.
  echo Backup: %BACKUP_DIR%
  pause
  exit /b %BUILD_RESULT%
)

echo.
echo [DONE] Random Office assistant animations were applied successfully.
echo Backup: %BACKUP_DIR%
echo Run "npm run dev" in %TARGET_DIR% to preview the project.
pause
exit /b 0
