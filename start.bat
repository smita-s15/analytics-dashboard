@echo off
echo Starting FastAPI backend on port 8000...
cd backend
python -m venv venv 2>nul
call venv\Scripts\activate
pip install -r requirements.txt -q
start "FastAPI Backend" cmd /k "uvicorn main:app --reload --port 8000"

echo Starting React frontend on port 5173...
cd ..\frontend
call npm install -q
start "React Frontend" cmd /k "npm run dev"

echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Both servers are running in separate windows.
pause
