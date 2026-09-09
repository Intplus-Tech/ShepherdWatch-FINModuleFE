"use client"

import { useCallback } from "react"
import { hrGet, hrPost, payloadData, payloadList, payloadPagination,
  keepMatching, type HrPagination } from "@/lib/hr/client"
import { mapLoan } from "@/lib/hr/mappers"
import { useHrQuery } from "@/lib/hr/useHrQuery"
import { useHrScope } from "@/lib/hr/useHrScope"
import type { HrLoan } from "@/lib/hr/types"

export type LoanFilters = {
  page?: number
  limit?: number
  branchId?: string
  employeeId?: string
  status?: string
}

export function useHrLoans(filters: LoanFilters = {}) {
  const scope = useHrScope(filters.branchId)
  const { page = 1, limit = 20, employeeId = "", status = "" } = filters

  const result = useHrQuery<{ loans: HrLoan[]; pagination: HrPagination }>(
    async () => {
      const payload = await hrGet("/loans", {
        page,
        limit,
        branchId: scope.branchId,
        employeeId,
        status,
      })
      return {
        loans: keepMatching(payloadList(payload).map(mapLoan).filter((loan) => loan.id), "status", status),
        pagination: payloadPagination(payload, limit),
      }
    },
    [page, limit, scope.branchId, employeeId, status],
    { loans: [], pagination: { total: 0, page: 1, limit, pages: 0 } }
  )

  return {
    loans: result.data.loans,
    pagination: result.data.pagination,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}

export function useHrLoan(loanId: string) {
  const result = useHrQuery<HrLoan | null>(
    loanId ? async () => mapLoan(payloadData(await hrGet(`/loans/${loanId}`))) : null,
    [loanId],
    null
  )

  return { loan: result.data, loading: result.loading, error: result.error, refresh: result.refresh }
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
 * The loan approval chain is accountant verification → pastor authorization →
 * (director override only when the request breaches policy). Each screen calls
 * the step its role owns.
 */
export function useLoanMutations() {
  const applyForLoan = useCallback(
    async (input: ApplyLoanInput) => mapLoan(payloadData(await hrPost("/loans", input))),
    []
  )

  const accountantReview = useCallback(
    async (id: string, comment: string, isVerified = true) =>
      mapLoan(payloadData(await hrPost(`/loans/${id}/accountant-review`, { comment, isVerified }))),
    []
  )

  const pastorApproval = useCallback(
    async (id: string, action: "approved" | "declined", comment?: string) =>
      mapLoan(payloadData(await hrPost(`/loans/${id}/pastor-approval`, { action, comment }))),
    []
  )

  const directorOverride = useCallback(
    async (id: string, reason: string, acknowledgedPolicyViolation = true) =>
      mapLoan(
        payloadData(
          await hrPost(`/loans/${id}/director-override`, { reason, acknowledgedPolicyViolation })
        )
      ),
    []
  )

  const recordRepayment = useCallback(
    async (id: string, amount: number) =>
      mapLoan(payloadData(await hrPost(`/loans/${id}/repayments`, { amount }))),
    []
  )

  const withdrawLoan = useCallback(
    async (id: string, reason?: string) =>
      mapLoan(payloadData(await hrPost(`/loans/${id}/withdraw`, { reason }))),
    []
  )

  return {
    applyForLoan,
    accountantReview,
    pastorApproval,
    directorOverride,
    recordRepayment,
    withdrawLoan,
  }
}
