"use client"

import { Plus, SlidersHorizontal, Download, Eye } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  Field,
  ProgressBar,
  StatusBadge,
  Th,
  Td,
  btnPrimary,
} from "./shared"

const HISTORY = [
  {
    id: "LN-2024-0012",
    type: "Emergency Personal Loan",
    amount: "₦5,000.00",
    date: "May 12, 2024",
    status: "PENDING APPROVAL",
  },
  {
    id: "LN-2023-0881",
    type: "Staff Housing Loan",
    amount: "₦145,000.00",
    date: "Jan 02, 2023",
    status: "DISBURSED",
  },
  {
    id: "LN-2022-0450",
    type: "Professional Development Grant",
    amount: "₦2,500.00",
    date: "Oct 15, 2022",
    status: "COMPLETED",
  },
  {
    id: "LN-2021-0112",
    type: "Vehicle Asset Advance",
    amount: "₦32,000.00",
    date: "Mar 10, 2021",
    status: "ACTIVE",
  },
  {
    id: "LN-2020-0988",
    type: "Relocation Stipend",
    amount: "₦4,000.00",
    date: "Nov 22, 2020",
    status: "REJECTED",
  },
]

export default function LoansTab({
  onNewLoan,
  onViewLoan,
}: {
  onNewLoan: () => void
  onViewLoan: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Active Loan Summary */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* White card */}
        <SectionCard>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardHeading>Staff Housing Loan</CardHeading>
              <div className="mt-0.5 text-[12px] text-[#6B7280]">
                Ref: HL-2023-0881
              </div>
            </div>
            <StatusBadge status="LONG TERM" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            <Field label="Principal" value="₦145,000.00" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Outstanding
              </div>
              <div className="mt-1 text-[14px] font-semibold text-rose-600">
                ₦112,450.20
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Repaid
              </div>
              <div className="mt-1 text-[14px] font-semibold text-emerald-600">
                22.4%
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar percent={22.4} tone="emerald" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-[#6B7280]">
            <span>Disbursed: Jan 15, 2023</span>
            <span>Maturity: Jan 15, 2033</span>
          </div>
        </SectionCard>

        {/* Dark card */}
        <div className="rounded-xl bg-[#111827] p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[16px] font-bold">Vehicle Asset Advance</div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              ACTIVE
            </span>
          </div>
          <div className="mt-6">
            <div className="text-[11px] text-white/60">Monthly Deduction</div>
            <div className="text-[18px] font-bold">₦1,200.00</div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-white/60">Interest Rate</div>
              <div className="text-[14px] font-semibold">4.5% Fixed</div>
            </div>
            <div>
              <div className="text-[11px] text-white/60">
                Installments Remaining
              </div>
              <div className="text-[14px] font-semibold">14 of 48</div>
            </div>
          </div>
        </div>
      </div>

      {/* New loan button */}
      <div className="flex justify-end">
        <button className={btnPrimary} onClick={onNewLoan}>
          <Plus className="h-4 w-4" />
          New Loan Application
        </button>
      </div>

      {/* Loan Application History */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Loan Application History</CardHeading>
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <button aria-label="Filter" className="hover:text-[#3B5BDB]">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button aria-label="Download" className="hover:text-[#3B5BDB]">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Loan ID</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Applied Date</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {HISTORY.map((row) => (
                <tr key={row.id}>
                  <Td className="font-semibold text-[#111827]">{row.id}</Td>
                  <Td className="text-[#4B5563]">{row.type}</Td>
                  <Td className="text-[#4B5563]">{row.amount}</Td>
                  <Td className="text-[#4B5563]">{row.date}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <button
                      onClick={onViewLoan}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3B5BDB] hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-5 py-3">
          <span className="text-[12px] text-[#6B7280]">
            Showing 5 of 12 records
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]">
              Previous
            </button>
            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]">
              Next
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
