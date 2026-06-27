// ─── Core Data Types ─────────────────────────────────────────────────────────

export interface KeywordRecord {
  id: string;
  keyword: string;
  category: string;
  status: "ranking" | "not_ranking" | "new" | "dropped";
  device: "desktop" | "mobile" | "tablet";
  source: "organic" | "paid" | "featured";
  clicks: number;
  impressions: number;
  ctr: number;
  rank: number;
  previousRank: number | null;
  landingPage: string;
  monthlySearches: number | null;
  date: string;
}

export interface ChartDataPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgRank: number;
  activeUsers: number;
  newUsers: number;
  engagementRate: number;
}

export interface KPIData {
  totalRecords: number;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgRank: number;
  rankingKeywords: number;
}

// ─── API Request / Response ──────────────────────────────────────────────────

export interface TableFilters {
  category?: string;
  status?: string;
  rankMin?: number;
  rankMax?: number;
  device?: string;
  source?: string;
}

export interface TableQueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: TableFilters;
}

export interface SortState {
  column: string;
  direction: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AnalyticsResponse {
  records: KeywordRecord[];
  pagination: PaginationMeta;
  kpis: KPIData;
  chart: ChartDataPoint[];
}

// ─── Column Management ───────────────────────────────────────────────────────

export interface ColumnDef {
  key: keyof KeywordRecord;
  label: string;
  sortable: boolean;
  defaultVisible: boolean;
  width?: string;
  render?: (value: unknown, row: KeywordRecord) => React.ReactNode;
}

export interface ColumnConfig {
  key: keyof KeywordRecord;
  visible: boolean;
}

// ─── Annotations ─────────────────────────────────────────────────────────────

export type AnnotationType =
  | "algorithm_update"
  | "seo_campaign"
  | "migration"
  | "content_release"
  | "product_launch"
  | "other";

export interface Annotation {
  id: string;
  date: string;
  title: string;
  description: string;
  type: AnnotationType;
  createdAt: string;
  updatedAt: string;
}

// ─── Filter Options ───────────────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
}
