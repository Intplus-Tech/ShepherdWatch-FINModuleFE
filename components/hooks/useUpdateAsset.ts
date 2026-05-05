import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AssetDetail } from "./useAsset";

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

export type UpdateAssetPayload = Partial<AssetDetail> & Record<string, unknown>;

export function useUpdateAsset(assetId: string | undefined | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAssetPayload) => {
      if (!assetId) throw new Error("Missing asset id");
      const res = await requestWithAuthRecovery(() =>
        axios.patch(`/api/v1/assets/${assetId}`, payload, { withCredentials: true })
      );
      return res.data;
    },
    onSuccess: () => {
      if (!assetId) return;
      queryClient.invalidateQueries({ queryKey: ["asset", assetId] });
      queryClient.invalidateQueries({ queryKey: ["asset-overview"] });
    },
  });
}
