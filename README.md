# Analytics Dashboard — React + FastAPI

A production-ready analytics dashboard built with **React + Vite** (frontend) and **FastAPI + Python** (backend).

---

## Live Demo

- **Frontend:** https://analytics-dashboard-livid-ten.vercel.app
- **Backend API:** https://analytics-dashboard-0b7p.onrender.com
- **API Docs:** https://analytics-dashboard-0b7p.onrender.com/docs

---

## Tech Stack

| Layer                 | Technology        |
| --------------------- | ----------------- |
| Frontend Framework    | React 18 + Vite   |
| Language              | TypeScript        |
| HTTP Client           | Axios             |
| Data Fetching & Cache | TanStack Query v5 |
| State Management      | Zustand           |
| Charts                | Recharts          |
| Styling               | Tailwind CSS v3   |
| Backend Framework     | FastAPI           |
| Backend Language      | Python 3.11+      |
| Data Validation       | Pydantic v2       |
| Server                | Uvicorn           |

---

## Project Structure

```
analytics-dashboard/
├── backend/
│   ├── main.py              # FastAPI routes — analytics + annotations CRUD
│   ├── models.py            # Pydantic models matching frontend TypeScript types
│   ├── data.py              # 65,000-record deterministic dataset generator
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── vite-env.d.ts
│   │   ├── components/
│   │   │   ├── ui/          # Badge, Modal, Select, Skeleton, ThemeToggle
│   │   │   ├── dashboard/   # KPIWidgets, DashboardPage
│   │   │   ├── chart/       # InsightsChart, AnnotationForm
│   │   │   └── table/       # DataTable, SearchBar, FilterPanel, ColumnPicker, Pagination, ExportButton
│   │   ├── hooks/
│   │   │   └── useAnalytics.ts    # TanStack Query hooks → FastAPI via Axios
│   │   ├── lib/
│   │   │   ├── api.ts             # Axios instance with interceptors
│   │   │   ├── columns.ts         # Column definitions + localStorage
│   │   │   ├── queryKeys.ts       # Stable cache key builders
│   │   │   └── utils.ts           # formatNumber, formatCtr, formatRankDelta
│   │   ├── store/
│   │   │   ├── dashboardStore.ts  # Zustand — page, search, sort, filters, columns
│   │   │   └── themeStore.ts      # Zustand — dark/light mode
│   │   └── types/
│   │       └── index.ts           # Shared TypeScript interfaces
│   ├── .env.example
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
├── README.md
├── start.sh                 # Start both servers (Mac/Linux)
└── start.bat                # Start both servers (Windows)
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

---

### 1. Clone the repo

```bash
git clone https://github.com/smita-s15/analytics-dashboard.git
cd analytics-dashboard
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate — Windows
venv\Scripts\activate

# Activate — Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create env file — create a file called .env.development with:
# VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 4. Run both together

**Windows:**

```bash
start.bat
```

**Mac/Linux:**

```bash
chmod +x start.sh
./start.sh
```

---

## Environment Variables

| File               | Used When       | Value                                                        |
| ------------------ | --------------- | ------------------------------------------------------------ |
| `.env.development` | `npm run dev`   | `VITE_API_URL=http://localhost:8000`                         |
| `.env.production`  | `npm run build` | `VITE_API_URL=https://analytics-dashboard-0b7p.onrender.com` |

See `frontend/.env.example` for reference.

---

## API Endpoints

| Method | Endpoint                            | Description                           |
| ------ | ----------------------------------- | ------------------------------------- |
| GET    | `/api/analytics`                    | Paginated records + KPIs + chart data |
| GET    | `/api/analytics/annotations`        | List all annotations                  |
| POST   | `/api/analytics/annotations`        | Create annotation                     |
| PUT    | `/api/analytics/annotations`        | Update annotation                     |
| DELETE | `/api/analytics/annotations?id=xxx` | Delete annotation                     |
| GET    | `/health`                           | Health check                          |

### GET /api/analytics Parameters

| Param     | Type      | Default | Description                   |
| --------- | --------- | ------- | ----------------------------- |
| page      | int       | 1       | Page number                   |
| limit     | int       | 50      | Rows per page (10–500)        |
| search    | string    | —       | Search keyword + landing page |
| sortBy    | string    | —       | Column to sort by             |
| sortOrder | asc\|desc | asc     | Sort direction                |
| category  | string    | —       | Filter by category            |
| status    | string    | —       | Filter by status              |
| device    | string    | —       | Filter by device              |
| source    | string    | —       | Filter by source              |
| rankMin   | int       | —       | Minimum rank                  |
| rankMax   | int       | —       | Maximum rank                  |

---

## Architecture Decisions

### Caching — TanStack Query

Every combination of `(page, limit, search, sortBy, sortOrder, filters)` maps to a deterministic cache key. Navigating Page 1 → Page 2 → back to Page 1 reuses the cached response instantly. The next page is prefetched in the background.

- `staleTime: 5 min` — responses reused within an active session
- `gcTime: 30 min` — previous pages kept in memory for back-navigation
- `placeholderData` — shows stale data while new request loads (no flicker)

### HTTP Client — Axios

Axios instance in `lib/api.ts` with baseURL from environment variable, request/response interceptors for logging, 30 second timeout, and centralised error handling.

### State Management — Zustand

All dashboard state (pagination, search, sort, filters, column visibility) lives in a Zustand store. Column visibility auto-persists to `localStorage`.

### Backend — FastAPI + Python

The 65,000-record dataset is generated deterministically and materialised once at startup. Filter → search → sort → slice runs in pure Python. In production this would be a PostgreSQL database.

### Dark Mode

Tailwind `class` strategy. `themeStore` applies/removes the `dark` class on `<html>` and persists to `localStorage`. Auto-detects OS preference on first visit.

---

## Deployment

### Backend — Render

```
Root Directory:    backend
Runtime:           Python
Build Command:     pip install -r requirements.txt
Start Command:     uvicorn main:app --host 0.0.0.0 --port $PORT
Environment Vars:  PYTHON_VERSION=3.11.9
```

### Frontend — Vercel

```
Root Directory:    frontend
Build Command:     npm run build
Output Directory:  dist
Environment Vars:  VITE_API_URL=https://analytics-dashboard-0b7p.onrender.com
```

---

## Assumptions

1. No authentication — would add FastAPI JWT middleware in production
2. In-memory annotation store — would use PostgreSQL + SQLAlchemy in production
3. 150ms artificial API latency to make loading states visible in development
4. Dataset materialised in-memory — acceptable for demo; production uses a database

---

## Running Tests

```bash
cd frontend
npm test
```
