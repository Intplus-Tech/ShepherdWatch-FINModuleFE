"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  ArrowUpDown,
  BadgeCheck,
  Banknote,
  ChevronDown,
  Download,
  Plus,
  Search,
  ShieldAlert,
  TrendingUp,
  X,
} from "lucide-react"

const statCards = [
  {
    title: "Global Network Health",
    value: "94%",
    meta: "+2% vs last month",
    metaTone: "text-emerald-600",
    icon: TrendingUp,
    tone: "text-[#3B5BDB]",
    iconBg: "bg-[#E9EEFF]",
  },
  {
    title: "Total Remittance (YTD)",
    value: "$4.2M",
    meta: "+12% vs last year",
    metaTone: "text-emerald-600",
    icon: Banknote,
    tone: "text-emerald-600",
    iconBg: "bg-[#EAF8F1]",
  },
  {
    title: "Critical Alerts",
    value: "3",
    meta: "1 resolved",
    metaTone: "text-rose-600",
    icon: ShieldAlert,
    tone: "text-rose-600",
    iconBg: "bg-[#FDECEC]",
  },
  {
    title: "Pending Audits",
    value: "12",
    meta: "Due within 7 days",
    metaTone: "text-amber-600",
    icon: AlertTriangle,
    tone: "text-amber-600",
    iconBg: "bg-[#FFF4E6]",
  },
]

const branches = [
  {
    name: "North Umbria Branch",
    id: "ID: 001 • United Kingdom",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    netPosition: "+$14,200",
    netTone: "text-emerald-600",
    lastRemittance: "Oct 14, 2023",
    scoreLabel: "Compliance Score",
    score: 88,
    scoreTone: "bg-[#3B5BDB]",
    action: "Manage",
    actionVariant: "outline",
  },
  {
    name: "Kyoto Branch",
    id: "ID: JP-023 • Japan",
    status: "Review",
    statusTone: "bg-amber-50 text-amber-600",
    netPosition: "-$2,850",
    netTone: "text-rose-600",
    lastRemittance: "Sep 28, 2023",
    scoreLabel: "Compliance Score",
    score: 65,
    scoreTone: "bg-[#F59E0B]",
    action: "Manage",
    actionVariant: "outline",
  },
  {
    name: "Sao Paulo Branch",
    id: "ID: BR-104 • Brazil",
    status: "Suspended",
    statusTone: "bg-rose-50 text-rose-600",
    netPosition: "-$18,400",
    netTone: "text-rose-600",
    lastRemittance: "Overdue (90d)",
    scoreLabel: "Compliance Criticals",
    score: 42,
    scoreTone: "bg-[#EF4444]",
    action: "Reactivate",
    actionVariant: "secondary",
  },
  {
    name: "Maryland Branch",
    id: "ID: 009 • Nigeria",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    netPosition: "+$82,100",
    netTone: "text-emerald-600",
    lastRemittance: "Oct 12, 2023",
    scoreLabel: "Compliance Score",
    score: 96,
    scoreTone: "bg-[#3B5BDB]",
    action: "Manage",
    actionVariant: "outline",
  },
  {
    name: "Toronto Branch",
    id: "ID: CA-152 • Canada",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    netPosition: "+$8,320",
    netTone: "text-emerald-600",
    lastRemittance: "Oct 10, 2023",
    scoreLabel: "Compliance Score",
    score: 92,
    scoreTone: "bg-[#3B5BDB]",
    action: "Manage",
    actionVariant: "outline",
  },
  {
    name: "Dubai Branch",
    id: "ID: AE-101 • UAE",
    status: "Onboarding",
    statusTone: "bg-[#EEF2FF] text-[#4F46E5]",
    netPosition: "--",
    netTone: "text-[#9CA3AF]",
    lastRemittance: "Pending",
    scoreLabel: "Compliance Score",
    score: 0,
    scoreTone: "bg-[#E5E7EB]",
    action: "Setup",
    actionVariant: "outline",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/branch-management" className="border-0 border-r border-[#EEF1F6]" />

          <main className="relative flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <div className="pointer-events-none select-none">
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

              <section className="mt-6 rounded-[14px] bg-white border border-[#EEF1F6] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#111827]">Branch Management &amp; Health</h2>
                    <p className="text-[10px] text-[#9CA3AF]">
                      Monitor financial status, remittance, and compliance scores across all global branches.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export Report
                    </Button>
                    <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[10px] text-white">
                      <Plus className="h-3.5 w-3.5" />
                      New Branch
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {statCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-[#FBFCFF] p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-[#9CA3AF]">{card.title}</div>
                          <div className={`h-6 w-6 rounded-full ${card.iconBg} flex items-center justify-center`}>
                            <Icon className={`h-3.5 w-3.5 ${card.tone}`} />
                          </div>
                        </div>
                        <div className="mt-2 text-[15px] font-semibold text-[#111827]">{card.value}</div>
                        <div className={`mt-1 text-[9px] ${card.metaTone}`}>{card.meta}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                    <Input
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white pl-8 text-[10px] text-[#6B7280]"
                      placeholder="Search by Branch Name, ID, or Region"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      Region: All
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      Status: Active
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      Compliance: &lt; 70
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Sort: Highest Deficit
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {branches.map((branch) => (
                    <div key={branch.name} className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold text-[#111827]">{branch.name}</div>
                          <div className="text-[9px] text-[#9CA3AF]">{branch.id}</div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] ${branch.statusTone}`}>{branch.status}</span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-[9px] text-[#9CA3AF]">
                        <div>
                          <div>Net Position</div>
                          <div className={`text-[11px] font-semibold ${branch.netTone}`}>{branch.netPosition}</div>
                        </div>
                        <div>
                          <div>Last Remittance</div>
                          <div className="text-[11px] font-semibold text-[#111827]">{branch.lastRemittance}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[9px] text-[#9CA3AF]">
                        <div className="flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 text-[#3B5BDB]" />
                          {branch.scoreLabel}
                        </div>
                        <div className="text-[#111827]">
                          {branch.score ? `${branch.score}/100` : "N/A"}
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-[#EEF1F6]">
                        <div
                          className={`h-1.5 rounded-full ${branch.scoreTone}`}
                          style={{ width: `${branch.score}%` }}
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className={`mt-4 h-8 w-full rounded-[10px] text-[10px] ${
                          branch.actionVariant === "secondary"
                            ? "border-rose-100 bg-rose-50 text-rose-600"
                            : "border-[#E5E7EB] bg-white text-[#6B7280]"
                        }`}
                      >
                        {branch.action}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-center">
                  <div className="flex items-center gap-1 rounded-[10px] border border-[#EEF1F6] bg-white px-2 py-1 text-[10px] text-[#6B7280]">
                    <button className="px-2 py-1 text-[#9CA3AF]">&lt;</button>
                    <button className="h-6 w-6 rounded-[6px] bg-[#3B5BDB] text-white">1</button>
                    <button className="h-6 w-6 rounded-[6px]">2</button>
                    <button className="h-6 w-6 rounded-[6px]">3</button>
                    <span className="px-1 text-[#9CA3AF]">...</span>
                    <button className="h-6 w-6 rounded-[6px]">8</button>
                    <button className="px-2 py-1 text-[#9CA3AF]">&gt;</button>
                  </div>
                </div>
              </section>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" />

            <div className="absolute left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
              <div className="flex items-start justify-between px-5 pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#E9EEFF] text-[#3B5BDB]">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#111827]">New Branch Onboarding</div>
                    <div className="mt-1 text-[9px] text-[#9CA3AF]">Initiate a new branch entry in the registry.</div>
                  </div>
                </div>
                <button className="h-6 w-6 rounded-full border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="px-5 pb-4 pt-3 text-[9px] text-[#6B7280]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[9px] font-medium text-[#6B7280]">Branch Name</div>
                    <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="e.g. Divine Grace Sanctuary" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-medium text-[#6B7280]">Assigned Lead Pastor</div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
                      <Input className="h-7 rounded-[8px] border-[#E5E7EB] pl-7 text-[9px]" placeholder="Search director..." />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-medium text-[#6B7280]">Region</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                    >
                      Select a region
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-medium text-[#6B7280]">Assigned Accountant</div>
                    <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="Enter name of the suggested Accountant" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-medium text-[#6B7280]">Currency</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                    >
                      Naira (NGN)
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div />
                </div>

                <div className="mt-3 rounded-[10px] border border-[#EEF2FF] bg-[#F7F9FF] p-3">
                  <div className="flex items-center gap-2 text-[9px] font-medium text-[#3B5BDB]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Mandatory Statutory Deductions
                  </div>
                  <p className="mt-1 text-[9px] text-[#9CA3AF]">Select the most appropriate tax to this branch.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    Growing
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    Create Branch
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
