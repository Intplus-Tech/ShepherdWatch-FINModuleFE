"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { ChevronDown, Download, Filter, Scale, ShieldCheck, ShieldAlert } from "lucide-react"

const cards = [
  {
    title: "Total VAT/Tax Collected",
    value: "N1,240,500",
    meta: "+6%",
    icon: Scale,
    color: "text-blue-600",
  },
  {
    title: "Total VAT/Tax Outstanding",
    value: "N2,481,000",
    meta: "+2%",
    icon: ShieldAlert,
    color: "text-purple-600",
  },
  {
    title: "Total 13% Sensor Savings",
    value: "N124,050",
    meta: "-1%",
    icon: ShieldCheck,
    color: "text-orange-500",
  },
]

const rows = [
  { name: "Maryland, Lagos", id: "BR-101", total: "N15,000.00", outstanding: "N0.00", last: "Oct 24, 2023", status: "Compliant" },
  { name: "Victoria Island, Lagos", id: "BR-104", total: "N2,000.00", outstanding: "N5,500.00", last: "Sep 15, 2023", status: "Overdue" },
  { name: "HO, Ibadan", id: "BR-102", total: "N12,500.00", outstanding: "N0.00", last: "Oct 22, 2023", status: "Compliant" },
  { name: "Ado-Ekiti, Ekiti", id: "BR-109", total: "N8,000.00", outstanding: "N1,200.00", last: "Oct 01, 2023", status: "Pending" },
  { name: "Gwagwalada, FCT", id: "BR-103", total: "N5,000.00", outstanding: "N3,500.00", last: "Aug 20, 2023", status: "Overdue" },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/compliance" className="border-0 border-r border-[#EEF1F6]" />

          <main className="flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

            <div className="mt-6 rounded-[14px] bg-white border border-[#EEF1F6] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[13px] font-semibold text-[#111827]">Statutory Compliance & Remittance</h2>
                  <p className="text-[10px] text-[#9CA3AF]">Consolidated view of HQ remittances across all branches for FY 2023-2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                    Oct 2023
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button className="flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-2.5 py-1.5 text-[10px] text-white">
                    <Download className="h-3 w-3" /> Export for Audit
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {cards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-[#FBFCFF] p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-[#9CA3AF]">{card.title}</div>
                        <div className="h-6 w-6 rounded-full bg-[#EEF1F6] flex items-center justify-center">
                          <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                        </div>
                      </div>
                      <div className="mt-2 text-[15px] font-semibold text-[#111827]">{card.value}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-[#EEF1F6]">
                        <div className="h-1.5 w-3/5 rounded-full bg-[#3B5BDB]" />
                      </div>
                      <div className="mt-1 text-[9px] text-emerald-600">{card.meta} of target collected</div>
                    </div>
                  )}
                })}
              </div>

              <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[10px] text-[#6B7280]">
                  All Branches
                  <ChevronDown className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-2">
                  {[
                    "All",
                    "Compliant",
                    "Overdue/Non-Compliant",
                  ].map((tab) => (
                    <button
                      key={tab}
                      className={`rounded-full px-3 py-1 text-[9px] ${
                        tab === "All" ? "bg-[#E9EEFF] text-[#3B5BDB]" : "bg-[#F3F5F9] text-[#6B7280]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Filter className="h-3 w-3" />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
                <table className="w-full text-[10px]">
                  <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                    <tr>
                      <th className="py-3 px-4 text-left">BRANCH NAME</th>
                      <th className="py-3 px-4 text-left">BRANCH ID</th>
                      <th className="py-3 px-4 text-left">TOTAL REMITTED</th>
                      <th className="py-3 px-4 text-left">OUTSTANDING</th>
                      <th className="py-3 px-4 text-left">LAST REMITTANCE</th>
                      <th className="py-3 px-4 text-left">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.name} className="border-t border-[#EEF1F6] text-[#111827]">
                        <td className="py-3 px-4 font-medium">{row.name}</td>
                        <td className="py-3 px-4 text-[#6B7280]">{row.id}</td>
                        <td className="py-3 px-4">{row.total}</td>
                        <td className={`py-3 px-4 ${row.outstanding !== "N0.00" ? "text-rose-600" : "text-[#6B7280]"}`}>
                          {row.outstanding}
                        </td>
                        <td className="py-3 px-4 text-[#6B7280]">{row.last}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] ${
                              row.status === "Compliant"
                                ? "bg-emerald-50 text-emerald-600"
                                : row.status === "Pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[#9CA3AF]">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-[9px] text-[#9CA3AF]">
                <div>Showing 1-5 of 45 branches</div>
                <div className="flex items-center gap-2">
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280]">Previous</button>
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280]">Next</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
