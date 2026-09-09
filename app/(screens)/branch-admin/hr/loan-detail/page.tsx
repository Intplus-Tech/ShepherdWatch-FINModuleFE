"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useHrLoan, useLoanMutations } from "@/components/hooks/useHrLoans"
import { useToast } from "@/components/ui/toast"
import {
  LOAN_STATUS_LABELS,
  LOAN_STATUS_STYLES,
  formatDate,
  formatNaira,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import { useRouter } from "next/navigation"
import {
  Menu,
  Search,
  Bell,
  ChevronLeft,
  Check,
  X as XIcon,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { cn } from "@/lib/utils"

function ScheduleBadge({ status }: { status: "Paid" | "UPCOMING" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        status === "Paid"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      )}
    >
      {status}
    </span>
  )
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
      <div
        className={cn("mt-2 text-[20px] font-bold text-[#111827]", valueClass)}
      >
        {value}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoanDetailScreen />
    </Suspense>
  )
}

function LoanDetailScreen() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const searchParams = useSearchParams()
  const loanId = searchParams.get("loanId") ?? ""
  const { pushToast } = useToast()
  const { loan, loading, error, refresh } = useHrLoan(loanId)
  const { withdrawLoan } = useLoanMutations()

  const amountRepaid = loan ? Math.max(loan.amount - loan.remainingBalance, 0) : 0

  // The API returns recorded repayments; the remaining installments are
  // projected from the monthly deduction so the schedule reads end to end.
  const schedule = (() => {
    if (!loan) return [] as {
      id: string
      date: string
      installment: string
      amount: string
      status: "Paid" | "UPCOMING"
      reference: string
    }[]

    const paid = loan.repayments.map((repayment, index) => ({
      id: `paid-${index}`,
      date: formatDate(repayment.paidAt),
      installment: `${index + 1} of ${loan.tenureMonths || loan.repayments.length}`,
      amount: formatNaira(repayment.amount),
      status: "Paid" as const,
      reference: repayment.reference || "—",
    }))

    const remaining =
      loan.monthlyDeduction > 0
        ? Math.ceil(loan.remainingBalance / loan.monthlyDeduction)
        : 0

    const upcoming = Array.from({ length: Math.max(remaining, 0) }, (_, index) => ({
      id: `due-${index}`,
      date: "Scheduled",
      installment: `${paid.length + index + 1} of ${loan.tenureMonths || paid.length + remaining}`,
      amount: formatNaira(
        Math.min(loan.monthlyDeduction, loan.remainingBalance - index * loan.monthlyDeduction)
      ),
      status: "UPCOMING" as const,
      reference: "—",
    }))

    return [...paid, ...upcoming]
  })()

  const handleWithdraw = async () => {
    if (!loan) return
    setWithdrawing(true)
    try {
      await withdrawLoan(loan.id, "Withdrawn by branch admin")
      pushToast("Loan request withdrawn", "success")
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to withdraw this request", "error")
    } finally {
      setWithdrawing(false)
    }
  }

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
        {/* Header */}
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
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Header card */}
          <div className="mt-4 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[14px] font-bold text-[#2563EB]">
                  {initials(loan?.employeeName ?? "")}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[16px] font-bold text-[#111827]">
                      {loan?.employeeName || (loading ? "Loading…" : "Loan")}
                    </span>
                    {loan ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                          statusStyle(LOAN_STATUS_STYLES, loan.status)
                        )}
                      >
                        {statusLabel(LOAN_STATUS_LABELS, loan.status)}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    {loan
                      ? `ID: ${loan.employeeCode || "—"} • ${loan.jobTitle || loan.department || "Staff"}`
                      : error || (loanId ? "" : "No loan selected")}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={
                  withdrawing ||
                  !loan ||
                  ["withdrawn", "completed", "rejected"].includes(String(loan.status))
                }
                className="rounded-md bg-rose-600 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {withdrawing ? "Withdrawing…" : "Withdraw Request"}
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Loan Amount" value={formatNaira(loan?.amount ?? 0)} />
            <StatCard
              label="Amount Repaid"
              value={formatNaira(amountRepaid)}
              valueClass="text-emerald-600"
            />
            <StatCard
              label="Outstanding"
              value={formatNaira(loan?.remainingBalance ?? 0)}
              valueClass="text-rose-600"
            />
            <StatCard
              label="Monthly Deduction"
              value={formatNaira(loan?.monthlyDeduction ?? 0)}
            />
          </div>

          {/* Two-column row */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT: Repayment Schedule */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-2">
              <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] px-5 py-4">
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Repayment Schedule
                </h2>
                <span className="text-[12px] text-[#9CA3AF]">
                  Repayments are posted by Finance
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#EEF2FF]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Installment
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {schedule.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-5 text-[13px] text-[#111827]">{row.date}</td>
                        <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                          {row.installment}
                        </td>
                        <td className="px-4 py-5 text-[13px] font-semibold text-[#111827]">
                          {row.amount}
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <ScheduleBadge status={row.status} />
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#6B7280]">{row.reference}</td>
                      </tr>
                    ))}

                    {!loading && schedule.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#9CA3AF]">
                          {loanId ? "No repayments recorded yet." : "Open a loan from the list to see its schedule."}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#F3F4F6] px-5 py-4">
                <span className="text-[13px] text-[#6B7280]">
                  {loan?.repayments.length ?? 0} repayment
                  {(loan?.repayments.length ?? 0) === 1 ? "" : "s"} recorded
                </span>
              </div>
            </div>

            {/* RIGHT: On-going + Past loans */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* On-going Loan */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[16px] font-bold text-[#111827]">
                  On-going Loan
                </h3>

                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    Purpose
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {loan?.purpose || "—"}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Amount
                    </div>
                    <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                      {formatNaira(loan?.amount ?? 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Applied
                    </div>
                    <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                      {formatDate(loan?.createdAt ?? "")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Loan */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[16px] font-bold text-[#111827]">Approval Trail</h3>

                <ol className="mt-4 space-y-5">
                  {[
                    { key: "accountant", title: "Finance Verification", review: loan?.accountantReview },
                    { key: "pastor", title: "Pastor Authorization", review: loan?.pastorApproval },
                    { key: "director", title: "Director Override", review: loan?.directorOverride },
                  ]
                    .filter((step) => step.review)
                    .map((step) => {
                      const review = step.review!
                      const declined = review.action === "declined"
                      return (
                        <li key={step.key} className="flex gap-3">
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                              declined
                                ? "bg-rose-100 text-rose-600"
                                : "bg-emerald-100 text-emerald-600"
                            )}
                          >
                            {declined ? <XIcon className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[14px] font-bold text-[#111827]">{step.title}</div>
                            {review.comment ? (
                              <div className="text-[12px] text-[#6B7280]">{review.comment}</div>
                            ) : null}
                            {review.at ? (
                              <div className="mt-1 text-[12px] text-[#9CA3AF]">
                                {formatDate(review.at)}
                              </div>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}

                  {loan &&
                  !loan.accountantReview &&
                  !loan.pastorApproval &&
                  !loan.directorOverride ? (
                    <li className="text-[13px] text-[#9CA3AF]">
                      Awaiting the first review on this application.
                    </li>
                  ) : null}
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
