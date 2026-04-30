"use client"
import { useState } from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Printer,
  ShieldCheck,
  TrendingUp,
  Upload,
  Wallet,
  CheckCircle2,
  MinusCircle,
  FileText,
  Pencil,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Menu,
  X,
  Plus
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useTransactions } from "@/components/hooks/useTransactions"
import { TransactionCreateModal } from "@/components/financial/TransactionCreateModal"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import Link from "next/link"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const displayName = user?.name || user?.email || "User";
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor";
  const tenantId = user?.tenantId ?? user?.tenant?.id ?? "";
  const [page, setPage] = useState(1);
  const { transactions: allTransactions, pagination, loading, error, refresh } = useTransactions({ page, limit: 20 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const transactions = allTransactions.filter(tx => 
    (tx.flowType ?? "").toUpperCase() === "INFLOW" || Number(tx.amount) > 0
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <div className="h-screen w-full bg-white font-sans antialiased text-[#111827] flex overflow-hidden">
      <TransactionCreateModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refresh}
        flowType="income"
        tenantId={tenantId}
      />
      <BranchLeadPastorSidebar />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden min-w-0">
        {/* Top Navigation Header */}
        <header className="flex h-18 shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 md:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-[16px] font-extrabold text-[#111827] tracking-tight">Dashboard</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-10 w-65 rounded-[10px] bg-[#F9FAFB] border border-[#EEF1F6] pl-10 pr-4 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF] focus:border-[#2563EB] transition-all"
              />
            </div>
            <button className="relative text-[#6B7280] hover:text-[#111827] transition-colors">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-rose-500 border border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full">
          {/* Top Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-[24px] md:text-[32px] font-black text-[#111827] uppercase tracking-tighter leading-none mb-2" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>INCOME TRACKING</h1>
              <p className="text-[13px] md:text-[14px] font-medium text-[#6B7280]">Monitor and verify all financial inflows for the branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsModalOpen(true)} className="h-[44px] flex-1 lg:flex-none rounded-[10px] bg-[#2563EB] px-5 text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                <Plus className="h-4.5 w-4.5" strokeWidth={2.5} /> Record Income
              </Button>
              <Button variant="outline" className="h-[44px] flex-1 lg:flex-none rounded-[10px] border-[#E5E7EB] bg-white px-5 text-[14px] font-bold text-[#111827] shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <Upload className="h-4.5 w-4.5 text-[#4B5563]" strokeWidth={2.5} /> Import
              </Button>
              <button className="h-11 w-11 shrink-0 rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors">
                <Printer className="h-4.5 w-4.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Top Grid Area (Metrics & Trend) */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px] mb-8">

            {/* 4 Main Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: TOTAL COLLECTED */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">TOTAL COLLECTED</div>
                  <div className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-bold text-[#059669]">+12%</div>
                </div>
                <div className="text-[26.67px] font-black text-[#111827] leading-8 tracking-normal">₦2.45M</div>
              </div>

              {/* Card 2: DAILY AVG */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">DAILY AVG</div>
                  <div className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-bold text-[#059669]">+5%</div>
                </div>
                <div className="text-[26.67px] font-black text-[#111827] leading-8 tracking-normal">₦111k</div>
              </div>

              {/* Card 3: PROJECTED */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">PROJECTED</div>
                  <div className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">-2%</div>
                </div>
                <div className="text-[26.67px] font-black text-[#111827] leading-8 tracking-normal">₦3.2M</div>
              </div>

              {/* Card 4: VS TARGET */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-1">
                  <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">VS TARGET</div>
                  <div className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-bold text-[#059669]">+8%</div>
                </div>
                <div className="text-[26.67px] font-black text-[#111827] leading-[32px] tracking-normal mb-2">81%</div>
                <div className="h-[6px] w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div className="h-full bg-[#2563EB]" style={{ width: '81%' }} />
                </div>
              </div>

            </div>

            {/* Card 5: TREND (Matches Summary Insights width) */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col h-full min-h-[140px] w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">TREND</div>
                <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                  <ChevronLeft className="h-[14px] w-[14px] cursor-pointer hover:text-[#4B5563]" strokeWidth={3} />
                  <ChevronRight className="h-[14px] w-[14px] cursor-pointer hover:text-[#4B5563]" strokeWidth={3} />
                </div>
              </div>
              <div className="flex items-end justify-between flex-1 gap-2">
                <div className="flex flex-col items-center flex-1 h-full justify-end w-full">
                  <div className="w-full bg-[#DCE4F0] rounded-t-[2px]" style={{ height: '55px' }}></div>
                  <div className="text-[10px] font-bold text-[#9CA3AF] mt-1.5">20 Jan</div>
                </div>
                <div className="flex flex-col items-center flex-1 h-full justify-end w-full">
                  <div className="w-full bg-[#DCE4F0] rounded-t-[2px]" style={{ height: '40px' }}></div>
                  <div className="text-[10px] font-bold text-[#9CA3AF] mt-1.5">21 Jan</div>
                </div>
                <div className="flex flex-col items-center flex-1 h-full justify-end w-full">
                  <div className="w-full bg-[#2563EB] rounded-t-[2px]" style={{ height: '70px' }}></div>
                  <div className="text-[10px] font-bold text-[#111827] mt-1.5">22 Jan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-8 border-b border-[#E5E7EB] mb-6 px-1">
            <button className="pb-3 border-b-[3px] border-[#2563EB] text-[14px] font-bold text-[#2563EB]">All Transactions</button>
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">Tithes</button>
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">Offerings</button>
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">Capital Projects</button>

            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-2">
              Forex <span className="rounded-[6px] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-extrabold text-[#2563EB]">$500</span>
            </button>
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-2">
              Unverified <span className="rounded-[6px] bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-600">₦25k</span>
            </button>
          </div>

          {/* Main Grid View */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
            {/* Data Table */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">DATE</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">MEMBER NAME</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">CATEGORY</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">AMOUNT</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">STATUS</th>
                      <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                          Loading transactions...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-rose-500">
                          {error}
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                          No income transactions found.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => {
                        const isVerified = String(tx.status ?? "").toUpperCase().includes("VERIFIED") || String(tx.status ?? "").toUpperCase() === "APPROVED"
                        return (
                          <tr key={tx.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-6 py-5 text-[14px] font-semibold text-[#111827]">
                              {tx.date ? formatDate(tx.date) : "—"}
                            </td>
                            <td className="px-5 py-5 text-[14px] font-extrabold text-[#111827]">{tx.description || "N/A"}</td>
                            <td className="px-5 py-5">
                              <span className="inline-flex items-center rounded-[6px] bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-bold text-[#4B5563]">
                                {tx.category || tx.coaName || "Uncategorized"}
                              </span>
                            </td>
                            <td className="px-5 py-5 text-[15px] font-extrabold text-[#111827] tracking-tight">{formatCurrency(tx.amount)}</td>
                            <td className="px-5 py-5">
                              {isVerified ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#059669] uppercase tracking-widest">
                                  <CheckCircle2 className="h-[15px] w-[15px]" strokeWidth={2.5} /> VERIFIED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-500 uppercase tracking-widest">
                                  <MinusCircle className="h-[15px] w-[15px]" strokeWidth={2.5} /> PENDING
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button className="text-[#2563EB] hover:text-[#1D4ED8] transition-colors"><FileText className="h-[18px] w-[18px]" strokeWidth={2} /></button>
                                <button className="text-[#2563EB] hover:text-[#1D4ED8] transition-colors"><Pencil className="h-[18px] w-[18px]" strokeWidth={2} /></button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-5 mt-auto">
                <div className="text-[13px] font-bold text-[#6B7280]">
                  Showing {pagination && pagination.total > 0 
                      ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * Math.max(pagination.limit, 1), pagination.total)}`
                      : "0"} of {pagination?.total ?? 0} records
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination || pagination.page <= 1}
                    className="h-[38px] w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(pagination?.pages ?? 1, p + 1))}
                    disabled={!pagination || pagination.page >= (pagination?.pages ?? 1)}
                    className="h-[38px] w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#111827] hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Box (Insights) */}
            <div className="h-fit">
              <div className="rounded-[16px] border border-[#E5E7EB] bg-[#F8FAFC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="text-[#2563EB]">
                    <Lightbulb className="h-[20px] w-5" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[15px] font-extrabold text-[#2563EB] tracking-tight">Summary Insights</h3>
                </div>
                <p className="text-[14px] font-medium text-[#4B5563] leading-relaxed">
                  Total unverified income currently stands at <span className="text-[#111827] font-extrabold tracking-tight">₦25,000</span>. You have <span className="text-[#111827] font-extrabold">2 transactions</span> pending manual verification from the weekend services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


