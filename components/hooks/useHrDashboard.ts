"use client"

import { asArray, asRecord, hrGet, payloadData, readNumber, readPersonName, readString } from "@/lib/hr/client"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"

/** Each role gets its own dashboard endpoint with its own shape. */

export type AdminHrDashboard = {
  totalEmployees: number
  onLeaveToday: number
  clockedInToday: number
  clockInRate: number
  activeTrainings: number
  pendingActions: { type: string; count: number; label: string }[]
}

export type PastorHrDashboard = {
  attendanceRate: number
  totalEmployees: number
  presentToday: number
  staffOnLeave: { id: string; name: string; jobTitle: string; avatarUrl: string; returnDate: string }[]
  nextTraining: { id: string; title: string; startDate: string; venueOrLink: string } | null
}

export type AccountantHrDashboard = {
  totalEmployees: number
  payrollMtd: number
  activeLoans: number
  loanBalance: number
  workforceCostTrend: { month: string; payroll: number; deductions: number }[]
  loanPortfolioHealth: { category: string; count: number; principal: number }[]
}

export type DirectorHrDashboard = {
  totalHeadcount: number
  totalBranches: number
  totalActiveLoans: number
  turnoverRate: number
  totalPayrollCost: number
  headcountByBranch: {
    branchId: string
    branchName: string
    state: string
    count: number
    attendanceHealth: string
  }[]
}

export function useAdminHrDashboard(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<AdminHrDashboard>(
    async () => {
      const data = payloadData(await hrGet("/dashboard/admin", { branchId: scope.branchId }))
      const kpis = asRecord(data.kpis)
      return {
        totalEmployees: readNumber(kpis.totalEmployees),
        onLeaveToday: readNumber(kpis.onLeaveToday),
        clockedInToday: readNumber(kpis.clockedInToday),
        clockInRate: readNumber(kpis.clockInRate),
        activeTrainings: readNumber(kpis.activeTrainings),
        pendingActions: asArray(data.pendingActions).map((entry) => {
          const action = asRecord(entry)
          return {
            type: readString(action.type),
            count: readNumber(action.count),
            label: readString(action.label),
          }
        }),
      }
    },
    [scope.branchId],
    {
      totalEmployees: 0,
      onLeaveToday: 0,
      clockedInToday: 0,
      clockInRate: 0,
      activeTrainings: 0,
      pendingActions: [],
    }
  )

  return { dashboard: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function usePastorHrDashboard(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<PastorHrDashboard>(
    async () => {
      const data = payloadData(await hrGet("/dashboard/pastor", { branchId: scope.branchId }))
      const summary = asRecord(data.operationalSummary)
      const training = asRecord(summary.nextTraining)
      return {
        attendanceRate: readNumber(summary.attendanceRate),
        totalEmployees: readNumber(summary.totalEmployees),
        presentToday: readNumber(summary.presentToday),
        staffOnLeave: asArray(summary.staffOnLeave).map((entry) => {
          const row = asRecord(entry)
          const employee = asRecord(row.employee)
          const user = asRecord(employee.userId)
          return {
            id: readString(employee._id, employee.id),
            name: readPersonName(employee, user),
            jobTitle: readString(employee.jobTitle),
            avatarUrl: readString(user.avatarUrl),
            returnDate: readString(row.returnDate),
          }
        }),
        nextTraining: readString(training._id, training.id)
          ? {
              id: readString(training._id, training.id),
              title: readString(training.title),
              startDate: readString(training.startDate),
              venueOrLink: readString(training.venueOrLink),
            }
          : null,
      }
    },
    [scope.branchId],
    { attendanceRate: 0, totalEmployees: 0, presentToday: 0, staffOnLeave: [], nextTraining: null }
  )

  return { dashboard: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useAccountantHrDashboard(branchId?: string) {
  const scope = useHrScope(branchId)

  const result = useHrQuery<AccountantHrDashboard>(
    async () => {
      const data = payloadData(await hrGet("/dashboard/accountant", { branchId: scope.branchId }))
      const kpis = asRecord(data.kpis)
      return {
        totalEmployees: readNumber(kpis.totalEmployees),
        payrollMtd: readNumber(kpis.payrollMtd),
        activeLoans: readNumber(kpis.activeLoans),
        loanBalance: readNumber(kpis.loanBalance),
        workforceCostTrend: asArray(data.workforceCostTrend).map((entry) => {
          const row = asRecord(entry)
          return {
            month: readString(row.month),
            payroll: readNumber(row.payroll),
            deductions: readNumber(row.deductions),
          }
        }),
        loanPortfolioHealth: asArray(data.loanPortfolioHealth).map((entry) => {
          const row = asRecord(entry)
          return {
            category: readString(row.category),
            count: readNumber(row.count),
            principal: readNumber(row.principal),
          }
        }),
      }
    },
    [scope.branchId],
    {
      totalEmployees: 0,
      payrollMtd: 0,
      activeLoans: 0,
      loanBalance: 0,
      workforceCostTrend: [],
      loanPortfolioHealth: [],
    }
  )

  return { dashboard: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useDirectorHrDashboard() {
  const result = useHrQuery<DirectorHrDashboard>(
    async () => {
      const data = payloadData(await hrGet("/dashboard/director"))
      const metrics = asRecord(data.metrics)
      return {
        totalHeadcount: readNumber(metrics.totalHeadcount),
        totalBranches: readNumber(metrics.totalBranches),
        totalActiveLoans: readNumber(metrics.totalActiveLoans),
        turnoverRate: readNumber(metrics.turnoverRate),
        totalPayrollCost: readNumber(metrics.totalPayrollCost),
        headcountByBranch: asArray(data.headcountByBranch).map((entry) => {
          const row = asRecord(entry)
          return {
            branchId: readString(row.branchId),
            branchName: readString(row.branchName),
            state: readString(row.state),
            count: readNumber(row.count),
            attendanceHealth: readString(row.attendanceHealth),
          }
        }),
      }
    },
    [],
    {
      totalHeadcount: 0,
      totalBranches: 0,
      totalActiveLoans: 0,
      turnoverRate: 0,
      totalPayrollCost: 0,
      headcountByBranch: [],
    }
  )

  return { dashboard: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}
