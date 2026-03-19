"use client"

import UserDirectoryMenuPage from "@/app/(screens)/director-screen/user-directory-menu/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  ChevronDown,
  Mail,
  UserRound,
  X,
} from "lucide-react"

const labelText = "text-[9.33px] leading-[13.33px] font-medium"
const inputText = "text-[12px] leading-[16px]"

export default function Page() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] font-sans">
      <div className="pointer-events-none select-none">
        <div className="scale-[1.08] origin-top-left blur-[4px] brightness-[0.95] opacity-65">
          <UserDirectoryMenuPage />
        </div>
      </div>

      <div className="absolute inset-0 flex items-start justify-end px-6 py-6 md:px-10">
        <div className="w-full max-w-[320px] rounded-[12px] border border-[#E5E7EB] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
            <div className="text-[12px] leading-[18.67px] font-bold text-[#111827]">Invite New User</div>
            <button className="text-[#9CA3AF]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Full Name</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  className={`${inputText} h-9 rounded-md border-[#E5E7EB] bg-white pl-9 text-[#111827]`}
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  className={`${inputText} h-9 rounded-md border-[#E5E7EB] bg-white pl-9 text-[#111827]`}
                  placeholder="e.g. john@shepherdwatch.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Primary Role</label>
              <button className="flex h-9 w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3 text-[10.67px] leading-[16px] font-normal text-[#9CA3AF]">
                Select a role...
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className={`${labelText} text-[#6B7280]`}>Branch Assignment</label>
              <div className="relative">
                <Input
                  className={`${inputText} h-9 rounded-md border-[#E5E7EB] bg-white pr-10 text-[#111827]`}
                  defaultValue="London HQ"
                />
                <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
              <div className="text-[10px] text-[#9CA3AF]">User will access data only from assigned branches.</div>
            </div>
          </div>

          <div className="border-t border-[#EEF1F6] px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.63px] leading-[14.17px] text-[#6B7280]">Send invitation Email immediately</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B5BDB]" />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" className="h-8 rounded-md border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">
                Cancel
              </Button>
              <Button className="h-8 rounded-md bg-[#3B5BDB] text-[11px] text-white shadow hover:bg-blue-700">
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
