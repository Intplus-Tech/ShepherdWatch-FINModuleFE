import type { QueryParams } from "@/lib/hr/client"

/**
 * Query-key registry for the HR module.
 *
 * Mutations invalidate by prefix (`hrKeys.leaves()` clears every leave list and
 * metric regardless of filters), so approving a request on one screen refreshes
 * the dashboard counters on the next without either screen knowing about the
 * other.
 */
export const hrKeys = {
  all: ["hr"] as const,

  dashboard: (role: "accountant" | "admin" | "pastor" | "director") =>
    [...hrKeys.all, "dashboard", role] as const,

  employees: () => [...hrKeys.all, "employees"] as const,
  employeeList: (params?: QueryParams) => [...hrKeys.employees(), "list", params ?? {}] as const,
  employeeMetrics: (params?: QueryParams) =>
    [...hrKeys.employees(), "metrics", params ?? {}] as const,
  employee: (id: string) => [...hrKeys.employees(), "detail", id] as const,

  leaves: () => [...hrKeys.all, "leaves"] as const,
  leaveList: (params?: QueryParams) => [...hrKeys.leaves(), "list", params ?? {}] as const,
  leaveMetrics: (params?: QueryParams) => [...hrKeys.leaves(), "metrics", params ?? {}] as const,
  leaveCalendar: (params?: QueryParams) => [...hrKeys.leaves(), "calendar", params ?? {}] as const,
  leave: (id: string) => [...hrKeys.leaves(), "detail", id] as const,

  leaveTypes: () => [...hrKeys.all, "leave-types"] as const,
  leaveTypeList: (params?: QueryParams) => [...hrKeys.leaveTypes(), "list", params ?? {}] as const,
  leaveBalances: (employeeId: string) =>
    [...hrKeys.leaveTypes(), "balances", employeeId] as const,

  loans: () => [...hrKeys.all, "loans"] as const,
  loanList: (params?: QueryParams) => [...hrKeys.loans(), "list", params ?? {}] as const,
  loan: (id: string) => [...hrKeys.loans(), "detail", id] as const,

  attendance: () => [...hrKeys.all, "attendance"] as const,
  attendanceList: (params?: QueryParams) => [...hrKeys.attendance(), "list", params ?? {}] as const,
  attendanceMetrics: (params?: QueryParams) =>
    [...hrKeys.attendance(), "metrics", params ?? {}] as const,

  trainings: () => [...hrKeys.all, "trainings"] as const,
  trainingList: (params?: QueryParams) => [...hrKeys.trainings(), "list", params ?? {}] as const,
  trainingMetrics: (params?: QueryParams) =>
    [...hrKeys.trainings(), "metrics", params ?? {}] as const,
  trainingBudget: (params?: QueryParams) =>
    [...hrKeys.trainings(), "budget-overview", params ?? {}] as const,
  training: (id: string) => [...hrKeys.trainings(), "detail", id] as const,
  trainingRecord: (recordId: string) => [...hrKeys.trainings(), "record", recordId] as const,

  exitClearances: () => [...hrKeys.all, "exit-clearances"] as const,
  exitClearanceList: (params?: QueryParams) =>
    [...hrKeys.exitClearances(), "list", params ?? {}] as const,
  exitClearanceMetrics: (params?: QueryParams) =>
    [...hrKeys.exitClearances(), "metrics", params ?? {}] as const,
  exitClearance: (id: string) => [...hrKeys.exitClearances(), "detail", id] as const,

  jobRequisitions: () => [...hrKeys.all, "job-requisitions"] as const,
  jobRequisitionList: (params?: QueryParams) =>
    [...hrKeys.jobRequisitions(), "list", params ?? {}] as const,
  jobRequisitionMetrics: (params?: QueryParams) =>
    [...hrKeys.jobRequisitions(), "metrics", params ?? {}] as const,
  jobRequisition: (id: string) => [...hrKeys.jobRequisitions(), "detail", id] as const,

  payroll: () => [...hrKeys.all, "payroll"] as const,
  payrollCurrentRun: (params?: QueryParams) =>
    [...hrKeys.payroll(), "current-run", params ?? {}] as const,
  payrollOverview: (params?: QueryParams) =>
    [...hrKeys.payroll(), "overview", params ?? {}] as const,
  payslip: (runId: string, employeeId: string) =>
    [...hrKeys.payroll(), "payslip", runId, employeeId] as const,

  config: () => [...hrKeys.all, "config"] as const,

  documents: () => [...hrKeys.all, "documents"] as const,
  documentsByEmployee: (employeeId: string) =>
    [...hrKeys.documents(), "employee", employeeId] as const,
}
