import { ColumnDef, KeywordRecord } from "@/types";

export const COLUMN_DEFINITIONS: ColumnDef[] = [
  { key: "keyword", label: "Keyword", sortable: true, defaultVisible: true, width: "220px" },
  { key: "category", label: "Category", sortable: true, defaultVisible: true, width: "140px" },
  { key: "status", label: "Status", sortable: true, defaultVisible: true, width: "120px" },
  { key: "clicks", label: "Clicks", sortable: true, defaultVisible: true, width: "100px" },
  { key: "impressions", label: "Impressions", sortable: true, defaultVisible: true, width: "120px" },
  { key: "ctr", label: "CTR (%)", sortable: true, defaultVisible: true, width: "100px" },
  { key: "rank", label: "Rank", sortable: true, defaultVisible: true, width: "80px" },
  { key: "previousRank", label: "Prev. Rank", sortable: true, defaultVisible: false, width: "100px" },
  { key: "device", label: "Device", sortable: true, defaultVisible: true, width: "100px" },
  { key: "source", label: "Source", sortable: true, defaultVisible: false, width: "100px" },
  { key: "monthlySearches", label: "Monthly Searches", sortable: true, defaultVisible: true, width: "150px" },
  { key: "landingPage", label: "Landing Page", sortable: false, defaultVisible: false, width: "200px" },
  { key: "date", label: "Date", sortable: true, defaultVisible: false, width: "110px" },
];

export const COLUMN_STORAGE_KEY = "analytics_column_config";

export function getDefaultColumnConfig() {
  return COLUMN_DEFINITIONS.map((col) => ({
    key: col.key,
    visible: col.defaultVisible,
  }));
}

export function loadColumnConfig() {
  if (typeof window === "undefined") return getDefaultColumnConfig();
  try {
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!saved) return getDefaultColumnConfig();
    const parsed = JSON.parse(saved);
    // Merge with current definitions to handle new columns gracefully
    const savedKeys = new Set(parsed.map((c: { key: string }) => c.key));
    const merged = [
      ...parsed,
      ...getDefaultColumnConfig().filter((c) => !savedKeys.has(c.key)),
    ];
    return merged;
  } catch {
    return getDefaultColumnConfig();
  }
}

export function saveColumnConfig(config: { key: keyof KeywordRecord; visible: boolean }[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(config));
}
