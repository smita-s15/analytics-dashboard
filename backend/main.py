import asyncio
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    AnalyticsResponse, PaginationMeta, KPIData,
    Annotation, CreateAnnotationRequest, UpdateAnnotationRequest,
    KeywordRecord,
)
from data import get_dataset, generate_chart_data, TOTAL_RECORDS

app = FastAPI(title="Analytics Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─── In-memory annotation store ──────────────────────────────────────────────

_annotations: dict[str, Annotation] = {}

def _seed_annotations():
    today = datetime.now(timezone.utc)
    from datetime import timedelta
    seeds = [
        Annotation(
            id="ann_001",
            date=(today - timedelta(days=12)).date().isoformat(),
            title="Google Core Update",
            description="Major Google core algorithm update rolled out. Monitor rankings closely.",
            type="algorithm_update",
            createdAt=today.isoformat(),
            updatedAt=today.isoformat(),
        ),
        Annotation(
            id="ann_002",
            date=(today - timedelta(days=6)).date().isoformat(),
            title="Q2 SEO Campaign Launch",
            description="Kicked off targeted link-building and on-page optimisation for top-20 keywords.",
            type="seo_campaign",
            createdAt=today.isoformat(),
            updatedAt=today.isoformat(),
        ),
    ]
    for ann in seeds:
        _annotations[ann.id] = ann

_seed_annotations()


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _apply_filters(records: list[KeywordRecord], category, status, device, source, rank_min, rank_max) -> list[KeywordRecord]:
    result = records
    if category:
        result = [r for r in result if r.category == category]
    if status:
        result = [r for r in result if r.status == status]
    if device:
        result = [r for r in result if r.device == device]
    if source:
        result = [r for r in result if r.source == source]
    if rank_min is not None:
        result = [r for r in result if r.rank >= rank_min]
    if rank_max is not None:
        result = [r for r in result if r.rank <= rank_max]
    return result


def _apply_search(records: list[KeywordRecord], search: str) -> list[KeywordRecord]:
    if not search:
        return records
    q = search.lower().strip()
    return [r for r in records if q in r.keyword.lower() or q in r.landingPage.lower()]


def _apply_sort(records: list[KeywordRecord], sort_by: str, sort_order: str) -> list[KeywordRecord]:
    if not sort_by:
        return records
    reverse = sort_order == "desc"
    try:
        return sorted(records, key=lambda r: (getattr(r, sort_by) is None, getattr(r, sort_by)), reverse=reverse)
    except AttributeError:
        return records


def _compute_kpis(records: list[KeywordRecord]) -> KPIData:
    total = len(records)
    total_clicks = sum(r.clicks for r in records)
    total_impressions = sum(r.impressions for r in records)
    avg_ctr = round(total_clicks / total_impressions * 100, 2) if total_impressions > 0 else 0
    avg_rank = round(sum(r.rank for r in records) / total, 1) if total > 0 else 0
    ranking = sum(1 for r in records if r.status in ("ranking", "new"))
    return KPIData(
        totalRecords=total,
        totalClicks=total_clicks,
        totalImpressions=total_impressions,
        avgCtr=avg_ctr,
        avgRank=avg_rank,
        rankingKeywords=ranking,
    )


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=10, le=500),
    search: Optional[str] = Query(None),
    sortBy: Optional[str] = Query(None),
    sortOrder: str = Query("asc"),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    device: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    rankMin: Optional[int] = Query(None),
    rankMax: Optional[int] = Query(None),
):
    # Simulate light latency so loading states are visible
    await asyncio.sleep(0.15)

    records = get_dataset()
    records = _apply_filters(records, category, status, device, source, rankMin, rankMax)
    records = _apply_search(records, search or "")
    records = _apply_sort(records, sortBy or "", sortOrder)

    total = len(records)
    total_pages = max(1, -(-total // limit))  # ceiling division
    offset = (page - 1) * limit
    page_records = records[offset: offset + limit]

    kpis = _compute_kpis(records)
    chart = generate_chart_data(30)

    return AnalyticsResponse(
        records=page_records,
        pagination=PaginationMeta(page=page, limit=limit, total=total, totalPages=total_pages),
        kpis=kpis,
        chart=chart,
    )


@app.get("/api/analytics/annotations", response_model=list[Annotation])
async def get_annotations():
    return list(_annotations.values())


@app.post("/api/analytics/annotations", response_model=Annotation, status_code=201)
async def create_annotation(body: CreateAnnotationRequest):
    now = datetime.now(timezone.utc).isoformat()
    ann_id = f"ann_{int(datetime.now().timestamp() * 1000)}"
    ann = Annotation(
        id=ann_id,
        date=body.date,
        title=body.title,
        description=body.description,
        type=body.type,
        createdAt=now,
        updatedAt=now,
    )
    _annotations[ann_id] = ann
    return ann


@app.put("/api/analytics/annotations", response_model=Annotation)
async def update_annotation(body: UpdateAnnotationRequest):
    if body.id not in _annotations:
        raise HTTPException(status_code=404, detail="Annotation not found")
    existing = _annotations[body.id]
    updated = Annotation(
        id=existing.id,
        date=body.date,
        title=body.title,
        description=body.description,
        type=body.type,
        createdAt=existing.createdAt,
        updatedAt=datetime.now(timezone.utc).isoformat(),
    )
    _annotations[body.id] = updated
    return updated


@app.delete("/api/analytics/annotations")
async def delete_annotation(id: str = Query(...)):
    if id not in _annotations:
        raise HTTPException(status_code=404, detail="Annotation not found")
    del _annotations[id]
    return {"success": True}


@app.get("/health")
async def health():
    return {"status": "ok", "records": TOTAL_RECORDS}
