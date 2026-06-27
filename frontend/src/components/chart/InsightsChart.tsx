
import { useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ChartDataPoint, Annotation } from "@/types";
import type { MouseHandlerDataParam } from "recharts/types/synchronisation/types";
import { ANNOTATION_TYPES } from "@/lib/mockData";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { AnnotationForm } from "./AnnotationForm";
import { useAnnotations, useCreateAnnotation, useUpdateAnnotation, useDeleteAnnotation } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

// ─── Metric config ────────────────────────────────────────────────────────────

interface MetricConfig {
  key: keyof ChartDataPoint;
  label: string;
  color: string;
  yAxisId: "left" | "right";
  formatter: (v: number) => string;
}

const METRICS: MetricConfig[] = [
  { key: "clicks",         label: "Clicks",       color: "#3b82f6", yAxisId: "left",  formatter: (v) => v.toLocaleString() },
  { key: "impressions",    label: "Impressions",  color: "#8b5cf6", yAxisId: "right", formatter: (v) => `${(v / 1000).toFixed(0)}k` },
  { key: "ctr",            label: "CTR (%)",      color: "#10b981", yAxisId: "left",  formatter: (v) => `${v.toFixed(1)}%` },
  { key: "avgRank",        label: "Avg Rank",     color: "#f59e0b", yAxisId: "left",  formatter: (v) => v.toFixed(1) },
  { key: "activeUsers",    label: "Active Users", color: "#ec4899", yAxisId: "left",  formatter: (v) => v.toLocaleString() },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
  visibleMetrics: Set<string>;
  annotations: Annotation[];
}

function CustomTooltip({ active, payload, label, visibleMetrics, annotations }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const dateAnnotations = annotations.filter((a) => a.date === label);
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4 min-w-[200px]">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
        {label ? format(parseISO(label), "MMM d, yyyy") : ""}
      </p>
      {payload.map((entry) => {
        const metric = METRICS.find((m) => m.key === entry.dataKey);
        if (!metric || !visibleMetrics.has(metric.key)) return null;
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6 py-0.5">
            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: metric.color }} />
              {metric.label}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{metric.formatter(entry.value)}</span>
          </div>
        );
      })}
      {dateAnnotations.map((ann) => {
        const type = ANNOTATION_TYPES.find((t) => t.value === ann.type);
        return (
          <div key={ann.id} className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold" style={{ color: type?.color }}>{ann.title}</p>
            {ann.description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ann.description}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InsightsChartProps {
  data?: ChartDataPoint[];
  isLoading?: boolean;
}

export function InsightsChart({ data, isLoading }: InsightsChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState(new Set(["clicks", "impressions", "ctr"]));
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [clickedDate, setClickedDate] = useState<string | null>(null);

  const { data: annotations = [] } = useAnnotations();
  const createMutation = useCreateAnnotation();
  const updateMutation = useUpdateAnnotation();
  const deleteMutation = useDeleteAnnotation();

  const toggleMetric = (key: string) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  const handleAnnotationClick = useCallback((ann: Annotation) => {
    setSelectedAnnotation(ann);
    setModalMode("view");
  }, []);

  const handleChartClick = useCallback((e: MouseHandlerDataParam) => {
    if (e?.activeLabel != null) {
      setClickedDate(String(e.activeLabel));
      setModalMode("create");
    }
  }, []);

  if (isLoading || !data) {
    return <div className="bg-white rounded-xl border border-slate-200 p-6"><Skeleton className="h-72 w-full" /></div>;
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Traffic Insights</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => { setSelectedAnnotation(null); setClickedDate(null); setModalMode("create"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              <Plus size={13} /> Add Annotation
            </button>
          </div>
        </div>

        {/* Metric toggles */}
        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                visibleMetrics.has(m.key)
                  ? "text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
              style={visibleMetrics.has(m.key) ? { backgroundColor: m.color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: visibleMetrics.has(m.key) ? "rgba(255,255,255,0.6)" : m.color }}
              />
              {m.label}
            </button>
          ))}
        </div>

        {/* Chart – click any date to add annotation */}
        <div className="px-2 pb-4" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              onClick={handleChartClick}
              margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(parseISO(v), "d MMM")}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    active={props.active}
                    payload={props.payload as unknown as Array<{ dataKey: string; value: number }>}
                    label={props.label as string}
                    visibleMetrics={visibleMetrics}
                    annotations={annotations}
                  />
                )}
              />

              {/* Annotation reference lines */}
              {annotations.map((ann) => {
                const type = ANNOTATION_TYPES.find((t) => t.value === ann.type);
                return (
                  <ReferenceLine
                    key={ann.id}
                    x={ann.date}
                    yAxisId="left"
                    stroke={type?.color ?? "#64748b"}
                    strokeDasharray="4 2"
                    strokeWidth={1.5}
                    label={{
                      value: "●",
                      position: "insideBottomRight",
                      fill: type?.color ?? "#64748b",
                      fontSize: 12,
                      cursor: "pointer",
                      onClick: () => handleAnnotationClick(ann),
                    }}
                  />
                );
              })}

              {METRICS.filter((m) => visibleMetrics.has(m.key)).map((m) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  yAxisId={m.yAxisId}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Annotation chips below chart */}
        {annotations.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-700 px-6 py-3 flex flex-wrap gap-2">
            {annotations.map((ann) => {
              const type = ANNOTATION_TYPES.find((t) => t.value === ann.type);
              return (
                <button
                  key={ann.id}
                  onClick={() => handleAnnotationClick(ann)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: type?.color }} />
                  <span className="text-slate-500 dark:text-slate-400">{format(parseISO(ann.date), "d MMM")}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{ann.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create annotation modal */}
      <Modal open={modalMode === "create"} onClose={() => setModalMode(null)} title="Add Annotation">
        <AnnotationForm
          defaultDate={clickedDate ?? undefined}
          onSubmit={async (d) => { await createMutation.mutateAsync(d); setModalMode(null); }}
          onCancel={() => setModalMode(null)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* View annotation modal */}
      <Modal
        open={modalMode === "view" && !!selectedAnnotation}
        onClose={() => setModalMode(null)}
        title="Annotation"
      >
        {selectedAnnotation && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedAnnotation.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {format(parseISO(selectedAnnotation.date), "MMMM d, yyyy")} ·{" "}
                {ANNOTATION_TYPES.find((t) => t.value === selectedAnnotation.type)?.label}
              </p>
              {selectedAnnotation.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{selectedAnnotation.description}</p>
              )}
            </div>
            <div className="flex justify-between pt-2">
              <button
                onClick={async () => {
                  await deleteMutation.mutateAsync(selectedAnnotation.id);
                  setModalMode(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
              <button
                onClick={() => setModalMode("edit")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                <Pencil size={13} /> Edit
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit annotation modal */}
      <Modal
        open={modalMode === "edit" && !!selectedAnnotation}
        onClose={() => setModalMode(null)}
        title="Edit Annotation"
      >
        {selectedAnnotation && (
          <AnnotationForm
            initialData={selectedAnnotation}
            onSubmit={async (d) => {
              await updateMutation.mutateAsync({ ...selectedAnnotation, ...d });
              setModalMode(null);
            }}
            onCancel={() => setModalMode(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </>
  );
}
