import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fieldOf, hrGet, hrGetList, hrPost, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type {
  JobRequisition,
  JobRequisitionMetrics,
  JobRequisitionPriority,
  JobRequisitionStatus,
} from "@/lib/hr/types"

export type JobRequisitionListParams = {
  page?: number
  limit?: number
  branchId?: string
  status?: JobRequisitionStatus | "all"
  priority?: JobRequisitionPriority | "all"
  enabled?: boolean
}

export function useJobRequisitions(options: JobRequisitionListParams = {}) {
  const { enabled = true, status, priority, ...rest } = options
  const params: QueryParams = {
    ...rest,
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
  }

  return useQuery({
    queryKey: hrKeys.jobRequisitionList(params),
    queryFn: () => hrGetList<JobRequisition>("/job-requisitions", params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useJobRequisitionMetrics(branchId?: string) {
  const params: QueryParams = { branchId }
  return useQuery({
    queryKey: hrKeys.jobRequisitionMetrics(params),
    queryFn: () => hrGet<JobRequisitionMetrics>("/job-requisitions/metrics", params),
  })
}

export function useJobRequisition(id: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.jobRequisition(id ?? ""),
    queryFn: () => hrGet<JobRequisition>(`/job-requisitions/${id}`),
    enabled: Boolean(id),
  })
}

function useRequisitionMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, variables) => {
      const id = fieldOf(variables, "id")
      if (id) queryClient.invalidateQueries({ queryKey: hrKeys.jobRequisition(id) })
      queryClient.invalidateQueries({ queryKey: hrKeys.jobRequisitions() })
    },
  })
}

export type CreateJobRequisitionInput = {
  roleTitle: string
  department: string
  branchId: string
  salarySuggested: number
  priority?: JobRequisitionPriority
  expectedStartDate: string
  justification: string
}

/** `refNumber` is generated server-side, so it is not part of the input. */
export function useCreateJobRequisition() {
  return useRequisitionMutation((input: CreateJobRequisitionInput) =>
    hrPost<JobRequisition>("/job-requisitions", input),
  )
}

/** Director decision. `reviewComment` is required by the backend for both outcomes. */
export function useReviewJobRequisition() {
  return useRequisitionMutation(
    ({
      id,
      action,
      reviewComment,
    }: {
      id: string
      action: "approved" | "rejected"
      reviewComment: string
    }) => hrPost<JobRequisition>(`/job-requisitions/${id}/review`, { action, reviewComment }),
  )
}
