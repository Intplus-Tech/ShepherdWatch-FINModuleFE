"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, ChevronDown, MessageCircle, Send } from "lucide-react"

const summaryCards = [
  { title: "Total Proposed Budget", value: "?12,500,450,000.00", meta: "FY 2024" },
  { title: "Total Expenses", value: "?8,000,215,500.00", meta: "YTD" },
  { title: "Net Budget Remaining", value: "?4,552,800,000.00", meta: "65%" },
  { title: "Next Review", value: "?25,000,417.00", meta: "Jan 15, 2024" },
]

const budgetRows = [
  {
    category: "Operations",
    amount: "?2,000,000",
    ytd: "?640,000",
    variance: "-4%",
  },
  {
    category: "Programs & Events",
    amount: "?1,200,000",
    ytd: "?420,000",
    variance: "+2%",
  },
  {
    category: "Facility Maintenance",
    amount: "?800,000",
    ytd: "?300,000",
    variance: "-1%",
  },
]

const messages = [
  {
    author: "Panel Admin",
    time: "2 hours ago",
    text: "We reviewed the maintenance request. It falls within the approved range. Proceed with repair this week.",
  },
  {
    author: "You",
    time: "1 hour ago",
    text: "Thanks, we will send the vendor invoice by end of day.",
  },
  {
    author: "Panel Admin",
    time: "45 mins ago",
    text: "Please attach the updated quote so we can update the budget allocation.",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/budget" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="Budget Preparation & Forecasting"
              subtitle="Validate budgets and track communication threads."
              rightSlot={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    FY 2024
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    Export
                  </Button>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                </div>
              }
            />

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                  <div className="mt-2 text-[12px] font-semibold text-[#111827]">{card.value}</div>
                  <div className="text-[8px] text-[#6B7280]">{card.meta}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2.2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="text-[10px] font-semibold text-[#111827]">Budget Breakdown</div>
                  <button className="rounded-full bg-[#E9EEFF] px-2 py-0.5 text-[9px] text-[#3B5BDB]">Active FY 2024</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 px-3 text-left">CATEGORY</th>
                        <th className="py-2 px-3 text-left">AMOUNT</th>
                        <th className="py-2 px-3 text-left">YTD SPEND</th>
                        <th className="py-2 px-3 text-left">VARIANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetRows.map((row) => (
                        <tr key={row.category} className="border-t border-[#EEF1F6]">
                          <td className="py-2 px-3 font-medium text-[#111827]">{row.category}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.amount}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.ytd}</td>
                          <td className={`py-2 px-3 ${row.variance.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>{row.variance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-2 text-[9px] text-[#6B7280]">
                  <div>Showing 1-3 of 12 entries</div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1">Previous</button>
                    <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1">Next</button>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
                  <MessageCircle className="h-4 w-4 text-[#3B5BDB]" />
                  Activity Thread
                </div>
                <div className="mt-3 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.text} className={`rounded-[10px] px-3 py-2 text-[9px] ${msg.author === "You" ? "bg-[#E9EEFF] text-[#1E3A8A] ml-8" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                      <div className="font-semibold text-[#111827]">{msg.author} <span className="text-[8px] text-[#9CA3AF]">{msg.time}</span></div>
                      <p className="mt-1">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="Type your message..." />
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    <Send className="h-3.5 w-3.5" />
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
