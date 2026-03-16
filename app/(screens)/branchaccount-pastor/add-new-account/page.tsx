"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Plus, X } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="relative min-h-[720px]">
          <div className="flex flex-col lg:flex-row">
            <BranchAccountantSidebar activeHref="/branchaccount-pastor/budget" />

            <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
              <BranchAccountantHeader title="Accounts" subtitle="Manage chart of accounts and categories." />

              <div className="mt-6 rounded-[12px] border border-dashed border-[#E5E7EB] bg-white p-6 text-[11px] text-[#9CA3AF]">
                Accounts table content
              </div>
            </main>
          </div>

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-[#EEF1F6] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
              <div className="text-[11px] font-semibold text-[#111827]">Add New Account</div>
              <div className="h-6 w-6 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                <X className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 text-[9px] text-[#6B7280]">
              <div className="space-y-1">
                <div>Account Name</div>
                <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="e.g., Offering Income" />
              </div>
              <div className="space-y-1">
                <div>Account Type</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                >
                  Income
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div>Account Code</div>
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="4001" />
                </div>
                <div className="space-y-1">
                  <div>Currency</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    NGN
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <div>Description</div>
                <Input className="h-16 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="Optional description" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#EEF1F6] px-4 py-3">
              <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                Cancel
              </Button>
              <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                <Plus className="h-3.5 w-3.5" />
                Save Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
