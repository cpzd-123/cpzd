@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
title CPZD 管理启动器

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%XHBlogs"
set "ADMIN=%ROOT%my-blog-manager"
set "TARGET_REMOTE=https://github.com/cpzd-123/cpzd.git"

:menu
cls
echo ====================================
echo        CPZD 管理启动器
echo ====================================
echo.
echo 1. 启动前台网站
echo 2. 启动 CPZD Admin 后台
echo 3. 一键上传并发布
echo 4. 安装前台依赖
echo 5. 安装后台依赖
echo 6. 查看 Git 状态
echo 7. 强制覆盖 GitHub main 分支
echo 8. 退出
echo.
set /p "choice=请选择："

if "%choice%"=="1" goto frontend
if "%choice%"=="2" goto admin
if "%choice%"=="3" goto publish
if "%choice%"=="4" goto install_frontend
if "%choice%"=="5" goto install_admin
if "%choice%"=="6" goto git_status
if "%choice%"=="7" goto force_push
if "%choice%"=="8" goto end

echo.
echo 无效选择，请重新输入。
pause
goto menu

:frontend
cd /d "%FRONTEND%"
call npm.cmd run dev
pause
goto menu

:admin
cd /d "%ADMIN%"
call Start.bat
pause
goto menu

:publish
call "%ROOT%publish.bat"
goto menu

:install_frontend
cd /d "%FRONTEND%"
call npm.cmd install
pause
goto menu

:install_admin
cd /d "%ADMIN%"
call npm.cmd install
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
echo 危险操作：这会强制覆盖 GitHub main 分支。
echo 默认不建议使用。只有你明确知道后果时才继续。
echo.
set /p "confirm=请输入 YES 确认强制推送："
if not "%confirm%"=="YES" (
  echo 已取消强制推送。
  pause
  goto menu
)
git remote set-url origin %TARGET_REMOTE%
git push -u origin main --force
pause
goto menu

:end
endlocal
exit /b 0
