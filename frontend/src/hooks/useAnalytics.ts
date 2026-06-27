import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnalyticsResponse, Annotation, TableQueryParams } from "@/types";
import { buildQueryKey } from "@/lib/queryKeys";
import api from "@/lib/api";

// ─── Build params object for axios ───────────────────────────────────────────

function buildParams(params: TableQueryParams): Record<string, string> {
  const sp: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.search) sp.search = params.search;
  if (params.sortBy) sp.sortBy = params.sortBy;
  if (params.sortOrder) sp.sortOrder = params.sortOrder;
  if (params.filters?.category) sp.category = params.filters.category;
  if (params.filters?.status) sp.status = params.filters.status;
  if (params.filters?.device) sp.device = params.filters.device;
  if (params.filters?.source) sp.source = params.filters.source;
  if (params.filters?.rankMin != null)
    sp.rankMin = String(params.filters.rankMin);
  if (params.filters?.rankMax != null)
    sp.rankMax = String(params.filters.rankMax);
  return sp;
}

// ─── Main data hook ───────────────────────────────────────────────────────────

export function useAnalytics(params: TableQueryParams) {
  return useQuery<AnalyticsResponse>({
    queryKey: buildQueryKey(params),
    queryFn: async () => {
      const { data } = await api.get("/api/analytics", {
        params: buildParams(params),
      });
      return data;
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ─── Prefetch next page ───────────────────────────────────────────────────────

export function usePrefetchNextPage(
  params: TableQueryParams,
  totalPages: number,
) {
  const qc = useQueryClient();
  const nextParams = { ...params, page: params.page + 1 };
  if (params.page < totalPages) {
    qc.prefetchQuery({
      queryKey: buildQueryKey(nextParams),
      queryFn: async () => {
        const { data } = await api.get("/api/analytics", {
          params: buildParams(nextParams),
        });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  }
}

// ─── Annotations ─────────────────────────────────────────────────────────────

export function useAnnotations() {
  return useQuery<Annotation[]>({
    queryKey: ["annotations"],
    queryFn: async () => {
      const { data } = await api.get("/api/analytics/annotations");
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCreateAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<Annotation, "id" | "createdAt" | "updatedAt">,
    ) => {
      const { data } = await api.post("/api/analytics/annotations", payload);
      return data as Annotation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations"] }),
  });
}

export function useUpdateAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Annotation) => {
      const { data } = await api.put("/api/analytics/annotations", payload);
      return data as Annotation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations"] }),
  });
}

export function useDeleteAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete("/api/analytics/annotations", { params: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annotations"] }),
  });
}
