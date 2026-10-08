@echo off
REM Double-click to run The Windows of Bengaluru with full audio.
cd /d "%~dp0"
start "" "http://localhost:5173/windows-of-bengaluru.html"
python -m http.server 5173 || py -m http.server 5173
