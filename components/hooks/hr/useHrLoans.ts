import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fieldOf, hrGet, hrGetList, hrPost, type QueryParams } from "@/lib/hr/client"
import { hrKeys } from "@/lib/hr/keys"
import type { EmployeeLoan, LoanStatus } from "@/lib/hr/types"

export type LoanListParams = {
  page?: number
  limit?: number
  branchId?: string
  employeeId?: string
  status?: LoanStatus | "all"
  enabled?: boolean
}

export function useLoans(options: LoanListParams = {}) {
  const { enabled = true, status, ...rest } = options
  const params: QueryParams = { ...rest, status: status === "all" ? undefined : status }

  return useQuery({
    queryKey: hrKeys.loanList(params),
    queryFn: () => hrGetList<EmployeeLoan>("/loans", params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useLoan(id: string | null | undefined) {
  return useQuery({
    queryKey: hrKeys.loan(id ?? ""),
    queryFn: () => hrGet<EmployeeLoan>(`/loans/${id}`),
    enabled: Boolean(id),
  })
}

function useLoanMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, variables) => {
      const id = fieldOf(variables, "id")
      if (id) queryClient.invalidateQueries({ queryKey: hrKeys.loan(id) })
      queryClient.invalidateQueries({ queryKey: hrKeys.loans() })
      queryClient.invalidateQueries({ queryKey: [...hrKeys.all, "dashboard"] })
    },
  })
}

export type ApplyLoanInput = {
  employeeId: string
  branchId: string
  amount: number
  purpose: string
  tenureMonths: number
  firstDeductionDate?: string
  supportingDocumentUrls?: string[]
}

/**
 * File a loan application.
 *
 * `monthlyDeduction` and `debtServiceRatio` are computed server-side from the
 * employee's salary — the client must not send them.
 */
export function useApplyLoan() {
  return useLoanMutation((input: ApplyLoanInput) => hrPost<EmployeeLoan>("/loans", input))
}

/** Accountant's affordability check — the first gate in the loan workflow. */
export function useAccountantReviewLoan() {
  return useLoanMutation(
    ({ id, comment, isVerified = true }: { id: string; comment: string; isVerified?: boolean }) =>
      hrPost<EmployeeLoan>(`/loans/${id}/accountant-review`, { comment, isVerified }),
  )
}

export function usePastorApproveLoan() {
  return useLoanMutation(
    ({
      id,
      action,
      comment,
    }: {
      id: string
      action: "approved" | "declined"
      comment?: string
    }) => hrPost<EmployeeLoan>(`/loans/${id}/pastor-approval`, { action, comment }),
  )
}

/**
 * Director override for an application that breaches the DSR policy.
 *
 * The backend rejects the call unless `acknowledgedPolicyViolation` is `true`,
 * so the calling screen has to surface that waiver explicitly.
 */
export function useDirectorOverrideLoan() {
  return useLoanMutation(
    ({
      id,
      reason,
      acknowledgedPolicyViolation,
    }: {
      id: string
      reason: string
      acknowledgedPolicyViolation: boolean
    }) =>
      hrPost<EmployeeLoan>(`/loans/${id}/director-override`, {
        reason,
        acknowledgedPolicyViolation,
      }),
  )
}

export function useAddLoanRepayment() {
  return useLoanMutation(({ id, amount }: { id: string; amount: number }) =>
    hrPost<EmployeeLoan>(`/loans/${id}/repayments`, { amount }),
  )
}

export function useWithdrawLoan() {
  return useLoanMutation(({ id }: { id: string }) =>
    hrPost<EmployeeLoan>(`/loans/${id}/withdraw`),
  )
}
