
import { create } from "zustand";
import { TableFilters, SortState, ColumnConfig } from "@/types";
import { KeywordRecord } from "@/types";
import { loadColumnConfig, saveColumnConfig } from "@/lib/columns";

interface DashboardState {
  // Pagination
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Search
  search: string;
  setSearch: (search: string) => void;

  // Sort (multi-column: primary only for now – extendable)
  sort: SortState | null;
  setSort: (sort: SortState | null) => void;

  // Filters
  filters: TableFilters;
  setFilters: (filters: TableFilters) => void;
  resetFilters: () => void;

  // Column visibility
  columns: ColumnConfig[];
  setColumns: (columns: ColumnConfig[]) => void;
  toggleColumn: (key: keyof KeywordRecord) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  page: 1,
  limit: 50,
  search: "",
  sort: null,
  filters: {},
  columns: loadColumnConfig(),

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),

  setSearch: (search) => set({ search, page: 1 }),

  setSort: (sort) => set({ sort }),

  setFilters: (filters) => set({ filters, page: 1 }),

  resetFilters: () => set({ filters: {}, search: "", page: 1, sort: null }),

  setColumns: (columns) => {
    saveColumnConfig(columns);
    set({ columns });
  },

  toggleColumn: (key) => {
    const columns = get().columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c));
    saveColumnConfig(columns);
    set({ columns });
  },
}));
