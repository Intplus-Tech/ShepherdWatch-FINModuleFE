"use client"

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

const SALARY_ROWS = [
  { desc: "Basic Salary", amount: "450,000.00", type: "CREDIT" },
  { desc: "Monthly Allowance", amount: "50,000.00", type: "CREDIT" },
  { desc: "Gross Pay", amount: "500,000.00", type: "", bold: true },
  { desc: "Pension (Contribution)", amount: "(36,000.00)", type: "DEBIT" },
  { desc: "PAYE Tax", amount: "(22,500.00)", type: "DEBIT" },
]

const ASSETS = [
  {
    name: "HP Laptop X15",
    serial: "HP-8890-SM",
    date: "05 Jan 2020",
    status: "ASSIGNED",
  },
  {
    name: "Ergonomic Desk Chair",
    serial: "OFF-CH-201",
    date: "12 Jan 2020",
    status: "ASSIGNED",
  },
  {
    name: "Employee ID Card",
    serial: "SW-00532",
    date: "02 Jan 2020",
    status: "ACTIVE",
  },
]

export default function PayrollTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Leave Balance"
          value="12 Annual Days"
          sub="3 Sick Days Remaining"
        />
        <StatCard label="Net Monthly Pay" value="₦441,500" />
        <StatCard
          label="Active Loans"
          value="₦180,000"
          sub="Outstanding Balance"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Salary Breakdown */}
        <SectionCard className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <CardHeading>Salary Breakdown</CardHeading>
            <span className="rounded-full bg-[#111827] px-3 py-1 text-[10px] font-bold text-white">
              CURRENT PLAN: FY2024 V2
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
                {SALARY_ROWS.map((row) => (
                  <tr key={row.desc}>
                    <Td
                      className={
                        row.bold
                          ? "font-bold text-[#111827]"
                          : "font-semibold text-[#111827]"
                      }
                    >
                      {row.desc}
                    </Td>
                    <Td
                      className={
                        "text-right " +
                        (row.bold
                          ? "font-bold text-[#111827]"
                          : "text-[#4B5563]")
                      }
                    >
                      {row.amount}
                    </Td>
                    <Td>{row.type ? <StatusBadge status={row.type} /> : null}</Td>
                  </tr>
                ))}
                <tr className="bg-[#111827] text-white">
                  <Td className="font-bold text-white">Net Take-Home Pay</Td>
                  <Td className="text-right font-bold text-white">441,500.00</Td>
                  <Td> </Td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Disbursement Info */}
          <SectionCard>
            <CardHeading>Disbursement Info</CardHeading>
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Primary Bank" value="Access Bank PLC" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Account Number
                </div>
                <div className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-[#111827]">
                  0012345678
                  <button
                    aria-label="Copy account number"
                    className="text-[#9CA3AF] hover:text-[#3B5BDB]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Direct Deposit Verified
              </div>
            </div>
          </SectionCard>

          {/* Active Loan */}
          <SectionCard>
            <div className="flex items-center justify-between">
              <CardHeading>Active Loan</CardHeading>
              <StatusBadge status="IN PROGRESS" />
            </div>
            <div className="mt-4">
              <div className="text-[14px] font-semibold text-[#111827]">
                Staff Car Loan
              </div>
              <div className="text-[12px] text-[#6B7280]">
                Facility ID: LON-2023-042
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Field label="Principal" value="₦1,500,000" />
                <Field label="Monthly" value="₦15,000" />
              </div>
              <div className="mt-4 flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>Repayment Progress</span>
                <span className="font-semibold text-[#111827]">88%</span>
              </div>
              <div className="mt-2">
                <ProgressBar percent={88} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>Balance: ₦180,000</span>
                <span>12 months left</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Assets Allocated */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Assets Allocated</CardHeading>
          <button className="text-[13px] font-semibold text-[#3B5BDB] hover:underline">
            View History
          </button>
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Asset Name</Th>
                <Th>Serial No.</Th>
                <Th>Date Issued</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {ASSETS.map((a) => (
                <tr key={a.serial}>
                  <Td className="font-semibold text-[#111827]">{a.name}</Td>
                  <Td className="text-[#4B5563]">{a.serial}</Td>
                  <Td className="text-[#4B5563]">{a.date}</Td>
                  <Td>
                    <StatusBadge status={a.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
