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
  Download,
  Info,
  Layers,
  Settings,
  ShieldCheck,
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
    tone: "text-[#2563EB]",
    active: true,
  },
  {
    title: "CAPITAL SAVINGS",
    value: "20%",
    tone: "text-[#16A34A]",
    active: true,
  },
  {
    title: "GENERAL SAVINGS",
    value: "1%",
    tone: "text-[#F59E0B]",
    active: true,
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                    Statutory &amp; Savings DNA Config
                  </h2>
                  <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                    Define the core financial rules, remittance logic, and automated compliance rules
                    applied across the entire branch network.
                  </p>
                </div>
                <Button className="h-8 rounded-[10px] bg-[#3B5BDB] text-[12.74px] leading-[16.98px] text-white">
                  <Download className="h-4 w-4" /> Edit DNA
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {dnaCards.map((card) => (
                  <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                    <div className="flex items-center justify-between text-[12.74px] leading-[16.98px] font-semibold text-[#6B7280]">
                      {card.title}
                      {card.active ? (
                        <span className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A]">
                          ACTIVE
                        </span>
                      ) : null}
                    </div>
                    <div className={`mt-3 text-[24px] font-bold ${card.tone}`}>{card.value}</div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-[#EEF1F6]">
                      <div className="h-1.5 w-1/3 rounded-full bg-[#3B5BDB]" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                  <Wallet className="h-4 w-4 text-[#3B5BDB]" />
                  Remittance &amp; Automation
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">Remittance Frequency</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button className="rounded-[10px] border border-[#DBEAFE] bg-[#EEF2FF] px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold text-[#3B5BDB]">
                        Weekly
                      </button>
                      <button className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold text-[#6B7280]">
                        Monthly
                      </button>
                      <button className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold text-[#6B7280]">
                        Quarterly
                      </button>
                    </div>
                    <div className="mt-2 text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                      Funds will be processed every Saturday at 12:00 AM UTC
                    </div>
                  </div>

                  <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                          Automated Deduction
                        </div>
                        <div className="text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                          Trigger automatic bank transfers based on frequency
                        </div>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-[#3B5BDB]" />
                    </div>
                  </div>

                  <div>
                    <div className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                      Minimum Remittance Threshold
                    </div>
                    <Input className="mt-2 h-8 rounded-[10px] border-[#E5E7EB] text-[14.86px] leading-[21.23px] font-semibold" value="$ 500.00" readOnly />
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
                  <div>
                    <div className="text-[12.74px] leading-[16.98px] font-semibold text-[#92400E]">
                      Caution: Global DNA Changes
                    </div>
                    <p className="mt-1 text-[11.68px] leading-[14.6px] font-normal text-[#A16207]">
                      Updating the HQ Tithes and Savings percentages will immediately update all remittance calculations for all 112 active branches. New sync triggers will take effect from the next billing cycle on Monday, Oct 21.
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
                    Update DNA
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
