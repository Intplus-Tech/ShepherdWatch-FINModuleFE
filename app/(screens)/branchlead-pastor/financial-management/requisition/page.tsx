"use client"

import { API_V1 } from "@/lib/api";
import { useMemo, useState, useEffect } from "react"

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
import { useRequisitions } from "@/components/hooks/useRequisitions"
import { useBudgetPerformance } from "@/components/hooks/useBudgetPerformance"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { getCsrfTokenFromCookie } from "@/lib/csrf"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth()
  const displayName = user?.name || user?.email || "User"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const { branchId: contextBranchId } = useBranchContext()
  const branchId = contextBranchId || user?.branchId || user?.tenantId || user?.tenant?.id || ""
  // Budgets closest to exhaustion, for the alerts card.
  const { performanceData, fetchPerformance } = useBudgetPerformance()
  useEffect(() => {
    if (branchId) fetchPerformance({ branchId })
  }, [branchId, fetchPerformance])
  const budgetAlerts = (performanceData?.budgets ?? [])
    .map((b) => {
      const approved = Number(b.approved ?? 0)
      const spent = Number(b.spent ?? 0)
      return { id: b.budgetId, title: b.title || "Budget", pct: approved > 0 ? Math.min(100, Math.round((spent / approved) * 100)) : 0 }
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)

  const { requisitions: liveRequisitions, refresh: refreshReqs } = useRequisitions({
    branchId,
    limit: 50,
  })

  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null)

  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null)

  const getCsrfToken = getCsrfTokenFromCookie

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

  // The latest requisitions on this branch, as an activity feed.
  const recentActivity = [...liveRequisitions]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5)
    .map((r) => {
      const status = String(r.currentStatus ?? "pending").replace(/_/g, " ")
      const date = r.createdAt ? new Date(r.createdAt) : null
      return {
        id: `#${(r.reference || r.id).toString().slice(-8).toUpperCase()}`,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        description: r.coaName || r.justification || "Requisition",
        amount: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(r.amount ?? 0)),
        timeLabel: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
        rawId: r.id,
      }
    })
  const expenseChart = {
    segments: [
      { label: "Operational", percentage: 78, color: "#F97316" },
      { label: "Programs", percentage: 15, color: "#0EA5E9" },
      { label: "Capital", percentage: 7, color: "#22C55E" }
    ],
    background: "conic-gradient(#F97316 0% 78%, #0EA5E9 78% 93%, #22C55E 93% 100%)"
  }

  const selectedRequisition = useMemo(() => {
    if (!selectedRequisitionId) return null
    const foundLive = liveRequisitions.find((r) => r.id === selectedRequisitionId)
    if (foundLive) return foundLive
    const foundCard = priorityCards.find((c) => c.rawId === selectedRequisitionId)
    if (foundCard) {
      return {
        id: foundCard.rawId,
        reference: foundCard.id.replace(/^#REQ-/, ""),
        description: foundCard.description,
        justification: foundCard.fullDescription,
        category: foundCard.category,
        amount: foundCard.amount,
      }
    }
    const foundRow = pendingRows.find((r) => r.rawId === selectedRequisitionId)
    if (foundRow) {
      return {
        id: foundRow.rawId,
        reference: foundRow.id.replace(/^#REQ-/, ""),
        description: foundRow.description,
        category: foundRow.category,
        amount: foundRow.amount,
        requestedBy: foundRow.requestedBy,
        status: foundRow.status,
      }
    }
    return null
  }, [selectedRequisitionId, liveRequisitions])

  return (
    <div className="h-screen w-full bg-[#F9FAFB] font-sans antialiased text-[#111827] flex overflow-hidden">
      <BranchLeadPastorSidebar />
      <RequisitionDetailsModal
        isOpen={selectedRequisitionId !== null}
        onClose={() => setSelectedRequisitionId(null)}
        isAuthorizing={isApproving !== null}
        requisition={selectedRequisition}
        onAuthorize={async () => {
          if (!selectedRequisitionId) return
          await handleApprove(selectedRequisitionId)
          refreshReqs()
          setSelectedRequisitionId(null)
        }}
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
                          onClick={() => setSelectedRequisitionId(card.rawId)}
                          className="h-[44px] rounded-[8px] bg-[#2563EB] px-6 text-[14px] font-bold text-white shadow-md hover:bg-[#1D4ED8] transition-colors flex items-center gap-2">
                          <LockKeyhole className="h-4 w-4" /> Review &amp; Approve
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
                  {budgetAlerts.length === 0 ? (
                    <div className="text-[12px] text-[#9CA3AF]">No approved budgets to track yet.</div>
                  ) : (
                    budgetAlerts.map((b) => {
                      const tone = b.pct >= 90 ? "rose" : b.pct >= 75 ? "orange" : "blue"
                      return (
                        <div key={b.id}>
                          <div className="flex justify-between items-end mb-2">
                            <div className="text-[12px] font-extrabold text-[#111827] truncate pr-2">{b.title}</div>
                            <div className={`text-[11px] font-bold shrink-0 ${tone === "rose" ? "text-rose-500" : tone === "orange" ? "text-orange-500" : "text-[#3B5BDB]"}`}>{b.pct}% used</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                            <div className={`h-full rounded-full ${tone === "rose" ? "bg-rose-500" : tone === "orange" ? "bg-orange-500" : "bg-[#3B5BDB]"}`} style={{ width: `${b.pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col h-fit">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-5">Recent Activity</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#F3F4F6]">
                  {recentActivity.length === 0 && (
                    <div className="text-[12px] text-[#9CA3AF] pl-8">No requisitions yet.</div>
                  )}
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


