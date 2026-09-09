"use client"

import { useCallback, useMemo } from "react"
import { hrGet, hrPost, payloadData, payloadList, payloadPagination,
  keepMatching, type HrPagination } from "@/lib/hr/client"
import { mapLeave, mapLeaveMetrics } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrLeave, HrLeaveMetrics } from "@/lib/hr/types"

export type LeaveFilters = {
  page?: number
  limit?: number
  branchId?: string
  employeeId?: string
  status?: string
}

export function useHrLeaves(filters: LeaveFilters = {}) {
  const scope = useHrScope(filters.branchId)
  const { page = 1, limit = 20, employeeId = "", status = "" } = filters

  const result = useHrQuery<{ leaves: HrLeave[]; pagination: HrPagination }>(
    async () => {
      const payload = await hrGet("/leaves", {
        page,
        limit,
        branchId: scope.branchId,
        employeeId,
        status,
      })
      return {
        leaves: keepMatching(payloadList(payload).map(mapLeave).filter((leave) => leave.id), "status", status),
        pagination: payloadPagination(payload, limit),
      }
    },
    [page, limit, scope.branchId, employeeId, status],
    { leaves: [], pagination: { total: 0, page: 1, limit, pages: 0 } }
  )

  return {
    leaves: result.data.leaves,
    pagination: result.data.pagination,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrLeaveMetrics(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<HrLeaveMetrics>(
    async () => mapLeaveMetrics(payloadData(await hrGet("/leaves/metrics", { branchId: scope.branchId }))),
    [scope.branchId],
    { total: 0, pending: 0, approved: 0, declined: 0 }
  )

  return { metrics: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrLeaveCalendar(options: { branchId?: string; month?: number; year?: number } = {}) {
  const scope = useHrScope(options.branchId)
  const now = new Date()
  const month = options.month ?? now.getMonth() + 1
  const year = options.year ?? now.getFullYear()

  const result = useHrQuery<HrLeave[]>(
    async () => {
      const payload = await hrGet("/leaves/calendar", { branchId: scope.branchId, month, year })
      return payloadList(payload).map(mapLeave).filter((leave) => leave.id)
    },
    [scope.branchId, month, year],
    []
  )

  return { entries: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrLeave(leaveId: string) {
  const result = useHrQuery<HrLeave | null>(
    leaveId ? async () => mapLeave(payloadData(await hrGet(`/leaves/${leaveId}`))) : null,
    [leaveId],
    null
  )

  return { leave: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export type ApplyLeaveInput = {
  employeeId: string
  branchId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  reason?: string
  handoverNote?: string
  attachments?: string[]
}

export function useLeaveMutations() {
  const applyLeave = useCallback(
    async (input: ApplyLeaveInput) => mapLeave(payloadData(await hrPost("/leaves", input))),
    []
  )

  const applyOnBehalf = useCallback(
    async (input: ApplyLeaveInput) => mapLeave(payloadData(await hrPost("/leaves/apply-on-behalf", input))),
    []
  )

  const approveLeave = useCallback(
    async (id: string, comment?: string) =>
      mapLeave(payloadData(await hrPost(`/leaves/${id}/approve`, { comment }))),
    []
  )

  const rejectLeave = useCallback(
    async (id: string, comment: string) =>
      mapLeave(payloadData(await hrPost(`/leaves/${id}/reject`, { comment }))),
    []
  )

  return { applyLeave, applyOnBehalf, approveLeave, rejectLeave }
}

export type HrLeaveTypeOption = { id: string; name: string; code: string }

/**
 * Stopgap leave-type list. The backend has no leave-types endpoint yet, so the
 * options are the distinct types already present on the branch's leave records.
 * A branch with no leave history returns none — the caller has to say so rather
 * than submit a request the API will reject for a missing `leaveTypeId`.
 */
export function useHrLeaveTypes(branchId?: string) {
  const { leaves, loading, error } = useHrLeaves({ limit: 100, branchId })

  const types = useMemo(() => {
    const seen = new Map<string, HrLeaveTypeOption>()
    for (const leave of leaves) {
      if (!leave.leaveTypeId || seen.has(leave.leaveTypeId)) continue
      seen.set(leave.leaveTypeId, {
        id: leave.leaveTypeId,
        name: leave.leaveTypeName || leave.leaveTypeCode || "Leave",
        code: leave.leaveTypeCode,
      })
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [leaves])

  return { types, loading, error }
}
