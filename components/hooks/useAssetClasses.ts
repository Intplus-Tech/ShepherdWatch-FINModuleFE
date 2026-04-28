import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type AssetClass = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  defaultDepreciationMethod?: string;
  defaultUsefulLifeYears?: number;
  defaultResidualValuePercent?: number;
  residualValuePercent?: number;
};

type AssetClassPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type ListAssetClassesResult = {
  items: AssetClass[];
  pagination: AssetClassPagination;
  success?: boolean;
  message?: string;
  timestamp?: string;
};

type UseAssetClassesOptions = {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
};

type DepreciationMethod = "straight_line" | "declining_balance";

type UpdateAssetClassInput = {
  id: string;
  name?: unknown;
  description?: unknown;
  defaultDepreciationMethod?: unknown;
  defaultUsefulLifeYears?: unknown;
  defaultResidualValuePercent?: unknown;
};

type UpdateAssetClassPayload = {
  name?: string;
  description?: string;
  defaultDepreciationMethod?: DepreciationMethod;
  defaultUsefulLifeYears?: number;
  defaultResidualValuePercent?: number;
};

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
    if (status !== 401) {
      throw error;
    }

    const refreshed = await tryRefreshSession();
    if (!refreshed) {
      throw error;
    }

    return request();
  }
}

export function useAssetClasses(options: UseAssetClassesOptions = {}) {
  const queryClient = useQueryClient();
  const page = normalizePositiveInt(options.page, 1);
  const limit = normalizePositiveInt(options.limit, 20);
  const search = normalizeOptionalString(options.search);
  const enabled = options.enabled ?? true;

  const assetClassesQuery = useQuery({
    queryKey: ['asset-classes', { page, limit, search: search ?? "" }],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await requestWithAuthRecovery(() =>
        axios.get('/api/v1/asset-classes', {
          withCredentials: true,
          params: {
            page,
            limit,
            ...(search ? { search } : {}),
          },
        })
      );
      return extractAssetClassListResponse(res.data, page, limit);
    }
  });

  const createAssetClassMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      defaultDepreciationMethod?: string;
      defaultUsefulLifeYears?: number;
      defaultResidualValuePercent?: number;
    }) => {
      const res = await requestWithAuthRecovery(() =>
        axios.post('/api/v1/asset-classes', payload, { withCredentials: true })
      );
      return res.data;
    },
    retry: false,
    onSuccess: (responsePayload) => {
      const created = extractCreatedAssetClass(responsePayload);
      if (created) {
        queryClient.setQueriesData<ListAssetClassesResult>({ queryKey: ['asset-classes'] }, (old) => {
          if (!old) return old;
          const existing = Array.isArray(old.items) ? old.items : [];
          const createdKey = String(created._id ?? created.id ?? created.name ?? "").trim().toLowerCase();
          const hasMatch = existing.some((item) => {
            const itemKey = String(item?._id ?? item?.id ?? item?.name ?? "").trim().toLowerCase();
            return itemKey.length > 0 && itemKey === createdKey;
          });

          if (hasMatch) return old;

          const nextItems = [created, ...existing];
          return {
            ...old,
            items: nextItems,
            pagination: {
              ...old.pagination,
              total: Math.max(0, Number(old.pagination?.total ?? 0) + 1),
            },
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ['asset-classes'] });
    }
  });

  return {
    assetClasses: assetClassesQuery.data?.items ?? [],
    pagination: assetClassesQuery.data?.pagination ?? {
      total: 0,
      page,
      limit,
      pages: 0,
    },
    success: assetClassesQuery.data?.success,
    message: assetClassesQuery.data?.message,
    timestamp: assetClassesQuery.data?.timestamp,
    isLoading: assetClassesQuery.isLoading,
    isFetching: assetClassesQuery.isFetching,
    error: assetClassesQuery.error ? (assetClassesQuery.error as Error).message : null,
    refetch: assetClassesQuery.refetch,
    
    createAssetClass: createAssetClassMutation.mutateAsync,
    isCreating: createAssetClassMutation.isPending,
    createError: createAssetClassMutationErrorMessage(createAssetClassMutation.error),
  };
}

export function useAssetClassById(assetClassId: string | null) {
  const assetClassQuery = useQuery({
    queryKey: ["asset-class", assetClassId],
    enabled: Boolean(assetClassId && assetClassId.trim().length > 0),
    queryFn: async () => {
      const id = String(assetClassId).trim();
      const res = await requestWithAuthRecovery(() =>
        axios.get(`/api/v1/asset-classes/${encodeURIComponent(id)}`, { withCredentials: true })
      );

      const record = asRecord(res.data);
      if (!record) return null;

      const directData = record.data;
      if (directData && typeof directData === "object") {
        return directData as AssetClass;
      }

      return record as AssetClass;
    },
  });

  return {
    assetClass: assetClassQuery.data ?? null,
    isLoading: assetClassQuery.isLoading,
    error: assetClassQuery.error ? (assetClassQuery.error as Error).message : null,
    refetch: assetClassQuery.refetch,
  };
}

export function useUpdateAssetClass() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: UpdateAssetClassInput) => {
      const id = normalizeRequiredId(input.id);
      const payload = normalizeUpdateAssetClassPayload(input);
      if (Object.keys(payload).length === 0) {
        throw new Error("Update at least one field.");
      }

      const res = await requestWithAuthRecovery(() =>
        axios.patch(`/api/v1/asset-classes/${encodeURIComponent(id)}`, payload, {
          withCredentials: true,
        })
      );
      return { id, data: res.data };
    },
    retry: false,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ["asset-classes"] });
      queryClient.invalidateQueries({ queryKey: ["asset-class", id] });
    },
  });

  return {
    updateAssetClass: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    updateError: createAssetClassMutationErrorMessage(mutation.error),
    updateSuccess: mutation.isSuccess,
  };
}

function createAssetClassMutationErrorMessage(error: unknown): string | null {
  if (!error) return null;
  const axiosError = error as AxiosError<{
    message?: string;
    error?: string;
    detail?: string;
    errors?: Array<{ message?: string } | string>;
  }>;

  const data = axiosError.response?.data;
  if (data) {
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.error === "string" && data.error.trim()) return data.error;
    if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === "string" && first.trim()) return first;
      if (first && typeof first === "object" && typeof first.message === "string" && first.message.trim()) {
        return first.message;
      }
    }
  }

  return (error as Error).message;
}

function extractAssetClassListResponse(
  payload: unknown,
  fallbackPage: number,
  fallbackLimit: number
): ListAssetClassesResult {
  const record = asRecord(payload);
  if (!record) {
    return {
      items: [],
      pagination: {
        total: 0,
        page: fallbackPage,
        limit: fallbackLimit,
        pages: 0,
      },
    };
  }

  const items = extractAssetClassList(payload);
  const pagination = extractPagination(record, fallbackPage, fallbackLimit, items.length);

  return {
    items,
    pagination,
    success: typeof record.success === "boolean" ? record.success : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
    timestamp: typeof record.timestamp === "string" ? record.timestamp : undefined,
  };
}

function extractAssetClassList(payload: unknown): AssetClass[] {
  const record = asRecord(payload);
  if (!record) return [];

  const directData = record.data;
  if (Array.isArray(directData)) return directData as AssetClass[];

  const nestedData = asRecord(directData);
  if (!nestedData) return [];

  if (Array.isArray(nestedData.data)) return nestedData.data as AssetClass[];
  if (Array.isArray(nestedData.items)) return nestedData.items as AssetClass[];

  return [];
}

function extractPagination(
  record: Record<string, unknown>,
  fallbackPage: number,
  fallbackLimit: number,
  itemCount: number
): AssetClassPagination {
  const paginationRecord = asRecord(record.pagination);
  const total = normalizePositiveInt(paginationRecord?.total, itemCount);
  const page = normalizePositiveInt(paginationRecord?.page, fallbackPage);
  const limit = normalizePositiveInt(paginationRecord?.limit, fallbackLimit);
  const pages = normalizePositiveInt(
    paginationRecord?.pages,
    limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1
  );

  return { total, page, limit, pages };
}

function extractCreatedAssetClass(payload: unknown): AssetClass | null {
  const record = asRecord(payload);
  if (!record) return null;

  const candidates: unknown[] = [
    record.data,
    asRecord(record.data)?.data,
    record.assetClass,
    asRecord(record.data)?.assetClass,
  ];

  for (const candidate of candidates) {
    const candidateRecord = asRecord(candidate);
    if (!candidateRecord) continue;
    if (typeof candidateRecord.name === "string" && candidateRecord.name.trim()) {
      return candidateRecord as AssetClass;
    }
    if (candidateRecord._id || candidateRecord.id) {
      return candidateRecord as AssetClass;
    }
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function normalizePositiveInt(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  const int = Math.trunc(num);
  return int > 0 ? int : fallback;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeRequiredId(value: unknown): string {
  const id = normalizeOptionalString(value);
  if (!id) {
    throw new Error("Asset class id is required.");
  }
  return id;
}

function normalizeUpdateAssetClassPayload(input: UpdateAssetClassInput): UpdateAssetClassPayload {
  const payload: UpdateAssetClassPayload = {};
  const name = normalizeOptionalString(input.name);
  if (name) payload.name = name;

  const description = normalizeOptionalString(input.description);
  if (description) payload.description = description;

  const method = normalizeDepreciationMethod(input.defaultDepreciationMethod);
  if (method) payload.defaultDepreciationMethod = method;

  const usefulLife = normalizeOptionalNumber(input.defaultUsefulLifeYears);
  if (usefulLife !== undefined) {
    if (usefulLife < 1) {
      throw new Error("Useful life years must be at least 1.");
    }
    payload.defaultUsefulLifeYears = usefulLife;
  }

  const residual = normalizeOptionalNumber(input.defaultResidualValuePercent);
  if (residual !== undefined) {
    if (residual < 0 || residual > 100) {
      throw new Error("Residual value percent must be between 0 and 100.");
    }
    payload.defaultResidualValuePercent = residual;
  }

  return payload;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("Numeric fields must be valid numbers.");
  }
  return parsed;
}

function normalizeDepreciationMethod(value: unknown): DepreciationMethod | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error("Invalid depreciation method.");
  }

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "straight_line" || normalized === "straightline") {
    return "straight_line";
  }
  if (normalized === "declining_balance" || normalized === "decliningbalance") {
    return "declining_balance";
  }

  throw new Error("Invalid depreciation method.");
}
