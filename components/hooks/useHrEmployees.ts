"use client"

import { useCallback } from "react"
import {
  hrGet,
  hrPatch,
  hrPost,
  hrPut,
  payloadData,
  payloadList,
  payloadPagination,
  type HrPagination,
} from "@/lib/hr/client"
import { mapEmployee, mapEmployeeDetail, mapEmployeeMetrics } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrEmployee, HrEmployeeDetail, HrEmployeeMetrics } from "@/lib/hr/types"

export type EmployeeFilters = {
  page?: number
  limit?: number
  search?: string
  branchId?: string
  department?: string
  employmentStatus?: string
}

const EMPTY_PAGINATION: HrPagination = { total: 0, page: 1, limit: 20, pages: 0 }

export function useHrEmployees(filters: EmployeeFilters = {}) {
  const scope = useHrScope(filters.branchId)
  const { page = 1, limit = 20, search = "", department = "", employmentStatus = "" } = filters

  const result = useHrQuery<{ employees: HrEmployee[]; pagination: HrPagination }>(
    async () => {
      const payload = await hrGet("/employees", {
        page,
        limit,
        search,
        branchId: scope.branchId,
        department,
        employmentStatus,
      })
      return {
        employees: payloadList(payload).map(mapEmployee).filter((employee) => employee.id),
        pagination: payloadPagination(payload, limit),
      }
    },
    [page, limit, search, scope.branchId, department, employmentStatus],
    { employees: [], pagination: { ...EMPTY_PAGINATION, limit } }
  )

  return {
    employees: result.data.employees,
    pagination: result.data.pagination,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrEmployeeMetrics(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<HrEmployeeMetrics>(
    async () => mapEmployeeMetrics(payloadData(await hrGet("/employees/metrics", { branchId: scope.branchId }))),
    [scope.branchId],
    { totalStaff: 0, activeStaff: 0, onLeaveStaff: 0, suspendedStaff: 0, exitPendingStaff: 0 }
  )

  return { metrics: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrEmployee(employeeId: string) {
  const result = useHrQuery<HrEmployeeDetail | null>(
    employeeId ? async () => mapEmployeeDetail(payloadData(await hrGet(`/employees/${employeeId}`))) : null,
    [employeeId],
    null
  )

  return { employee: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export type CreateEmployeeInput = {
  userId?: string
  branchId: string
  employeeId?: string
  jobTitle: string
  department?: string
  salary?: number
  phone?: string
  address?: string
  gender?: string
  maritalStatus?: string
  hireDate?: string
}

export function useEmployeeMutations() {
  const createEmployee = useCallback(
    async (input: CreateEmployeeInput) => mapEmployee(payloadData(await hrPost("/employees", input))),
    []
  )

  const updateEmployee = useCallback(
    async (
      id: string,
      input: {
        phone?: string
        address?: string
        emergencyContact?: Record<string, unknown>
        disbursementDetails?: Record<string, unknown>
      }
    ) => mapEmployee(payloadData(await hrPut(`/employees/${id}`, input))),
    []
  )

  const updateStatus = useCallback(
    async (id: string, status: string) =>
      mapEmployee(payloadData(await hrPatch(`/employees/${id}/status`, { status }))),
    []
  )

  return { createEmployee, updateEmployee, updateStatus }
}
