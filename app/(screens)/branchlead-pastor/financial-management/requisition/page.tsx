"use client"

import { API_V1 } from "@/lib/api";
import { useState } from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  Info,
  Search,
  Menu,
  X,
  AlertCircle,
  MoreVertical,
  LockKeyhole,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { RequisitionDetailsModal } from "@/components/modals/RequisitionDetailsModal"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth()
  const displayName = user?.name || user?.email || "User"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const branchId = user?.tenantId ?? user?.tenant?.id ?? ""

  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null)

  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null)

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleApprove = async (id: string) => {
    if (!id) return
    setIsApproving(id)
    setApproveError(null)
    setApproveSuccess(null)
    try {
      const csrfToken = getCsrfToken()
      const res = await fetch(`${API_V1}/financial/requisitions/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ action: "approved", comment: "Approved within budget" }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message ?? "Failed to approve requisition")
      }
      setApproveSuccess("Requisition approved successfully.")
    } catch (err: unknown) {
      setApproveError(err instanceof Error ? err.message : "Failed to approve requisition")
    } finally {
      setIsApproving(null)
    }
  }


  const priorityCards = [
    {
      id: "#REQ-2301",
      description: "Audio Upgrade",
      fullDescription: "The proposed equipment list for the main hall exceeds the Q1 Capital Allocation by $1,200.",
      category: "Capital Expenditure",
      amount: "₦1,150,000",
      timeLabel: "Today, 09:42 AM",
      rawId: "req-2301"
    },
    {
      id: "#REQ-2302",
      description: "Emergency Repairs",
      fullDescription: "Leaking roof in the youth center requires immediate professional repair. Exceeds Maintenance budget by $300.",
      category: "Maintenance",
      amount: "₦3,150,000",
      timeLabel: "Yesterday, 04:15 PM",
      rawId: "req-2302"
    }
  ]

  const pendingRows = [
    {
      id: "#REQ-2303",
      description: "Weekly Cleaning Supplies",
      requestedBy: "Admin Unit",
      category: "Operational",
      amount: "$250.00",
      status: "IN REVIEW",
      rawId: "req-2303"
    },
    {
      id: "#REQ-2304",
      description: "Sunday Bulletin Print",
      requestedBy: "Media Dept",
      category: "Programs",
      amount: "$185.00",
      status: "IN REVIEW",
      rawId: "req-2304"
    },
    {
      id: "#REQ-2305",
      description: "Guest Speaker Honorarium",
      requestedBy: "Pastoral",
      category: "Programs",
      amount: "$500.00",
      status: "IN REVIEW",
      rawId: "req-2305"
    },
    {
      id: "#REQ-2306",
      description: "Utility Bill - Water",
      requestedBy: "Facility",
      category: "Operational",
      amount: "$120.00",
      status: "IN REVIEW",
      rawId: "req-2306"
    },
    {
      id: "#REQ-2307",
      description: "Stationery & Ink",
      requestedBy: "Admin Unit",
      category: "Operational",
      amount: "$95.00",
      status: "IN REVIEW",
      rawId: "req-2307"
    }
  ]

  const recentActivity = [
    {
      id: "#REQ-2298",
      status: "Paid",
      description: "Generator Fuel",
      amount: "₦150,000.00",
      timeLabel: "Jan 22, 2024",
      rawId: "req-2298"
    },
    {
      id: "#REQ-2295",
      status: "Approved",
      description: "Sunday School Decor",
      amount: "₦75,000.00",
      timeLabel: "Jan 20, 2024",
      rawId: "req-2295"
    },
    {
      id: "#REQ-2292",
      status: "Paid",
      description: "Choir Uniform Repair",
      amount: "₦30,000.00",
      timeLabel: "Jan 19, 2024",
      rawId: "req-2292"
    }
  ]
  const expenseChart = {
    segments: [
      { label: "Operational", percentage: 78, color: "#F97316" },
      { label: "Programs", percentage: 15, color: "#0EA5E9" },
      { label: "Capital", percentage: 7, color: "#22C55E" }
    ],
    background: "conic-gradient(#F97316 0% 78%, #0EA5E9 78% 93%, #22C55E 93% 100%)"
  }

  return (
    <div className="h-screen w-full bg-[#F9FAFB] font-sans antialiased text-[#111827] flex overflow-hidden">
      <BranchLeadPastorSidebar />
      <RequisitionDetailsModal 
        isOpen={selectedRequisitionId !== null} 
        onClose={() => setSelectedRequisitionId(null)} 
      />



      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden min-w-0">
        {/* Top Navigation Header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 md:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-[17px] font-extrabold text-[#111827] tracking-tight">Dashboard</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[260px] rounded-[10px] bg-[#F9FAFB] border border-[#EEF1F6] pl-[34px] pr-4 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF] focus:border-[#2563EB] transition-all"
              />
            </div>
            <button className="relative text-[#6B7280] hover:text-[#111827] transition-colors">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -top-0.5 right-0 flex h-2 w-2 rounded-full bg-rose-500 border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Area */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full">
          {/* Top Header */}
          <div className="mb-8">
            <h1 className="text-[24px] md:text-[32px] font-black text-[#111827] uppercase tracking-tighter leading-[32px] mb-2" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>REQUISITION</h1>
            <p className="text-[13px] font-medium text-[#6B7280]">Manage all requisitions approval.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_340px]">
            {/* Left Column Area */}
            <div className="flex flex-col gap-8 w-full min-w-0">
              {/* Approval Inbox Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="text-rose-500">
                    <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">Approval Inbox <span className="text-[#6B7280] font-semibold">(Priority)</span></h2>
                </div>
                <div className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-500 uppercase tracking-widest">
                  ACTION REQUIRED
                </div>
              </div>

              {/* Priority Cards */}
              <div className="flex flex-col gap-6">
                {priorityCards.map((card, index) => (
                  <div
                    key={card.rawId}
                    className={`rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm flex flex-col md:flex-row overflow-hidden border-l-[4px] ${index === 0 ? "border-l-rose-500" : "border-l-orange-500"}`}
                  >
                    <div className="flex-1 p-6 md:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`text-[11px] font-extrabold tracking-widest uppercase ${index === 0 ? "text-rose-500" : "text-orange-500"}`}>
                          {index === 0 ? "CRITICAL: OVER-BUDGET" : "URGENT: OVER-BUDGET"}
                        </div>
                        <div className="text-[12px] font-semibold text-[#9CA3AF]">Requested: {card.timeLabel}</div>
                      </div>
                      <h3 className="text-[22px] font-black text-[#111827] tracking-tight leading-tight mb-3">
                        {card.id} {card.description}
                      </h3>
                      <p className="text-[14px] text-[#6B7280] font-medium leading-relaxed max-w-[90%] mb-8">
                        {card.fullDescription}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-8">
                        <div>
                          <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">REQUEST AMOUNT</div>
                          <div className="text-[18px] font-extrabold text-[#111827]">{card.amount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">CATEGORY</div>
                          <div className="text-[14px] font-bold text-[#111827]">{card.category}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handleApprove(card.rawId)}
                          disabled={isApproving === card.rawId}
                          className="h-[44px] rounded-[8px] bg-[#2563EB] px-6 text-[14px] font-bold text-white shadow-md hover:bg-[#1D4ED8] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                          <LockKeyhole className="h-4 w-4" /> {isApproving === card.rawId ? "Approving..." : "Review & Approve"}
                        </button>
                        <button 
                          onClick={() => setSelectedRequisitionId(card.rawId)}
                          className="text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
              {(approveError || approveSuccess) && (
                <div className="rounded-[12px] border px-4 py-3 text-[13px] font-semibold">
                  {approveError && (
                    <div className="text-rose-600">{approveError}</div>
                  )}
                  {approveSuccess && (
                    <div className="text-emerald-600">{approveSuccess}</div>
                  )}
                </div>
              )}

              {/* Pending Requisitions Data Table */}
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">Pending Requisitions</h2>
                  <button className="text-[13px] font-bold text-[#2563EB] hover:underline">View All ({pendingRows.length})</button>
                </div>
                
                <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="border-b border-[#E5E7EB]">
                        <tr>
                          <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">ID & DESCRIPTION</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">CATEGORY</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">AMOUNT</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">STATUS</th>
                          <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {pendingRows.slice(0, 5).map((row) => (
                          <tr key={row.rawId} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-[14px] font-black text-[#111827]">{row.id} {row.description}</div>
                              <div className="text-[12px] font-semibold text-[#9CA3AF] mt-0.5">Requested by {row.requestedBy}</div>
                            </td>
                            <td className="px-5 py-4 text-[13px] font-semibold text-[#4B5563]">{row.category}</td>
                            <td className="px-5 py-4 text-[15px] font-black text-[#111827]">{row.amount}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                                <MoreVertical className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Area (340px) */}
            <div className="flex flex-col gap-6">
              
              {/* Expense Distribution */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-8">Expense Distribution</h3>
                <div className="relative flex justify-center items-center mb-10 w-full py-4">
                  <div className="relative h-[180px] w-[180px] sm:h-[200px] sm:w-[200px]">
                    <div
                      className="absolute inset-0 rounded-full rotate-[-210deg]"
                      style={{ background: expenseChart.background }}
                    />
                    <div className="absolute inset-[22px] rounded-full bg-white" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[12px] font-extrabold text-[#111827]">
                        Expense Mix
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  {expenseChart.segments.map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                        {segment.label}
                      </div>
                      <div className="text-[13px] font-bold text-[#6B7280]">{segment.percentage.toFixed(2)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Budget Alerts */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-5">Critical Budget Alerts</h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[12px] font-extrabold text-[#111827]">Transport</div>
                      <div className="text-[11px] font-bold text-rose-500">92% exhausted</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[12px] font-extrabold text-[#111827]">Utilities</div>
                      <div className="text-[11px] font-bold text-orange-500">86% exhausted</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '86%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[12px] font-extrabold text-[#111827]">Maintenance</div>
                      <div className="text-[11px] font-bold text-orange-500">85% exhausted</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col h-fit">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-5">Recent Activity</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#F3F4F6]">
                  {recentActivity.map((item) => (
                    <div key={item.rawId} className="relative flex gap-4">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center z-10 border-2 border-white">
                        <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="text-[13px] font-extrabold text-[#111827]">{item.id} {item.status}</div>
                        <div className="text-[12px] font-semibold text-[#6B7280]">{item.description} - {item.amount}</div>
                        <div className="text-[11px] font-bold text-[#9CA3AF] mt-1">{item.timeLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="mt-8 w-full h-[44px] rounded-[10px] border-[#E5E7EB] text-[13px] font-bold text-[#111827] shadow-sm hover:bg-gray-50 flex items-center justify-center">
                  Full Transaction Log
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


