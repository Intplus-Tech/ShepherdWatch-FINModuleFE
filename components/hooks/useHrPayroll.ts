"use client"

import { useCallback } from "react"
import { hrGet, hrPost, payloadData } from "@/lib/hr/client"
import { mapPayrollOverview, mapPayrollRun, mapPayslip } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrPayrollOverview, HrPayrollRun, HrPayslip } from "@/lib/hr/types"

/**
 * The current run is branch-scoped and `branchId` is required, so a director
 * viewing every branch has to pick one before this returns anything — until
 * then the query is skipped and the screen shows its picker.
 */
export function useHrPayrollRun(options: { branchId?: string; period?: string } = {}) {
  const scope = useHrScope(options.branchId)
  const branchId = options.branchId ?? scope.branchId ?? ""
  const period = options.period ?? ""

  const result = useHrQuery<HrPayrollRun | null>(
    branchId
      ? async () => mapPayrollRun(payloadData(await hrGet("/payroll/current-run", { branchId, period })))
      : null,
    [branchId, period],
    null
  )

  return {
    run: result.data,
    /** True when a branch still has to be chosen before the run can load. */
    needsBranch: !branchId,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrPayrollOverview(period?: string) {
  const result = useHrQuery<HrPayrollOverview | null>(
    async () => mapPayrollOverview(payloadData(await hrGet("/payroll/overview", { period }))),
    [period ?? ""],
    null
  )

  return { overview: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function useHrPayslip(runId: string, employeeId: string) {
  const result = useHrQuery<HrPayslip | null>(
    runId && employeeId
      ? async () => mapPayslip(payloadData(await hrGet(`/payroll/runs/${runId}/employees/${employeeId}`)))
      : null,
    [runId, employeeId],
    null
  )

  return { payslip: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}

export function usePayrollMutations() {
  const submitRun = useCallback(
    async (runId: string) => mapPayrollRun(payloadData(await hrPost(`/payroll/runs/${runId}/submit`))),
    []
  )

  const authorizeRun = useCallback(
    async (runId: string) => mapPayrollRun(payloadData(await hrPost(`/payroll/runs/${runId}/authorize`))),
    []
  )

  return { submitRun, authorizeRun }
}

export type BranchPayrollRow = {
  branchId: string
  branchName: string
  runId: string
  status: string
  staffCount: number
  grossPay: number
  deductions: number
  netPayable: number
}

/**
 * Payroll per branch. The overview endpoint only returns organisation-wide
 * totals, so each branch's current run is fetched alongside it — a handful of
 * calls, one per reporting branch.
 */
export function useHrPayrollByBranch(
  branches: { id: string; name: string }[],
  period?: string
) {
  const key = branches.map((branch) => branch.id).join(",")

  const result = useHrQuery<BranchPayrollRow[]>(
    key
      ? async () => {
          const rows = await Promise.all(
            branches.map(async (branch) => {
              try {
                const run = mapPayrollRun(
                  payloadData(await hrGet("/payroll/current-run", { branchId: branch.id, period }))
                )
                return {
                  branchId: branch.id,
                  branchName: branch.name,
                  runId: run.id,
                  status: run.status,
                  staffCount: run.employeeCount,
                  grossPay: run.totalGrossPay,
                  deductions: run.totalDeductions,
                  netPayable: run.totalNetPay,
                }
              } catch {
                // A branch with no run yet still belongs in the table.
                return {
                  branchId: branch.id,
                  branchName: branch.name,
                  runId: "",
                  status: "none",
                  staffCount: 0,
                  grossPay: 0,
                  deductions: 0,
                  netPayable: 0,
                }
              }
            })
          )
          return rows
        }
      : null,
    [key, period ?? ""],
    []
  )

  return { rows: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
}
