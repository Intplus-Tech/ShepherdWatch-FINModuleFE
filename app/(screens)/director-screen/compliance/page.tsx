"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import {
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  Landmark,
  PiggyBank,
  WalletMinimal,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react"

const cards = [
  {
    title: "Total 10% Tithe Collected",
    value: "$1,240,500",
    meta: "+95%",
    icon: WalletMinimal,
    bar: "bg-[#3B5BDB]",
  },
  {
    title: "Total 20% Capital Savings",
    value: "$2,481,000",
    meta: "+92%",
    icon: PiggyBank,
    bar: "bg-[#7C3AED]",
  },
  {
    title: "Total 1% General Savings",
    value: "$124,050",
    meta: "-88%",
    icon: Landmark,
    bar: "bg-[#F97316]",
  },
]

const rows = [
  { name: "Maryland, Lagos", id: "BR-1001", total: "$15,000.00", outstanding: "$0.00", last: "Oct 24, 2023", status: "Compliant" },
  { name: "Victoria Island, Lagos", id: "BR-1045", total: "$2,000.00", outstanding: "$5,500.00", last: "Sep 15, 2023", status: "Overdue" },
  { name: "HQ, Ibadan", id: "BR-1022", total: "$12,500.00", outstanding: "$0.00", last: "Oct 22, 2023", status: "Compliant" },
  { name: "Ado-Ekiti, Ekiti", id: "BR-1089", total: "$8,000.00", outstanding: "$1,200.00", last: "Oct 01, 2023", status: "Pending" },
  { name: "Gwagwalada, FCT", id: "BR-1033", total: "$500.00", outstanding: "$3,500.00", last: "Aug 20, 2023", status: "Overdue" },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/compliance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#111827]">Statutory Compliance & Remittance</h2>
                <p className="text-[13px] text-[#6B7280] mt-1">Consolidated view of HQ remittances across all branches for FY 2023-2024</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                  <CalendarDays className="h-4 w-4 text-[#6B7280]" />
                  Oct 2023
                  <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
                </button>
                <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700">
                  <Download className="h-4 w-4" /> Export for Audit
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{card.title}</div>
                        <div className="mt-2 text-[17.79px] leading-[23.72px] font-bold text-[#111827]">{card.value}</div>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF]">
                        <Icon className="h-4 w-4 text-[#3B5BDB]" />
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-emerald-600">{card.meta} of target collected</div>
                    <div className="mt-2 h-1.5 rounded-full bg-[#EEF1F6]">
                      <div className={`h-1.5 w-3/5 rounded-full ${card.bar}`} />
                    </div>
                  </div>
                )}
              )}
            </div>

            <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <button className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[11px] font-bold text-[#111827]">All Branches</button>
                  <button className="rounded-[8px] bg-[#E9EEFF] px-3 py-1.5 text-[11px] font-bold text-[#3B5BDB]">Compliant</button>
                  <button className="rounded-[8px] bg-[#F3F5F9] px-3 py-1.5 text-[11px] font-bold text-[#6B7280]">Overdue/Non-Compliant</button>
                </div>
                <div className="flex items-center gap-2 text-[#9CA3AF]">
                  <Filter className="h-4 w-4" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">BRANCH NAME</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">BRANCH ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">TOTAL REMITTED</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">OUTSTANDING</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">LAST REMITTANCE</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">STATUS</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right border-y border-[#EEF1F6]">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {rows.map((row) => (
                      <tr key={row.name} className="hover:bg-gray-50/50 font-semibold text-[#111827] transition-colors">
                        <td className="px-6 py-5">{row.name}</td>
                        <td className="px-6 py-5 text-[#6B7280]">{row.id}</td>
                        <td className="px-6 py-5">{row.total}</td>
                        <td className={`px-6 py-5 ${row.outstanding !== "$0.00" ? "text-rose-600" : "text-[#6B7280]"}`}>
                          {row.outstanding}
                        </td>
                        <td className="px-6 py-5 text-[#6B7280]">{row.last}</td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              row.status === "Compliant"
                                ? "bg-emerald-50 text-emerald-600"
                                : row.status === "Pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {row.status === "Compliant" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : row.status === "Pending" ? (
                              <Clock3 className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-[#9CA3AF]">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#EEF1F6] p-4 px-6">
                <span className="text-[13px] font-medium text-[#6B7280]">
                  Showing <span className="text-[#111827] font-bold">1-5</span> of <span className="font-bold text-[#111827]">45</span> branches
                </span>
                <div className="flex items-center gap-2">
                  <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50">Previous</button>
                  <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#111827] border border-[#E5E7EB] hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
