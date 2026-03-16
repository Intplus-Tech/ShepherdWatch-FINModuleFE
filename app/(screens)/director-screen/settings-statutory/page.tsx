"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  Download,
  Info,
  Layers,
  PenSquare,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"

const sideItems = [
  { label: "Budget" },
  { label: "Asset" },
  { label: "Statutory & Savings DNA", active: true },
  { label: "Audit Logs" },
  { label: "Permissions" },
]

const dnaCards = [
  {
    title: "HQ TITHES",
    value: "10%",
    status: "Active",
    statusTone: "bg-[#E0F2FE] text-[#0284C7]",
    accent: "bg-[#3B5BDB]",
    icon: Wallet,
  },
  {
    title: "CAPITAL SAVINGS",
    value: "20%",
    status: "Active",
    statusTone: "bg-[#ECFDF3] text-[#16A34A]",
    accent: "bg-[#22C55E]",
    icon: ShieldCheck,
  },
  {
    title: "GENERAL SAVINGS",
    value: "1%",
    status: "Active",
    statusTone: "bg-[#FEF3C7] text-[#D97706]",
    accent: "bg-[#F59E0B]",
    icon: Sparkles,
  },
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
                        <ShieldCheck className="h-3.5 w-3.5" />
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
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#111827]">Statutory &amp; Savings DNA Config</h2>
                    <p className="text-[10px] text-[#9CA3AF]">
                      Define the core financial ratios, remittance logic, and automated compliance rules applied across the entire branch network.
                    </p>
                  </div>
                  <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[10px] text-white">
                    <PenSquare className="h-3.5 w-3.5" />
                    Edit DNA
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {dnaCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                        <div className="flex items-center justify-between">
                          <div className={`rounded-full px-2 py-0.5 text-[8px] ${card.statusTone}`}>{card.status.toUpperCase()}</div>
                          <div className="h-7 w-7 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                            <Icon className="h-3.5 w-3.5 text-[#3B5BDB]" />
                          </div>
                        </div>
                        <div className="mt-2 text-[9px] font-semibold text-[#6B7280]">{card.title}</div>
                        <div className="text-[16px] font-semibold text-[#111827]">{card.value}</div>
                        <div className={`mt-2 h-1.5 w-full rounded-full bg-[#EEF1F6]`}>
                          <div className={`h-1.5 rounded-full ${card.accent}`} style={{ width: "40%" }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                  <div className="flex items-center gap-2 border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold text-[#111827]">
                    <Layers className="h-4 w-4 text-[#3B5BDB]" />
                    Remittance &amp; Automation
                  </div>
                  <div className="space-y-4 px-4 py-4 text-[9px] text-[#6B7280]">
                    <div>
                      <div className="text-[9px] font-medium text-[#6B7280]">Remittance Frequency</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="rounded-[8px] bg-[#E9EEFF] px-2.5 py-1 text-[9px] text-[#3B5BDB]">Weekly</button>
                        <button className="rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1 text-[9px] text-[#6B7280]">Monthly</button>
                        <button className="rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1 text-[9px] text-[#6B7280]">Quarterly</button>
                      </div>
                      <div className="mt-1 text-[8px] text-[#9CA3AF]">Funds will be processed every Monday at 12:00 AM UTC.</div>
                    </div>

                    <div className="rounded-[10px] border border-[#DBEAFE] bg-[#F0F7FF] px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-medium text-[#1E3A8A]">Automated Deduction</div>
                          <div className="text-[8px] text-[#6B7280]">Trigger automatic wallet transfers based on frequency.</div>
                        </div>
                        <div className="h-4 w-8 rounded-full bg-[#3B5BDB] px-0.5 flex items-center">
                          <div className="h-3 w-3 rounded-full bg-white translate-x-4" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-medium text-[#6B7280]">Minimum Remittance Threshold</div>
                      <Input className="mt-2 h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" value="? 500,000" readOnly />
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
                    <div>
                      <div className="text-[10px] font-semibold text-[#92400E]">Caution: Global DNA Changes</div>
                      <p className="mt-1 text-[9px] text-[#A16207]">
                        Updating the HQ Tithes or Savings percentages will immediately adjust the remittance calculations for all 142 active branches. New percentages will take effect from the next billing cycle on Monday, Oct 23rd.
                      </p>
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
                      Cancel
                    </Button>
                    <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[10px] text-white">
                      Update DNA
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
