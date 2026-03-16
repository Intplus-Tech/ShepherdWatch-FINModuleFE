"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/settings" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="User Settings"
              subtitle="Manage personal details, roles, and organizational templates."
              rightSlot={
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  Save Changes
                </Button>
              }
            />

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-[#EEF2FF]">
                    <img src="/images/Beared%20Guy02-min%201.jpg" alt="Alex" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#111827]">Alex Mercer</div>
                    <div className="text-[8px] text-[#9CA3AF]">Accountant • Branch: Lagos, NG</div>
                    <div className="text-[8px] text-[#9CA3AF]">ID: 3341223</div>
                  </div>
                </div>
                <button className="text-[9px] text-[#3B5BDB]">Change Password</button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[9px] text-[#6B7280]">Full Name</div>
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="Alex Mercer" readOnly />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-[#6B7280]">Employee ID</div>
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="834271" readOnly />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-[#6B7280]">Work Email</div>
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="alex.mercer@shepherdwatch.co" readOnly />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-[#6B7280]">Phone Number</div>
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="+234 701 987 3456" readOnly />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
