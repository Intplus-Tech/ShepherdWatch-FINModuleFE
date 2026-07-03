import { API_V1 } from "@/lib/api";
import { getCsrfTokenFromCookie } from "@/lib/csrf";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

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

function csrfHeaders(): Record<string, string> {
  const token = getCsrfTokenFromCookie();
  return token ? { "x-csrf-token": token } : {};
}

export type AssetMovement = {
  id?: string;
  _id?: string;
  assetId?: string;
  assetName?: string;
  fromLocation?: string;
  toLocation?: string;
  movementType?: string;
  reason?: string;
  handledBy?: string;
  movedBy?: string;
  createdAt?: string;
  movedAt?: string;
  [key: string]: unknown;
};

export type RecordAssetMovementPayload = {
  fromLocation?: string;
  toLocation?: string;
  movementType?: string;
  reason?: string;
  [key: string]: unknown;
};

export type StockAdjustmentPayload = {
  quantityAdded?: number;
  newTotal?: number;
  totalCost?: number;
  reason?: string;
  [key: string]: unknown;
};

export type CashBoxTopUpPayload = {
  amount?: number;
  bankAccountId?: string;
  justification?: string;
  [key: string]: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractItems(payload: unknown): AssetMovement[] {
  if (Array.isArray(payload)) return payload as AssetMovement[];
  const root = asRecord(payload);
  if (!root) return [];
  const data = root.data;
  if (Array.isArray(data)) return data as AssetMovement[];
  const dataRecord = asRecord(data);
  if (dataRecord) {
    if (Array.isArray(dataRecord.items)) return dataRecord.items as AssetMovement[];
    if (Array.isArray(dataRecord.content)) return dataRecord.content as AssetMovement[];
    if (Array.isArray(dataRecord.movements)) return dataRecord.movements as AssetMovement[];
  }
  if (Array.isArray(root.items)) return root.items as AssetMovement[];
  if (Array.isArray(root.content)) return root.content as AssetMovement[];
  if (Array.isArray(root.movements)) return root.movements as AssetMovement[];
  return [];
}

export function useAssetMovements(options: { enabled?: boolean; assetId?: string } = {}) {
  const enabled = options.enabled ?? true;
  const assetId = options.assetId?.trim() || undefined;

  const query = useQuery({
    queryKey: ["asset-movements", { assetId: assetId ?? "" }],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const path = assetId ? `${API_V1}/assets/${assetId}/movements` : `${API_V1}/assets/movements`;
      const res = await requestWithAuthRecovery(() =>
        axios.get(path, { withCredentials: true })
      );
      return { items: extractItems(res.data), raw: res.data };
    },
  });

  return {
    items: query.data?.items ?? [],
    raw: query.data?.raw,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

export function useRecordAssetMovement(assetId: string | undefined | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RecordAssetMovementPayload) => {
      if (!assetId) throw new Error("Missing asset id");
      const res = await requestWithAuthRecovery(() =>
        axios.post(`${API_V1}/assets/${assetId}/movements`, payload, {
          withCredentials: true,
          headers: csrfHeaders(),
        })
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-movements"] });
    },
  });
}

export function useStockAdjustment(assetId: string | undefined | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StockAdjustmentPayload) => {
      if (!assetId) throw new Error("Missing asset id");
      const res = await requestWithAuthRecovery(() =>
        axios.post(`${API_V1}/assets/${assetId}/stock-adjustments`, payload, {
          withCredentials: true,
          headers: csrfHeaders(),
        })
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-overview"] });
    },
  });
}

export function useCashBoxTopUp(cashBoxId: string | undefined | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CashBoxTopUpPayload) => {
      if (!cashBoxId) throw new Error("Missing cash box id");
      const res = await requestWithAuthRecovery(() =>
        axios.post(`${API_V1}/cash-boxes/${cashBoxId}/top-up`, payload, {
          withCredentials: true,
          headers: csrfHeaders(),
        })
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-overview"] });
    },
  });
}
