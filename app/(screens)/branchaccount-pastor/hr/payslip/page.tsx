"use client"

import { Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useHrPayrollRun, useHrPayslip } from "@/components/hooks/useHrPayroll"
import { useToast } from "@/components/ui/toast"
import { initials } from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import { Search, Bell, ArrowLeft, Download, Calculator } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"

type LineItem = {
  description: string
  amount: number
}

/** Payslip keys come back camelCased; this is what a reader expects to see. */
function labelFor(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim()
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PayslipScreen />
    </Suspense>
  )
}

function PayslipScreen() {
  const searchParams = useSearchParams()
  const employeeId = searchParams.get("employeeId") ?? ""
  const { pushToast } = useToast()

  // A payslip belongs to a payroll run, so the branch's current run supplies
  // the run id the employee's slip is read from.
  const { run } = useHrPayrollRun()
  const { payslip, loading, error } = useHrPayslip(run?.id ?? "", employeeId)

  const earnings = useMemo<LineItem[]>(
    () =>
      Object.entries(payslip?.earnings ?? {})
        .filter(([key]) => key !== "grossPay")
        .map(([key, amount]) => ({ description: labelFor(key), amount })),
    [payslip]
  )

  const deductions = useMemo<LineItem[]>(
    () =>
      Object.entries(payslip?.deductions ?? {})
        .filter(([key]) => key !== "totalDeductions")
        .map(([key, amount]) => ({ description: labelFor(key), amount })),
    [payslip]
  )

  const grossEarnings =
    payslip?.earnings?.grossPay ?? earnings.reduce((sum, item) => sum + item.amount, 0)
  const totalDeductions =
    payslip?.deductions?.totalDeductions ?? deductions.reduce((sum, item) => sum + item.amount, 0)
  const netPay = payslip?.netPay ?? grossEarnings - totalDeductions

  const handleDownload = () => {
    const exported = exportHrRows("payslip", [
      ...earnings.map((item) => ({ Section: "Earnings", Item: item.description, Amount: item.amount })),
      ...deductions.map((item) => ({ Section: "Deductions", Item: item.description, Amount: item.amount })),
      { Section: "Summary", Item: "Net Pay", Amount: netPay },
    ])
    if (!exported) pushToast("Nothing to download yet", "info")
  }

  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/employee-directory" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-4 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Back + Download row */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payroll List
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!payslip}
            className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download Payslip
          </button>
        </div>

        {/* Employee card */}
        <div className="mb-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E8EDFF] text-[16px] font-bold text-[#3B5BDB]">
              {initials(payslip?.employee.name ?? "")}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[#111827]">
                {payslip?.employee.name || (loading ? "Loading…" : "Payslip")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#6B7280]">
                  {payslip?.employee.jobTitle ||
                    payslip?.employee.department ||
                    error ||
                    (employeeId ? "" : "Open a staff member from the directory")}
                </span>
                {payslip?.employee.employeeCode ? (
                  <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                    {payslip.employee.employeeCode}
                  </span>
                ) : null}
                {payslip?.period ? (
                  <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
                    {payslip.period}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Final Net Pay Computation card */}
        <div className="mb-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111827] text-white">
              <Calculator className="h-4 w-4" />
            </span>
            <h2 className="text-[16px] font-bold text-[#111827]">Final Net Pay Computation</h2>
          </div>

          <div className="rounded-lg bg-[#F9FAFB] p-5">
            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {/* Gross Earnings */}
              <div className="flex flex-col justify-center rounded-lg border border-[#EEF1F6] bg-white px-4 py-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Gross Earnings
                </span>
                <span className="mt-1 text-[18px] font-bold text-[#111827]">
                  {formatNaira(grossEarnings)}
                </span>
              </div>

              {/* minus */}
              <div className="flex items-center justify-center text-[22px] font-bold text-[#9CA3AF]">
                −
              </div>

              {/* Total Deductions */}
              <div className="flex flex-col justify-center rounded-lg border border-[#EEF1F6] bg-white px-4 py-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Total Deductions
                </span>
                <span className="mt-1 text-[18px] font-bold text-rose-600">
                  {formatNaira(totalDeductions)}
                </span>
              </div>

              {/* equals */}
              <div className="flex items-center justify-center text-[22px] font-bold text-[#9CA3AF]">
                =
              </div>

              {/* Net Pay */}
              <div className="flex flex-col justify-center rounded-lg bg-[#111827] px-4 py-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Net Pay (Take Home)
                </span>
                <span className="mt-1 text-[18px] font-bold text-white">
                  {formatNaira(netPay)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings + Deductions tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Earnings */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F6] p-5">
              <h2 className="text-[16px] font-bold text-[#111827]">Earnings</h2>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Credit
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Amount (₦)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {earnings.map((item) => (
                    <tr key={item.description}>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{item.description}</td>
                      <td className="px-4 py-4 text-right text-[13px] font-semibold text-[#111827]">
                        {formatAmount(item.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#EEF2FF]">
                    <td className="px-4 py-4 text-[13px] font-bold uppercase tracking-wider text-[#111827]">
                      Total Earnings
                    </td>
                    <td className="px-4 py-4 text-right text-[13px] font-bold text-[#111827]">
                      {formatAmount(grossEarnings)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F6] p-5">
              <h2 className="text-[16px] font-bold text-[#111827]">Deductions</h2>
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Debit
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Amount (₦)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {deductions.map((item) => (
                    <tr key={item.description}>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{item.description}</td>
                      <td className="px-4 py-4 text-right text-[13px] font-semibold text-[#111827]">
                        {formatAmount(item.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#FFF1F2]">
                    <td className="px-4 py-4 text-[13px] font-bold uppercase tracking-wider text-rose-700">
                      Total Deductions
                    </td>
                    <td className="px-4 py-4 text-right text-[13px] font-bold text-rose-600">
                      {formatAmount(totalDeductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
