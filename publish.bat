@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
set "TARGET_REMOTE=https://github.com/cpzd-123/cpzd.git"

cd /d "%ROOT%"

call :say PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgICAgQ1BaRCDkuIDplK7kuIrkvKDlj5HluIMKPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09
echo.

git --version >nul 2>&1
if errorlevel 1 (
  call :say 5pyq5qOA5rWL5YiwIEdpdO+8jOivt+WFiOWuieijhSBHaXTjgII=
  pause
  exit /b 1
)

if not exist ".git" (
  call :say 5b2T5YmN55uu5b2V5LiN5pivIEdpdCDku5PlupPvvIzmraPlnKjliJ3lp4vljJYuLi4=
  git init
  if errorlevel 1 goto fail
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  call :say 5pyq5om+5YiwIG9yaWdpbu+8jOato+WcqOa3u+WKoO+8mg==
  echo %TARGET_REMOTE%
  git remote add origin %TARGET_REMOTE%
) else (
  for /f "delims=" %%r in ('git remote get-url origin') do set "CURRENT_REMOTE=%%r"
  if /i not "!CURRENT_REMOTE!"=="%TARGET_REMOTE%" (
    call :say b3JpZ2luIOS4jeaYryBDUFpEIOS7k+W6k++8jOato+WcqOiuvue9ruS4uu+8mg==
    echo %TARGET_REMOTE%
    git remote set-url origin %TARGET_REMOTE%
  )
)
if errorlevel 1 goto fail

for /f "delims=" %%b in ('git branch --show-current') do set "CURRENT_BRANCH=%%b"
if /i not "!CURRENT_BRANCH!"=="main" (
  echo.
  echo Current branch: !CURRENT_BRANCH!
  call :say 6K+35YiH5o2i5YiwIG1haW4g5YiG5pSv5ZCO5YaN5Y+R5biD44CC
  call :say 5pys6ISa5pys5LiN5Lya6Ieq5Yqo5YiH5o2i5YiG5pSv77yM6YG/5YWN6KaG55uW5L2g55qE5pys5Zyw5YaF5a6544CC
  pause
  exit /b 1
)

git status --short > "%TEMP%\cpzd_git_status.txt"
for %%A in ("%TEMP%\cpzd_git_status.txt") do set "STATUS_SIZE=%%~zA"
if "%STATUS_SIZE%"=="0" (
  call :say 5rKh5pyJ6ZyA6KaB5Y+R5biD55qE5pS55Yqo44CC
  del "%TEMP%\cpzd_git_status.txt" >nul 2>&1
  pause
  exit /b 0
)
del "%TEMP%\cpzd_git_status.txt" >nul 2>&1

call :say 5qOA5rWL5Yiw5pS55Yqo77yM5YeG5aSH5o+Q5Lqk5bm25o6o6YCB44CC
git status --short
echo.

git add .
if errorlevel 1 goto fail

for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set "TODAY=%%a-%%b-%%c"
for /f "tokens=1-2 delims=:." %%a in ("%time%") do set "NOW=%%a:%%b"
set "NOW=%NOW: =0%"
set "COMMIT_MSG=Update CPZD site %TODAY% %NOW%"

git commit -m "%COMMIT_MSG%"
if errorlevel 1 goto fail

git push origin main
if errorlevel 1 (
  echo.
  call :say 5LiK5Lyg5aSx6LSl44CC5Y+v6IO95piv6L+c56iL5pyJ5paw5o+Q5Lqk44CB572R57uc5oiW55m75b2V54q25oCB6Zeu6aKY44CC
  call :say 5pys6ISa5pys5LiN5Lya6Ieq5YqoIGdpdCBwdWxs77yM5Lmf5LiN5Lya6Ieq5YqoIGZvcmNlIHB1c2jjgII=
  call :say 5aaC56Gu5a6e6ZyA6KaB5by65Yi26KaG55uW77yM6K+36YCa6L+HIHVwZGF0ZS5iYXQg56ysIDcg6aG55omL5Yqo5LqM5qyh56Gu6K6k44CC
  pause
  exit /b 1
)

echo.
call :say 5LiK5Lyg5oiQ5Yqf44CC
call :say VmVyY2VsIOWwhuiHquWKqOmDqOe9suOAgg==
call :say 6K+356iN5ZCO6K6/6ZeuIGh0dHBzOi8vY3B6ZC50b3A=
pause
exit /b 0

:fail
echo.
call :say 5pON5L2c5aSx6LSl77yM6K+35p+l55yL5LiK5pa56ZSZ6K+v5L+h5oGv44CC
pause
exit /b 1

:say
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; Write-Host ([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('%~1')))"
exit /b 0
