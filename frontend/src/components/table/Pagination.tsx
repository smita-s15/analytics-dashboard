
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationMeta } from "@/types";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";

const PAGE_SIZES = [
  { value: "50",  label: "50 / page" },
  { value: "100", label: "100 / page" },
  { value: "250", label: "250 / page" },
  { value: "500", label: "500 / page" },
];

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({ meta, onPageChange, onLimitChange }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{start.toLocaleString()}–{end.toLocaleString()}</span> of <span className="font-medium text-slate-700 dark:text-slate-200">{total.toLocaleString()}</span> records
      </p>
      <div className="flex items-center gap-2">
        <Select value={String(limit)} onChange={(e) => onLimitChange(Number(e.target.value))} options={PAGE_SIZES} className="w-32" />
        <div className="flex items-center gap-1">
          <NavBtn onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First"><ChevronsLeft size={15} /></NavBtn>
          <NavBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous"><ChevronLeft size={15} /></NavBtn>
          {pages.map((p, i) =>
            p === "…"
              ? <span key={`ellipsis-${i}`} className="px-2 text-slate-400 dark:text-slate-500 text-sm">…</span>
              : <NavBtn key={p} onClick={() => onPageChange(p)} active={p === page}>{p}</NavBtn>
          )}
          <NavBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next"><ChevronRight size={15} /></NavBtn>
          <NavBtn onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last"><ChevronsRight size={15} /></NavBtn>
        </div>
      </div>
    </div>
  );
}

function NavBtn({ children, onClick, disabled, active, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn(
        "h-8 min-w-8 px-2 rounded-lg text-sm transition-colors font-medium",
        active ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
        disabled && "opacity-30 cursor-not-allowed pointer-events-none"
      )}
      {...props}
    >
      {children}
    </button>
  );
}
