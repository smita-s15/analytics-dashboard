
import { useState, useRef, useEffect } from "react";
import { Columns, Check } from "lucide-react";
import { ColumnConfig } from "@/types";
import { KeywordRecord } from "@/types";
import { COLUMN_DEFINITIONS } from "@/lib/columns";
import { cn } from "@/lib/utils";

interface ColumnPickerProps {
  columns: ColumnConfig[];
  onToggle: (key: keyof KeywordRecord) => void;
}

export function ColumnPicker({ columns, onToggle }: ColumnPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const visibleCount = columns.filter((c) => c.visible).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
      >
        <Columns size={14} />
        Columns
        <span className="text-xs text-slate-400 dark:text-slate-500">({visibleCount})</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-2 w-52">
          <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Show / Hide Columns</p>
          {COLUMN_DEFINITIONS.map((def) => {
            const config = columns.find((c) => c.key === def.key);
            const visible = config?.visible ?? true;
            return (
              <button key={def.key} onClick={() => onToggle(def.key)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span className={visible ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>{def.label}</span>
                {visible && <Check size={13} className="text-blue-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
