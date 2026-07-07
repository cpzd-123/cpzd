@echo off
setlocal

set "NCMC=D:\Scoop\shims\ncmc.exe"

if not exist "%NCMC%" (
  echo ncmc was not found at:
  echo   %NCMC%
  echo.
  echo Please check that Scoop is installed at D:\Scoop.
  pause
  exit /b 1
)

if "%~1"=="" (
  echo Drag one or more .ncm files onto this file to convert them.
  echo.
  echo Or run it like this:
  echo   "%~f0" "D:\Music\song.ncm"
  echo.
  pause
  exit /b 0
)

for %%F in (%*) do (
  echo Converting: %%~fF
  "%NCMC%" "%%~fF"
  echo.
)

echo Done.
pause
