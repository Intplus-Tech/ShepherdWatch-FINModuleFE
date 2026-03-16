"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  ChevronDown,
  Download,
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
    title: "Operational Budget",
    desc: "Recurring administrative and utility costs",
    tags: ["Staffing", "Utilities", "Rent"],
  },
  {
    code: "PR",
    title: "Program Budget",
    desc: "Events, outreach, and training initiatives",
    tags: ["Events", "Outreach", "Training"],
  },
  {
    code: "CP",
    title: "Capital Budget",
    desc: "Long-term assets, equipment and building",
    tags: ["Equipment", "Vehicles"],
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
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/settings" className="border-0 border-r border-[#EEF1F6]" />

          <main className="flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <ScreenHeader
              title="Financial Overview"
              subtitle="Global financial health monitoring"
              rightSlot={
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                  >
                    All Branches
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                  >
                    This Month
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white p-0.5 text-[9px] text-[#6B7280]">
                    <button className="rounded-[8px] bg-[#E9EEFF] px-2 py-1 text-[#3B5BDB]">NGN</button>
                    <button className="rounded-[8px] px-2 py-1 text-[#6B7280]">USD</button>
                    <button className="rounded-[8px] px-2 py-1 text-[#6B7280]">EUR</button>
                  </div>
                  <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[10px] text-white">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </div>
              }
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
              <aside className="space-y-4">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[9px] text-[#9CA3AF]">SUPER ADMIN</div>
                  <div className="text-[12px] font-semibold text-[#111827]">Global Configuration</div>
                  <div className="mt-3 space-y-1">
                    {sideItems.map((item) => (
                      <button
                        key={item.label}
                        className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-[10px] ${
                          item.active
                            ? "bg-[#E9EEFF] text-[#3B5BDB]"
                            : "text-[#6B7280] hover:bg-[#F3F5F9]"
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
                    Director's Note
                  </div>
                  <p className="mt-2 text-[9px] text-[#6B7280]">
                    These settings are global. Changes here affect all department budgets and fiscal cycles immediately.
                  </p>
                </div>
              </aside>

              <section className="space-y-5">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#111827]">Global Budget Configuration</h2>
                  <p className="text-[10px] text-[#9CA3AF]">
                    Define organization-wide budget streams, tolerance policies, and temporal cycles.
                  </p>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                  <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#111827]">
                      <FolderKanban className="h-4 w-4 text-[#3B5BDB]" />
                      Budget Streams &amp; Categories
                    </div>
                    <button className="text-[9px] text-[#3B5BDB]">+ Add Stream</button>
                  </div>
                  <div className="divide-y divide-[#EEF1F6]">
                    {budgetStreams.map((stream) => (
                      <div key={stream.title} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[9px] font-semibold text-[#3B5BDB]">
                            {stream.code}
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold text-[#111827]">{stream.title}</div>
                            <div className="text-[9px] text-[#9CA3AF]">{stream.desc}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {stream.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[8px] text-[#6B7280]"
                            >
                              {tag}
                            </span>
                          ))}
                          <button className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[8px] text-[#3B5BDB]">
                            + Add Head
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#111827]">
                      <SlidersHorizontal className="h-4 w-4 text-[#3B5BDB]" />
                      Variation Tolerance
                    </div>
                    <div className="mt-3 text-[9px] text-[#6B7280]">Global Tolerance Flex</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input className="h-7 w-14 rounded-[8px] border-[#E5E7EB] text-[9px]" value="5.0" readOnly />
                      <span className="text-[9px] text-[#9CA3AF]">%</span>
                    </div>
                    <div className="mt-2 text-[8px] text-[#9CA3AF]">Allowed spending above budget before restriction.</div>
                    <div className="mt-4 text-[9px] text-[#6B7280]">Enforcement Action</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-1 text-[9px] text-[#3B5BDB]">Soft Warning</button>
                      <button className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[9px] text-[#6B7280]">Hard Block</button>
                    </div>
                  </div>

                  <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#111827]">
                      <Calendar className="h-4 w-4 text-[#3B5BDB]" />
                      Time Segmentation
                    </div>
                    <div className="mt-3 text-[9px] text-[#6B7280]">Reporting Interval</div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-start gap-2 rounded-[10px] border border-[#DBEAFE] bg-[#F0F7FF] p-2">
                        <div className="mt-0.5 h-3 w-3 rounded-full border border-[#3B5BDB] bg-[#3B5BDB]" />
                        <div>
                          <div className="text-[9px] font-semibold text-[#1E3A8A]">Monthly Defaults</div>
                          <div className="text-[8px] text-[#6B7280]">12 budgeting cycles per year</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-[10px] border border-[#EEF1F6] bg-white p-2">
                        <div className="mt-0.5 h-3 w-3 rounded-full border border-[#D1D5DB] bg-white" />
                        <div>
                          <div className="text-[9px] font-semibold text-[#111827]">Quarterly Defaults</div>
                          <div className="text-[8px] text-[#6B7280]">4 budgeting cycles per year</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#111827]">
                    <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                    Default Thresholds (?)
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <div className="text-[9px] text-[#6B7280]">Min. Approval Level 1</div>
                      <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="? 50,000" readOnly />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-[#6B7280]">Petty Cash Limit</div>
                      <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="? 15,000" readOnly />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-[#6B7280]">Audit Trigger</div>
                      <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="? 500,000" readOnly />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[9px] text-[#9CA3AF]">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3 w-3" />
                      Last updated by Director Adewale on Oct 24, 2026
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      Reset Defaults
                    </Button>
                    <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[10px] text-white">
                      Save All Configuration
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
