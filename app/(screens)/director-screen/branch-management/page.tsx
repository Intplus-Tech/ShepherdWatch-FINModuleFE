"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  ArrowUpDown,
  Banknote,
  ChevronDown,
  Download,
  Plus,
  Search,
  TrendingUp,
  ShieldAlert,
  BadgeCheck,
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
    id: "ID: UK-041 � United Kingdom",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    statusDot: "bg-emerald-500",
    netPosition: "+$14,200",
    netTone: "text-emerald-600",
    lastRemittance: "Oct 14, 2023",
    scoreLabel: "Compliance Score",
    score: 88,
    scoreTone: "bg-[#3B5BDB]",
    action: "Manage",
  },
  {
    name: "Kyoto Branch",
    id: "ID: JP-229 � Japan",
    status: "Review",
    statusTone: "bg-amber-50 text-amber-600",
    statusDot: "bg-amber-500",
    netPosition: "-$2,850",
    netTone: "text-rose-600",
    lastRemittance: "Sep 28, 2023",
    scoreLabel: "Compliance Score",
    score: 65,
    scoreTone: "bg-[#F59E0B]",
    action: "Manage",
  },
  {
    name: "Sao Paulo Branch",
    id: "ID: BR-104 � Brazil",
    status: "Suspended",
    statusTone: "bg-rose-50 text-rose-600",
    statusDot: "bg-rose-500",
    netPosition: "-$18,400",
    netTone: "text-rose-600",
    lastRemittance: "Overdue (90d)",
    scoreLabel: "Compliance Critical",
    score: 42,
    scoreTone: "bg-[#EF4444]",
    action: "Reactivate",
  },
  {
    name: "Maryland Branch",
    id: "ID: DE-009 � Nigeria",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    statusDot: "bg-emerald-500",
    netPosition: "+$62,100",
    netTone: "text-emerald-600",
    lastRemittance: "Oct 12, 2023",
    scoreLabel: "Compliance Score",
    score: 96,
    scoreTone: "bg-[#3B5BDB]",
    action: "Manage",
  },
  {
    name: "Toronto Branch",
    id: "ID: CA-552 � Nigeria",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    statusDot: "bg-emerald-500",
    netPosition: "+$8,320",
    netTone: "text-emerald-600",
    lastRemittance: "Oct 10, 2023",
    scoreLabel: "Compliance Score",
    score: 92,
    scoreTone: "bg-[#3B5BDB]",
    action: "Manage",
  },
  {
    name: "Dubai Branch",
    id: "ID: AE-101 � UAE",
    status: "Onboarding",
    statusTone: "bg-[#EEF2FF] text-[#4F46E5]",
    statusDot: "bg-[#6366F1]",
    netPosition: "--",
    netTone: "text-[#9CA3AF]",
    lastRemittance: "Pending",
    scoreLabel: "Compliance Score",
    score: 0,
    scoreTone: "bg-[#E5E7EB]",
    action: "Setup",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/branch-management"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <section className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#111827]">Branch Management &amp; Health</h2>
                <p className="text-[13px] text-[#6B7280] mt-1">
                  Monitor financial status, remittance, and compliance scores across all global branches.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  <Download className="h-4 w-4" /> Export Report
                </Button>
                <Button className="h-8 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700">
                  <Plus className="h-4 w-4" /> New Branch
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-medium text-[#9CA3AF]">{card.title}</div>
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${card.iconBg}`}>
                        <Icon className={`h-4 w-4 ${card.tone}`} />
                      </div>
                    </div>
                    <div className="mt-3 text-[18px] font-bold text-[#111827]">{card.value}</div>
                    <div className={`mt-1 text-[11px] ${card.metaTone}`}>{card.meta}</div>
                  </div>
                )}
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  className="h-10 rounded-md border-[#E5E7EB] bg-white pl-9 text-[12px] text-[#6B7280]"
                  placeholder="Search by Branch Name, ID, or Region"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  Region: All
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  Status: Active
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  Compliance: &lt; 70
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                <ArrowUpDown className="h-4 w-4" /> Sort: Highest Deficit
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {branches.map((branch) => (
                <div key={branch.name} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-semibold text-[#111827]">{branch.name}</div>
                      <div className="text-[11px] text-[#9CA3AF]">{branch.id}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${branch.statusTone}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${branch.statusDot}`} />
                      {branch.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-[#9CA3AF]">
                    <div>
                      <div>Net Position</div>
                      <div className={`text-[13px] font-semibold ${branch.netTone}`}>{branch.netPosition}</div>
                    </div>
                    <div>
                      <div>Last Remittance</div>
                      <div className="text-[13px] font-semibold text-[#111827]">{branch.lastRemittance}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="h-4 w-4 text-[#3B5BDB]" />
                      {branch.scoreLabel}
                    </div>
                    <div className="text-[#111827]">
                      {branch.score ? `${branch.score}/100` : "N/A"}
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-[#EEF1F6]">
                    <div
                      className={`h-2 rounded-full ${branch.scoreTone}`}
                      style={{ width: `${branch.score}%` }}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className={`mt-4 h-9 w-full rounded-md text-[12px] font-medium ${
                      branch.action === "Reactivate"
                        ? "border-rose-100 bg-rose-50 text-rose-600"
                        : "border-[#E5E7EB] bg-white text-[#4B5563]"
                    }`}
                  >
                    {branch.action}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center gap-1 rounded-md border border-[#EEF1F6] bg-white px-2 py-1 text-[12px] text-[#6B7280]">
                <button className="px-2 py-1 text-[#9CA3AF]">&lt;</button>
                <button className="h-7 w-7 rounded bg-[#3B5BDB] text-white">1</button>
                <button className="h-7 w-7 rounded">2</button>
                <button className="h-7 w-7 rounded">3</button>
                <span className="px-1 text-[#9CA3AF]">...</span>
                <button className="h-7 w-7 rounded">8</button>
                <button className="px-2 py-1 text-[#9CA3AF]">&gt;</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

