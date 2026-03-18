"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  FolderKanban,
  Info,
  Layers,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"

const budgetStreams = [
  {
    code: "OP",
    tone: "bg-[#E9EEFF] text-[#3B5BDB]",
    title: "Operational Budget",
    desc: "Recurring administrative and utility costs",
    tags: ["Staffing", "Utilities", "Rent"],
    addHeadPlacement: "bottom",
  },
  {
    code: "PR",
    tone: "bg-[#F3E8FF] text-[#7C3AED]",
    title: "Program Budget",
    desc: "Events, outreach, and training initiatives",
    tags: ["Events", "Outreach", "Training"],
    addHeadPlacement: "bottom",
  },
  {
    code: "CP",
    tone: "bg-[#FFF1E7] text-[#F97316]",
    title: "Capital Budget",
    desc: "Long-term assets, equipment and building",
    tags: ["Equipment", "Vehicles"],
    addHeadPlacement: "inline",
  },
]

const sideItems = [
  { label: "Budget", active: true },
  { label: "Overview" },
  { label: "Departmental" },
  { label: "Audit Logs" },
  { label: "Permissions" },
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
                <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">
                  Global Configuration
                </div>
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
                      <Settings className="h-3.5 w-3.5" />
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
                  Global Budget Configuration
                </h2>
                <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                  Define organization-wide budget streams, tolerance policies, and temporal cycles.
                </p>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <FolderKanban className="h-4 w-4 text-[#3B5BDB]" />
                    Budget Streams &amp; Categories
                  </div>
                  <button className="text-[14.86px] leading-[21.23px] font-bold text-center text-[#3B5BDB]">
                    + Add Stream
                  </button>
                </div>

                <div className="divide-y divide-[#EEF1F6]">
                  {budgetStreams.map((stream) => (
                    <div key={stream.code}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-[10px] ${stream.tone} text-[12.74px] leading-[16.98px] font-semibold`}
                          >
                            {stream.code}
                          </div>
                          <div>
                            <div className="text-[19.11px] leading-[29.72px] font-bold text-[#111827]">
                              {stream.title}
                            </div>
                            <div className="text-[12.74px] leading-[16.98px] font-normal text-[#9CA3AF]">
                              {stream.desc}
                            </div>
                          </div>
                        </div>

                      <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {stream.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[12.74px] leading-[16.98px] font-semibold text-[#6B7280]"
                            >
                              {tag}
                              <span className="text-[#9CA3AF]">×</span>
                            </span>
                          ))}
                          {stream.addHeadPlacement === "inline" ? (
                            <button className="flex items-center gap-1 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-1 text-[12.74px] leading-[16.98px] font-semibold text-[#3B5BDB]">
                              <Plus className="h-3 w-3" />
                              Add Head
                            </button>
                          ) : null}
                        </div>
                        {stream.addHeadPlacement === "bottom" ? (
                          <button className="flex items-center gap-1 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-1 text-[12.74px] leading-[16.98px] font-semibold text-[#3B5BDB]">
                            <Plus className="h-3 w-3" />
                            Add Head
                          </button>
                        ) : null}
                      </div>
                    </div>

                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[19.11px] leading-[29.72px] font-bold text-[#111827]">
                    <SlidersHorizontal className="h-4 w-4 text-[#3B5BDB]" />
                    Variation Tolerance
                  </div>
                  <div className="mt-3 text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                    Global Tolerance Flex
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Input className="h-8 w-16 rounded-[10px] border-[#E5E7EB] text-[12.74px] leading-[16.98px]" value="5.0" readOnly />
                    <span className="text-[14.86px] leading-[21.23px] font-bold text-[#9CA3AF]">%</span>
                  </div>
                  <div className="mt-2 text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                    Allowed spending above budget before restriction.
                  </div>
                  <div className="mt-4 text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                    Enforcement Action
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="rounded-[10px] border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold text-[#3B5BDB]">
                      Soft Warning
                    </button>
                    <button className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold text-[#6B7280]">
                      Hard Block
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[19.11px] leading-[29.72px] font-bold text-[#111827]">
                    <Calendar className="h-4 w-4 text-[#3B5BDB]" />
                    Time Segmentation
                  </div>
                  <div className="mt-3 text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">
                    Reporting Interval
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start gap-2 rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-3">
                      <div className="mt-0.5 h-3.5 w-3.5 rounded-full border border-[#3B5BDB] bg-[#3B5BDB]" />
                      <div>
                        <div className="text-[12.74px] leading-[16.98px] font-semibold text-[#1E3A8A]">
                          Monthly Defaults
                        </div>
                        <div className="text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">
                          12 budgeting cycles per year
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                      <div className="mt-0.5 h-3.5 w-3.5 rounded-full border border-[#D1D5DB] bg-white" />
                      <div>
                        <div className="text-[12.74px] leading-[16.98px] font-semibold text-[#111827]">
                          Quarterly Defaults
                        </div>
                        <div className="text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">
                          4 budgeting cycles per year
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[19.11px] leading-[29.72px] font-bold text-[#111827]">
                  <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                  Default Thresholds (?)
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                      Min. Approval Level 1
                    </div>
                    <Input className="h-8 rounded-[10px] border-[#E5E7EB] text-[14.86px] leading-[21.23px] font-semibold" value="? 50,000" readOnly />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                      Petty Cash Limit
                    </div>
                    <Input className="h-8 rounded-[10px] border-[#E5E7EB] text-[14.86px] leading-[21.23px] font-semibold" value="? 15,000" readOnly />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                      Audit Trigger
                    </div>
                    <Input className="h-8 rounded-[10px] border-[#E5E7EB] text-[14.86px] leading-[21.23px] font-semibold" value="? 500,000" readOnly />
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
                  <Button variant="outline" size="sm">
                    Reset Defaults
                  </Button>
                  <Button size="sm">Save All Configuration</Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
