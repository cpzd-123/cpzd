@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

call :say PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgICAgQ1BaRCBBZG1pbiBXZWIKPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CgpTdGFydGluZyBsb2NhbCB3ZWIgYWRtaW4uLi4KQnJvd3NlciB3aWxsIG9wZW4gYXV0b21hdGljYWxseS4KSWYgaXQgZG9lcyBub3Qgb3BlbiwgdmlzaXQgdGhlIHByaW50ZWQgVVJMLg==
echo.

set "PY_CMD="

call :try_python python
if defined PY_CMD goto start_admin

for %%V in (3.14 3.13 3.12 3.11 3.10) do (
  call :try_python py -%%V
  if defined PY_CMD goto start_admin
)

echo No usable Python with FastAPI was found.
echo Try running:
echo   python -m pip install fastapi uvicorn python-multipart requests PyYAML markdown markdownify httpx
pause
exit /b 1

:start_admin
echo Using Python: %PY_CMD%
%PY_CMD% run_me.py
if errorlevel 1 goto fail
goto end

:try_python
set "CANDIDATE=%*"
%CANDIDATE% -c "import fastapi, uvicorn, yaml, markdown, markdownify, httpx" >nul 2>&1
if not errorlevel 1 (
  set "PY_CMD=%CANDIDATE%"
)
exit /b 0

:fail
call :say Q1BaRCBBZG1pbiBmYWlsZWQgdG8gc3RhcnQuIFBsZWFzZSBjaGVjayB0aGUgZXJyb3IgYWJvdmUu
pause
exit /b 1

:end
call :say Q1BaRCBBZG1pbiBzdG9wcGVkLg==
pause
exit /b 0

:say
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; Write-Host ([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('%~1')))"
exit /b 0
