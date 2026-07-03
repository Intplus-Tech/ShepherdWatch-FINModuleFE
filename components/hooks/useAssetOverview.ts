import { API_V1 } from "@/lib/api";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/components/auth/AuthProvider";

async function tryRefreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_V1}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function requestWithAuthRecovery<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status !== 401) throw error;
    const refreshed = await tryRefreshSession();
    if (!refreshed) throw error;
    return request();
  }
}

export type AssetOverviewItem = {
  id?: string;
  _id?: string;
  branch?: string;
  branchName?: string;
  tenantId?: string;
  name?: string;
  assetName?: string;
  description?: string;
  category?: string;
  cost?: number;
  purchaseValue?: number;
  value?: number;
  nbv?: number;
  currentValue?: number;
  status?: string;
  [key: string]: unknown;
};

export type AssetOverviewResponse = {
  items: AssetOverviewItem[];
  totals?: Record<string, unknown>;
  raw?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractItems(payload: unknown): AssetOverviewItem[] {
  if (Array.isArray(payload)) return payload as AssetOverviewItem[];
  const root = asRecord(payload);
  if (!root) return [];
  const data = root.data;
  if (Array.isArray(data)) return data as AssetOverviewItem[];
  const dataRecord = asRecord(data);
  if (dataRecord) {
    if (Array.isArray(dataRecord.items)) return dataRecord.items as AssetOverviewItem[];
    if (Array.isArray(dataRecord.content)) return dataRecord.content as AssetOverviewItem[];
    if (Array.isArray(dataRecord.assets)) return dataRecord.assets as AssetOverviewItem[];
  }
  if (Array.isArray(root.items)) return root.items as AssetOverviewItem[];
  if (Array.isArray(root.content)) return root.content as AssetOverviewItem[];
  if (Array.isArray(root.assets)) return root.assets as AssetOverviewItem[];
  return [];
}

function extractTotals(payload: unknown): Record<string, unknown> | undefined {
  const root = asRecord(payload);
  if (!root) return undefined;
  const dataRecord = asRecord(root.data);
  if (dataRecord && asRecord(dataRecord.totals)) {
    return asRecord(dataRecord.totals) ?? undefined;
  }
  if (asRecord(root.totals)) return asRecord(root.totals) ?? undefined;
  if (asRecord(root.summary)) return asRecord(root.summary) ?? undefined;
  return undefined;
}

export function useAssetOverview(options: { enabled?: boolean; branchId?: string } = {}) {
  const { user } = useAuth();
  const enabled = options.enabled ?? true;
  const branchId = (options.branchId ?? user?.branchId)?.trim() || undefined;

  const query = useQuery({
    queryKey: ["asset-overview", { branchId: branchId ?? "" }],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await requestWithAuthRecovery(() =>
        axios.get(`${API_V1}/assets/overview`, {
          withCredentials: true,
          params: branchId ? { branchId } : undefined,
        })
      );
      const items = extractItems(res.data);
      const totals = extractTotals(res.data);
      return { items, totals, raw: res.data } satisfies AssetOverviewResponse;
    },
  });

  return {
    items: query.data?.items ?? [],
    totals: query.data?.totals,
    raw: query.data?.raw,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

export function useDepreciationAnalysis(
  options: { enabled?: boolean; branchId?: string; fiscalYear?: number } = {}
) {
  const enabled = options.enabled ?? true;
  const branchId = options.branchId?.trim() || undefined;
  const fiscalYear =
    typeof options.fiscalYear === "number" && Number.isFinite(options.fiscalYear)
      ? options.fiscalYear
      : undefined;

  const query = useQuery({
    queryKey: [
      "asset-depreciation-analysis",
      { branchId: branchId ?? "", fiscalYear: fiscalYear ?? "" },
    ],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (branchId) params.branchId = branchId;
      if (fiscalYear !== undefined) params.fiscalYear = fiscalYear;
      const res = await requestWithAuthRecovery(() =>
        axios.get(`${API_V1}/assets/depreciation-analysis`, {
          withCredentials: true,
          params: Object.keys(params).length > 0 ? params : undefined,
        })
      );
      return res.data;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
