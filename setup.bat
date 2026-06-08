@echo off

echo HOST_PATH=%CD% > .env
echo HOST_PATH was set to %CD%

echo Creating images...
docker compose --profile "*" build
if %errorlevel% neq 0 exit /b 1

echo Creating containers...
docker compose up -d
if %errorlevel% neq 0 exit /b 1

echo.
echo Setup complete!
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP: =%
echo Access the website from another device at http://%IP%:3000