import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { hrGet, hrGetList, hrPatch, hrPost, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type {
  TrainingBudgetOverview,
  TrainingEvent,
  TrainingLocationType,
  TrainingMetrics,
  TrainingParticipant,
  TrainingParticipantStatus,
} from "@/lib/hr/types"

export type TrainingListParams = {
  page?: number
  limit?: number
  branchId?: string
  locationType?: TrainingLocationType | "all"
  isPaid?: boolean
  enabled?: boolean
}

export function useTrainingEvents(options: TrainingListParams = {}) {
  const { enabled = true, locationType, ...rest } = options
  const params: QueryParams = {
    ...rest,
    locationType: locationType === "all" ? undefined : locationType,
  }

  return useQuery({
    queryKey: hrKeys.trainingList(params),
    queryFn: () => hrGetList<TrainingEvent>("/trainings", params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useTrainingMetrics(branchId?: string) {
  const params: QueryParams = { branchId }
  return useQuery({
    queryKey: hrKeys.trainingMetrics(params),
    queryFn: () => hrGet<TrainingMetrics>("/trainings/metrics", params),
  })
}

export function useTrainingBudgetOverview(branchId?: string) {
  const params: QueryParams = { branchId }
  return useQuery({
    queryKey: hrKeys.trainingBudget(params),
    queryFn: () => hrGet<TrainingBudgetOverview>("/trainings/budget-overview", params),
  })
}

export type TrainingEventDetail = {
  event: TrainingEvent
  participants: TrainingParticipant[]
}

/** A single event together with its participant roster. */
export function useTrainingEvent(id: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.training(id ?? ""),
    queryFn: () => hrGet<TrainingEventDetail>(`/trainings/${id}`),
    enabled: Boolean(id),
  })
}

function useTrainingMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.trainings() })
      queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "dashboard"] })
    },
  })
}

export type CreateTrainingInput = {
  title: string
  branchId?: string
  isGlobal?: boolean
  locationType?: TrainingLocationType
  venueOrLink: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  trainerName: string
  trainerType?: "internal" | "external"
  maxCapacity?: number
  isPaid?: boolean
  amount?: number
  budgetRequested?: number
  budgetJustification?: string
  flyerUrl?: string
  certificationIncluded?: boolean
  description?: string
}

export function useCreateTrainingEvent() {
  return useTrainingMutation((input: CreateTrainingInput) =>
    hrPost<TrainingEvent>("/trainings", input),
  )
}

export function useEnrollParticipants() {
  return useTrainingMutation(({ id, employeeIds }: { id: string; employeeIds: string[] }) =>
    hrPost<TrainingParticipant[]>(`/trainings/${id}/participants`, { employeeIds }),
  )
}

export function useUpdateParticipantRecord() {
  return useTrainingMutation(
    ({
      recordId,
      ...body
    }: {
      recordId: string
      status: TrainingParticipantStatus
      score?: number
      certificateUrl?: string
      renewalMonths?: number
    }) => hrPatch<TrainingParticipant>(`/trainings/records/${recordId}`, body),
  )
}

export function useApproveTrainingBudget() {
  return useTrainingMutation(({ id }: { id: string }) =>
    hrPost<TrainingEvent>(`/trainings/${id}/approve-budget`),
  )
}
