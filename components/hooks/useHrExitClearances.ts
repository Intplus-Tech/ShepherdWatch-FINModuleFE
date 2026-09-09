"use client"

import { useCallback } from "react"
import { hrGet, hrPost, payloadData, payloadList, payloadPagination,
  keepMatching, type HrPagination } from "@/lib/hr/client"
import { mapExitClearance, mapExitClearanceMetrics } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrClearanceChecklistItem, HrExitClearance, HrExitClearanceMetrics } from "@/lib/hr/types"

export type ExitClearanceFilters = {
  page?: number
  limit?: number
  branchId?: string
  status?: string
}

export function useHrExitClearances(filters: ExitClearanceFilters = {}) {
  const scope = useHrScope(filters.branchId)
  const { page = 1, limit = 20, status = "" } = filters

  const result = useHrQuery<{ clearances: HrExitClearance[]; pagination: HrPagination }>(
    async () => {
      const payload = await hrGet("/exit-clearances", {
        page,
        limit,
        branchId: scope.branchId,
        status,
      })
      return {
        clearances: keepMatching(
          payloadList(payload).map(mapExitClearance).filter((item) => item.id),
          "status",
          status
        ),
        pagination: payloadPagination(payload, limit),
      }
    },
    [page, limit, scope.branchId, status],
    { clearances: [], pagination: { total: 0, page: 1, limit, pages: 0 } }
  )

  return {
    clearances: result.data.clearances,
    pagination: result.data.pagination,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrExitClearanceMetrics(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<HrExitClearanceMetrics>(
    async () =>
      mapExitClearanceMetrics(payloadData(await hrGet("/exit-clearances/metrics", { branchId: scope.branchId }))),
    [scope.branchId],
    { inProgressCount: 0, pendingAdminCount: 0, pendingFinanceCount: 0, pendingPastorCount: 0, completedCount: 0 }
  )

  return { metrics: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrExitClearance(clearanceId: string) {
  const result = useHrQuery<HrExitClearance | null>(
    clearanceId ? async () => mapExitClearance(payloadData(await hrGet(`/exit-clearances/${clearanceId}`))) : null,
    [clearanceId],
    null
  )

  return { clearance: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

/**
 * Clearance moves admin → finance → pastor, and the director step only exists
 * to adjust what finance settled. Each mutation returns the updated dossier so
 * the caller can re-render the timeline without a second fetch.
 */
export function useExitClearanceMutations() {
  const initiateClearance = useCallback(
    async (input: { employeeId: string; branchId: string; reason: string; lastWorkingDate: string }) =>
      mapExitClearance(payloadData(await hrPost("/exit-clearances", input))),
    []
  )

  const adminSignOff = useCallback(
    async (id: string, checklist: HrClearanceChecklistItem[], notes?: string) =>
      mapExitClearance(payloadData(await hrPost(`/exit-clearances/${id}/admin-sign-off`, { checklist, notes }))),
    []
  )

  const financeSignOff = useCallback(
    async (
      id: string,
      input: {
        outstandingLoanBalance: number
        unreturnedAssetsCost: number
        loanDeductionApproved: boolean
        netFinalPay: number
        note?: string
      }
    ) => mapExitClearance(payloadData(await hrPost(`/exit-clearances/${id}/finance-sign-off`, input))),
    []
  )

  const directorAdjustment = useCallback(
    async (id: string, input: { loanDeductionApproved: boolean; netFinalPay: number; note?: string }) =>
      mapExitClearance(payloadData(await hrPost(`/exit-clearances/${id}/director-adjustment`, input))),
    []
  )

  const pastorRelease = useCallback(
    async (id: string) => mapExitClearance(payloadData(await hrPost(`/exit-clearances/${id}/pastor-release`))),
    []
  )

  return { initiateClearance, adminSignOff, financeSignOff, directorAdjustment, pastorRelease }
}
