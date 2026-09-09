"use client"

import { useCallback } from "react"
import { hrGet, hrPost, payloadData, payloadList, payloadPagination,
  keepMatching, type HrPagination } from "@/lib/hr/client"
import { mapJobRequisition, mapJobRequisitionMetrics } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrJobRequisition, HrJobRequisitionMetrics } from "@/lib/hr/types"

export type JobRequisitionFilters = {
  page?: number
  limit?: number
  branchId?: string
  status?: string
  priority?: string
}

export function useHrJobRequisitions(filters: JobRequisitionFilters = {}) {
  const scope = useHrScope(filters.branchId)
  const { page = 1, limit = 20, status = "", priority = "" } = filters

  const result = useHrQuery<{ requisitions: HrJobRequisition[]; pagination: HrPagination }>(
    async () => {
      const payload = await hrGet("/job-requisitions", {
        page,
        limit,
        branchId: scope.branchId,
        status,
        priority,
      })
      return {
        requisitions: keepMatching(
          payloadList(payload).map(mapJobRequisition).filter((item) => item.id),
          "status",
          status
        ),
        pagination: payloadPagination(payload, limit),
      }
    },
    [page, limit, scope.branchId, status, priority],
    { requisitions: [], pagination: { total: 0, page: 1, limit, pages: 0 } }
  )

  return {
    requisitions: result.data.requisitions,
    pagination: result.data.pagination,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrJobRequisitionMetrics(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<HrJobRequisitionMetrics>(
    async () =>
      mapJobRequisitionMetrics(payloadData(await hrGet("/job-requisitions/metrics", { branchId: scope.branchId }))),
    [scope.branchId],
    { totalRequisitions: 0, pendingReviewCount: 0, approvedCount: 0, rejectedCount: 0, criticalVacancies: 0 }
  )

  return { metrics: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrJobRequisition(requisitionId: string) {
  const result = useHrQuery<HrJobRequisition | null>(
    requisitionId
      ? async () => mapJobRequisition(payloadData(await hrGet(`/job-requisitions/${requisitionId}`)))
      : null,
    [requisitionId],
    null
  )

  return { requisition: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export type CreateJobRequisitionInput = {
  roleTitle: string
  department: string
  branchId: string
  salarySuggested: number
  priority?: string
  expectedStartDate: string
  justification: string
}

export function useJobRequisitionMutations() {
  const createRequisition = useCallback(
    async (input: CreateJobRequisitionInput) =>
      mapJobRequisition(payloadData(await hrPost("/job-requisitions", input))),
    []
  )

  const reviewRequisition = useCallback(
    async (id: string, action: "approved" | "rejected", reviewComment: string) =>
      mapJobRequisition(payloadData(await hrPost(`/job-requisitions/${id}/review`, { action, reviewComment }))),
    []
  )

  return { createRequisition, reviewRequisition }
}
