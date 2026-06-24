@echo off
cd /d "%~dp0"
echo Stopping Personal Dashboard...
docker compose down
echo Done.
pause
