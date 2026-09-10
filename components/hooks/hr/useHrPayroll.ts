import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { buildQuery, hrGet, hrPost, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type { PayrollOverview, PayrollRun, Payslip } from "@/lib/hr/types"

/**
 * Payroll.
 *
 * `current-run` and `generate-run` both validate `currentPayrollQuerySchema`,
 * which is a *query* schema requiring `branchId` — so branchId travels in the
 * query string on the POST as well, not in its body.
 */

export function useCurrentPayrollRun(
  options: { branchId?: string; period?: string; enabled?: boolean } = {},
) {
  const { enabled = true, branchId, period } = options
  const params: QueryParams = { branchId, period }

  return useQuery({
    queryKey: hrKeys.payrollCurrentRun(params),
    queryFn: () => hrGet<PayrollRun | null>("/payroll/current-run", params),
    // The endpoint 400s without a branchId rather than inferring one.
    enabled: enabled && Boolean(branchId),
  })
}

/** Organisation-wide roll-up; branch-scoped callers get only their own branch. */
export function usePayrollOverview(options: { period?: string; enabled?: boolean } = {}) {
  const { enabled = true, period } = options
  const params: QueryParams = { period }

  return useQuery({
    queryKey: hrKeys.payrollOverview(params),
    queryFn: () => hrGet<PayrollOverview>("/payroll/overview", params),
    enabled,
  })
}

export function usePayslip(runId: string | null | undefined, employeeId: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.payslip(runId ?? "", employeeId ?? ""),
    queryFn: () => hrGet<Payslip>(`/payroll/runs/${runId}/employees/${employeeId}`),
    enabled: Boolean(runId && employeeId),
  })
}

function usePayrollMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.payroll() })
      // Disbursement posts loan repayments, so loan balances move with it.
      queryClient.invalidateQueries({ queryKey: hrKeys.loans() })
      queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "dashboard"] })
    },
  })
}

export function useGeneratePayrollRun() {
  return usePayrollMutation(({ branchId, period }: { branchId: string; period?: string }) =>
    hrPost<PayrollRun>(`/payroll/generate-run${buildQuery({ branchId, period })}`),
  )
}

export function useSubmitPayrollRun() {
  return usePayrollMutation(({ id }: { id: string }) =>
    hrPost<PayrollRun>(`/payroll/runs/${id}/submit`),
  )
}

/** Director sign-off that releases the disbursement. */
export function useAuthorizePayrollRun() {
  return usePayrollMutation(({ id }: { id: string }) =>
    hrPost<PayrollRun>(`/payroll/runs/${id}/authorize`),
  )
}
