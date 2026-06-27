import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnalyticsResponse, Annotation, TableQueryParams } from "@/types";
import { buildQueryKey } from "@/lib/queryKeys";

// API base — Vite proxy forwards /api → http://localhost:8000
const API_BASE = "/api";

function buildUrl(params: TableQueryParams): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));
  if (params.search) sp.set("search", params.search);
  if (params.sortBy) sp.set("sortBy", params.sortBy);
  if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params.filters?.category) sp.set("category", params.filters.category);
  if (params.filters?.status) sp.set("status", params.filters.status);
  if (params.filters?.device) sp.set("device", params.filters.device);
  if (params.filters?.source) sp.set("source", params.filters.source);
  if (params.filters?.rankMin != null) sp.set("rankMin", String(params.filters.rankMin));
  if (params.filters?.rankMax != null) sp.set("rankMax", String(params.filters.rankMax));
  return `${API_BASE}/analytics?${sp.toString()}`;
}

export function useAnalytics(params: TableQueryParams) {
  return useQuery<AnalyticsResponse>({
    queryKey: buildQueryKey(params),
    queryFn: async () => {
      const res = await fetch(buildUrl(params));
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function usePrefetchNextPage(params: TableQueryParams, totalPages: number) {
  const qc = useQueryClient();
  const nextParams = { ...params, page: params.page + 1 };
  if (params.page < totalPages) {
    qc.prefetchQuery({
      queryKey: buildQueryKey(nextParams),
      queryFn: async () => {
        const res = await fetch(buildUrl(nextParams));
        if (!res.ok) throw new Error("Prefetch failed");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  }
}

export function useAnnotations() {
  return useQuery<Annotation[]>({
    queryKey: ["annotations"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/analytics/annotations`);
      if (!res.ok) throw new Error("Failed to fetch annotations");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useCreateAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Annotation, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch(`${API_BASE}/analytics/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create annotation");
      return res.json() as Promise<Annotation>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations"] }),
  });
}

export function useUpdateAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Annotation) => {
      const res = await fetch(`${API_BASE}/analytics/annotations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update annotation");
      return res.json() as Promise<Annotation>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations"] }),
  });
}

export function useDeleteAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/analytics/annotations?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete annotation");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations"] }),
  });
}
