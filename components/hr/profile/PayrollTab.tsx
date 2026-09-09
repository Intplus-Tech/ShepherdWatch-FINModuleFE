"use client"

import { useState } from "react"
import { Copy, CheckCircle2 } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  StatCard,
  Field,
  ProgressBar,
  StatusBadge,
  Th,
  Td,
} from "./shared"
import { useHrEmployee } from "@/components/hooks/useHrEmployees"
import { useHrLoans } from "@/components/hooks/useHrLoans"
import { useHrLeaves } from "@/components/hooks/useHrLeaves"
import { useHrDocuments } from "@/components/hooks/useHrDocuments"
import { useToast } from "@/components/ui/toast"
import {
  DOCUMENT_TYPE_LABELS,
  LOAN_STATUS_LABELS,
  formatDate,
  formatNaira,
  statusLabel,
} from "@/lib/hr/display"

function amountText(value: number, negative = false): string {
  const formatted = value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return negative ? `(${formatted})` : formatted
}

export default function PayrollTab({ employeeId }: { employeeId: string }) {
  const { pushToast } = useToast()
  const { employee } = useHrEmployee(employeeId)
  const { loans } = useHrLoans({ employeeId, limit: 20 })
  const { leaves } = useHrLeaves({ employeeId, limit: 50 })
  // Assets are not linked to staff in the API; the personnel vault is, and it
  // is the closest thing to an issued-items record.
  const { documents } = useHrDocuments(employeeId)
  const [copied, setCopied] = useState(false)

  const activeLoan = loans.find((loan) => loan.status === "active") ?? loans[0] ?? null
  const outstanding = loans
    .filter((loan) => loan.status === "active")
    .reduce((sum, loan) => sum + loan.remainingBalance, 0)

  const basic = employee?.salary ?? 0
  const allowanceTotal = (employee?.allowances ?? []).reduce((sum, item) => sum + item.amount, 0)
  const gross = basic + allowanceTotal
  const loanDeduction = activeLoan?.status === "active" ? activeLoan.monthlyDeduction : 0
  const net = Math.max(gross - loanDeduction, 0)

  // Cheap to build each render; the compiler memoizes it.
  const salaryRows = [
      { desc: "Basic Salary", amount: amountText(basic), type: "CREDIT", bold: false },
      ...(employee?.allowances ?? []).map((allowance) => ({
        desc: allowance.title || "Allowance",
        amount: amountText(allowance.amount),
        type: "CREDIT",
        bold: false,
      })),
      { desc: "Gross Pay", amount: amountText(gross), type: "", bold: true },
      ...(loanDeduction
        ? [
            {
              desc: "Loan Repayment",
              amount: amountText(loanDeduction, true),
              type: "DEBIT",
              bold: false,
            },
          ]
        : []),
  ]

  const leaveDaysTaken = leaves
    .filter((leave) => leave.status === "approved")
    .reduce((sum, leave) => sum + leave.totalDays, 0)

  const repaymentProgress = activeLoan?.amount
    ? Math.round(((activeLoan.amount - activeLoan.remainingBalance) / activeLoan.amount) * 100)
    : 0
  const monthsLeft =
    activeLoan?.monthlyDeduction && activeLoan.monthlyDeduction > 0
      ? Math.ceil(activeLoan.remainingBalance / activeLoan.monthlyDeduction)
      : 0

  const bank = employee?.disbursementDetails

  const copyAccount = async () => {
    if (!bank?.accountNumber) return
    try {
      await navigator.clipboard.writeText(bank.accountNumber)
      setCopied(true)
      pushToast("Account number copied", "success")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      pushToast("Could not copy the account number", "error")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Leave Taken"
          value={`${leaveDaysTaken} Days`}
          sub={`${leaves.length} request${leaves.length === 1 ? "" : "s"} on record`}
        />
        <StatCard label="Net Monthly Pay" value={formatNaira(net)} />
        <StatCard
          label="Active Loans"
          value={formatNaira(outstanding)}
          sub="Outstanding Balance"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Salary Breakdown */}
        <SectionCard className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <CardHeading>Salary Breakdown</CardHeading>
            <span className="rounded-full bg-[#111827] px-3 py-1 text-[10px] font-bold text-white">
              MONTHLY
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#EEF1F6]">
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <Th>Item Description</Th>
                  <Th className="text-right">Amount (₦)</Th>
                  <Th>Type</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {salaryRows.map((row) => (
                  <tr key={row.desc}>
                    <Td
                      className={
                        row.bold ? "font-bold text-[#111827]" : "font-semibold text-[#111827]"
                      }
                    >
                      {row.desc}
                    </Td>
                    <Td
                      className={
                        "text-right " + (row.bold ? "font-bold text-[#111827]" : "text-[#4B5563]")
                      }
                    >
                      {row.amount}
                    </Td>
                    <Td>{row.type ? <StatusBadge status={row.type} /> : null}</Td>
                  </tr>
                ))}
                <tr className="bg-[#111827] text-white">
                  <Td className="font-bold text-white">Net Take-Home Pay</Td>
                  <Td className="text-right font-bold text-white">{amountText(net)}</Td>
                  <Td> </Td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-[#9CA3AF]">
            Statutory deductions are applied on the payroll run; this view shows the standing
            salary structure and any loan recovery.
          </p>
        </SectionCard>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Disbursement Info */}
          <SectionCard>
            <CardHeading>Disbursement Info</CardHeading>
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Primary Bank" value={bank?.bankName || "—"} />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Account Number
                </div>
                <div className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-[#111827]">
                  {bank?.accountNumber || "—"}
                  {bank?.accountNumber ? (
                    <button
                      onClick={copyAccount}
                      aria-label="Copy account number"
                      className="text-[#9CA3AF] hover:text-[#3B5BDB]"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
              {bank?.accountNumber ? (
                <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {copied ? "Copied to clipboard" : "Bank details on file"}
                </div>
              ) : (
                <div className="text-[13px] text-[#9CA3AF]">
                  No bank details on file — payroll cannot disburse to this staff member.
                </div>
              )}
            </div>
          </SectionCard>

          {/* Active Loan */}
          <SectionCard>
            <div className="flex items-center justify-between">
              <CardHeading>Active Loan</CardHeading>
              {activeLoan ? (
                <StatusBadge
                  status={statusLabel(LOAN_STATUS_LABELS, activeLoan.status).toUpperCase()}
                />
              ) : null}
            </div>
            {activeLoan ? (
              <div className="mt-4">
                <div className="text-[14px] font-semibold text-[#111827]">
                  {activeLoan.purpose || "Staff loan"}
                </div>
                <div className="text-[12px] text-[#6B7280]">
                  Applied {formatDate(activeLoan.createdAt)}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Field label="Principal" value={formatNaira(activeLoan.amount)} />
                  <Field label="Monthly" value={formatNaira(activeLoan.monthlyDeduction)} />
                </div>
                <div className="mt-4 flex items-center justify-between text-[12px] text-[#6B7280]">
                  <span>Repayment Progress</span>
                  <span className="font-semibold text-[#111827]">{repaymentProgress}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar percent={repaymentProgress} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                  <span>Balance: {formatNaira(activeLoan.remainingBalance)}</span>
                  <span>
                    {monthsLeft} month{monthsLeft === 1 ? "" : "s"} left
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-[#9CA3AF]">No loans on record.</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Personnel documents */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Personnel Documents</CardHeading>
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Document</Th>
                <Th>Type</Th>
                <Th>Filed</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {documents.map((document) => (
                <tr key={document.id}>
                  <Td className="font-semibold text-[#111827]">{document.title}</Td>
                  <Td className="text-[#4B5563]">
                    {statusLabel(DOCUMENT_TYPE_LABELS, document.documentType)}
                  </Td>
                  <Td className="text-[#4B5563]">{formatDate(document.createdAt)}</Td>
                  <Td>
                    <StatusBadge status={String(document.verificationStatus).toUpperCase()} />
                  </Td>
                </tr>
              ))}

              {documents.length === 0 ? (
                <tr>
                  <Td className="text-[#9CA3AF]">No documents filed.</Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
