import { useCallback, useState } from "react"

export type DeductionType = "paye" | "pension" | "nhf"

export type CreateDeductionPayload = {
  type: DeductionType
  employeeProfileId: string
  amount: number
  period: string
  branchId?: string
}

export type UpdateDeductionPayload = {
  amount?: number
  period?: string
}

export type RemitDeductionPayload = {
  remittanceDate?: string
  receiptNumber?: string
}

export type ListDeductionsParams = {
  page?: number
  limit?: number
  type?: DeductionType
  period?: string
  branchId?: string
  remitted?: boolean
}

export type StatutoryDeduction = {
  id: string
  type: DeductionType
  amount: number
  remitted: boolean
  remittedAt?: string
  receiptNumber?: string
  period: string
  employeeProfileId: string
  branchId?: string
}

export type DeductionsPagination = {
  total: number
  page: number
  limit: number
  pages: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return fallback
}

function getCsrfToken() {
  if (typeof document === "undefined") return ""
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrf_token="))
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
}

function mapDeduction(item: Record<string, unknown>, index: number): StatutoryDeduction {
  return {
    id: toString(item?._id ?? item?.id, `deduction-${index}`),
    type: toString(item?.type, "paye") as DeductionType,
    amount: toNumber(item?.amount),
    remitted: Boolean(item?.remitted),
    remittedAt: toString(item?.remittedAt, ""),
    receiptNumber: toString(item?.receiptNumber, ""),
    period: toString(item?.period, ""),
    employeeProfileId: toString(item?.employeeProfileId, ""),
    branchId: toString(item?.branchId, ""),
  }
}

export function useStatutoryDeductions() {
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [remitting, setRemitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [deductions, setDeductions] = useState<StatutoryDeduction[]>([])
  const [selectedDeduction, setSelectedDeduction] = useState<StatutoryDeduction | null>(null)
  const [pagination, setPagination] = useState<DeductionsPagination | null>(null)

  const fetchDeductions = useCallback(async (params: ListDeductionsParams = {}) => {
    setLoading(true)
    setListError(null)
    try {
      const query = new URLSearchParams()
      if (params.page !== undefined) query.set("page", String(params.page))
      if (params.limit !== undefined) query.set("limit", String(params.limit))
      if (params.type) query.set("type", params.type)
      if (params.period) query.set("period", params.period)
      if (params.branchId) query.set("branchId", params.branchId)
      if (params.remitted !== undefined) query.set("remitted", String(params.remitted))

      const response = await fetch(`/api/core/financial/compliance/deductions?${query.toString()}`, {
        method: "GET",
        credentials: "include",
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to fetch statutory deductions.")
      }

      const raw = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
      const mapped = raw.map((item: Record<string, unknown>, index: number) => mapDeduction(item, index))
      const meta = data?.pagination ?? data?.data?.pagination ?? null

      setDeductions(mapped)
      if (meta) {
        setPagination({
          total: toNumber(meta.total),
          page: toNumber(meta.page) || 1,
          limit: toNumber(meta.limit) || params.limit || 20,
          pages: toNumber(meta.pages) || 1,
        })
      } else {
        setPagination({
          total: mapped.length,
          page: params.page ?? 1,
          limit: params.limit ?? Math.max(mapped.length, 20),
          pages: 1,
        })
      }
      return mapped
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch statutory deductions."
      setListError(message)
      setDeductions([])
      setPagination(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createDeduction = useCallback(async (payload: CreateDeductionPayload): Promise<StatutoryDeduction> => {
    setCreating(true)
    setError(null)
    try {
      const response = await fetch("/api/core/financial/compliance/deductions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to create statutory deduction.")
      }
      const created = data?.data ?? data
      return mapDeduction(created ?? {}, 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create statutory deduction."
      setError(message)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  const getDeductionById = useCallback(async (id: string): Promise<StatutoryDeduction> => {
    if (!id) {
      throw new Error("Deduction ID is required.")
    }

    setDetailLoading(true)
    setDetailError(null)
    try {
      const response = await fetch(`/api/core/financial/compliance/deductions/${id}`, {
        method: "GET",
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to fetch statutory deduction details.")
      }

      const raw = (payload?.data ?? payload ?? {}) as Record<string, unknown>
      const mapped = mapDeduction(raw, 0)
      setSelectedDeduction(mapped)
      return mapped
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch statutory deduction details."
      setDetailError(message)
      throw err
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const updateDeduction = useCallback(
    async (id: string, payload: UpdateDeductionPayload): Promise<StatutoryDeduction> => {
      if (!id) {
        throw new Error("Deduction ID is required.")
      }
      if (payload.amount === undefined && payload.period === undefined) {
        throw new Error("Provide amount or period to update deduction.")
      }

      setUpdating(true)
      setError(null)
      setDetailError(null)
      try {
        const response = await fetch(`/api/core/financial/compliance/deductions/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to update statutory deduction.")
        }

        const raw = (data?.data ?? data ?? {}) as Record<string, unknown>
        const mapped = mapDeduction(raw, 0)

        setDeductions((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)))
        setSelectedDeduction(mapped)
        return mapped
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to update statutory deduction."
        setError(message)
        throw err
      } finally {
        setUpdating(false)
      }
    },
    []
  )

  const remitDeduction = useCallback(
    async (id: string, payload: RemitDeductionPayload = {}): Promise<StatutoryDeduction> => {
      if (!id) {
        throw new Error("Deduction ID is required.")
      }

      setRemitting(true)
      setError(null)
      setDetailError(null)
      try {
        const response = await fetch(`/api/core/financial/compliance/deductions/${id}/remit`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to mark deduction as remitted.")
        }

        const raw = (data?.data ?? data ?? {}) as Record<string, unknown>
        const mapped = mapDeduction(raw, 0)

        setDeductions((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)))
        setSelectedDeduction(mapped)
        return mapped
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to mark deduction as remitted."
        setError(message)
        throw err
      } finally {
        setRemitting(false)
      }
    },
    []
  )

  return {
    createDeduction,
    fetchDeductions,
    getDeductionById,
    updateDeduction,
    remitDeduction,
    deductions,
    selectedDeduction,
    pagination,
    creating,
    updating,
    remitting,
    loading,
    detailLoading,
    error,
    listError,
    detailError,
    setError,
    setListError,
  }
}
