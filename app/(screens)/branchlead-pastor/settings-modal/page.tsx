"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  LayoutDashboard,
  ShieldCheck,
  User,
  Wallet,
  X,
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="relative min-h-[720px]">
          <div className="flex flex-col lg:flex-row">
            <aside className="w-full lg:w-[220px] border-b lg:border-b-0 lg:border-r border-[#EEF1F6] bg-white px-4 py-5">
              <div className="flex items-center gap-2 pb-5">
                <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
                <div>
                  <div className="text-[12px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
                  <div className="text-[9px] text-[#9CA3AF]">Lead Pastor View</div>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { label: "Dashboard", icon: LayoutDashboard },
                  { label: "Settings", icon: User, active: true },
                  { label: "Budget", icon: Wallet },
                  { label: "Compliance", icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-[11px] ${
                        item.active ? "bg-[#E9EEFF] text-[#3B5BDB] font-medium" : "text-[#6B7280]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  )}
                )}
              </nav>

              <div className="mt-6 space-y-2 text-[10px] text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Help Center
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 pt-4">
                <div className="h-7 w-7 rounded-full overflow-hidden bg-[#E8EDFF]">
                  <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Alex" width={28} height={28} className="h-full w-full object-cover" />
                </div>
                <div className="text-[9px]">
                  <div className="font-semibold text-[#111827]">Alex Morgan</div>
                  <div className="text-[#9CA3AF]">Lead Pastor</div>
                </div>
              </div>
            </aside>

            <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#9CA3AF]">Dashboard</div>
                  <h1 className="text-[14px] font-semibold text-[#111827]">User Settings</h1>
                  <p className="text-[9px] text-[#9CA3AF]">Manage personal details, roles, and permission settings.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    Save Changes
                  </Button>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-[#EEF2FF]">
                      <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Alex" width={40} height={40} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[#111827]">Alex Mercer</div>
                      <div className="text-[8px] text-[#9CA3AF]">Lead Pastor • Branch: Lagos, NG</div>
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
                    <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="334122" readOnly />
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

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-[#EEF1F6] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
              <div className="text-[11px] font-semibold text-[#111827]">Change Password</div>
              <div className="h-6 w-6 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                <X className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 text-[9px] text-[#6B7280]">
              <div className="space-y-1">
                <div>Old Password</div>
                <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="Enter old password" />
              </div>
              <div className="space-y-1">
                <div>New Password</div>
                <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="Enter new password" />
              </div>
              <div className="space-y-1">
                <div>Confirm Password</div>
                <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="Confirm new password" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#EEF1F6] px-4 py-3">
              <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                Cancel
              </Button>
              <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
