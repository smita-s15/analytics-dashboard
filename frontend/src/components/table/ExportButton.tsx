import { useState } from "react";
import { Download } from "lucide-react";
import { KeywordRecord, ColumnConfig, TableQueryParams } from "@/types";
import { COLUMN_DEFINITIONS } from "@/lib/columns";
import api from "@/lib/api";

interface ExportButtonProps {
  columns: ColumnConfig[];
  queryParams: Omit<TableQueryParams, "page" | "limit">;
  totalRecords: number;
}

export function ExportButton({
  columns,
  queryParams,
  totalRecords,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      // Fetch ALL records with limit=totalRecords in one request
      const { data } = await api.get("/api/analytics", {
        params: {
          page: 1,
          limit: totalRecords,
          ...(queryParams.search && { search: queryParams.search }),
          ...(queryParams.sortBy && { sortBy: queryParams.sortBy }),
          ...(queryParams.sortOrder && { sortOrder: queryParams.sortOrder }),
          ...(queryParams.filters?.category && {
            category: queryParams.filters.category,
          }),
          ...(queryParams.filters?.status && {
            status: queryParams.filters.status,
          }),
          ...(queryParams.filters?.device && {
            device: queryParams.filters.device,
          }),
          ...(queryParams.filters?.source && {
            source: queryParams.filters.source,
          }),
          ...(queryParams.filters?.rankMin != null && {
            rankMin: queryParams.filters.rankMin,
          }),
          ...(queryParams.filters?.rankMax != null && {
            rankMax: queryParams.filters.rankMax,
          }),
        },
      });

      const records: KeywordRecord[] = data.records;

      const visibleDefs = COLUMN_DEFINITIONS.filter(
        (def) => columns.find((c) => c.key === def.key)?.visible,
      );

      const header = visibleDefs.map((d) => d.label).join(",");
      const rows = records.map((row) =>
        visibleDefs
          .map((def) => {
            const val = row[def.key];
            const str = val == null ? "" : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(","),
      );

      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `keywords_${queryParams.filters?.status ?? "all"}_${queryParams.filters?.category ?? "all"}_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      suppressHydrationWarning
      onClick={handleExport}
      disabled={isExporting || totalRecords === 0}
      className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={14} />
      {isExporting
        ? "Exporting…"
        : `Export All (${totalRecords.toLocaleString()})`}
    </button>
  );
}
