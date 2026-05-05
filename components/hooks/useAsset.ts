import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

async function tryRefreshSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/auth/refresh-token", {
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

export type AssetCondition = "excellent" | "good" | "fair" | "poor";
export type AssetType = "fixed" | "stock" | "cash_box";

export type AssetDetail = {
  id?: string;
  _id?: string;
  name?: string;
  description?: string | null;
  chartOfAccountId?: string | null;
  assetClassId?: string | null;
  assetClassName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  residualValue?: number | null;
  location?: string | null;
  responsiblePersonId?: string | null;
  responsiblePersonName?: string | null;
  custodianId?: string | null;
  custodianName?: string | null;
  condition?: AssetCondition | null;
  assetType?: AssetType | null;
  photoUrl?: string | null;
  quantity?: number | null;
  unitCost?: number | null;
  reorderLevel?: number | null;
  cost?: number | null;
  purchaseValue?: number | null;
  currentValue?: number | null;
  nbv?: number | null;
  serialNumber?: string | null;
  modelYear?: string | number | null;
  purchaseDate?: string | null;
  warrantyStatus?: string | null;
  warrantyExpiry?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractAsset(payload: unknown): AssetDetail | null {
  const root = asRecord(payload);
  if (!root) return null;
  const data = asRecord(root.data);
  if (data) {
    const inner = asRecord(data.asset) ?? asRecord(data.item);
    return (inner ?? data) as AssetDetail;
  }
  return root as AssetDetail;
}

export function useAsset(assetId: string | undefined | null, options: { enabled?: boolean } = {}) {
  const enabled = (options.enabled ?? true) && !!assetId;

  const query = useQuery({
    queryKey: ["asset", assetId ?? ""],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await requestWithAuthRecovery(() =>
        axios.get(`/api/v1/assets/${assetId}`, { withCredentials: true })
      );
      return extractAsset(res.data);
    },
  });

  return {
    asset: query.data ?? null,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
