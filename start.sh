#!/bin/bash
# ─── Analytics Dashboard — Start Script (Mac/Linux) ──────────────────────────

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     Analytics Dashboard Startup      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ─── Backend ─────────────────────────────────────────────────────────────────
echo "▶ Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
  echo "  Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

echo "  Installing Python dependencies..."
pip install -r requirements.txt -q

echo "  Starting FastAPI on port 8000..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# ─── Frontend ────────────────────────────────────────────────────────────────
echo ""
echo "▶ Setting up frontend..."
cd ../frontend

if [ ! -f ".env.development" ]; then
  echo "  Creating .env.development..."
  echo "VITE_API_URL=http://localhost:8000" > .env.development
fi

echo "  Installing Node dependencies..."
npm install -q

echo "  Starting React on port 5173..."
npm run dev &
FRONTEND_PID=$!

# ─── Ready ───────────────────────────────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════╗"
echo "║           Servers Running              ║"
echo "╠════════════════════════════════════════╣"
echo "║  Frontend : http://localhost:5173      ║"
echo "║  Backend  : http://localhost:8000      ║"
echo "║  API Docs : http://localhost:8000/docs ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM EXIT

wait