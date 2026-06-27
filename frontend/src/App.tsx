import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function App() {
  const { init } = useThemeStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      {/* Top nav */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="8" width="3" height="7" rx="1" fill="white" />
                <rect x="6" y="5" width="3" height="10" rx="1" fill="white" />
                <rect x="11" y="1" width="3" height="14" rx="1" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
              Analytics Dashboard
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
              · 65,000 records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <DashboardPage />
      </main>
    </div>
  );
}
