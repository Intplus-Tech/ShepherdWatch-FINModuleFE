"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Percent, Plus, X } from "lucide-react"

type DeductionRow = {
  id: string
  type: string
  branchType: "Pioneer" | "Growing" | "Established"
  percentage: string
  active: boolean
}

const INITIAL_ROWS: DeductionRow[] = [
  { id: "tithe-pioneer", type: "Tithe Remittance to HQ", branchType: "Pioneer", percentage: "20", active: true },
  { id: "tithe-growing", type: "Tithe Remittance to HQ", branchType: "Growing", percentage: "20", active: true },
  { id: "tithe-established", type: "Tithe Remittance to HQ", branchType: "Established", percentage: "20", active: true },
  { id: "capital-pioneer", type: "Capital Savings (HQ)", branchType: "Pioneer", percentage: "20", active: true },
  { id: "capital-growing", type: "Capital Savings (HQ)", branchType: "Growing", percentage: "20", active: true },
  { id: "capital-established", type: "Capital Savings (HQ)", branchType: "Established", percentage: "20", active: true },
  { id: "general-pioneer", type: "General Savings", branchType: "Pioneer", percentage: "20", active: true },
  { id: "general-growing", type: "General Savings", branchType: "Growing", percentage: "20", active: true },
  { id: "general-established", type: "General Savings", branchType: "Established", percentage: "20", active: false },
]

export default function Page() {
  const router = useRouter()
  const [rows, setRows] = useState<DeductionRow[]>(INITIAL_ROWS)

  const close = () => router.push("/director-screen/settings-statutory")

  const updateRow = (id: string, patch: Partial<DeductionRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  return (
    <div className="min-h-screen bg-[#EAF1FB] font-sans">
      {/* Modal chrome bar */}
      <div className="h-9 w-full bg-[#1F2937]" />

      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="overflow-hidden rounded-[12px] border border-[#EEF1F6] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-4">
            <h1 className="text-[18px] font-bold text-[#111827]">
              EDIT DNA (Statutory Deductions &amp; Savings)
            </h1>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">
            {/* Director's note banner */}
            <div className="rounded-[8px] bg-[#F97316] px-4 py-2.5 text-[12px] font-semibold text-black">
              Director&apos;s Note: These settings are global. Changes here affect ALL 142 branches
              immediately. New percentages take effect next billing cycle.
            </div>

            {/* Section header */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
                <Percent className="h-4 w-4 " />
                STATUTORY DEDUCTIONS (HQ Remittance)
              </div>
              <button
                type="button"
                onClick={() =>
                  setRows((prev) => [
                    ...prev,
                    {
                      id: `custom-${Date.now()}`,
                      type: "New Deduction",
                      branchType: "Pioneer",
                      percentage: "0",
                      active: false,
                    },
                  ])
                }
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#3B5BDB] hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add New Deduction Rule
              </button>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#EEF1F6] text-[11px] font-semibold text-[#9CA3AF]">
                    <th className="py-2 pr-3 font-medium">Deduction Type</th>
                    <th className="py-2 pr-3 font-medium">Branch Type</th>
                    <th className="py-2 pr-3 font-medium text-[#3B5BDB]">Percentage (%)</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F3F5F9] text-[13px] text-[#374151]"
                    >
                      <td className="py-3 pr-3 font-medium text-[#111827]">{row.type}</td>
                      <td className="py-3 pr-3 text-[#9CA3AF]">{row.branchType}</td>
                      <td className="py-3 pr-3">
                        <div className="relative inline-flex w-24 items-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.percentage}
                            onChange={(e) => updateRow(row.id, { percentage: e.target.value })}
                            aria-label={`${row.type} ${row.branchType} percentage`}
                            className="h-8 w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-2 pr-7 text-[13px] font-semibold text-[#3B5BDB]"
                          />
                          <span className="pointer-events-none absolute right-2 text-[11px] font-semibold text-[#9CA3AF]">
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <Switch
                          checked={row.active}
                          onCheckedChange={(checked) => updateRow(row.id, { active: checked })}
                          className="data-[state=checked]:bg-[#16A34A] data-[state=unchecked]:bg-[#E5E7EB]"
                        />
                      </td>
                      <td className="py-3 pr-3 text-right">
                        {row.active ? (
                          <span className="inline-flex rounded-full bg-[#16A34A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#EF4444] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 border-t border-[#EEF1F6] px-6 py-4">
            <button
              type="button"
              onClick={close}
              className="text-[14px] font-semibold text-[#6B7280] hover:text-[#374151]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#3B5BDB] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#2C46B4]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
