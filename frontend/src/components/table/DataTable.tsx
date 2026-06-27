
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { KeywordRecord, SortState, ColumnConfig } from "@/types";
import { COLUMN_DEFINITIONS } from "@/lib/columns";
import { StatusBadge } from "@/components/ui/Badge";
import { formatNumber, formatCtr, formatRankDelta } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Skeleton";

function RankDelta({ current, previous }: { current: number; previous: number | null }) {
  const { label, direction } = formatRankDelta(current, previous);
  return (
    <span className={cn(
      "text-xs font-medium",
      direction === "up"   && "text-emerald-600 dark:text-emerald-400",
      direction === "down" && "text-red-500 dark:text-red-400",
      direction === "same" && "text-slate-400 dark:text-slate-500",
      direction === "new"  && "text-blue-500 dark:text-blue-400"
    )}>
      {label}
    </span>
  );
}

function renderCell(col: (typeof COLUMN_DEFINITIONS)[0], row: KeywordRecord) {
  const val = row[col.key];
  switch (col.key) {
    case "status":
      return <StatusBadge status={row.status} />;
    case "ctr":
      return <span className="text-slate-700 dark:text-slate-300">{formatCtr(row.ctr)}</span>;
    case "clicks":
    case "impressions":
    case "monthlySearches":
      return <span className="text-slate-700 dark:text-slate-300 tabular-nums">{formatNumber(val as number | null)}</span>;
    case "rank":
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">{row.rank}</span>
          <RankDelta current={row.rank} previous={row.previousRank} />
        </div>
      );
    case "previousRank":
      return <span className="text-slate-400 dark:text-slate-500 tabular-nums">{row.previousRank ?? "—"}</span>;
    case "landingPage":
      return <span className="text-blue-600 dark:text-blue-400 truncate block max-w-[180px]" title={row.landingPage}>{row.landingPage}</span>;
    case "keyword":
      return <span className="font-medium text-slate-800 dark:text-slate-200 truncate block max-w-[200px]" title={row.keyword}>{row.keyword}</span>;
    default:
      return <span className="text-slate-600 dark:text-slate-400">{val != null ? String(val) : "—"}</span>;
  }
}

function SortIcon({ colKey, sort }: { colKey: string; sort: SortState | null }) {
  if (!sort || sort.column !== colKey) return <ArrowUpDown size={12} className="text-slate-300 dark:text-slate-600" />;
  return sort.direction === "asc"
    ? <ArrowUp size={12} className="text-blue-500" />
    : <ArrowDown size={12} className="text-blue-500" />;
}

interface DataTableProps {
  records: KeywordRecord[];
  columns: ColumnConfig[];
  sort: SortState | null;
  onSort: (sort: SortState | null) => void;
  isLoading: boolean;
  isFetching: boolean;
}

export function DataTable({ records, columns, sort, onSort, isLoading, isFetching }: DataTableProps) {
  const visibleDefs = COLUMN_DEFINITIONS.filter((def) => {
    const config = columns.find((c) => c.key === def.key);
    return config?.visible ?? false;
  });

  function handleSort(key: string, sortable: boolean) {
    if (!sortable) return;
    if (sort?.column === key) {
      onSort(sort.direction === "asc" ? { column: key, direction: "desc" } : null);
    } else {
      onSort({ column: key, direction: "asc" });
    }
  }

  if (isLoading) return <TableSkeleton rows={10} />;

  return (
    <div className={cn("relative overflow-auto rounded-lg border border-slate-200 dark:border-slate-700", isFetching && "opacity-70 pointer-events-none")}>
      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 shadow border border-slate-200 dark:border-slate-700">
            <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            Loading…
          </div>
        </div>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            {visibleDefs.map((def) => (
              <th key={def.key} style={{ minWidth: def.width }}
                onClick={() => handleSort(def.key, def.sortable)}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap select-none",
                  def.sortable && "cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {def.label}
                  {def.sortable && <SortIcon colKey={def.key} sort={sort} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={visibleDefs.length} className="text-center py-16 text-slate-400 dark:text-slate-500">
                No records match your search or filters.
              </td>
            </tr>
          ) : (
            records.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                {visibleDefs.map((def) => (
                  <td key={def.key} className="px-4 py-3">
                    {renderCell(def, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
