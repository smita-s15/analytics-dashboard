
import { useDashboardStore } from "@/store/dashboardStore";
import { useAnalytics, usePrefetchNextPage } from "@/hooks/useAnalytics";
import { KPIWidgets } from "@/components/dashboard/KPIWidgets";
import { InsightsChart } from "@/components/chart/InsightsChart";
import { DataTable } from "@/components/table/DataTable";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { ColumnPicker } from "@/components/table/ColumnPicker";
import { Pagination } from "@/components/table/Pagination";
import { ExportButton } from "@/components/table/ExportButton";
import { SortState } from "@/types";

export function DashboardPage() {
  const { page, limit, search, sort, filters, columns, setPage, setLimit, setSearch, setSort, setFilters, toggleColumn } = useDashboardStore();

  const queryParams = { page, limit, search, sortBy: sort?.column, sortOrder: sort?.direction, filters };
  const { data, isLoading, isFetching, isError } = useAnalytics(queryParams);

  usePrefetchNextPage(queryParams, data?.pagination.totalPages ?? 1);

  function handleSort(newSort: SortState | null) { setSort(newSort); setPage(1); }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-sm mt-1">Failed to load analytics data. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KPIWidgets data={data?.kpis} isLoading={isLoading} />
      <InsightsChart data={data?.chart} isLoading={isLoading} />

      {/* Data Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">Keyword Data</h2>
              {data?.pagination && (
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                  {data.pagination.total.toLocaleString()} records
                </span>
              )}
              {isFetching && !isLoading && (
                <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Updating…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ExportButton records={data?.records ?? []} columns={columns} />
              <ColumnPicker columns={columns} onToggle={toggleColumn} />
            </div>
          </div>
          <SearchBar value={search} onChange={setSearch} className="max-w-sm" />
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        <div className="p-4">
          <DataTable records={data?.records ?? []} columns={columns} sort={sort} onSort={handleSort} isLoading={isLoading} isFetching={isFetching && !isLoading} />
        </div>

        {data?.pagination && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700">
            <Pagination meta={data.pagination} onPageChange={setPage} onLimitChange={setLimit} />
          </div>
        )}
      </div>
    </div>
  );
}
