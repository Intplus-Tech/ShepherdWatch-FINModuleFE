"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import {
  LayoutDashboard,
  FilePlus2,
  Wrench,
  Database,
  Settings,
  Search,
  X,
  Plus,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X as XIcon,
} from "lucide-react"

import BranchAdminHeader from "@/components/navigation/BranchAdminHeader"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRequisitionInbox } from "@/components/hooks/useRequisitionInbox"

const inter = Inter({ subsets: ["latin"] })

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatDate(value?: string) {
  if (!value) return "--"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function toTracker(status: string) {
  const normalized = status.toLowerCase()
  if (normalized.includes("paid")) {
    return { progress: 4, progressLabel: "Disbursed", progressColor: "green", rejected: false }
  }
  if (normalized.includes("approved")) {
    return { progress: 4, progressLabel: "Completed", progressColor: "green", rejected: false }
  }
  if (normalized.includes("declined")) {
    return { progress: 2, progressLabel: "Rejected", progressColor: "red", rejected: true }
  }
  if (normalized.includes("draft")) {
    return { progress: 1, progressLabel: "Draft", progressColor: "blue", rejected: false }
  }
  return { progress: 2, progressLabel: "In Progress", progressColor: "blue", rejected: false }
}

export default function TrackRequests() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { requisitions, loading: inboxLoading } = useRequisitionInbox({
    branchId: user?.tenantId ?? user?.tenant?.id ?? "",
    limit: 20,
  })
  const requestData = useMemo(
    () =>
      requisitions.map((item) => {
        const status = String(item.currentStatus ?? "pending")
        const tracker = toTracker(status)
        return {
          id: item.reference ? `#${item.reference}` : `#${item.id.slice(0, 8).toUpperCase()}`,
          date: formatDate(item.createdAt),
          purpose: item.justification || "Expense requisition",
          category: item.coaName ? `Budget Head • ${item.coaName}` : "Budget Head • General",
          amount: formatCurrency(item.amount || 0),
          ...tracker,
        }
      }),
    [requisitions]
  )

  // Tracker UI component builder
  const renderTracker = (step: number, colorMode: string, rejected: boolean = false, compact: boolean = false) => {
    const totalSteps = 4
    const bgMap: Record<string, string> = {
      blue: "bg-[#2563EB]",
      green: "bg-[#10B981]",
      red: "bg-[#EF4444]",
    }
    const activeBg = bgMap[colorMode] || "bg-[#2563EB]"
    
    const trackWidth = compact ? "w-[160px]" : "w-[220px]"
    const nodeSize = compact ? "w-4 h-4" : "w-5 h-5"
    const ringSize = compact ? "ring-[2px]" : "ring-[3px]"
    const innerDot = compact ? "h-2 w-2" : "h-2.5 w-2.5"
    const miniDot = compact ? "h-1 w-1" : "h-1.5 w-1.5"
    const lineHeight = compact ? "h-[2px]" : "h-[3px]"

    return (
      <div className={`flex flex-col items-center ${trackWidth}`}>
        {/* Tracker graphic container */}
        <div className="relative flex items-center justify-between w-full mb-2 mt-1">
          {/* Background grey track line */}
          <div className={`absolute top-1/2 left-0 w-full ${lineHeight} bg-[#EEF1F6] -translate-y-1/2 z-0`} />
          
          {/* Active colored track line */}
          {step > 1 && (
            <div 
              className={`absolute top-1/2 left-0 ${lineHeight} -translate-y-1/2 z-1 ${activeBg}`} 
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
          )}

          {/* Nodes */}
          {[1, 2, 3, 4].map((node) => {
            const isPast = node < step
            const isCurrent = node === step

            // Special handling if rejected on current step
            if (rejected && isCurrent) {
              return (
                <div key={node} className={`relative z-10 ${nodeSize} rounded-full bg-[#EF4444] ${ringSize} ring-white flex items-center justify-center`}>
                  <XIcon className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                </div>
              )
            }

            if (isPast || (isCurrent && colorMode === "green")) {
              return (
                <div key={node} className={`relative z-10 ${nodeSize} rounded-full ${activeBg} ${ringSize} ring-white flex items-center justify-center`}>
                  <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                </div>
              )
            } else if (isCurrent) {
              return (
                <div key={node} className={`relative z-10 ${nodeSize} rounded-full bg-white ring-[2px] ring-inset ring-[#2563EB] flex items-center justify-center`}>
                  <div className={`${innerDot} rounded-full bg-[#2563EB]`} />
                </div>
              )
            } else {
              return (
                <div key={node} className={`relative z-10 ${nodeSize} rounded-full bg-[#F3F4F6] ${ringSize} ring-white flex items-center justify-center`}>
                  <div className={`${miniDot} rounded-full bg-[#D1D5DB]`} />
                </div>
              )
            }
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        
        <div className="py-6 flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* Logo Container */}
          <div className="flex items-center gap-3 pb-8 px-6">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="text-[17px] font-[800] text-[#2563EB] leading-tight tracking-tight">ShepherdWatch</div>
              <div className="text-[11.5px] text-[#6B7280] font-medium tracking-wide">Admin&apos;s View</div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1.5 mt-2 px-3">
            {[
              { label: "Dashboard", href: "#", icon: LayoutDashboard, active: true },
              { label: "Requisitions", href: "#", icon: FilePlus2 },
              { label: "Logistics & Repairs", href: "#", icon: Wrench },
              { label: "Assets", href: "#", icon: Database },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-4 py-3 text-[14px] font-[700] cursor-pointer transition-colors ${item.active ? "bg-[#EEF2FF] text-[#2563EB]" : "text-[#4B5563] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-5 w-5 stroke-[2] ${item.active ? "text-[#2563EB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* System Section */}
          <div className="px-3 mt-4">
            <div className="text-[11px] font-[800] text-[#9CA3AF] tracking-widest uppercase mb-3 px-4">System</div>
            <div className="space-y-1">
              <div className="flex items-center gap-3.5 rounded-[8px] px-4 py-3 cursor-pointer text-[14px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 stroke-[2] text-[#6B7280]" />
                Settings
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto px-3 mb-2">
            <div className="pt-6 border-t border-[#EEF1F6] flex items-center gap-3.5 px-4 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-200 flex items-center justify-center">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-[800] text-[#111827] leading-tight mb-0.5">Alex Morgan</div>
                <div className="text-[12px] font-medium text-[#9CA3AF] leading-tight">Branch Officer</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <BranchAdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} title="Dashboard" />

        {/* Scrollable Layout */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[40px] pt-2 sm:pt-4 lg:pt-5 pb-6 sm:pb-8 lg:pb-[40px]">
          <div className="mx-auto w-full max-w-[1440px]">

            {/* Back Button */}
            <div className="mb-4">
              <button className="flex items-center gap-1.5 text-[14px] font-[700] text-[#4B5563] hover:text-[#111827] transition-colors">
                <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
                Back
              </button>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
              <div className="max-w-[600px]">
                <h1 
                  className="text-[#111827] mb-2.5"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    fontSize: "30.78px",
                    lineHeight: "34.2px",
                    letterSpacing: "-0.77px",
                    verticalAlign: "middle"
                  }}
                >
                  Track My Requests
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#6B7280] font-medium leading-relaxed">
                  Track progress and view feedback for all branch expense requests. Manage approvers and disbursements in one place.
                </p>
              </div>
              <button className="shrink-0 h-[38px] sm:h-[46px] px-4 sm:px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center gap-2 text-[12.5px] sm:text-[14px] font-bold text-white transition-colors shadow-sm self-start md:self-end">
                <Plus className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={2.5} />
                New Requisition
              </button>
            </div>

            {/* Filter & Table Unified Card */}
            <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-sm w-full overflow-hidden flex flex-col">
              
              {/* Header / Filter Toolbar */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EEF1F6] bg-white">
                
                {/* Search */}
                <div className="relative w-full lg:max-w-[320px]">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
                  <input
                    type="search"
                    placeholder="Search by ID or Title"
                    className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-3 text-[13.5px] text-[#111827] font-semibold placeholder:text-[#9CA3AF] placeholder:font-medium focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                  <button className="h-[40px] px-4 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2 text-[13px] font-[800] text-[#4B5563] hover:bg-gray-100 transition-colors shrink-0">
                    Status: All <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={3} />
                  </button>
                  <button className="h-[40px] px-4 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2 text-[13px] font-[800] text-[#4B5563] hover:bg-gray-100 transition-colors shrink-0">
                    Date Range <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={3} />
                  </button>
                  <button className="h-[40px] px-4 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-2 text-[13px] font-[800] text-[#4B5563] hover:bg-gray-100 transition-colors shrink-0">
                    Category <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={3} />
                  </button>
                </div>

              </div>

              {/* Compact Table (Mobile/Tablet) */}
              <div className="lg:hidden w-full max-h-[420px] overflow-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-white">
                      <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-[800] text-[#6B7280] w-[13%]">ID</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-[800] text-[#6B7280] w-[13%]">Submitted</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-[800] text-[#6B7280] w-[26%]">Purpose</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-[800] text-[#6B7280] w-[12%]">Amount</th>
                      <th className="py-0 px-4 w-[28%] border-x border-[#EEF1F6] bg-gray-50/30">
                        <div className="flex flex-col w-full items-center pt-2 pb-2 border-b border-transparent">
                          <div className="text-[9px] uppercase tracking-widest font-[800] text-[#9CA3AF] mb-1">Approval</div>
                          <div className="flex w-[160px] justify-between px-0.5">
                            <span className="text-[8px] font-[800] text-[#9CA3AF]">Apprvl</span>
                            <span className="text-[8px] font-[800] text-[#9CA3AF]">CEO</span>
                            <span className="text-[8px] font-[800] text-[#9CA3AF]">Finco</span>
                            <span className="text-[8px] font-[800] text-[#9CA3AF]">Pymt</span>
                          </div>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-[800] text-[#6B7280] w-[8%] text-center">Action</th>
                    </tr>
                  </thead>
	                  <tbody className="divide-y divide-[#EEF1F6]">
                    {inboxLoading && (
                      <tr>
                        <td colSpan={6} className="py-8 px-4 text-center text-[12px] font-semibold text-[#6B7280]">
                          Loading requisitions...
                        </td>
                      </tr>
                    )}
                    {!inboxLoading && requestData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 px-4 text-center text-[12px] font-semibold text-[#6B7280]">
                          No requisitions found.
                        </td>
                      </tr>
                    )}
                    {!inboxLoading &&
                      requestData.map((req, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors bg-white group">
                        <td className="py-4 px-4">
                          <div className="text-[12px] font-[800] text-[#2563EB]">{req.id}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-[11px] font-medium text-[#9CA3AF]">{req.date}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-[12px] font-[800] text-[#111827]">{req.purpose}</div>
                            <div className="text-[11px] font-medium text-[#9CA3AF]">{req.category}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-[12px] font-[800] text-[#111827]">{req.amount}</div>
                        </td>
                        <td className="py-4 px-4 border-x border-[#EEF1F6] bg-gray-50/30">
                          <div className="flex flex-col items-center justify-center w-full">
                            {renderTracker(req.progress, req.progressColor, req.rejected, true)}
                            <div className={`text-[11px] font-[800] mt-1 text-center ${req.progressColor === 'blue' ? 'text-[#2563EB]' : req.progressColor === 'green' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                              {req.progressLabel}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center w-full">
                            <button className="h-7 w-7 rounded-[7px] flex items-center justify-center text-[#9CA3AF] hover:bg-gray-100 hover:text-[#4B5563] transition-colors">
                              <ChevronRight className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                        </tr>
                      ))}
	                  </tbody>
                </table>
              </div>
              <div className="lg:hidden px-4 py-2 text-[11px] font-medium text-[#9CA3AF] border-t border-[#EEF1F6]">
                Scroll horizontally to view Amount, Approval, and Action.
              </div>

              {/* Data Table View */}
              <div className="hidden lg:block w-full overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-white">
                      <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-[800] text-[#6B7280] w-[13%]">ID</th>
                      <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-[800] text-[#6B7280] w-[13%]">Submitted On</th>
                      <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-[800] text-[#6B7280] w-[26%]">Purpose</th>
                      <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-[800] text-[#6B7280] w-[12%]">Amount</th>
                      <th className="py-0 px-6 w-[28%] border-x border-[#EEF1F6] bg-gray-50/30">
                        {/* Approval Progress Sub-header spanning the tracker dots */}
                        <div className="flex flex-col w-full items-center pt-3 pb-2 border-b border-transparent">
                          <div className="text-[10px] uppercase tracking-widest font-[800] text-[#9CA3AF] mb-1.5">Approval Progress</div>
                          <div className="flex w-[220px] justify-between px-0.5">
                            <span className="text-[9px] font-[800] text-[#9CA3AF]">Apprvl</span>
                            <span className="text-[9px] font-[800] text-[#9CA3AF]">CEO</span>
                            <span className="text-[9px] font-[800] text-[#9CA3AF]">Finco</span>
                            <span className="text-[9px] font-[800] text-[#9CA3AF]">Pymt</span>
                          </div>
                        </div>
                      </th>
                      <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-[800] text-[#6B7280] w-[8%] text-center">Action</th>
                    </tr>
                  </thead>
	                  <tbody className="divide-y divide-[#EEF1F6]">
                      {inboxLoading && (
                        <tr>
                          <td colSpan={6} className="py-10 px-6 text-center text-[13px] font-semibold text-[#6B7280]">
                            Loading requisitions...
                          </td>
                        </tr>
                      )}
                      {!inboxLoading && requestData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 px-6 text-center text-[13px] font-semibold text-[#6B7280]">
                            No requisitions found.
                          </td>
                        </tr>
                      )}
                      {!inboxLoading && requestData.map((req, idx) => (
	                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors bg-white group">
                        <td className="py-5 px-6">
                          <div className="text-[13.5px] font-[800] text-[#2563EB]">{req.id}</div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="text-[13px] font-medium text-[#9CA3AF]">{req.date}</div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-[13.5px] font-[800] text-[#111827]">{req.purpose}</div>
                            <div className="text-[12px] font-medium text-[#9CA3AF]">{req.category}</div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="text-[14px] font-[800] text-[#111827]">{req.amount}</div>
                        </td>
                        <td className="py-5 px-6 border-x border-[#EEF1F6] bg-gray-50/30">
                          <div className="flex flex-col items-center justify-center w-full">
                            {renderTracker(req.progress, req.progressColor, req.rejected)}
                            <div className={`text-[12px] font-[800] mt-1.5 text-center ${req.progressColor === 'blue' ? 'text-[#2563EB]' : req.progressColor === 'green' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                              {req.progressLabel}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center justify-center w-full">
                            <button className="h-8 w-8 rounded-[8px] flex items-center justify-center text-[#9CA3AF] hover:bg-gray-100 hover:text-[#4B5563] transition-colors">
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
	                      </tr>
	                    ))}
	                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="border-t border-[#EEF1F6] py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]/50">
                <div className="text-[13px] font-medium text-[#6B7280]">
	                  Showing <span className="font-[800]">1 to {requestData.length}</span> of <span className="font-[800]">{requestData.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 px-3 rounded-[6px] text-[13px] font-[700] text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
                    Previous
                  </button>
                  <button className="h-8 w-8 rounded-[6px] bg-[#2563EB] flex items-center justify-center text-[13px] font-[700] text-white shadow-sm">
                    1
                  </button>
                  <button className="h-8 px-3 rounded-[6px] text-[13px] font-[700] text-[#2563EB] hover:bg-[#EEF2FF] transition-colors">
                    Next
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

