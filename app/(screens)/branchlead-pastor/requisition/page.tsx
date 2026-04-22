"use client"
import { useMemo, useState } from "react"

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
  LockKeyhole
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRequisitionInbox } from "@/components/hooks/useRequisitionInbox"
import { useExpenseDistribution } from "@/components/hooks/useExpenseDistribution"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth()
  const branchId = user?.tenantId ?? user?.tenant?.id ?? ""
  const { requisitions, loading: reqLoading, error: reqError, refresh } = useRequisitionInbox({
    branchId,
  })
  const { items: expenseItems, loading: expenseLoading } = useExpenseDistribution({ branchId })

  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null)

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
      const res = await fetch(`/api/core/financial/requisitions/${id}/approve`, {
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
      refresh()
    } catch (err: unknown) {
      setApproveError(err instanceof Error ? err.message : "Failed to approve requisition")
    } finally {
      setIsApproving(null)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(value)

  const pendingRows = useMemo(() => {
    return requisitions.map((req) => {
      const createdAt = req.createdAt ? new Date(req.createdAt) : null
      const timeLabel =
        createdAt && !Number.isNaN(createdAt.getTime())
          ? createdAt.toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"

      return {
      id: req.reference ? `#${req.reference}` : `#${req.id.slice(0, 8).toUpperCase()}`,
      description: req.justification || "Requisition",
      category: req.coaName || "Operational",
      amount: formatCurrency(req.amount || 0),
      status: (req.currentStatus ?? "PENDING").toUpperCase().replace(/_/g, " "),
      requestedBy: req.requestedBy || "Branch Admin",
      rawId: req.id,
      timeLabel,
    }
  })
  }, [requisitions])

  const priorityCards = pendingRows.slice(0, 2)
  const recentActivity = pendingRows.slice(2, 5)
  const expenseChart = useMemo(() => {
    const grouped = new Map<string, number>()
    for (const item of expenseItems) {
      const key = String(item.category || "other").toLowerCase()
      grouped.set(key, (grouped.get(key) ?? 0) + Number(item.percentage || 0))
    }

    const sorted = Array.from(grouped.entries())
      .map(([category, percentage]) => ({ category, percentage }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)

    const colorMap: Record<string, string> = {
      operational: "#F97316",
      programs: "#0EA5E9",
      capital: "#22C55E",
      other: "#94A3B8",
    }
    const defaultNames: Record<string, string> = {
      operational: "Operational",
      programs: "Programs",
      capital: "Capital",
      other: "Other",
    }

    const segments = sorted.map((item) => ({
      label: defaultNames[item.category] ?? item.category,
      percentage: Math.max(0, item.percentage),
      color: colorMap[item.category] ?? colorMap.other,
    }))

    if (segments.length === 0) {
      segments.push(
        { label: "Operational", percentage: 0, color: colorMap.operational },
        { label: "Programs", percentage: 0, color: colorMap.programs },
        { label: "Capital", percentage: 0, color: colorMap.capital }
      )
    }

    const conicResult = segments.reduce(
      (acc, segment) => {
        const end = Math.min(100, acc.cursor + segment.percentage)
        return {
          cursor: end,
          stops: [...acc.stops, `${segment.color} ${acc.cursor}% ${end}%`],
        }
      },
      { cursor: 0, stops: [] as string[] }
    )
    const stops =
      conicResult.cursor < 100
        ? [...conicResult.stops, `#E5E7EB ${conicResult.cursor}% 100%`]
        : conicResult.stops

    return {
      segments,
      background: `conic-gradient(${stops.join(",")})`,
    }
  }, [expenseItems])

  return (
    <div className="h-screen w-full bg-[#F9FAFB] font-sans antialiased text-[#111827] flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#EEF1F6] flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-6">
          <div className="flex items-center justify-between gap-3 pb-8">
            <div className="flex items-center gap-3">
              <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={28} height={28} />
              <div>
                <div className="text-[14px] font-bold text-[#111827] tracking-tight">ShepherdWatch</div>
                <div className="text-[11px] font-semibold text-[#6B7280]">Lead Pastor View</div>
              </div>
            </div>
            <button className="lg:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {/* Dashboard */}
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={2} />
              Dashboard
            </div>

            {/* Financial Management (Expanded Dropdown) */}
            <div className="rounded-[12px] bg-[#EFF6FF] p-2">
              <div className="flex items-center justify-between px-2 py-1.5 mb-2 cursor-pointer">
                <div className="flex items-center gap-3 text-[13px] text-[#2563EB] font-bold">
                  <Wallet className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  Financial Management
                </div>
                <ChevronDown className="h-4 w-4 text-[#2563EB]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col space-y-1 border-l-2 border-[#DDE7EE] ml-[22px] pl-3 py-1">
                <div className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827] py-1.5 cursor-pointer transition-colors">
                  Income Tracking
                </div>
                <div className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827] py-1.5 cursor-pointer transition-colors">
                  Expense Tracking
                </div>
                <div className="text-[12px] font-bold text-[#2563EB] py-1.5 cursor-pointer">
                  Requisition
                </div>
              </div>
            </div>

            {/* Other Menu Items */}
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors mt-2">
              <Wallet className="h-[18px] w-[18px]" strokeWidth={2} />
              Assets
            </div>
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} />
              Budget
            </div>
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2} />
              Compliance & Remittance
            </div>
          </nav>
        </div>

        <div className="mt-auto px-5 pb-6">
          <div className="space-y-1.5 pt-6 border-t border-[#EEF1F6] text-[13px] font-semibold text-[#6B7280]">
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <ShieldCheck className="h-[18px] w-[18px]" />
              Settings
            </div>
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <Info className="h-[18px] w-[18px]" />
              Help Center
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 pt-6 border-t border-[#EEF1F6]">
            <div className="h-10 w-10 rounded-full border border-[#E5E7EB] overflow-hidden bg-[#F9FAFB] shrink-0">
              <Image src="/images/login%20page%20picture.jpg" alt="Alex" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#111827] truncate">Alex Morgan</div>
              <div className="text-[11px] font-medium text-[#6B7280] truncate">Lead Pastor</div>
            </div>
          </div>
        </div>
      </aside>

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
            <h1 className="text-[24px] md:text-[32px] font-black text-[#111827] uppercase tracking-tighter leading-[32px] mb-2">REQUISITION</h1>
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
                {reqLoading && (
                  <div className="rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm p-6 text-[13px] font-semibold text-[#6B7280]">
                    Loading priority requisitions...
                  </div>
                )}
                {!reqLoading && reqError && (
                  <div className="rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] shadow-sm p-6 text-[13px] font-semibold text-rose-600">
                    {reqError}
                  </div>
                )}
                {!reqLoading && !reqError && priorityCards.length === 0 && (
                  <div className="rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm p-6 text-[13px] font-semibold text-[#6B7280]">
                    No pending requisitions to review right now.
                  </div>
                )}
                {priorityCards.map((card, index) => (
                  <div
                    key={card.rawId}
                    className={`rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm flex flex-col md:flex-row overflow-hidden border-l-[4px] ${index === 0 ? "border-l-rose-500" : "border-l-orange-500"}`}
                  >
                    <div className="flex-1 p-6 md:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`text-[11px] font-extrabold tracking-widest uppercase ${index === 0 ? "text-rose-500" : "text-orange-500"}`}>
                          {index === 0 ? "CRITICAL - OVER-BUDGET" : "URGENT - OVER-BUDGET"}
                        </div>
                        <div className="text-[12px] font-semibold text-[#9CA3AF]">Requested: {card.timeLabel}</div>
                      </div>
                      <h3 className="text-[22px] font-black text-[#111827] tracking-tight leading-tight mb-3">
                        {card.id} {card.description}
                      </h3>
                      <p className="text-[14px] text-[#6B7280] font-medium leading-relaxed max-w-[90%] mb-8">
                        {card.description}
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
                        <button className="text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                    <div className="w-full md:w-[220px] md:h-auto h-[200px] shrink-0 p-5 pl-0 hidden md:block">
                      <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-black">
                        <Image src="/images/login%20page%20picture.jpg" alt="Requisition" fill className="object-cover opacity-80" />
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
                        {reqLoading && (
                          <tr>
                            <td colSpan={5} className="px-6 py-6 text-center text-[13px] font-semibold text-[#6B7280]">
                              Loading requisitions...
                            </td>
                          </tr>
                        )}
                        {!reqLoading && reqError && (
                          <tr>
                            <td colSpan={5} className="px-6 py-6 text-center text-[13px] font-semibold text-rose-500">
                              {reqError}
                            </td>
                          </tr>
                        )}
                        {!reqLoading && !reqError && pendingRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-6 text-center text-[13px] font-semibold text-[#6B7280]">
                              No pending requisitions available.
                            </td>
                          </tr>
                        )}
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
                        {expenseLoading ? "Updating..." : "Expense Mix"}
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
                  {reqLoading && (
                    <div className="text-[13px] font-semibold text-[#9CA3AF]">Loading activity...</div>
                  )}
                  {!reqLoading && reqError && (
                    <div className="text-[13px] font-semibold text-rose-500">{reqError}</div>
                  )}
                  {!reqLoading && !reqError && recentActivity.length === 0 && (
                    <div className="text-[13px] font-semibold text-[#9CA3AF]">No recent requisition activity yet.</div>
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


