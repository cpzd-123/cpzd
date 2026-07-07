@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
title CPZD 一键上传发布

set "ROOT=%~dp0"
set "TARGET_REMOTE=https://github.com/cpzd-123/cpzd.git"
cd /d "%ROOT%"

echo ====================================
echo        CPZD 一键上传发布
echo ====================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
  echo 未检测到 Git，请先安装 Git。
  pause
  exit /b 1
)

if not exist ".git" (
  echo 当前目录不是 Git 仓库。
  echo 请把 publish.bat 放在 CPZD 项目根目录后再运行。
  pause
  exit /b 1
)

echo 检查远程仓库...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo 未找到 origin，正在设置为 CPZD 主站仓库：
  echo %TARGET_REMOTE%
  git remote add origin %TARGET_REMOTE%
) else (
  for /f "delims=" %%r in ('git remote get-url origin') do set "CURRENT_REMOTE=%%r"
  if /i not "!CURRENT_REMOTE!"=="%TARGET_REMOTE%" (
    echo origin 不是 CPZD 主站仓库，正在改为：
    echo %TARGET_REMOTE%
    git remote set-url origin %TARGET_REMOTE%
  )
)
if errorlevel 1 goto fail

echo.
echo 当前远程仓库：
git remote -v

for /f "delims=" %%b in ('git branch --show-current') do set "CURRENT_BRANCH=%%b"
if /i not "!CURRENT_BRANCH!"=="main" (
  echo.
  echo 当前分支是：!CURRENT_BRANCH!
  echo 请先切换到 main 分支后再发布。
  echo 本脚本不会自动切换分支，避免覆盖你的本地内容。
  pause
  exit /b 1
)

echo.
echo 检查是否有改动...
git status --short > "%TEMP%\cpzd_git_status.txt"
for %%A in ("%TEMP%\cpzd_git_status.txt") do set "STATUS_SIZE=%%~zA"
if "%STATUS_SIZE%"=="0" (
  echo 没有需要发布的改动。
  del "%TEMP%\cpzd_git_status.txt" >nul 2>&1
  pause
  exit /b 0
)

type "%TEMP%\cpzd_git_status.txt"
del "%TEMP%\cpzd_git_status.txt" >nul 2>&1

echo.
echo 正在添加改动...
git add .
if errorlevel 1 goto fail

for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm'"') do set "STAMP=%%i"
set "COMMIT_MSG=Update CPZD site %STAMP%"

echo.
echo 提交信息：%COMMIT_MSG%
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo 提交失败，可能是没有有效改动，或 Git 用户信息未配置。
  pause
  exit /b 1
)

echo.
echo 正在推送到 GitHub main 分支...
git push origin main
if errorlevel 1 (
  echo.
  echo 推送失败。
  echo 请检查 GitHub 登录状态、网络、远程仓库，或是否需要手动处理冲突。
  echo 本脚本不会自动 git pull，也不会自动 force push。
  pause
  exit /b 1
)

echo.
echo ====================================
echo 上传成功。
echo Vercel 将自动部署。
echo 稍后访问：https://cpzd.top
echo ====================================
pause
exit /b 0

:fail
echo.
echo 操作失败，请查看上方错误信息。
pause
exit /b 1
