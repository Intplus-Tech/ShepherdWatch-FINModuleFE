import { API_V1 } from "@/lib/api";
import { getCsrfTokenFromCookie } from "@/lib/csrf";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export interface AssetSaleLog {
  id?: string;
  _id?: string;
  assetId?: string;
  assetName?: string;
  branchId?: string;
  branchName?: string;
  saleDate?: string;
  saleAmount?: number | string;
  buyerName?: string;
  buyerContact?: string;
  reasonForSale?: string;
  proceedsToAccount?: string;
  status?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateSaleLogBody {
  assetId: string;
  branchId?: string;
  saleDate: string;
  saleAmount: string | number;
  buyerName: string;
  buyerContact: string;
  reasonForSale: string;
  proceedsToAccount: string;
  [key: string]: unknown;
}

export interface UseAssetSalesLogsOptions {
  status?: string;
  search?: string;
  branchId?: string;
  enabled?: boolean;
}

function csrfHeaders(): Record<string, string> {
  const token = getCsrfTokenFromCookie();
  return token ? { "x-csrf-token": token } : {};
}

function extractItems(payload: unknown): AssetSaleLog[] {
  if (Array.isArray(payload)) return payload as AssetSaleLog[];
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;

  const data = root.data;
  if (Array.isArray(data)) return data as AssetSaleLog[];
  if (data && typeof data === "object") {
    const dataRecord = data as Record<string, unknown>;
    if (Array.isArray(dataRecord.content)) return dataRecord.content as AssetSaleLog[];
    if (Array.isArray(dataRecord.items)) return dataRecord.items as AssetSaleLog[];
  }

  if (Array.isArray(root.content)) return root.content as AssetSaleLog[];
  if (Array.isArray(root.items)) return root.items as AssetSaleLog[];
  return [];
}

async function parseOrThrow(res: Response, fallbackMessage: string) {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.message ?? fallbackMessage);
  }
  return payload;
}

export async function createSaleLog(body: CreateSaleLogBody) {
  const res = await fetch(`${API_V1}/asset-sales-logs`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
    },
    body: JSON.stringify(body),
  });
  return parseOrThrow(res, "Unable to create sale record.");
}

export async function approveSaleLog(id: string) {
  const res = await fetch(`${API_V1}/asset-sales-logs/${id}/approve`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
    },
  });
  return parseOrThrow(res, "Unable to approve sale record.");
}

export async function rejectSaleLog(id: string, rejectionReason: string) {
  const res = await fetch(`${API_V1}/asset-sales-logs/${id}/reject`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
    },
    body: JSON.stringify({ rejectionReason }),
  });
  return parseOrThrow(res, "Unable to reject sale record.");
}

export async function deleteSaleLog(id: string) {
  const res = await fetch(`${API_V1}/asset-sales-logs/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...csrfHeaders(),
    },
  });
  return parseOrThrow(res, "Unable to delete sale record.");
}

export function useAssetSalesLogs(options: UseAssetSalesLogsOptions = {}) {
  const { user } = useAuth();
  const enabled = options.enabled ?? true;
  const branchId = options.branchId ?? user?.branchId ?? undefined;
  const { status, search } = options;

  const [salesLogs, setSalesLogs] = useState<AssetSaleLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      if (search) qs.set("search", search);
      if (branchId) qs.set("branchId", branchId);

      const query = qs.toString();
      const res = await fetch(
        `${API_V1}/asset-sales-logs${query ? `?${query}` : ""}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to load sales log.");
      }
      setSalesLogs(extractItems(payload));
    } catch (err) {
      setSalesLogs([]);
      setError(err instanceof Error ? err.message : "Unable to load sales log.");
    } finally {
      setLoading(false);
    }
  }, [enabled, status, search, branchId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    salesLogs,
    loading,
    error,
    refresh,
    createSaleLog,
    approveSaleLog,
    rejectSaleLog,
    deleteSaleLog,
  };
}
