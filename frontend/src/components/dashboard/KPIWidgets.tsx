
import { TrendingUp, MousePointerClick, Eye, BarChart2, Hash, Star } from "lucide-react";
import { KPIData } from "@/types";
import { KPICardSkeleton } from "@/components/ui/Skeleton";
import { formatNumber, formatCtr } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function KPICard({ label, value, subtext, icon, iconBg }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={cn("p-2.5 rounded-xl flex-shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

export function KPIWidgets({ data, isLoading }: { data?: KPIData; isLoading: boolean }) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)}
      </div>
    );
  }

  const cards: KPICardProps[] = [
    { label: "Total Records",     value: formatNumber(data.totalRecords),    subtext: "matching your filters", icon: <Hash size={18} className="text-violet-600 dark:text-violet-400" />, iconBg: "bg-violet-50 dark:bg-violet-900/30" },
    { label: "Ranking Keywords",  value: formatNumber(data.rankingKeywords), subtext: `of ${formatNumber(data.totalRecords)} total`, icon: <Star size={18} className="text-amber-600 dark:text-amber-400" />, iconBg: "bg-amber-50 dark:bg-amber-900/30" },
    { label: "Total Clicks",      value: formatNumber(data.totalClicks),     subtext: "across all records",   icon: <MousePointerClick size={18} className="text-blue-600 dark:text-blue-400" />, iconBg: "bg-blue-50 dark:bg-blue-900/30" },
    { label: "Total Impressions", value: formatNumber(data.totalImpressions),subtext: "search appearances",   icon: <Eye size={18} className="text-emerald-600 dark:text-emerald-400" />, iconBg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { label: "Avg. CTR",          value: formatCtr(data.avgCtr),            subtext: "click-through rate",   icon: <TrendingUp size={18} className="text-rose-600 dark:text-rose-400" />, iconBg: "bg-rose-50 dark:bg-rose-900/30" },
    { label: "Avg. Rank",         value: data.avgRank.toFixed(1),           subtext: "average position",     icon: <BarChart2 size={18} className="text-indigo-600 dark:text-indigo-400" />, iconBg: "bg-indigo-50 dark:bg-indigo-900/30" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => <KPICard key={card.label} {...card} />)}
    </div>
  );
}
