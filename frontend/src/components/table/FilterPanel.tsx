
import { TableFilters } from "@/types";
import { Select } from "@/components/ui/Select";
import { X } from "lucide-react";

const CATEGORIES = [
  { value: "Informational", label: "Informational" },
  { value: "Commercial", label: "Commercial" },
  { value: "Navigational", label: "Navigational" },
  { value: "Transactional", label: "Transactional" },
];
const STATUSES = [
  { value: "ranking", label: "Ranking" },
  { value: "new", label: "New" },
  { value: "dropped", label: "Dropped" },
  { value: "not_ranking", label: "Not Ranking" },
];
const DEVICES = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];
const SOURCES = [
  { value: "organic", label: "Organic" },
  { value: "paid", label: "Paid" },
  { value: "featured", label: "Featured" },
];

interface FilterPanelProps {
  filters: TableFilters;
  onChange: (filters: TableFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const active = Object.values(filters).filter(Boolean).length;

  function set(key: keyof TableFilters, value: string | number | undefined) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select label="Category" placeholder="All Categories" value={filters.category ?? ""} onChange={(e) => set("category", e.target.value)} options={CATEGORIES} className="w-44" />
      <Select label="Status"   placeholder="All Statuses"   value={filters.status ?? ""}   onChange={(e) => set("status",   e.target.value)} options={STATUSES}   className="w-40" />
      <Select label="Device"   placeholder="All Devices"    value={filters.device ?? ""}   onChange={(e) => set("device",   e.target.value)} options={DEVICES}   className="w-36" />
      <Select label="Source"   placeholder="All Sources"    value={filters.source ?? ""}   onChange={(e) => set("source",   e.target.value)} options={SOURCES}   className="w-36" />

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rank Range</span>
        <div className="flex items-center gap-1.5">
          <input type="number" placeholder="Min" min={1} max={100} value={filters.rankMin ?? ""}
            onChange={(e) => set("rankMin", e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="h-9 w-16 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <span className="text-slate-300 dark:text-slate-600 text-sm">–</span>
          <input type="number" placeholder="Max" min={1} max={100} value={filters.rankMax ?? ""}
            onChange={(e) => set("rankMax", e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="h-9 w-16 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {active > 0 && (
        <button onClick={() => onChange({})}
          className="h-9 flex items-center gap-1.5 px-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors self-end border border-slate-200 dark:border-slate-600"
        >
          <X size={13} /> Clear ({active})
        </button>
      )}
    </div>
  );
}
