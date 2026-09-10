import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { hrGet, hrGetList, hrPost, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type { AttendanceLog, AttendanceMetrics, AttendanceStatus } from "@/lib/hr/types"

export type AttendanceListParams = {
  page?: number
  limit?: number
  branchId?: string
  employeeId?: string
  status?: AttendanceStatus | "all"
  date?: string
  startDate?: string
  endDate?: string
  enabled?: boolean
}

export function useAttendanceLogs(options: AttendanceListParams = {}) {
  const { enabled = true, status, ...rest } = options
  const params: QueryParams = { ...rest, status: status === "all" ? undefined : status }

  return useQuery({
    queryKey: hrKeys.attendanceList(params),
    queryFn: () => hrGetList<AttendanceLog>("/attendance", params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

/** Today's clock-in counters. `date` accepts `YYYY-MM-DD` to look at a past day. */
export function useAttendanceMetrics(params: { branchId?: string; date?: string } = {}) {
  return useQuery({
    queryKey: hrKeys.attendanceMetrics(params),
    queryFn: () => hrGet<AttendanceMetrics>("/attendance/metrics", params),
  })
}

function useAttendanceMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.attendance() })
      queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "dashboard"] })
    },
  })
}

export type RecordAttendanceInput = {
  employeeId: string
  branchId: string
  date?: string
  clockIn?: string
  clockOut?: string
  status?: AttendanceStatus
  isManualEntry?: boolean
  reason?: string
}

export function useRecordAttendance() {
  return useAttendanceMutation((input: RecordAttendanceInput) =>
    hrPost<AttendanceLog>("/attendance", input),
  )
}

export function useRecordAbsence() {
  return useAttendanceMutation(
    (input: { employeeId: string; branchId: string; date?: string; reason: string }) =>
      hrPost<AttendanceLog>("/attendance/absence", input),
  )
}

/** Close out a flagged log (missing clock-out, etc.) with an audit note. */
export function useResolveAttendanceAnomaly() {
  return useAttendanceMutation(({ id, resolutionNote }: { id: string; resolutionNote: string }) =>
    hrPost<AttendanceLog>(`/attendance/${id}/resolve`, { resolutionNote }),
  )
}
