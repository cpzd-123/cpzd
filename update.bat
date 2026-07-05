@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%XHBlogs"
set "ADMIN=%ROOT%my-blog-manager"

:menu
cls
call :say PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgICAgQ1BaRCDnrqHnkIblkK/liqjlmagKPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CgoxLiDlkK/liqjliY3lj7DnvZHnq5kKMi4g5ZCv5YqoIENQWkQgQWRtaW4g5ZCO5Y+wCjMuIOS4gOmUruS4iuS8oOW5tuWPkeW4gwo0LiDlronoo4XliY3lj7Dkvp3otZYKNS4g5a6J6KOF5ZCO5Y+w5L6d6LWWCjYuIOafpeeciyBHaXQg54q25oCBCjcuIOW8uuWItuimhuebliBHaXRIdWIgbWFpbiDliIbmlK8KOC4g6YCA5Ye6
echo.
set /p "choice=Select: "

if "%choice%"=="1" goto frontend
if "%choice%"=="2" goto admin
if "%choice%"=="3" goto publish
if "%choice%"=="4" goto install_frontend
if "%choice%"=="5" goto install_admin
if "%choice%"=="6" goto git_status
if "%choice%"=="7" goto force_push
if "%choice%"=="8" goto end

echo.
call :say 5peg5pWI6YCJ5oup77yM6K+36YeN5paw6L6T5YWl44CC
pause
goto menu

:frontend
cd /d "%FRONTEND%"
npm run dev
pause
goto menu

:admin
cd /d "%ADMIN%"
if exist "Start.bat" (
  call Start.bat
) else (
  npm run dev
)
pause
goto menu

:publish
call "%ROOT%publish.bat"
goto menu

:install_frontend
cd /d "%FRONTEND%"
npm install
pause
goto menu

:install_admin
cd /d "%ADMIN%"
npm install
pause
goto menu

:git_status
cd /d "%ROOT%"
echo.
echo [Git Remote]
git remote -v
echo.
echo [Git Branch]
git branch
echo.
echo [Git Status]
git status --short
echo.
pause
goto menu

:force_push
cd /d "%ROOT%"
echo.
call :say 5Y2x6Zmp5pON5L2c77ya6L+Z5Lya5by65Yi26KaG55uWIEdpdEh1YiBtYWluIOWIhuaUr+OAgg==
call :say 6buY6K6k5LiN5bu66K6u5L2/55So44CC5Y+q5pyJ5L2g5piO56Gu55+l6YGT5ZCO5p6c5pe25omN57un57ut44CC
echo.
set /p "confirm=Type YES to confirm force push: "
if not "%confirm%"=="YES" (
  call :say 5bey5Y+W5raI5by65Yi25o6o6YCB44CC
  pause
  goto menu
)
git remote set-url origin https://github.com/cpzd-123/cpzd.git
git push -u origin main --force
pause
goto menu

:say
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; Write-Host ([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('%~1')))"
exit /b 0

:end
endlocal
exit /b 0
