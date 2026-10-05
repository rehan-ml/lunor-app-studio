@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Creating local environment...
  py -m venv .venv
  call .venv\Scripts\python.exe -m pip install -r requirements.txt
)

echo Lunor App Studio is starting at http://127.0.0.1:8510
call .venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8510
