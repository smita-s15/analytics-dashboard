
import { Download } from "lucide-react";
import { KeywordRecord, ColumnConfig } from "@/types";
import { COLUMN_DEFINITIONS } from "@/lib/columns";

interface ExportButtonProps {
  records: KeywordRecord[];
  columns: ColumnConfig[];
}

export function ExportButton({ records, columns }: ExportButtonProps) {
  function handleExport() {
    const visibleDefs = COLUMN_DEFINITIONS.filter((def) => {
      const cfg = columns.find((c) => c.key === def.key);
      return cfg?.visible;
    });
    const header = visibleDefs.map((d) => d.label).join(",");
    const rows = records.map((row) =>
      visibleDefs.map((def) => {
        const val = row[def.key];
        const str = val == null ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      suppressHydrationWarning
      onClick={handleExport}
      className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
    >
      <Download size={14} />
      Export
    </button>
  );
}
