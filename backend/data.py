import math
from datetime import date, timedelta
from models import KeywordRecord, ChartDataPoint

KEYWORDS = [
    "alabama high school football", "bob newhart", "osama bin laden",
    "new york news today", "kung fu panda 4 streaming", "connections puzzle",
    "weather tomorrow", "best restaurants near me", "react typescript tutorial",
    "next.js app router", "tailwind css components", "web development 2024",
    "javascript async await", "python machine learning", "seo best practices",
    "google algorithm update", "content marketing strategy", "ecommerce conversion rate",
    "keyword research tools", "backlink building guide", "site speed optimization",
    "mobile first indexing", "core web vitals", "local seo checklist",
    "technical seo audit", "schema markup guide", "featured snippets tips",
    "voice search optimization", "youtube seo strategy", "social media marketing",
    "email marketing tools", "ppc advertising guide", "google ads tutorial",
    "facebook ads strategy", "influencer marketing", "brand awareness metrics",
    "customer acquisition cost", "lifetime value calculation", "churn rate reduction",
    "product market fit", "startup growth hacking", "saas pricing strategy",
    "b2b lead generation", "crm best practices", "sales funnel optimization",
    "landing page design", "a/b testing guide", "conversion rate optimization",
    "user experience design", "accessibility standards",
]

CATEGORIES = ["Informational", "Commercial", "Navigational", "Transactional"]
STATUSES = ["ranking", "not_ranking", "new", "dropped"]
DEVICES = ["desktop", "mobile", "tablet"]
SOURCES = ["organic", "paid", "featured"]
LANDING_PAGES = [
    "/blog/seo-guide", "/products/analytics", "/services/marketing",
    "/case-studies/growth", "/resources/templates", "/pricing", "/about", "/contact",
]

TOTAL_RECORDS = 65_000


def seeded_random(seed: float) -> float:
    x = math.sin(seed) * 10000
    return x - math.floor(x)


def generate_record(index: int) -> KeywordRecord:
    def r(offset=0):
        return seeded_random(index * 13 + offset)

    keyword = KEYWORDS[int(r(0) * len(KEYWORDS))]
    clicks = int(r(1) * 5000)
    impressions = clicks + int(r(2) * 50000)
    rank = int(r(3) * 100) + 1
    prev_rank = int(r(5) * 100) + 1 if r(4) > 0.2 else None

    suffix = "" if index % 10 == 0 else str(int(r(6) * 100))
    full_keyword = f"{keyword} {suffix}".strip()

    today = date.today()
    record_date = today - timedelta(days=int(r(14) * 30))

    return KeywordRecord(
        id=f"kw_{str(index).zfill(6)}",
        keyword=full_keyword,
        category=CATEGORIES[int(r(7) * len(CATEGORIES))],
        status=STATUSES[int(r(8) * len(STATUSES))],
        device=DEVICES[int(r(9) * len(DEVICES))],
        source=SOURCES[int(r(10) * len(SOURCES))],
        clicks=clicks,
        impressions=impressions,
        ctr=round((clicks / impressions * 100), 2) if impressions > 0 else 0,
        rank=rank,
        previousRank=prev_rank,
        landingPage=LANDING_PAGES[int(r(11) * len(LANDING_PAGES))],
        monthlySearches=int(r(13) * 500000) if r(12) > 0.3 else None,
        date=record_date.isoformat(),
    )


def generate_chart_data(days: int = 30) -> list[ChartDataPoint]:
    today = date.today()
    result = []
    for i in range(days):
        def r(o=0):
            return seeded_random(i * 7 + o)
        point_date = today - timedelta(days=days - 1 - i)
        result.append(ChartDataPoint(
            date=point_date.isoformat(),
            clicks=800 + int(r(0) * 4200),
            impressions=15000 + int(r(1) * 85000),
            ctr=round(1 + r(2) * 9, 2),
            avgRank=round(8 + r(3) * 42, 1),
            activeUsers=120 + int(r(4) * 880),
            newUsers=80 + int(r(5) * 520),
            engagementRate=round(30 + r(6) * 40, 1),
        ))
    return result


# Materialise dataset once at module import (singleton)
_dataset: list[KeywordRecord] | None = None


def get_dataset() -> list[KeywordRecord]:
    global _dataset
    if _dataset is None:
        _dataset = [generate_record(i) for i in range(TOTAL_RECORDS)]
    return _dataset
