"use client"

import BranchManagementPage from "@/app/(screens)/director-screen/branch-management/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building, ChevronDown, Percent, Search, X } from "lucide-react"

const labelText = "text-[9.33px] leading-[16px] font-semibold text-[#111827]"
const helpText = "text-[9.33px] leading-[16px] font-normal text-[#111827]"
const titleText = "text-[9.33px] leading-[16px] font-semibold text-[#111827]"
const inputText = "text-[9.33px] leading-[9.33px] font-normal text-[#111827] placeholder:text-[9.33px] placeholder:leading-[9.33px] placeholder:font-normal placeholder:text-[#9CA3AF]"
const buttonText = "text-[9.33px] leading-[16px] font-semibold"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Background (Branch Management) */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="origin-top scale-[1.08]">
          <BranchManagementPage />
        </div>
        <div className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-[3px]" />
      </div>

      {/* Modal */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-[448px] h-[450px] rounded-[8px] border border-[#E5E7EB] border-[0.67px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] flex flex-col">
          <div className="flex items-start justify-between px-4 pt-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#E9EEFF] text-[#3B5BDB]">
                <Building className="h-4 w-4" />
              </div>
              <div>
                <div className={titleText}>New Branch Onboarding</div>
                <div className={`${helpText} mt-0.5`}>Initiate a new branch entry in the registry.</div>
              </div>
            </div>
            <button className="h-6 w-6 rounded-full border border-[#E5E7EB] border-[0.67px] text-[#9CA3AF] flex items-center justify-center">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-4 pb-3 pt-2 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className={labelText}>Branch Name</div>
                <Input className={`h-7 rounded-[8px] border-[#E5E7EB] ${inputText}`} placeholder="e.g. Divine Grace Sanctuary" />
              </div>
              <div className="space-y-1">
                <div className={labelText}>Assigned Lead Pastor</div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input className={`h-7 rounded-[8px] border-[#E5E7EB] pl-7 ${inputText}`} placeholder="Search director..." />
                </div>
              </div>
              <div className="space-y-1 col-start-2">
                <div className={labelText}>Assigned Accountant</div>
                <Input className={`h-7 rounded-[8px] border-[#E5E7EB] ${inputText}`} placeholder="Enter name of the suggested Accountant" />
              </div>
              <div className="space-y-1">
                <div className={labelText}>Region</div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[#111827] ${buttonText}`}
                >
                  Select a region
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <div className={labelText}>Currency</div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[#111827] ${buttonText}`}
                >
                  Naira (NGN)
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mt-3 rounded-[10px] border border-[#EEF2FF] bg-[#F7F9FF] p-3">
              <div className={`flex items-center gap-2 ${titleText} text-[#3B5BDB]`}>
                <Percent className="h-3.5 w-3.5" />
                Mandatory Statutory Deductions
              </div>
              <p className={`${helpText} mt-1`}>Select the most appropriate tax to this branch.</p>
              <Button
                variant="outline"
                size="sm"
                className={`mt-2 h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[#111827] ${buttonText}`}
              >
                Growing
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[#111827] ${buttonText}`}
              >
                Cancel
              </Button>
              <Button size="sm" className={`h-7 rounded-[8px] bg-[#3B5BDB] text-white ${buttonText}`}>
                Create Branch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

