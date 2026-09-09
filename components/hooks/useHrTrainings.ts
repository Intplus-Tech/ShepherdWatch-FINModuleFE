"use client"

import { useCallback } from "react"
import {
  asRecord,
  readNumber,
  readPersonName,
  readRefId,
  readString,
  hrGet,
  hrPatch,
  hrPost,
  payloadData,
  payloadList,
  payloadPagination,
  type HrPagination,
} from "@/lib/hr/client"
import { mapTraining, mapTrainingBudget, mapTrainingMetrics } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrTraining, HrTrainingBudget, HrTrainingMetrics } from "@/lib/hr/types"

export type TrainingFilters = {
  page?: number
  limit?: number
  branchId?: string
  locationType?: string
  isPaid?: boolean
}

export function useHrTrainings(filters: TrainingFilters = {}) {
  const scope = useHrScope(filters.branchId)
  const { page = 1, limit = 20, locationType = "" } = filters
  const isPaid = filters.isPaid

  const result = useHrQuery<{ trainings: HrTraining[]; pagination: HrPagination }>(
    async () => {
      const payload = await hrGet("/trainings", {
        page,
        limit,
        branchId: scope.branchId,
        locationType,
        isPaid: isPaid === undefined ? undefined : isPaid,
      })
      return {
        trainings: payloadList(payload).map(mapTraining).filter((training) => training.id),
        pagination: payloadPagination(payload, limit),
      }
    },
    [page, limit, scope.branchId, locationType, isPaid],
    { trainings: [], pagination: { total: 0, page: 1, limit, pages: 0 } }
  )

  return {
    trainings: result.data.trainings,
    pagination: result.data.pagination,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrTrainingMetrics(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<HrTrainingMetrics>(
    async () => mapTrainingMetrics(payloadData(await hrGet("/trainings/metrics", { branchId: scope.branchId }))),
    [scope.branchId],
    { totalEvents: 0, totalEnrolled: 0, certifiedStaff: 0, completionRate: 0, pendingBudgetsCount: 0 }
  )

  return { metrics: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrTrainingBudget() {
  const result = useHrQuery<HrTrainingBudget>(
    async () => mapTrainingBudget(payloadData(await hrGet("/trainings/budget-overview"))),
    [],
    { annualAllocation: 0, totalSpent: 0, committedPending: 0, availableBalance: 0, percentageUtilized: 0 }
  )

  return { budget: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrTraining(trainingId: string) {
  const result = useHrQuery<HrTraining | null>(
    trainingId ? async () => mapTraining(payloadData(await hrGet(`/trainings/${trainingId}`))) : null,
    [trainingId],
    null
  )

  return { training: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export type CreateTrainingInput = {
  title: string
  branchId?: string
  isGlobal?: boolean
  locationType?: string
  venueOrLink: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  trainerName: string
  trainerType?: string
  maxCapacity?: number
  isPaid?: boolean
  amount?: number
  budgetRequested?: number
  budgetJustification?: string
  flyerUrl?: string
  certificationIncluded?: boolean
  description?: string
}

export function useTrainingMutations() {
  const createTraining = useCallback(
    async (input: CreateTrainingInput) => mapTraining(payloadData(await hrPost("/trainings", input))),
    []
  )

  const enrollParticipants = useCallback(
    async (trainingId: string, employeeIds: string[]) =>
      payloadData(await hrPost(`/trainings/${trainingId}/participants`, { employeeIds })),
    []
  )

  const updateParticipantRecord = useCallback(
    async (
      recordId: string,
      input: { status: string; score?: number; certificateUrl?: string; renewalMonths?: number }
    ) => payloadData(await hrPatch(`/trainings/records/${recordId}`, input)),
    []
  )

  const approveTrainingBudget = useCallback(
    async (trainingId: string, comment?: string) =>
      mapTraining(payloadData(await hrPost(`/trainings/${trainingId}/approve-budget`, { comment }))),
    []
  )

  return { createTraining, enrollParticipants, updateParticipantRecord, approveTrainingBudget }
}

export type HrTrainingRecord = {
  id: string
  trainingId: string
  trainingTitle: string
  employeeId: string
  employeeName: string
  status: string
  score: number
  certificateUrl: string
  issuedAt: string
  renewalDue: string
}

/**
 * One participant's training and certification record. The endpoint returns the
 * record itself; the event title is not populated on it, so screens that show a
 * title pass it alongside or fall back to the id.
 */
export function useHrTrainingRecord(recordId: string) {
  const result = useHrQuery<HrTrainingRecord | null>(
    recordId
      ? async () => {
          const data = payloadData(await hrGet(`/trainings/records/${recordId}`))
          const event = asRecord(data.eventId)
          const employee = asRecord(data.employeeId)
          return {
            id: readString(data._id, data.id),
            trainingId: readRefId(data.eventId),
            trainingTitle: readString(event.title),
            employeeId: readRefId(data.employeeId),
            employeeName: readPersonName(employee, asRecord(employee.userId)),
            status: readString(data.status) || "enrolled",
            score: readNumber(data.score),
            certificateUrl: readString(data.certificateUrl),
            issuedAt: readString(data.issuedAt),
            renewalDue: readString(data.renewalDue),
          }
        }
      : null,
    [recordId],
    null
  )

  return { record: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}
