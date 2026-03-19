"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Car,
  Download,
  FileText,
  Info,
  Layers,
  Landmark,
  Monitor,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Building2,
} from "lucide-react"

const sideItems = [
  { label: "Budget" },
  { label: "Asset", active: true },
  { label: "Departmental" },
  { label: "Audit Logs" },
  { label: "Permissions" },
]

const assetClasses = [
  {
    name: "Land",
    icon: Landmark,
    method: "Non-Depreciable",
    life: "--",
    salvage: "100%",
  },
  {
    name: "Building",
    icon: Building2,
    method: "Straight Line",
    life: "50",
    salvage: "10%",
  },
  {
    name: "Motor Vehicle",
    icon: Car,
    method: "Reducing Balance",
    life: "7",
    salvage: "15%",
  },
  {
    name: "IT Equipment",
    icon: Monitor,
    method: "Straight Line",
    life: "3",
    salvage: "5%",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[12.74px] leading-[16.98px] font-bold uppercase tracking-[1.27px] text-[#9CA3AF]">
                  SUPER ADMIN
                </div>
                <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">Global Configuration</div>
                <div className="mt-3 space-y-1">
                  {sideItems.map((item) => (
                    <button
                      key={item.label}
                      className={`flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-[14.86px] leading-[21.23px] ${
                        item.active
                          ? "bg-[#E9EEFF] text-[#3B5BDB] font-bold"
                          : "text-[#6B7280] font-medium hover:bg-[#F3F5F9]"
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium text-[#2563EB]">
                  <Info className="h-3.5 w-3.5" />
                  Director&apos;s Note
                </div>
                <p className="mt-2 text-[9px] text-[#6B7280]">
                  These settings are global. Changes here affect all department budgets and fiscal cycles immediately.
                </p>
              </div>
            </aside>

            <section className="space-y-6">
              <div>
                <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                  Global Asset Policy Config
                </h2>
                <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                  Define organization-wide depreciation standards, life expectancy, and disposal rules.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <FileText className="h-4 w-4 text-[#3B5BDB]" />
                    Disposal Approval
                  </div>
                  <p className="mt-2 text-[12.74px] leading-[16.98px] font-normal text-[#9CA3AF]">
                    Require head-office (Director) sign-off for all asset disposals exceeding ?5,000.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">Centralized Status</div>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#3B5BDB]" />
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <SlidersHorizontal className="h-4 w-4 text-[#3B5BDB]" />
                    Global Salvage Value %
                  </div>
                  <p className="mt-2 text-[12.74px] leading-[16.98px] font-normal text-[#9CA3AF]">
                    Set the default estimated percentage of value remaining at the end of useful life.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Input className="h-8 w-16 rounded-[10px] border-[#E5E7EB] text-[14.86px] leading-[21.23px] font-semibold" value="10" readOnly />
                    <span className="text-[14.86px] leading-[21.23px] font-bold text-[#9CA3AF]">%</span>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                    Last Policy Review
                  </div>
                  <p className="mt-2 text-[12.74px] leading-[16.98px] font-normal text-[#9CA3AF]">
                    The last comprehensive review of asset life expectancy was performed on:
                  </p>
                  <div className="mt-3 text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">October 14, 2023</div>
                  <div className="text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">MODIFIED BY J. ANDERSON (DIRECTOR)</div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="text-[16.98px] leading-[25.48px] font-bold text-[#111827]">Asset Class Defaults</div>
                  <button className="text-[14.86px] leading-[21.23px] font-bold text-[#3B5BDB]">+ Add New Class</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12.74px] leading-[16.98px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-3 px-4 text-left">ASSET CLASS</th>
                        <th className="py-3 px-4 text-left">DEPRECIATION METHOD</th>
                        <th className="py-3 px-4 text-left">USEFUL LIFE (YRS)</th>
                        <th className="py-3 px-4 text-left">SALVAGE VALUE</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetClasses.map((item) => (
                        <tr key={item.name} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-[8px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center">
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">{item.name}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[12.74px] leading-[16.98px] text-[#6B7280]"
                            >
                              {item.method}
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                          <td className="py-3 px-4 text-[#6B7280]">{item.life}</td>
                          <td className="py-3 px-4 text-[#6B7280]">{item.salvage}</td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-[12.74px] leading-[16.98px] font-semibold text-[#3B5BDB]">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
                  <div>
                    <div className="text-[12.74px] leading-[16.98px] font-semibold text-[#92400E]">Global Configuration Warning</div>
                    <p className="mt-1 text-[11.68px] leading-[14.6px] font-normal text-[#A16207]">
                      Updating these policies will re-calculate the expected net book values for all current assets in the next financial reporting cycle. Ensure you have Board approval before committing these changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[12.74px] leading-[16.98px] italic font-normal text-[#9CA3AF]">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3 w-3" />
                    Last updated by Director Adewale on Oct 24, 2026
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[12.74px] leading-[16.98px] text-[#6B7280]"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[12.74px] leading-[16.98px] text-white">
                    Save All Configuration
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
