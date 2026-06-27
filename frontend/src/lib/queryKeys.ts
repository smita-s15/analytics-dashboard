import { TableQueryParams } from "@/types";

export function buildQueryKey(params: TableQueryParams): unknown[] {
  return [
    "analytics",
    {
      page: params.page,
      limit: params.limit,
      search: params.search ?? "",
      sortBy: params.sortBy ?? "",
      sortOrder: params.sortOrder ?? "asc",
      filters: {
        category: params.filters?.category ?? "",
        status: params.filters?.status ?? "",
        rankMin: params.filters?.rankMin ?? "",
        rankMax: params.filters?.rankMax ?? "",
        device: params.filters?.device ?? "",
        source: params.filters?.source ?? "",
      },
    },
  ];
}

export function buildInsightsQueryKey(
  params: Omit<TableQueryParams, "page" | "limit" | "sortBy" | "sortOrder">
): unknown[] {
  return ["insights", { search: params.search ?? "", filters: params.filters ?? {} }];
}
