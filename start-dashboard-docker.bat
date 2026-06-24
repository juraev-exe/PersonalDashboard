@echo off
setlocal

cd /d "%~dp0"

where docker >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed or not in PATH.
    echo Install Docker Desktop, then run this file again.
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo Starting Docker Desktop...
    if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
        start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    ) else if exist "%LocalAppData%\Docker\Docker Desktop.exe" (
        start "" "%LocalAppData%\Docker\Docker Desktop.exe"
    ) else (
        echo Docker is installed, but Docker Desktop was not found in the usual locations.
        echo Please start Docker Desktop manually, then run this file again.
        pause
        exit /b 1
    )

    echo Waiting for Docker to become ready...
    for /l %%i in (1,1,60) do (
        docker info >nul 2>&1
        if not errorlevel 1 goto docker_ready
        timeout /t 2 /nobreak >nul
    )

    echo Docker did not become ready in time.
    echo Start Docker Desktop manually and run this file again.
    pause
    exit /b 1
)

:docker_ready
echo.
echo Starting Personal Dashboard with Docker...
docker compose up -d --build
if errorlevel 1 (
    echo.
    echo Personal Dashboard failed to start.
    pause
    exit /b 1
)

echo.
echo Personal Dashboard is running at http://localhost:5173
start "" "http://localhost:5173"
echo.
echo You can close this window. Personal Dashboard will keep running in Docker.
pause
