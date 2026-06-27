from pydantic import BaseModel
from typing import Optional, Literal
from enum import Enum


class StatusEnum(str, Enum):
    ranking = "ranking"
    not_ranking = "not_ranking"
    new = "new"
    dropped = "dropped"


class DeviceEnum(str, Enum):
    desktop = "desktop"
    mobile = "mobile"
    tablet = "tablet"


class SourceEnum(str, Enum):
    organic = "organic"
    paid = "paid"
    featured = "featured"


class AnnotationTypeEnum(str, Enum):
    algorithm_update = "algorithm_update"
    seo_campaign = "seo_campaign"
    migration = "migration"
    content_release = "content_release"
    product_launch = "product_launch"
    other = "other"


class KeywordRecord(BaseModel):
    id: str
    keyword: str
    category: str
    status: StatusEnum
    device: DeviceEnum
    source: SourceEnum
    clicks: int
    impressions: int
    ctr: float
    rank: int
    previousRank: Optional[int] = None
    landingPage: str
    monthlySearches: Optional[int] = None
    date: str


class ChartDataPoint(BaseModel):
    date: str
    clicks: int
    impressions: int
    ctr: float
    avgRank: float
    activeUsers: int
    newUsers: int
    engagementRate: float


class KPIData(BaseModel):
    totalRecords: int
    totalClicks: int
    totalImpressions: int
    avgCtr: float
    avgRank: float
    rankingKeywords: int


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int


class AnalyticsResponse(BaseModel):
    records: list[KeywordRecord]
    pagination: PaginationMeta
    kpis: KPIData
    chart: list[ChartDataPoint]


class Annotation(BaseModel):
    id: str
    date: str
    title: str
    description: str
    type: AnnotationTypeEnum
    createdAt: str
    updatedAt: str


class CreateAnnotationRequest(BaseModel):
    date: str
    title: str
    description: str = ""
    type: AnnotationTypeEnum = AnnotationTypeEnum.other


class UpdateAnnotationRequest(BaseModel):
    id: str
    date: str
    title: str
    description: str = ""
    type: AnnotationTypeEnum = AnnotationTypeEnum.other
