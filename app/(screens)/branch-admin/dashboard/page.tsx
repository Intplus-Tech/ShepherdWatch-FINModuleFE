"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FilePlus2,
  Wrench,
  Database,
  Settings,
  X,
  Plus,
  ArrowRight,
  History,
  BarChart3,
  Edit2,
  Eye,
  FileEdit,
  Download,
  UploadCloud,
  ChevronDown,
  FileBox,
  LogOut,
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

function mapStatusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized.includes("approved") || normalized.includes("paid")) return "bg-green-50 text-green-600"
  if (normalized.includes("declined")) return "bg-rose-50 text-rose-600"
  // Draft and Submitted both render blue.
  return "bg-blue-50 text-blue-600"
}

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

  const { requisitions, loading: inboxLoading } = useRequisitionInbox({
    branchId: user?.tenantId ?? user?.tenant?.id ?? "",
    limit: 8,
  })
  const pendingCount = useMemo(
    () =>
      requisitions.filter((item) => String(item.currentStatus ?? "").toLowerCase().includes("pending")).length,
    [requisitions]
  )
  const recentRequisitions = useMemo(
    () =>
      requisitions.map((item, index) => {
        const status = (item.currentStatus ?? "pending").replace(/_/g, " ")
        const normalized = status.toLowerCase()
        const action = normalized.includes("draft")
          ? "edit"
          : normalized.includes("paid")
            ? "download-menu"
            : "view"
        return {
          realId: item.id,
          id: item.reference ? `#${item.reference}` : `#${item.id.slice(0, 8).toUpperCase()}`,
          iconColor: index % 2 === 0 ? "text-blue-500" : "text-orange-500",
          iconBg: index % 2 === 0 ? "bg-blue-50" : "bg-orange-50",
          desc: item.justification || "Requisition",
          date: formatDate(item.createdAt),
          amount: formatCurrency(item.amount || 0),
          status: status.replace(/\b\w/g, (value) => value.toUpperCase()),
          statusColors: mapStatusTone(status),
          action,
        }
      }),
    [requisitions]
  )

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
              { label: "Dashboard", href: "/branch-admin/dashboard", icon: LayoutDashboard },
              { label: "Requisitions", href: "/branch-admin/requisitions", icon: FilePlus2 },
              { label: "Logistics & Repairs", href: "/branch-admin/logistics-repair", icon: Wrench },
              { label: "Assets", href: "/branch-admin/asset", icon: Database },
            ].map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between rounded-[8px] px-4 py-3 text-[14px] font-[700] cursor-pointer transition-colors ${isActive ? "bg-[#EEF2FF] text-[#2563EB]" : "text-[#4B5563] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-5 w-5 ${isActive ? "text-[#2563EB]" : "text-[#6B7280]"}`} strokeWidth={2} />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* System Section */}
          <div className="px-3 mt-4">
            <div className="text-[11px] font-[800] text-[#9CA3AF] tracking-widest uppercase mb-3 px-4">System</div>
            <div className="space-y-1">
              <Link href="/branch-admin/settings" className="flex items-center gap-3.5 rounded-[8px] px-4 py-3 cursor-pointer text-[14px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 stroke-[2] text-[#6B7280]" />
                Settings
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto px-3 mb-2">
            <div className="pt-6 border-t border-[#EEF1F6] flex flex-col gap-4 px-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-[8px] py-2.5 px-2 -mx-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-[calc(100%+16px)] text-left"
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout
              </button>

              <div className="flex items-center gap-3.5 cursor-pointer hover:opacity-80 transition-opacity">
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
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <BranchAdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable Layout */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[40px] pt-4 sm:pt-5 lg:pt-6 pb-6 sm:pb-8 lg:pb-[40px]">
          <div className="mx-auto w-full max-w-[1440px]">

            {/* Hero Section */}
            <div className="mb-8 sm:mb-10">
              <h1 
                className="text-[#111827] mb-2"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: "20px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  verticalAlign: "middle"
                }}
              >
                Welcome back, Alex
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#6B7280] font-medium">
                Here&apos;s what&apos;s happening with your branch finances today.
              </p>
            </div>

            {/* Quick Actions / Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
              
              {/* Card 1: New Requisition */}
              <Link
                href="/branch-admin/new-requisition"
                className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-sm p-6 relative flex flex-col justify-between overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="h-10 w-10 rounded-[10px] bg-[#EEF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="h-8 w-8 rounded-full border-[1.5px] border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] group-hover:bg-[#EEF2FF] group-hover:border-[#BFDBFE] group-hover:text-[#2563EB] transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[16px] font-[800] text-[#111827] mb-1.5">New Requisition</h3>
                  <p className="text-[13px] font-medium text-[#6B7280] leading-snug mb-5 pr-4">Create a new expense request for approval.</p>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#2563EB] group-hover:gap-2 transition-all">
                    Start Request <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>

              {/* Card 2: Track My Requests */}
              <Link
                href="/branch-admin/requests"
                className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-sm p-6 flex flex-col justify-between hover:border-[#C7D2FE] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="h-10 w-10 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-[#6B7280]">
                    <History className="h-5 w-5 text-[#2563EB]" strokeWidth={2} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[800] bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {inboxLoading ? "Loading..." : `${pendingCount} Pending`}
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-[800] text-[#111827] mb-1.5">Track My Requests</h3>
                  <p className="text-[13px] font-medium text-[#6B7280] leading-snug">Monitor status of your recent submissions.</p>
                </div>
              </Link>

              {/* Card 3: My Requisition History */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-sm p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-8">
                  <div className="h-10 w-10 rounded-[10px] bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
                    <BarChart3 className="h-5 w-5 text-[#16A34A]" strokeWidth={2} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[800] bg-emerald-50 text-green-600 border border-emerald-100">
                    Healthy
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-[800] text-[#111827] mb-1.5">My Requisition History</h3>
                  <p className="text-[13px] font-medium text-[#6B7280] leading-snug">Track progress and view feedback for all branch expense requests.</p>
                </div>
              </div>

            </div>

            {/* Recent Requisitions Section */}
            <div className="mb-4">
              <h2 className="text-[18px] font-[800] text-[#111827] tracking-tight">Recent Requisitions</h2>
            </div>

            <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-sm w-full overflow-hidden">
              {/* Mobile Card View (Hidden on Tablet/Desktop) */}
              <div className="w-full sm:hidden flex flex-col divide-y divide-[#EEF1F6]">
                {inboxLoading && (
                  <div className="p-4 text-[13px] font-semibold text-[#6B7280]">Loading requisitions...</div>
                )}
                {!inboxLoading && recentRequisitions.length === 0 && (
                  <div className="p-4 text-[13px] font-semibold text-[#6B7280]">No requisitions found.</div>
                )}
                {!inboxLoading &&
                  recentRequisitions.map((req, idx) => (
                  <div
                    key={idx}
                    onClick={() => router.push(`/branch-admin/request-modal?id=${encodeURIComponent(req.realId)}`)}
                    className="flex flex-col p-4 bg-white hover:bg-[#F8FAFC] transition-colors relative group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <div className="text-[13px] font-[800] text-[#111827]">{req.id}</div>
                        <div className="text-[12px] font-medium text-[#6B7280]">{req.date}</div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-[800] tracking-wide ${req.statusColors}`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-[8px] flex items-center justify-center shrink-0 ${req.iconBg} ${req.iconColor}`}>
                        <FileBox className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[14px] font-[800] text-[#111827] leading-tight">{req.desc}</div>
                        <div className="text-[13.5px] font-[800] text-[#4B5563] mt-0.5">{req.amount}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end border-t border-gray-100 pt-3 relative" onClick={(e) => e.stopPropagation()}>
                      <button className="h-9 w-9 rounded-[8px] flex items-center justify-center text-[#9CA3AF] bg-gray-50 hover:bg-gray-100 hover:text-[#4B5563] transition-colors">
                        {req.action === 'edit' && <Edit2 className="h-4.5 w-4.5" />}
                        {req.action === 'view' && <Eye className="h-4.5 w-4.5" />}
                        {req.action === 'sign' && <FileEdit className="h-4.5 w-4.5" />}
                        {req.action === 'download' && <Download className="h-4.5 w-4.5" />}
                        {req.action === 'download-menu' && (
                          <div className="relative">
                            <FileBox className="h-4.5 w-4.5" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                  ))}
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden sm:block w-full overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[800px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-white">
                      <th className="py-4 px-6 text-[12px] font-[800] text-[#6B7280] w-[15%]">Ref ID</th>
                      <th className="py-4 px-6 text-[12px] font-[800] text-[#6B7280]">Description</th>
                      <th className="py-4 px-6 text-[12px] font-[800] text-[#6B7280] w-[15%]">Date</th>
                      <th className="py-4 px-6 text-[12px] font-[800] text-[#6B7280] w-[15%]">Amount</th>
                      <th className="py-4 px-6 text-[12px] font-[800] text-[#6B7280] w-[12%]">Status</th>
                      <th className="py-4 px-6 text-[12px] font-[800] text-[#6B7280] w-[10%] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {inboxLoading && (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-[13px] font-semibold text-[#6B7280]">
                          Loading requisitions...
                        </td>
                      </tr>
                    )}
                    {!inboxLoading && recentRequisitions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-[13px] font-semibold text-[#6B7280]">
                          No requisitions found.
                        </td>
                      </tr>
                    )}
                    {!inboxLoading &&
                      recentRequisitions.map((req, idx) => (
                      <tr
                        key={idx}
                        onClick={() => router.push(`/branch-admin/request-modal?id=${encodeURIComponent(req.realId)}`)}
                        className="hover:bg-[#F8FAFC] transition-colors bg-white group cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <div className="text-[13px] font-[800] text-[#111827]">{req.id}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 ${req.iconBg} ${req.iconColor}`}>
                              <FileBox className="h-4 w-4" />
                            </div>
                            <div className="text-[13px] font-medium text-[#6B7280]">{req.desc}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-[13px] font-medium text-[#6B7280]">{req.date}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-[13.5px] font-[800] text-[#111827]">{req.amount}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-[800] tracking-wide ${req.statusColors}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end">
                            <button className="h-8 w-8 rounded-[8px] flex items-center justify-center text-[#9CA3AF] hover:bg-gray-100 hover:text-[#4B5563] transition-colors relative">
                              {req.action === 'edit' && <Edit2 className="h-4 w-4" />}
                              {req.action === 'view' && <Eye className="h-4 w-4" />}
                              {req.action === 'sign' && <FileEdit className="h-4 w-4" />}
                              {req.action === 'download' && <Download className="h-4 w-4" />}
                              {req.action === 'download-menu' && (
                                <>
                                  <FileBox className="h-4 w-4" />
                                  <div className="absolute right-0 top-[110%] z-10 w-[200px] rounded-[12px] bg-white border border-[#EEF1F6] shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-1.5 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
                                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer w-full text-left">
                                      <UploadCloud className="h-4 w-4 text-[#6B7280]" />
                                      <span className="text-[13px] font-semibold text-[#4B5563]">Upload Receipt</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer w-full text-left">
                                      <Download className="h-4 w-4 text-[#6B7280]" />
                                      <span className="text-[13px] font-semibold text-[#4B5563]">Download Receipt</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border-t border-[#EEF1F6] py-3.5 px-6 flex justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <button className="flex items-center gap-1.5 text-[12.5px] font-[800] text-[#6B7280]">
                  Show more <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}



