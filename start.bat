@echo off
:: ─── Analytics Dashboard — Start Script (Windows) ────────────────────────────

echo.
echo ╔════════════════════════════════════════╗
echo ║     Analytics Dashboard Startup        ║
echo ╚════════════════════════════════════════╝
echo.

:: ─── Backend ──────────────────────────────────────────────────────────────────
echo [1/4] Setting up Python virtual environment...
cd backend

if not exist "venv" (
  echo       Creating virtual environment...
  python -m venv venv
)

call venv\Scripts\activate

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt -q

echo [3/4] Starting FastAPI backend on port 8000...
start "FastAPI Backend" cmd /k "call venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: ─── Frontend ─────────────────────────────────────────────────────────────────
cd ..\frontend

if not exist ".env.development" (
  echo       Creating .env.development...
  echo VITE_API_URL=http://localhost:8000 > .env.development
)

echo [4/4] Installing Node dependencies and starting React...
call npm install -q
start "React Frontend" cmd /k "npm run dev"

:: ─── Ready ────────────────────────────────────────────────────────────────────
echo.
echo ╔════════════════════════════════════════╗
echo ║           Servers Running              ║
echo ╠════════════════════════════════════════╣
echo ║  Frontend : http://localhost:5173      ║
echo ║  Backend  : http://localhost:8000      ║
echo ║  API Docs : http://localhost:8000/docs ║
echo ╚════════════════════════════════════════╝
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause