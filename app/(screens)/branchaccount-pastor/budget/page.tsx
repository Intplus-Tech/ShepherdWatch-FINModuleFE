"use client"



import React, { useMemo, useState } from "react"

import Image from "next/image"

import { Inter } from "next/font/google"

import {

  LayoutDashboard,

  ArrowRightLeft,

  Wallet,

  Database,

  ShieldCheck,

  Settings,

  HelpCircle,

  Menu,

  X,

  ChevronDown,

  Download,

  Building2,

  Calendar,

  TrendingUp,

  Info,

  Plus,

  MessageSquare,

  PiggyBank,

  Landmark

} from "lucide-react"

import { useBudgetEntries } from "@/components/hooks/useBudgetEntries"
import { useAuth } from "@/components/auth/AuthProvider"



const inter = Inter({ subsets: ["latin"] })



const formatCurrency = (value: number) =>

  new Intl.NumberFormat("en-NG", {

    style: "currency",

    currency: "NGN",

    maximumFractionDigits: 0,

  }).format(value)



export default function Page() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { entries, loading: budgetLoading, error: budgetError } = useBudgetEntries()

  const { user } = useAuth()
  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [lastProposalId, setLastProposalId] = useState<string | null>(null)
  const [deletingProposal, setDeletingProposal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; " )
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleSubmitProposal = async () => {
    if (!tenantId) {
      setSubmitError("Tenant is required to submit a budget proposal.")
      return
    }

    const lines = entries
      .filter((entry) => entry.coaId)
      .map((entry) => ({
        coaId: entry.coaId,
        proposedAmount: Number(entry.amount ?? 0),
        justification: entry.name ?? entry.coaName ?? "Budget proposal line",
      }))

    if (lines.length === 0) {
      setSubmitError("No budget lines available to submit.")
      return
    }

    setSubmittingProposal(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const year = new Date().getFullYear() + 1
      const csrfToken = getCsrfToken()
      const response = await fetch("/api/core/financial/budget-proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          title: `${year} Annual Budget Proposal`,
          year,
          tenantId,
          lines,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to submit budget proposal.")
      }

      const proposalId = payload?.data?.id ?? payload?.id
      if (!proposalId) {
        throw new Error("Budget proposal created but no ID returned.")
      }
      setLastProposalId(String(proposalId))

      const submitResponse = await fetch(`/api/core/financial/budget-proposals/${proposalId}/submit`, {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      })
      const submitPayload = await submitResponse.json().catch(() => null)
      if (!submitResponse.ok) {
        throw new Error(submitPayload?.message ?? "Unable to submit budget proposal.")
      }

      setSubmitSuccess("Budget proposal submitted successfully.")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit budget proposal.")
    } finally {
      setSubmittingProposal(false)
    }
  }

  const handleExport = async () => {
    if (!tenantId) {
      setExportError("Tenant is required to export budget entries.")
      return
    }
    setExporting(true)
    setExportError(null)

    try {
      const params = new URLSearchParams({ tenantId })
      const response = await fetch(`/api/core/export/budget-entries?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const payload = await response.json().catch(async () => ({
          message: await response.text().catch(() => ""),
        }))
        throw new Error(payload?.message ?? "Unable to export budget entries.")
      }

      const blob = await response.blob()
      const disposition = response.headers.get("Content-Disposition") ?? ""
      const filenameMatch =
        disposition.match(/filename\\*=UTF-8''([^;]+)/i) ??
        disposition.match(/filename=\"?([^\";]+)\"?/i)
      const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : "budget-entries.csv"

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Unable to export budget entries.")
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteProposal = async () => {
    if (!lastProposalId) {
      setDeleteError("No budget proposal available to delete.")
      return
    }
    setDeletingProposal(true)
    setDeleteError(null)

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/api/core/financial/budget-proposals/${lastProposalId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete budget proposal.")
      }
      setLastProposalId(null)
      setSubmitSuccess("Budget proposal deleted successfully.")
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete budget proposal.")
    } finally {
      setDeletingProposal(false)
    }
  }



  const budgetData = useMemo(() => {

    const grouped = new Map<string, any[]>()

    entries.forEach((entry) => {

      const groupKey = entry.category || entry.stream || "Budget Entries"

      if (!grouped.has(groupKey)) grouped.set(groupKey, [])

      grouped.get(groupKey)?.push(entry)

    })



    return Array.from(grouped.entries()).map(([category, items]) => ({

      category,

      expanded: true,

      items: items.map((entry) => ({

        id: entry.id,

        name: entry.coaName || entry.name || `COA ${entry.coaId ?? ""}`.trim(),

        actual: "—",
        proposed: formatCurrency(entry.amount || 0),
        hasIcon: true,
        variance: "—",
        isPositive: (entry.amount ?? 0) >= 0,

      })),

    }))

  }, [entries])



  const totalProposed = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.amount || 0), 0),
    [entries]
  )

  const totals = useMemo(() => {
    const income = entries
      .filter((entry) => (entry.type ?? "").toUpperCase() === "INCOME")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)

    const expense = entries
      .filter((entry) => (entry.type ?? "").toUpperCase() === "EXPENSE")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)

    const overall = entries.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)
    const resolvedIncome = income || overall
    const resolvedExpense = expense || overall
    const deduction = resolvedIncome * 0.1
    const surplus = resolvedIncome - resolvedExpense - deduction

    return { income: resolvedIncome, expense: resolvedExpense, deduction, surplus }
  }, [entries])


  return (

    <div className={`flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>



      {/* Mobile Drawer Overlay */}

      {isMobileMenuOpen && (

        <div

          className="xl:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"

          onClick={() => setIsMobileMenuOpen(false)}

        />

      )}



      {/* Sidebar - Remains clean and hidden on mobile until toggled */}

      <aside className={`w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}>

        <button

          onClick={() => setIsMobileMenuOpen(false)}

          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"

        >

          <X className="h-4.5 w-4.5" />

        </button>

        <div className="p-6 flex flex-col h-full overflow-y-auto">

          <div className="flex items-center gap-3 pb-8">

            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={28} height={28} className="shrink-0" />

            <div>

              <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>

              <div className="text-[11px] text-[#9CA3AF] font-bold mt-1 tracking-wide uppercase">Accountant View</div>

            </div>

          </div>



          <nav className="space-y-1.5 flex-1">

            {[

              { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },

              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },

              { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet, active: true },

              { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database },

              { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },

            ].map((item) => {

              const Icon = item.icon

              return (

                <div

                  key={item.label}

                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"

                    }`}

                >

                  <div className="flex items-center gap-3.5">

                    <Icon className={`h-4.5 w-4.5 stroke-[2] ${item.active ? "text-[#3B5BDB]" : "text-[#6B7280]"}`} />

                    {item.label}

                  </div>

                </div>

              )

            })}

          </nav>



          <div className="mt-auto">

            <div className="space-y-1.5 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">

              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">

                <Settings className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />

                Settings

              </div>

              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">

                <HelpCircle className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />

                Help Center

              </div>

            </div>



            <div className="mt-8 flex items-center gap-3.5 px-3.5 pb-2 cursor-pointer hover:opacity-80 transition-opacity">

              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center">

                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />

              </div>

              <div>

                <div className="text-[14px] font-bold text-[#111827]">Alex Morgan</div>

                <div className="text-[11px] text-[#9CA3AF] font-medium">Accountant</div>

              </div>

            </div>

          </div>

        </div>

      </aside>



      {/* Main Layout Wrap */}

      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden">



        {/* Top Header */}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-transparent px-4 sm:px-6 xl:px-8 w-full gap-4 pt-3 pb-2 sm:pt-4 sm:pb-3">

          <div className="flex items-center gap-3 w-full sm:w-auto">

            <button

              onClick={() => setIsMobileMenuOpen(true)}

              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-white hover:text-[#111827] transition-colors"

            >

              <Menu className="h-5 w-5" />

            </button>

            <div className="flex-1">

              <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111827] tracking-tight truncate">Financial Overview</h1>

              <p className="text-[11px] sm:text-[12px] text-[#3B5BDB] font-medium mt-0.5 truncate">Global financial health monitoring</p>

            </div>

          </div>



          <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">

            <button className="flex justify-center whitespace-nowrap items-center h-[36px] px-3 flex-1 sm:flex-none rounded-[8px] border border-[#E5E7EB] bg-white text-[11px] sm:text-[12px] text-[#4B5563] font-bold shadow-sm hover:bg-gray-50 transition-all">

              <Building2 className="mr-2 h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />

              <span className="truncate">All Branches</span>

              <ChevronDown className="ml-2 h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />

            </button>

            <button className="flex justify-center whitespace-nowrap items-center h-[36px] px-3 flex-1 sm:flex-none rounded-[8px] border border-[#E5E7EB] bg-white text-[11px] sm:text-[12px] text-[#4B5563] font-bold shadow-sm hover:bg-gray-50 transition-all">

              <Calendar className="mr-2 h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />

              <span className="truncate">This Month</span>

              <ChevronDown className="ml-2 h-3.5 w-3.5 text-[#9CA3AF] shrink-0" />

            </button>



            <div className="hidden md:flex items-center h-[36px] rounded-[8px] border border-[#E5E7EB] bg-white p-1 shadow-sm shrink-0">

              <button className="px-3 h-full rounded-[6px] bg-[#3B5BDB] text-white text-[11px] font-bold transition-all">NGN</button>

              <button className="px-3 h-full rounded-[6px] text-[#6B7280] text-[11px] font-bold hover:bg-gray-50 transition-all">USD</button>

              <button className="px-3 h-full rounded-[6px] text-[#6B7280] text-[11px] font-bold hover:bg-gray-50 transition-all">EUR</button>

            </div>



            <button
              onClick={handleExport}
              disabled={exporting}
              className="hidden sm:flex items-center justify-center h-[36px] px-4 rounded-[8px] bg-[#3B5BDB] text-[12px] text-white font-bold shadow-sm hover:bg-[#3451b2] transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              <Download className="mr-2 h-4 w-4" />

              {exporting ? "Exporting..." : "Export"}

            </button>

          </div>

        </header>
        {exportError && (
          <div className="px-4 sm:px-6 xl:px-8 text-[12px] font-semibold text-rose-500">
            {exportError}
          </div>
        )}



        {/* Page Content */}

        <main className="flex-1 flex flex-col w-full px-4 sm:px-6 xl:px-8 pb-8 pt-2">



          <div className="flex flex-col lg:flex-row gap-6 h-full">

            <div className="flex-1 min-w-0 flex flex-col">



              {/* Main Header Area */}

              <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-6 gap-4 pt-2 border-t border-[#EEF1F6]/70">

                <div>

                  <h2 className="text-[18px] sm:text-[22px] font-bold text-[#111827] tracking-tight">Budget Preparation & Forecasting</h2>

                  <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7280] font-medium leading-snug">Manage operational, program, and capital expenditures for next fiscal month.</p>

                </div>

                <div className="flex flex-row items-center w-full md:w-auto gap-3">

                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex flex-1 justify-center md:flex-none whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 sm:px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[12px] text-[#111827] font-bold shadow-sm hover:bg-gray-50 transition-all tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    <Download className="mr-1.5 h-3.5 w-3.5" />

                    {exporting ? "Exporting..." : "Export"}

                  </button>
                  <button
                    onClick={handleDeleteProposal}
                    disabled={deletingProposal || !lastProposalId}
                    className="flex flex-1 justify-center md:flex-none whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 sm:px-4 rounded-[6px] border border-rose-200 bg-rose-50 text-[12px] text-rose-600 font-bold shadow-sm hover:bg-rose-100 transition-all tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingProposal ? "Deleting..." : "Delete Proposal"}
                  </button>

                  <button onClick={handleSubmitProposal} disabled={submittingProposal} className="flex flex-2 justify-center md:flex-none whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 sm:px-4 rounded-[6px] bg-[#3B5BDB] text-[12px] text-white font-bold shadow-[0_4px_14px_rgba(59,91,219,0.25)] hover:bg-[#3451b2] transition-all tracking-wide disabled:opacity-60 disabled:cursor-not-allowed">

                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mr-2 outline-none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>

                    {submittingProposal ? "Submitting..." : "Submit Proposal"}

                  </button>

                </div>

              </div>



              {/* Top Summary Cards */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">Total Projected Income</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">

                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.income)}</div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-[#10B981] tracking-wide truncate">+5.2% vs Last Year</div>

                  </div>

                </div>



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">Total Expenditure</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center shrink-0">

                      <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.expense)}</div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] tracking-wide truncate">84% of Income</div>

                  </div>

                </div>



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-bold text-[#9333EA]">HQ Deductions</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">

                      <Landmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.deduction)}</div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] tracking-wide truncate">Fixed 10% Tithe</div>

                  </div>

                </div>



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">Net Surplus</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-gray-100 text-[#111827] flex items-center justify-center border border-[#E5E7EB] shrink-0">

                      <PiggyBank className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.surplus)}</div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-[#10B981] tracking-wide truncate">Healthy buffer</div>

                  </div>

                </div>



              </div>



              {/* Main Table Interface */}

              <div className="rounded-[16px] bg-white border border-[#EEF1F6] flex flex-col shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] relative min-h-[460px] pb-[130px] sm:pb-[88px]">



                {/* Header Row */}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 lg:p-6 lg:pb-4 gap-3 sm:gap-4 border-b border-[#EEF1F6]">

                  <h3 className="text-[16px] sm:text-[18px] font-bold text-[#111827] tracking-tight">Budget Breakdown</h3>

                  <button className="flex items-center text-[12px] sm:text-[13px] font-bold text-[#3B5BDB] hover:text-[#3451b2] transition-colors bg-[#EEF2FF] sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-[6px] sm:rounded-none">

                    <Plus className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    Add Line Item

                  </button>

                </div>



                {/* Content */}

                <div className="w-full overflow-x-auto flex-1 pb-4">

                  <table className="w-full min-w-[700px] md:min-w-[800px] text-left text-[13px] border-collapse">

                    <thead>

                      <tr className="bg-transparent text-[#9CA3AF] border-b border-t-0 border-[#EEF1F6]">

                        <th className="py-3 sm:py-4 pl-4 sm:pl-6 lg:pl-8 font-medium w-[200px] sm:w-[280px]">Category Name</th>

                        <th className="py-3 sm:py-4 font-medium w-[130px] sm:w-[150px] text-center">Prev. Year Actual</th>

                        <th className="py-3 sm:py-4 font-medium w-[200px] sm:w-[220px] text-center">Proposed Budget</th>

                        <th className="py-3 sm:py-4 font-medium w-[80px] sm:w-[100px] text-center">Monthly</th>

                        <th className="py-3 sm:py-4 pr-4 sm:pr-6 lg:pr-8 font-medium w-[100px] sm:w-[120px] text-right">Variance</th>

                      </tr>

                    </thead>

                    <tbody>

                      {budgetLoading ? (

                        <tr>

                          <td colSpan={5} className="py-6 text-center text-[12px] text-[#9CA3AF]">

                            Loading budget entries...

                          </td>

                        </tr>

                      ) : budgetError ? (

                        <tr>

                          <td colSpan={5} className="py-6 text-center text-[12px] text-rose-600">

                            {budgetError}

                          </td>

                        </tr>

                      ) : budgetData.length === 0 ? (

                        <tr>

                          <td colSpan={5} className="py-6 text-center text-[12px] text-[#9CA3AF]">

                            No budget entries found for this period.

                          </td>

                        </tr>

                      ) : (

                        budgetData.map((group, gIdx) => (

                          <React.Fragment key={gIdx}>

                            <tr className="border-t border-[#EEF1F6] bg-gray-50/50">

                              <td colSpan={5} className="py-3 sm:py-4 pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">

                                <div className="flex items-center text-[12px] sm:text-[13px] font-bold text-[#111827]">

                                  <ChevronDown className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#111827] shrink-0" strokeWidth={2.5} />

                                  {group.category}

                                </div>

                              </td>

                            </tr>



                            {group.items.map((item) => (

                              <tr key={item.id} className="hover:bg-gray-50/20 transition-colors bg-white group border-b border-[#EEF1F6]/50 last:border-0">

                                <td className="py-3 pl-[32px] sm:pl-[44px] lg:pl-[52px] pr-4 font-medium text-[#374151] border-0 text-[12px] sm:text-[13px]">

                                  {item.name}

                                </td>

                                <td className="py-3 font-semibold text-[#6B7280] tracking-tight text-center border-0 text-[12px] sm:text-[13px]">

                                  {item.actual}

                                </td>

                                <td className="py-3 px-2 flex justify-center border-0">

                                  <div className="flex items-center h-[36px] sm:h-[38px] w-full max-w-[140px] rounded-[6px] border border-[#EEF1F6] bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB]/20 transition-all">

                                    <span className="text-[#9CA3AF] font-bold mr-1.5 sm:mr-2 text-[12px] sm:text-[13px]">₦</span>
                                    <input

                                      type="text"

                                      defaultValue={item.proposed}

                                      className="bg-transparent w-full text-[12px] sm:text-[13px] font-bold text-[#111827] outline-none tracking-tight"

                                    />

                                  </div>

                                </td>

                                <td className="py-3 text-center border-0">

                                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3AA5F3] mx-auto cursor-pointer hover:opacity-80 transition-opacity" strokeWidth={2} />

                                </td>

                                <td className="py-3 pr-4 sm:pr-6 lg:pr-8 text-right border-0">

                                  <span className={`inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-bold tracking-wide ${item.isPositive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FEF2F2] text-[#EF4444]"}`}>

                                    {item.variance}

                                  </span>

                                </td>

                              </tr>

                            ))}

                          </React.Fragment>

                        ))

                      )}

                      {/* Total Line */}

                      <tr className="border-t-2 border-[#E5E7EB] bg-white">

                        <td className="py-4 sm:py-5 pl-4 sm:pl-6 lg:pl-8 pr-4 font-bold text-[#111827] text-[13px] sm:text-[14px]">Total Budget</td>

                        <td className="py-4 sm:py-5 font-bold text-[#6B7280] text-[13px] sm:text-[14px] text-center tracking-tight">—</td>

                        <td className="py-4 sm:py-5 font-bold text-[#111827] text-[14px] sm:text-[15px] text-center tracking-tight">{formatCurrency(totalProposed)}</td>

                        <td className="py-4 sm:py-5"></td>

                        <td className="py-4 sm:py-5 pr-4 sm:pr-6 lg:pr-8 font-bold text-[#6B7280] text-right text-[12px] sm:text-[14px]">—</td>

                      </tr>

                    </tbody>

                  </table>

                </div>



                {/* Footer Save & Submit Area */}

                <div className="absolute bottom-0 left-0 right-0 py-3 sm:py-4 px-4 sm:px-6 bg-[#F8FAFC] sm:bg-white border-t border-[#EEF1F6] flex flex-row items-center justify-between sm:justify-end gap-3 sm:gap-4 rounded-b-[16px]">
                  {(submitError || submitSuccess || deleteError) && (
                    <div className="text-[11px] font-semibold mr-auto">
                      {submitSuccess && <span className="text-emerald-600">{submitSuccess}</span>}
                      {submitError && <span className="text-rose-500">{submitError}</span>}
                      {deleteError && <span className="text-rose-500">{deleteError}</span>}
                    </div>
                  )}

                  <button className="text-[12px] sm:text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors shrink-0 whitespace-nowrap bg-white sm:bg-transparent border border-[#E5E7EB] sm:border-transparent px-4 py-2 sm:px-0 sm:py-0 rounded-[6px] sm:rounded-none">Save Draft</button>

                  <button onClick={handleSubmitProposal} disabled={submittingProposal} className="h-[38px] sm:h-[40px] flex-1 sm:flex-none justify-center shrink-0 whitespace-nowrap px-4 sm:px-6 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] sm:text-[13px] font-bold shadow-[0_4px_14px_rgba(59,91,219,0.35)] hover:bg-[#3451b2] transition-colors tracking-wide outline-none disabled:opacity-60 disabled:cursor-not-allowed">

                    {submittingProposal ? "Submitting..." : "Submit Budget"}

                  </button>

                </div>

              </div>



              {/* Deadline Alert Notice */}

              <div className="mt-6 mb-4 rounded-[12px] bg-[#EEF2FF] border border-[#E0E7FF] p-4 sm:p-5 flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">

                <Info className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[#3B5BDB] shrink-0 mt-[2px]" strokeWidth={2.5} />

                <div>

                  <h4 className="text-[12px] sm:text-[13px] font-bold text-[#3B5BDB] tracking-wide mb-0.5">Approval Deadline approaching</h4>

                  <p className="text-[12px] sm:text-[13px] font-medium text-[#4f67c2] mt-1 leading-[18px] sm:leading-[20px] opacity-90 max-w-[850px]">Please ensure all department heads have reviewed their respective allocations before submitting for the final board meeting on November 15th.</p>

                </div>

              </div>



            </div>

          </div>

        </main>



      </div>

    </div>

  )

}

