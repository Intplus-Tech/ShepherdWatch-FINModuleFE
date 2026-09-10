import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { hrGet, hrGetList, hrPatch, hrPost, hrPut, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type { EmployeeMetrics, EmployeeProfile, EmploymentStatus } from "@/lib/hr/types"

export type EmployeeListParams = {
  page?: number
  limit?: number
  search?: string
  branchId?: string
  department?: string
  employmentStatus?: EmploymentStatus | "all"
  enabled?: boolean
}

/**
 * Employee directory.
 *
 * `employmentStatus: "all"` is the screens' filter default and is dropped
 * rather than forwarded — the backend validates the value against its enum and
 * rejects anything outside it.
 */
export function useEmployees(options: EmployeeListParams = {}) {
  const { enabled = true, employmentStatus, department, ...rest } = options
  const params: QueryParams = {
    ...rest,
    department: department === "all" ? undefined : department,
    employmentStatus: employmentStatus === "all" ? undefined : employmentStatus,
  }

  return useQuery({
    queryKey: hrKeys.employeeList(params),
    queryFn: () => hrGetList<EmployeeProfile>("/employees", params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useEmployeeMetrics(branchId?: string) {
  const params: QueryParams = { branchId }
  return useQuery({
    queryKey: hrKeys.employeeMetrics(params),
    queryFn: () => hrGet<EmployeeMetrics>("/employees/metrics", params),
  })
}

export function useEmployee(id: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.employee(id ?? ""),
    queryFn: () => hrGet<EmployeeProfile>(`/employees/${id}`),
    enabled: Boolean(id),
  })
}

export type CreateEmployeeInput = {
  userId?: string
  branchId: string
  employeeId?: string
  jobTitle: string
  department?: string
  hireDate: string
  employmentStatus?: EmploymentStatus
  dateOfBirth?: string
  gender?: "male" | "female"
  maritalStatus?: string
  phone?: string
  address?: string
  stateOfOrigin?: string
  nationality?: string
  salary?: number
  supervisorId?: string
  bankDetails?: { bankName: string; accountNumber: string; accountName: string }
  emergencyContact?: { name: string; relationship: string; phone: string; address?: string }
  nextOfKin?: { name: string; relationship: string; phone: string; email?: string }
  qualifications?: { institution: string; degree: string; yearObtained: number }[]
  taxId?: string
  pensionId?: string
  nhfId?: string
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => hrPost<EmployeeProfile>("/employees", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() })
      queryClient.invalidateQueries({ queryKey: hrKeys.all })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CreateEmployeeInput> & { id: string }) =>
      hrPut<EmployeeProfile>(`/employees/${id}`, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employee(variables.id) })
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() })
    },
  })
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmploymentStatus }) =>
      hrPatch<EmployeeProfile>(`/employees/${id}/status`, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employee(variables.id) })
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() })
    },
  })
}
