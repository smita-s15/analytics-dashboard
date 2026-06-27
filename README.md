# Analytics Dashboard — React + FastAPI

A production-ready analytics dashboard built with **React + Vite** (frontend) and **FastAPI + Python** (backend).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| Language | TypeScript |
| Data Fetching & Cache | TanStack Query v5 |
| State Management | Zustand |
| Charts | Recharts |
| Styling | Tailwind CSS v3 |
| Backend Framework | FastAPI |
| Backend Language | Python 3.11+ |
| Data Validation | Pydantic v2 |
| Server | Uvicorn |

---

## Project Structure

```
analytics-dashboard/
├── backend/
│   ├── main.py          # FastAPI routes — analytics + annotations CRUD
│   ├── models.py        # Pydantic models matching frontend TypeScript types
│   ├── data.py          # 65,000-record deterministic dataset generator
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── components/
    │   │   ├── ui/           # Badge, Modal, Select, Skeleton, ThemeToggle
    │   │   ├── dashboard/    # KPIWidgets, DashboardPage
    │   │   ├── chart/        # InsightsChart, AnnotationForm
    │   │   └── table/        # DataTable, SearchBar, FilterPanel, ColumnPicker, Pagination, ExportButton
    │   ├── hooks/
    │   │   └── useAnalytics.ts   # TanStack Query hooks → FastAPI
    │   ├── store/
    │   │   ├── dashboardStore.ts # Zustand — page, search, sort, filters, columns
    │   │   └── themeStore.ts     # Zustand — dark/light mode
    │   ├── lib/
    │   │   ├── columns.ts        # Column definitions + localStorage
    │   │   ├── queryKeys.ts      # Stable cache key builders
    │   │   └── utils.ts          # formatNumber, formatCtr, formatRankDelta
    │   └── types/
    │       └── index.ts          # Shared TypeScript interfaces
    ├── vite.config.ts    # Proxy /api → FastAPI on port 8000
    ├── tailwind.config.js
    └── package.json
```

---

## Setup & Running

### Prerequisites
- Python 3.11+
- Node.js 18+

---

### Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

API runs at: `http://localhost:8000`

API docs at: `http://localhost:8000/docs`

---

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

Vite automatically proxies all `/api` requests to `http://localhost:8000`.

---

### Run both together

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Then open `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics` | Paginated records + KPIs + chart data |
| GET | `/api/analytics/annotations` | List all annotations |
| POST | `/api/analytics/annotations` | Create annotation |
| PUT | `/api/analytics/annotations` | Update annotation |
| DELETE | `/api/analytics/annotations?id=xxx` | Delete annotation |
| GET | `/health` | Health check |

### GET /api/analytics Query Parameters

| Param | Type | Description |
|---|---|---|
| page | int | Page number (default: 1) |
| limit | int | Rows per page — 10 to 500 (default: 50) |
| search | string | Full-text search on keyword + landing page |
| sortBy | string | Column to sort by |
| sortOrder | asc\|desc | Sort direction |
| category | string | Filter by category |
| status | string | Filter by status |
| device | string | Filter by device |
| source | string | Filter by source |
| rankMin | int | Minimum rank |
| rankMax | int | Maximum rank |

---

## Architecture Decisions

### Caching (TanStack Query)

Every combination of `(page, limit, search, sortBy, sortOrder, filters)` maps to a deterministic cache key via `lib/queryKeys.ts`. Navigating Page 1 → Page 2 → back to Page 1 reuses the cached response instantly. The next page is prefetched in the background on every render.

- `staleTime: 5 min` — responses reused within an active session
- `gcTime: 30 min` — previous pages kept in memory for instant back-navigation
- `placeholderData` — shows previous data while new request is in flight (no flicker)

### State Management (Zustand)

All dashboard state (pagination, search, sort, filters, column visibility) lives in a Zustand store. Column visibility persists to `localStorage` automatically.

### Backend — FastAPI

The dataset is materialised once at module import (`data.py → get_dataset()`) and reused for all requests. Filter → search → sort → slice runs in pure Python — equivalent to a real SQL query. In production this would be replaced with a PostgreSQL query.

### Dark Mode

Uses Tailwind's `class` strategy. The `themeStore` applies/removes the `dark` class on `<html>` and persists preference to `localStorage`. Auto-detects OS preference on first visit.

---

## Assumptions

1. No authentication (would add FastAPI JWT middleware in production)
2. In-memory annotation store (would use PostgreSQL + SQLAlchemy in production)
3. 150ms artificial API latency to make loading states visible
4. Dataset materialised in-memory (acceptable for demo; production would use a database)

---

## Production Deployment

**Backend:** Deploy FastAPI with `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`

**Frontend:** `npm run build` then serve the `dist/` folder via Nginx or deploy to Vercel/Netlify

**CORS:** Update `allow_origins` in `main.py` to your production frontend URL
