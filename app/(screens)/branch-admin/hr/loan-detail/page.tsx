"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Menu, Search, Bell, ChevronLeft, Check, Loader2, X as XIcon } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { HrPanelState, HrTableState, hrErrorMessage } from "@/components/hr/HrDataState"
import {
  useAddLoanRepayment,
  useLoan,
  useLoans,
  useWithdrawLoan,
} from "@/components/hooks/hr/useHrLoans"
import {
  LOAN_STATUS_BADGES,
  LOAN_STATUS_LABELS,
  badgeFor,
  deref,
  employeeName,
  initials,
  loanBalance,
  lookup,
} from "@/lib/hr/normalize"
import type { EmployeeLoan } from "@/lib/hr/types"
import { formatCurrency, formatDate } from "@/lib/format"
import { withSuspense } from "@/lib/withSuspense"
import { cn } from "@/lib/utils"

type ScheduleRow = {
  key: string
  date: string
  installment: string
  amount: number
  paid: boolean
}

/**
 * Build the installment table.
 *
 * The backend records repayments that actually happened; it stores no forward
 * schedule. So paid rows come from `repayments[]` and the remaining rows are
 * projected from `tenureMonths` and `firstDeductionDate` — labelled Upcoming so
 * they aren't mistaken for posted transactions.
 */
function buildSchedule(loan: EmployeeLoan): ScheduleRow[] {
  const total = loan.tenureMonths ?? 0
  const repayments = [...(loan.repayments ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const rows: ScheduleRow[] = repayments.map((repayment, index) => ({
    key: `paid-${index}-${repayment.date}`,
    date: formatDate(repayment.date, "medium"),
    installment: `#${String(index + 1).padStart(2, "0")} of ${total || repayments.length}`,
    amount: repayment.amount,
    paid: true,
  }))

  const start = loan.firstDeductionDate ? new Date(loan.firstDeductionDate) : null
  if (start && total > repayments.length) {
    for (let i = repayments.length; i < total; i += 1) {
      const due = new Date(start)
      due.setMonth(due.getMonth() + i)
      rows.push({
        key: `upcoming-${i}`,
        date: formatDate(due.toISOString(), "medium"),
        installment: `#${String(i + 1).padStart(2, "0")} of ${total}`,
        amount: loan.monthlyDeduction,
        paid: false,
      })
    }
  }

  return rows
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-[#EEF1F6] bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </div>
      <div className={cn("mt-2 text-[20px] font-bold text-[#111827]", valueClass)}>{value}</div>
    </div>
  )
}

function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loanId = searchParams.get("id")

  const [mobileOpen, setMobileOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const loanQuery = useLoan(loanId)
  const loan = loanQuery.data
  const employee = deref(loan?.employeeId)

  const addRepayment = useAddLoanRepayment()
  const withdraw = useWithdrawLoan()

  /** Other loans for the same person — the "Past Loan" history rail. */
  const history = useLoans({
    employeeId: employee?._id,
    limit: 20,
    enabled: Boolean(employee?._id),
  })

  const schedule = useMemo(() => (loan ? buildSchedule(loan) : []), [loan])

  const pastLoans = useMemo(
    () =>
      (history.data?.items ?? [])
        .filter((item) => item._id !== loanId)
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        )
        .slice(0, 5),
    [history.data, loanId],
  )

  async function submitPayment() {
    if (!loan) return
    setActionError(null)
    const amount = Number(paymentAmount.replace(/[^0-9.]/g, ""))
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError("Enter a payment amount greater than zero.")
      return
    }
    try {
      await addRepayment.mutateAsync({ id: loan._id, amount })
      setPaymentOpen(false)
      setPaymentAmount("")
    } catch (error) {
      setActionError(hrErrorMessage(error))
    }
  }

  async function submitWithdraw() {
    if (!loan) return
    setActionError(null)
    try {
      await withdraw.mutateAsync({ id: loan._id })
    } catch (error) {
      setActionError(hrErrorMessage(error))
    }
  }

  const canWithdraw =
    loan?.status === "pending_pastor" || loan?.status === "pending_director"

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/employee-loans"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-[#4B5563] hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-[#111827]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[240px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEF1F6] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {!loanId ? (
            <HrPanelState
              isLoading={false}
              error={null}
              isEmpty
              emptyTitle="No loan selected"
              emptyDescription="Open a loan from the Employee Loans list to see its detail."
              className="mt-4"
            />
          ) : loanQuery.isLoading || loanQuery.error || !loan ? (
            <HrPanelState
              isLoading={loanQuery.isLoading}
              error={loanQuery.error}
              isEmpty={!loan}
              emptyTitle="Loan not found"
              emptyDescription="It may have been withdrawn or removed."
              onRetry={() => loanQuery.refetch()}
              className="mt-4"
            />
          ) : (
            <>
              {/* Header card */}
              <div className="mt-4 rounded-xl border border-[#EEF1F6] bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[14px] font-bold text-[#2563EB]">
                      {initials(employeeName(loan.employeeId))}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[16px] font-bold text-[#111827]">
                          {employeeName(loan.employeeId)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            badgeFor(LOAN_STATUS_BADGES, loan.status),
                          )}
                        >
                          {lookup(LOAN_STATUS_LABELS, loan.status)}
                        </span>
                      </div>
                      <div className="mt-1 text-[13px] text-[#6B7280]">
                        ID: {employee?.employeeId ?? "—"} • {employee?.jobTitle ?? "—"}
                      </div>
                    </div>
                  </div>

                  {canWithdraw && (
                    <button
                      type="button"
                      onClick={submitWithdraw}
                      disabled={withdraw.isPending}
                      className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      {withdraw.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Withdraw Request
                    </button>
                  )}
                </div>

                {actionError && (
                  <p className="mt-3 text-[12px] font-medium text-red-600">{actionError}</p>
                )}
              </div>

              {/* Stat cards */}
              <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                  label="Total Loan Amount"
                  value={formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
                />
                <StatCard
                  label="Amount Repaid"
                  value={formatCurrency(loan.totalRepaid ?? 0, { maximumFractionDigits: 0 })}
                  valueClass="text-emerald-600"
                />
                <StatCard
                  label="Outstanding"
                  value={formatCurrency(loanBalance(loan), { maximumFractionDigits: 0 })}
                  valueClass="text-rose-600"
                />
                <StatCard
                  label="Monthly Deduction"
                  value={formatCurrency(loan.monthlyDeduction, { maximumFractionDigits: 0 })}
                />
              </div>

              {/* Two-column row */}
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* LEFT: Repayment Schedule */}
                <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-2">
                  <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] px-5 py-4">
                    <h2 className="text-[16px] font-bold text-[#111827]">Repayment Schedule</h2>
                    <button
                      type="button"
                      onClick={() => setPaymentOpen((v) => !v)}
                      className="text-[13px] font-semibold text-[#2563EB] hover:underline"
                    >
                      {paymentOpen ? "Cancel" : "New Payment"}
                    </button>
                  </div>

                  {paymentOpen && (
                    <div className="flex flex-col gap-3 border-b border-[#F3F4F6] bg-[#F9FAFB] px-5 py-4 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                          Payment Amount
                        </label>
                        <div className="relative mt-1.5">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                            ₦
                          </span>
                          <input
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            inputMode="decimal"
                            placeholder={String(loan.monthlyDeduction)}
                            className="h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white pl-7 pr-3 text-[13px] outline-none focus:border-[#2563EB]"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={submitPayment}
                        disabled={addRepayment.isPending}
                        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md bg-[#111827] px-4 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
                      >
                        {addRepayment.isPending && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        Record Payment
                      </button>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#EEF2FF]">
                        <tr>
                          {["Date", "Installment", "Amount", "Status"].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        <HrTableState
                          colSpan={4}
                          isLoading={false}
                          error={null}
                          isEmpty={schedule.length === 0}
                          emptyTitle="No repayments yet"
                          emptyDescription="Record a payment or wait for the next payroll deduction."
                        />

                        {schedule.map((row) => (
                          <tr key={row.key} className="hover:bg-[#F9FAFB]">
                            <td className="px-4 py-5 text-[13px] text-[#111827]">{row.date}</td>
                            <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                              {row.installment}
                            </td>
                            <td className="px-4 py-5 text-[13px] font-semibold text-[#111827]">
                              {formatCurrency(row.amount, { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-5 text-[13px]">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                                  row.paid
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700",
                                )}
                              >
                                {row.paid ? "Paid" : "Upcoming"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-[#F3F4F6] px-5 py-3 text-[12px] text-[#9CA3AF]">
                    Paid rows are posted repayments. Upcoming rows are projected from the
                    {" "}
                    {loan.tenureMonths}-month tenure and first deduction date.
                  </div>
                </div>

                {/* RIGHT: On-going + Past loans */}
                <div className="flex flex-col gap-5 lg:col-span-1">
                  {/* On-going Loan */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <h3 className="text-[16px] font-bold text-[#111827]">This Loan</h3>

                    <div className="mt-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        Purpose
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {loan.purpose}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                          Amount
                        </div>
                        <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                          {formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                          Disbursed
                        </div>
                        <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                          {loan.disbursedAt ? formatDate(loan.disbursedAt, "medium") : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                          Tenure
                        </div>
                        <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                          {loan.tenureMonths} months
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                          DSR
                        </div>
                        <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                          {loan.debtServiceRatio != null
                            ? `${Math.round(loan.debtServiceRatio * 100) / 100}%`
                            : "—"}
                        </div>
                      </div>
                    </div>

                    {loan.declineReason && (
                      <p className="mt-4 rounded-md bg-rose-50 p-3 text-[12px] text-rose-700">
                        {loan.declineReason}
                      </p>
                    )}
                  </div>

                  {/* Past Loan */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <h3 className="text-[16px] font-bold text-[#111827]">Past Loans</h3>

                    {history.isLoading || history.error || pastLoans.length === 0 ? (
                      <HrPanelState
                        isLoading={history.isLoading}
                        error={history.error}
                        isEmpty={pastLoans.length === 0}
                        emptyTitle="No other loans"
                        emptyDescription="This is the only loan on record for this employee."
                        onRetry={() => history.refetch()}
                        className="mt-4 border-0 p-4"
                      />
                    ) : (
                      <ol className="mt-4 space-y-5">
                        {pastLoans.map((past) => {
                          const approved =
                            past.status === "approved" ||
                            past.status === "active" ||
                            past.status === "completed"
                          const decision = past.approvals?.[past.approvals.length - 1]
                          return (
                            <li key={past._id} className="flex gap-3">
                              <span
                                className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                  approved
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-rose-100 text-rose-600",
                                )}
                              >
                                {approved ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <XIcon className="h-4 w-4" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <div className="text-[14px] font-bold text-[#111827]">
                                  {past.purpose}
                                </div>
                                <div className="text-[12px] text-[#6B7280]">
                                  {lookup(LOAN_STATUS_LABELS, past.status)}
                                  {decision?.role ? ` · ${decision.role}` : ""}
                                </div>
                                <div className="mt-1 text-[12px] text-[#4B5563]">
                                  Amount:{" "}
                                  {formatCurrency(past.amount, { maximumFractionDigits: 0 })}
                                </div>
                                {past.disbursedAt && (
                                  <div className="text-[12px] text-[#9CA3AF]">
                                    Disbursed • {formatDate(past.disbursedAt, "medium")}
                                  </div>
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default withSuspense(Page)
