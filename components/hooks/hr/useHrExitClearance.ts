import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fieldOf, hrGet, hrGetList, hrPost, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type {
  AdminChecklistItem,
  ClearanceStatus,
  ExitClearance,
  ExitClearanceMetrics,
} from "@/lib/hr/types"

export type ExitClearanceListParams = {
  page?: number
  limit?: number
  branchId?: string
  status?: ClearanceStatus | "all"
  enabled?: boolean
}

export function useExitClearances(options: ExitClearanceListParams = {}) {
  const { enabled = true, status, ...rest } = options
  const params: QueryParams = { ...rest, status: status === "all" ? undefined : status }

  return useQuery({
    queryKey: hrKeys.exitClearanceList(params),
    queryFn: () => hrGetList<ExitClearance>("/exit-clearances", params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useExitClearanceMetrics(branchId?: string) {
  const params: QueryParams = { branchId }
  return useQuery({
    queryKey: hrKeys.exitClearanceMetrics(params),
    queryFn: () => hrGet<ExitClearanceMetrics>("/exit-clearances/metrics", params),
  })
}

export function useExitClearance(id: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.exitClearance(id ?? ""),
    queryFn: () => hrGet<ExitClearance>(`/exit-clearances/${id}`),
    enabled: Boolean(id),
  })
}

function useClearanceMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, variables) => {
      const id = fieldOf(variables, "id")
      if (id) queryClient.invalidateQueries({ queryKey: hrKeys.exitClearance(id) })
      queryClient.invalidateQueries({ queryKey: hrKeys.exitClearances() })
      // A completed clearance flips the employee's employment status.
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() })
    },
  })
}

export function useInitiateExitClearance() {
  return useClearanceMutation(
    (input: {
      employeeId: string
      branchId: string
      reason: string
      lastWorkingDate: string
    }) => hrPost<ExitClearance>("/exit-clearances", input),
  )
}

/**
 * One checklist row as the sign-off endpoint expects it: `isReturned` is
 * required here even though it is optional on the stored record.
 */
export type AdminChecklistSignOffItem = Omit<AdminChecklistItem, "isReturned"> & {
  isReturned: boolean
}

/** Admin confirms which company assets came back. */
export function useAdminSignOffClearance() {
  return useClearanceMutation(
    ({
      id,
      checklist,
      notes,
    }: {
      id: string
      checklist: AdminChecklistSignOffItem[]
      notes?: string
    }) => hrPost<ExitClearance>(`/exit-clearances/${id}/admin-sign-off`, { checklist, notes }),
  )
}

/** Finance reconciles outstanding loans and unreturned assets against final pay. */
export function useFinanceSignOffClearance() {
  return useClearanceMutation(
    ({
      id,
      ...body
    }: {
      id: string
      outstandingLoanBalance: number
      unreturnedAssetsCost: number
      loanDeductionApproved: boolean
      netFinalPay: number
      note?: string
    }) => hrPost<ExitClearance>(`/exit-clearances/${id}/finance-sign-off`, body),
  )
}

/** Director may waive a deduction and restate the net final pay. */
export function useDirectorAdjustClearance() {
  return useClearanceMutation(
    ({
      id,
      ...body
    }: {
      id: string
      loanDeductionApproved: boolean
      netFinalPay: number
      note?: string
    }) => hrPost<ExitClearance>(`/exit-clearances/${id}/director-adjustment`, body),
  )
}

/** Final pastoral release — closes the clearance and triggers the discharge letter. */
export function usePastorReleaseClearance() {
  return useClearanceMutation(({ id }: { id: string }) =>
    hrPost<ExitClearance>(`/exit-clearances/${id}/pastor-release`),
  )
}
