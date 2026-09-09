"use client"

import { useCallback } from "react"
import { hrGet, hrPost, payloadData, payloadList, payloadPagination,
  keepMatching, type HrPagination } from "@/lib/hr/client"
import { mapAttendanceLog, mapAttendanceMetrics } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrAttendanceLog, HrAttendanceMetrics } from "@/lib/hr/types"

export type AttendanceFilters = {
  page?: number
  limit?: number
  branchId?: string
  employeeId?: string
  status?: string
  date?: string
  startDate?: string
  endDate?: string
}

export function useHrAttendance(filters: AttendanceFilters = {}) {
  const scope = useHrScope(filters.branchId)
  const {
    page = 1,
    limit = 20,
    employeeId = "",
    status = "",
    date = "",
    startDate = "",
    endDate = "",
  } = filters

  const result = useHrQuery<{ logs: HrAttendanceLog[]; pagination: HrPagination }>(
    async () => {
      const payload = await hrGet("/attendance", {
        page,
        limit,
        branchId: scope.branchId,
        employeeId,
        status,
        date,
        startDate,
        endDate,
      })
      return {
        logs: keepMatching(payloadList(payload).map(mapAttendanceLog).filter((log) => log.id), "status", status),
        pagination: payloadPagination(payload, limit),
      }
    },
    [page, limit, scope.branchId, employeeId, status, date, startDate, endDate],
    { logs: [], pagination: { total: 0, page: 1, limit, pages: 0 } }
  )

  return {
    logs: result.data.logs,
    pagination: result.data.pagination,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrAttendanceMetrics(options: { branchId?: string; date?: string } = {}) {
  const scope = useHrScope(options.branchId)
  const date = options.date ?? ""

  const result = useHrQuery<HrAttendanceMetrics>(
    async () =>
      mapAttendanceMetrics(payloadData(await hrGet("/attendance/metrics", { branchId: scope.branchId, date }))),
    [scope.branchId, date],
    {
      totalEmployees: 0,
      clockedInToday: 0,
      lateToday: 0,
      absentToday: 0,
      attendanceRate: 0,
      avgClockInTime: "",
    }
  )

  return { metrics: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export type RecordAttendanceInput = {
  employeeId: string
  branchId: string
  date?: string
  clockIn?: string
  clockOut?: string
  status?: string
  isManualEntry?: boolean
  reason?: string
}

export function useAttendanceMutations() {
  const recordAttendance = useCallback(
    async (input: RecordAttendanceInput) => mapAttendanceLog(payloadData(await hrPost("/attendance", input))),
    []
  )

  const recordAbsence = useCallback(
    async (input: { employeeId: string; branchId: string; date?: string; reason: string }) =>
      mapAttendanceLog(payloadData(await hrPost("/attendance/absence", input))),
    []
  )

  const resolveAnomaly = useCallback(
    async (id: string, resolutionNote: string) =>
      mapAttendanceLog(payloadData(await hrPost(`/attendance/${id}/resolve`, { resolutionNote }))),
    []
  )

  return { recordAttendance, recordAbsence, resolveAnomaly }
}
