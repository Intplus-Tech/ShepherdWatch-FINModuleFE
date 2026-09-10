import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { hrGet, hrGetList, hrPost, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type {
  LeaveBalancesResponse,
  LeaveMetrics,
  LeaveRequest,
  LeaveStatus,
  LeaveTypeConfig,
} from "@/lib/hr/types"

export type LeaveListParams = {
  page?: number
  limit?: number
  branchId?: string
  employeeId?: string
  status?: LeaveStatus | "all"
  leaveTypeId?: string
  enabled?: boolean
}

export function useLeaveRequests(options: LeaveListParams = {}) {
  const { enabled = true, status, ...rest } = options
  const params: QueryParams = { ...rest, status: status === "all" ? undefined : status }

  return useQuery({
    queryKey: hrKeys.leaveList(params),
    queryFn: () => hrGetList<LeaveRequest>("/leaves", params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useLeaveMetrics(branchId?: string) {
  const params: QueryParams = { branchId }
  return useQuery({
    queryKey: hrKeys.leaveMetrics(params),
    queryFn: () => hrGet<LeaveMetrics>("/leaves/metrics", params),
  })
}

export function useLeaveRequest(id: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.leave(id ?? ""),
    queryFn: () => hrGet<LeaveRequest>(`/leaves/${id}`),
    enabled: Boolean(id),
  })
}

/**
 * Approved leave overlapping a month — drives the roster/calendar views.
 *
 * `month` is zero-based to match the backend validator (and `Date.getMonth()`),
 * not the 1-12 form used in period strings elsewhere in this module.
 */
export function useLeaveCalendar(
  params: { branchId?: string; month?: number; year?: number } = {},
) {
  return useQuery({
    queryKey: hrKeys.leaveCalendar(params),
    queryFn: () => hrGet<LeaveRequest[]>("/leaves/calendar", params),
  })
}

export function useLeaveTypes(options: { search?: string; enabled?: boolean } = {}) {
  const { enabled = true, ...params } = options
  return useQuery({
    queryKey: hrKeys.leaveTypeList(params),
    queryFn: () => hrGetList<LeaveTypeConfig>("/leave-types", params),
    enabled,
    // The catalogue changes far less often than the requests filed against it.
    staleTime: 5 * 60 * 1000,
  })
}

export function useLeaveBalances(
  employeeId: string | null | undefined,
  year?: number,
) {
  const params: QueryParams = { year }
  return useQuery({
    queryKey: [...hrKeys.leaveBalances(employeeId ?? ""), year ?? "current"],
    queryFn: () =>
      hrGet<LeaveBalancesResponse>(`/leave-types/balances/${employeeId}`, params),
    enabled: Boolean(employeeId),
  })
}

export type ApplyLeaveInput = {
  employeeId: string
  branchId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  reason?: string
  handoverNote?: string
  attachments?: { name: string; url: string; size?: number; mimeType?: string }[]
}

function useLeaveMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leaves() })
      // Leave decisions move the headcount and clock-in counters too.
      queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "dashboard"] })
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() })
    },
  })
}

export function useApplyLeave() {
  return useLeaveMutation((input: ApplyLeaveInput) => hrPost<LeaveRequest>("/leaves", input))
}

/** Admin/HR filing a request for someone else. */
export function useApplyLeaveOnBehalf() {
  return useLeaveMutation((input: ApplyLeaveInput) =>
    hrPost<LeaveRequest>("/leaves/apply-on-behalf", input),
  )
}

export function useApproveLeave() {
  return useLeaveMutation(({ id, comment }: { id: string; comment?: string }) =>
    hrPost<LeaveRequest>(`/leaves/${id}/approve`, { comment }),
  )
}

export function useRejectLeave() {
  return useLeaveMutation(({ id, comment }: { id: string; comment?: string }) =>
    hrPost<LeaveRequest>(`/leaves/${id}/reject`, { comment }),
  )
}
