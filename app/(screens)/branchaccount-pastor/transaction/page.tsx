"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
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
  Search,
  ChevronDown,
  Download,
  MoreHorizontal,
  Upload,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle,
  ArrowUp
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useTransactions } from "@/components/hooks/useTransactions"
import BranchesDropdown from "@/components/navigation/BranchesDropdown"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { startDate, endDate, dateLabel } = useMemo(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const toParam = (value: Date) => value.toISOString().slice(0, 10)
    const label = start.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    })

    return {
      startDate: toParam(start),
      endDate: toParam(end),
      dateLabel: label,
    }
  }, [])

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const { transactions: rawTransactions, pagination, loading: txLoading, error: txError, refresh: refreshTransactions } = useTransactions({
    startDate,
    endDate,
    page,
    limit,
    search: debouncedSearch,
  })
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [reconciling, setReconciling] = useState(false)
  const [reconcileError, setReconcileError] = useState<string | null>(null)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("")
  const [coaOptions, setCoaOptions] = useState<Array<{ id: string; label: string }>>([])
  const [coaLoading, setCoaLoading] = useState(true)
  const [coaError, setCoaError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [parseOpen, setParseOpen] = useState(false)
  const [parseSubject, setParseSubject] = useState("")
  const [parseFrom, setParseFrom] = useState("")
  const [parseBody, setParseBody] = useState("")
  const [parseLoading, setParseLoading] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseResults, setParseResults] = useState<Array<Record<string, any>>>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(value)

  const formatDateLabel = (value?: string) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const transactions = useMemo(() => {
    return rawTransactions.map((tx, idx) => {
      const flowType = (tx.flowType ?? "").toUpperCase()
      const isPositive = flowType === "INFLOW" || tx.amount >= 0
      const status = (tx.status ?? "UNVERIFIED").toUpperCase()
      const isVerified = status.includes("VERIFIED") || status === "APPROVED"
      const tagLabel = tx.category || tx.coaName || "Uncategorized"
      const tagColor = isPositive
        ? "bg-[#F3E8FF] text-[#9333EA]"
        : "bg-[#F3F4F6] text-[#4B5563]"

      return {
        checked: idx === 0,
        date: formatDateLabel(tx.date),
        description: tx.description || "Transaction",
        amount: `${isPositive ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}`,
        isPositive,
        tag: tagLabel,
        tagColor,
        hasSparkle: tagLabel.toLowerCase().includes("tithe"),
        status: isVerified ? "Verified" : "Unverified",
        statusColor: isVerified ? "bg-transparent text-[#10B981]" : "bg-[#FEF3C7] text-[#D97706]",
        isVerified,
        id: tx.id ?? `tx-${idx}`,
      }
    })
  }, [rawTransactions])

  useEffect(() => {
    if (!selectedTransactionId && rawTransactions.length > 0) {
      setSelectedTransactionId(String(rawTransactions[0]?.id ?? ""))
    }
  }, [rawTransactions, selectedTransactionId])

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const selectedTransaction = useMemo(
    () => rawTransactions.find((tx) => String(tx.id) === String(selectedTransactionId)),
    [rawTransactions, selectedTransactionId]
  )

  const handleVerify = async () => {
    if (!selectedTransactionId) return
    setVerifying(true)
    setVerifyError(null)

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/api/core/financial/transactions/${selectedTransactionId}/verify`, {
        method: "POST",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to verify transaction.")
      }
      refreshTransactions()
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Unable to verify transaction.")
    } finally {
      setVerifying(false)
    }
  }

  const handleReconcile = async () => {
    if (!selectedTransactionId) return
    setReconciling(true)
    setReconcileError(null)

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/api/core/financial/transactions/${selectedTransactionId}/reconcile`, {
        method: "POST",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to reconcile transaction.")
      }
      refreshTransactions()
    } catch (err) {
      setReconcileError(err instanceof Error ? err.message : "Unable to reconcile transaction.")
    } finally {
      setReconciling(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!transactionId) return
    setDeletingId(transactionId)
    setDeleteError(null)

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/api/core/financial/transactions/${transactionId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete transaction.")
      }
      refreshTransactions()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete transaction.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleParseEmail = async () => {
    if (!tenantId) {
      setParseError("Tenant is required to parse email alerts.")
      return
    }
    if (!parseSubject.trim() || !parseBody.trim() || !parseFrom.trim()) {
      setParseError("Subject, sender, and body are required.")
      return
    }

    setParseLoading(true)
    setParseError(null)
    setParseResults([])

    try {
      const response = await fetch("/api/core/financial/bank-statement/parse-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: parseSubject.trim(),
          body: parseBody.trim(),
          from: parseFrom.trim(),
          tenantId,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to parse email alert.")
      }
      const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
      setParseResults(data)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Unable to parse email alert.")
    } finally {
      setParseLoading(false)
    }
  }

  const handleExport = async () => {
    if (!tenantId) {
      setExportError("Tenant is required to export transactions.")
      return
    }
    setExporting(true)
    setExportError(null)

    try {
      const params = new URLSearchParams({
        tenantId,
        startDate,
        endDate,
      })
      const response = await fetch(`/api/core/financial/export/transactions?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const payload = await response.json().catch(async () => ({
          message: await response.text().catch(() => ""),
        }))
        throw new Error(payload?.message ?? "Unable to export transactions.")
      }

      const blob = await response.blob()
      const disposition = response.headers.get("Content-Disposition") ?? ""
      const filenameMatch =
        disposition.match(/filename\\*=UTF-8''([^;]+)/i) ??
        disposition.match(/filename=\"?([^\";]+)\"?/i)
      const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : "transactions.csv"

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Unable to export transactions.")
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadCoaOptions = async () => {
      setCoaLoading(true)
      setCoaError(null)

      try {
        const url = tenantId
          ? `/api/core/financial/coa?type=INCOME&tenantId=${encodeURIComponent(tenantId)}`
          : "/api/core/financial/coa?type=INCOME"

        const coaResponse = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const coaData = await coaResponse.json().catch(() => null)

        if (!coaResponse.ok) {
          throw new Error(coaData?.message ?? "Unable to fetch chart of accounts.")
        }

        const rawItems = Array.isArray(coaData?.data?.content)
          ? coaData.data.content
          : Array.isArray(coaData?.data)
            ? coaData.data
            : Array.isArray(coaData?.items)
              ? coaData.items
              : Array.isArray(coaData)
                ? coaData
                : []

        const options = rawItems.map((item: any, index: number) => {
          const name =
            item?.name ?? item?.accountName ?? item?.title ?? `COA ${index + 1}`
          const code = item?.code ?? item?.accountCode ?? item?.number
          return {
            id: String(item?.id ?? item?.coaId ?? `${index}`),
            label: code ? `${code} - ${name}` : name,
          }
        })

        if (isMounted) {
          setCoaOptions(options)
        }
      } catch (error) {
        if (isMounted) {
          setCoaError(
            error instanceof Error ? error.message : "Unable to load COA list."
          )
        }
      } finally {
        if (isMounted) {
          setCoaLoading(false)
        }
      }
    }

    if (tenantId) {
      loadCoaOptions()
    } else {
      setCoaLoading(false)
      setCoaError("Tenant context is missing.")
    }

    return () => {
      isMounted = false
    }
  }, [tenantId])

  return (
          <div className="flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
      
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
              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft, active: true },
              { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
              { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database },
              { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${
                    item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"
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

      {/* Main Layout Wrapping Column */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-transparent px-4 sm:px-6 xl:px-8 w-full gap-4 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-white hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-[#111827] tracking-tight">Financial Overview</h1>
              <p className="text-[12px] text-[#3B5BDB] font-medium mt-0.5">Global financial health monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-3">
            <BranchesDropdown label="All Branches" />
            <button className="flex items-center h-[36px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] text-[#4B5563] font-bold shadow-sm hover:bg-gray-50 transition-all">
              <Calendar className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
              This Month
              <ChevronDown className="ml-2 h-3.5 w-3.5 text-[#9CA3AF]" />
            </button>
            
            <div className="hidden md:flex items-center h-[36px] rounded-[8px] border border-[#E5E7EB] bg-white p-1 shadow-sm">
              <button className="px-3 h-full rounded-[6px] bg-[#3B5BDB] text-white text-[11px] font-bold transition-all">NGN</button>
              <button className="px-3 h-full rounded-[6px] text-[#6B7280] text-[11px] font-bold hover:bg-gray-50 transition-all">USD</button>
              <button className="px-3 h-full rounded-[6px] text-[#6B7280] text-[11px] font-bold hover:bg-gray-50 transition-all">EUR</button>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center h-[36px] px-4 rounded-[8px] bg-[#3B5BDB] text-[12px] text-white font-bold shadow-sm hover:bg-[#3451b2] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
        {deleteError && (
          <div className="px-4 sm:px-6 xl:px-8 text-[12px] font-semibold text-rose-500">
            {deleteError}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 flex flex-col w-full px-4 sm:px-6 xl:px-8 pb-8 pt-4">
          
          <div className="flex flex-col xl:flex-row gap-6 h-full mt-1">
            
            {/* LEFT COLUMN: Main Headers, Metrics, and Table */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              {/* Bank Transactions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-t border-[#EEF1F6]/70 pt-5">
                <div>
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Bank Transactions</h2>
                  <p className="mt-1 text-[13px] text-[#9CA3AF] font-medium">Reconcile imported bank feeds with your chart of accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center h-[33.33px] w-[140px] sm:w-[160px] justify-center rounded-[5.33px] border-[0.67px] border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] font-bold shadow-sm hover:bg-gray-50 transition-all">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </button>
                  <button
                    onClick={() => setParseOpen((prev) => !prev)}
                    className="flex items-center h-[33.33px] w-[140px] sm:w-[160px] justify-center rounded-[5.33px] border-[0.67px] border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] font-bold shadow-sm hover:bg-gray-50 transition-all"
                  >
                    Parse Email Alert
                  </button>
                  <button
                    onClick={handleReconcile}
                    disabled={reconciling || !selectedTransactionId}
                    className="flex items-center h-[33.33px] w-[140px] sm:w-[160px] justify-center rounded-[5.33px] border-[0.67px] border-transparent bg-[#3AA5F3] px-4 text-[12px] text-white font-bold shadow-[0_4px_14px_rgba(58,165,243,0.39)] hover:bg-[#2b8cd1] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> 
                    {reconciling ? "Reconciling..." : "Sync Feed"}
                  </button>
                </div>
                {reconcileError && (
                  <div className="mt-2 text-[12px] font-semibold text-rose-500">
                    {reconcileError}
                  </div>
                )}
              </div>
              {parseOpen && (
                <div className="mt-4 rounded-xl border border-[#EEF1F6] bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#6B7280]">Subject</label>
                      <input
                        value={parseSubject}
                        onChange={(event) => setParseSubject(event.target.value)}
                        className="h-10 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
                        placeholder="Debit Alert"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#6B7280]">From</label>
                      <input
                        value={parseFrom}
                        onChange={(event) => setParseFrom(event.target.value)}
                        className="h-10 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
                        placeholder="alerts@bank.com"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#6B7280]">Body</label>
                    <textarea
                      value={parseBody}
                      onChange={(event) => setParseBody(event.target.value)}
                      className="min-h-[90px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
                      placeholder="Paste email alert body..."
                    />
                  </div>
                  {parseError && <div className="mt-2 text-[12px] font-semibold text-rose-500">{parseError}</div>}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleParseEmail}
                      disabled={parseLoading}
                      className="rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {parseLoading ? "Parsing..." : "Parse Alert"}
                    </button>
                    <button
                      onClick={() => {
                        setParseSubject("")
                        setParseFrom("")
                        setParseBody("")
                        setParseResults([])
                        setParseError(null)
                      }}
                      className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-bold text-[#6B7280] hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                  {parseResults.length > 0 && (
                    <div className="mt-4 rounded-lg border border-[#EEF1F6] bg-[#F8FAFC] p-3 text-[12px] text-[#4B5563]">
                      <div className="font-bold text-[#111827] mb-2">Parsed Alerts</div>
                      <div className="space-y-2">
                        {parseResults.map((item, index) => (
                          <div key={index} className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-semibold text-[#111827]">
                              {formatCurrency(Number(item?.amount ?? 0))}
                            </div>
                            <div className="text-[11px] text-[#6B7280]">
                              {String(item?.flowType ?? "UNKNOWN").toUpperCase()}
                            </div>
                            <div className="text-[11px] text-[#6B7280]">
                              Confidence: {Number(item?.confidence ?? 0).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Metric Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Unverified</div>
                    <AlertTriangle className="h-8 w-8 text-[#FEF3C7]" strokeWidth={2} />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-['Inter'] font-bold text-[20px] leading-[24px] tracking-normal align-middle text-[#111827]">14</span>
                    <span className="text-[12px] font-bold text-[#D97706]">Action Needed</span>
                  </div>
                </div>
                
                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Inflow (Month)</div>
                    <TrendingUp className="h-8 w-8 text-[#E6F4EA]" strokeWidth={2} />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-['Inter'] font-bold text-[20px] leading-[24px] tracking-normal align-middle text-[#111827]">₦8,840,250</span>
                    <span className="flex items-center text-[12px] font-bold text-[#10B981]">
                      <ArrowUp className="mr-0.5 h-3.5 w-3.5" strokeWidth={3} />
                      12%
                    </span>
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Pending Review</div>
                    <div className="h-8 w-8 rounded-full border border-[#E5E7EB] flex items-center justify-center gap-[3px]">
                      <div className="h-[4px] w-[4px] bg-[#E5E7EB] rounded-full"></div>
                      <div className="h-[4px] w-[4px] bg-[#E5E7EB] rounded-full"></div>
                      <div className="h-[4px] w-[4px] bg-[#E5E7EB] rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-['Inter'] font-bold text-[20px] leading-[24px] tracking-normal align-middle text-[#111827]">5</span>
                  </div>
                </div>
              </div>

              {/* Main Table Area */}
              <div className="flex-1 rounded-[16px] border border-[#EEF1F6] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col overflow-hidden min-h-[500px]">
                     {/* Table Toolbar */}
              <div className="p-4 sm:p-5 border-b border-[#EEF1F6] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Tabs */}
                <div className="flex items-center gap-6">
                  <button className="py-2 text-[14px] font-bold text-[#9CA3AF] hover:text-[#111827] transition-colors">All</button>
                  <button className="relative py-2 text-[14px] font-bold text-[#3B5BDB]">
                    Unverified
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B5BDB]"></div>
                  </button>
                  <button className="py-2 text-[14px] font-bold text-[#9CA3AF] hover:text-[#111827] transition-colors">Verified</button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto ml-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-[360px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    <input 
                      type="search" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by description or amount..." 
                      className="h-[40px] w-full rounded-[8px] border border-[#EEF1F6] bg-white pl-10 pr-4 text-[13px] text-[#111827] font-medium placeholder:text-[#9CA3AF] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-sm"
                    />
                  </div>
                  {/* Date */}
                  <button className="flex items-center justify-center h-[40px] px-4 rounded-[8px] border border-[#EEF1F6] bg-white text-[13px] text-[#111827] font-bold hover:bg-gray-50 transition-colors shrink-0 shadow-sm">
                    <Calendar className="mr-2 h-4 w-4 text-[#9CA3AF]" />
                    {dateLabel}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full min-w-[900px] table-fixed text-left text-[12px] sm:text-[13px]">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-white text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-center">
                      <th className="pl-6 pr-4 py-5 w-[56px] text-left">
                        <input type="checkbox" className="rounded-[4px] border-[#D1D5DB] text-[#3B5BDB] focus:ring-[#3B5BDB]" />
                      </th>
                      <th className="py-5 font-bold w-[140px]">DATE</th>
                      <th className="py-5 font-bold text-[#3B5BDB] w-[360px]">DESCRIPTION</th>
                      <th className="py-5 font-bold w-[150px]">AMOUNT</th>
                      <th className="py-5 font-bold w-[180px]">SUGGESTED TAG</th>
                      <th className="py-5 font-bold w-[120px]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {txLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[12px] text-[#6B7280]">
                          Loading transactions…
                        </td>
                      </tr>
                    ) : txError ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[12px] text-rose-500">
                          {txError}
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[12px] text-[#6B7280]">
                          No transactions available.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className={`hover:bg-gray-50/50 transition-colors ${String(selectedTransactionId) === String(tx.id) ? "bg-[#F8FAFF]" : "bg-white"}`}
                        >
                          <td className="pl-6 pr-4 py-4 sm:py-6 w-[56px] relative text-left">
                            {String(selectedTransactionId) === String(tx.id) && <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#3B5BDB]" />}
                            <input
                              type="checkbox"
                              checked={String(selectedTransactionId) === String(tx.id)}
                              onChange={() => setSelectedTransactionId(String(tx.id))}
                              className="rounded-[4px] border-[#D1D5DB] text-[#3B5BDB] shadow-sm focus:ring-[#3B5BDB]"
                            />
                          </td>
                          <td className="py-4 sm:py-6 text-center font-medium text-[#6B7280] whitespace-nowrap">{tx.date}</td>
                          <td className="py-4 sm:py-6 text-center text-[12px] font-medium leading-[16px] text-[#111827]">{tx.description}</td>
                          <td className={`py-4 sm:py-6 text-center font-bold tracking-tight ${tx.isPositive ? "text-[#10B981]" : "text-[#111827]"}`}>{tx.amount}</td>
                          <td className="py-4 sm:py-6 text-center">
                            <span className={`inline-flex h-[20px] min-w-[81.94px] w-auto items-center justify-center rounded-[6666px] px-2 text-[10px] font-bold tracking-wide ${tx.tagColor}`}>
                              {tx.tag}
                              {tx.hasSparkle && <Sparkles className="ml-1.5 h-3.5 w-3.5" />}
                            </span>
                          </td>
                            <td className="py-4 sm:py-6 text-center">
                              {tx.isVerified ? (
                                <span className={`inline-flex items-center text-[11.5px] font-bold tracking-wide ${tx.statusColor}`}>
                                  <CheckCircle className="mr-1.5 h-4 w-4 text-[#10B981]" strokeWidth={2.5} />
                                  {tx.status}
                                </span>
                              ) : (
                                <span className={`inline-flex items-center rounded-[6px] px-3 py-1.5 text-[11px] font-bold tracking-wide ${tx.statusColor}`}>
                                  {tx.status}
                                </span>
                              )}
                              <button
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleDeleteTransaction(String(tx.id))
                                }}
                                disabled={deletingId === String(tx.id)}
                                className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60 disabled:cursor-not-allowed align-middle"
                              >
                                {deletingId === String(tx.id) ? (
                                  <span className="text-[9px] font-bold">...</span>
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
              <div className="p-5 border-t border-[#EEF1F6] flex items-center justify-between text-[13px] text-[#9CA3AF] font-medium bg-white">
                <div>
                  Showing {pagination && pagination.total > 0 
                      ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}`
                      : "0"} of {pagination?.total ?? 0} transactions
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination || pagination.page <= 1}
                    className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(pagination?.pages ?? 1, p + 1))}
                    disabled={!pagination || pagination.page >= (pagination?.pages ?? 1)}
                    className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Verification Sidebar Widget */}
            <div className="w-full xl:w-[350px] shrink-0 flex flex-col pt-5">
              <div className="rounded-[16px] border border-[#EEF1F6] border-b-2 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col sticky top-[100px]">
                
                <div className="flex items-start justify-between p-6 border-b border-[#EEF1F6]">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">Verification</h3>
                    <p className="text-[12px] font-bold text-[#9CA3AF] mt-1 tracking-wide">
                      Transaction #{selectedTransaction?.id ?? "—"}
                    </p>
                  </div>
                  <button className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#9CA3AF] transition-colors border border-transparent hover:border-[#E5E7EB]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6 flex-1 space-y-5">
                  <div className="rounded-[10px] bg-[#F4F6FF] p-4 text-[#111827] border border-[#EEF2FF]">
                    <div className="text-[9px] font-bold text-[#3B5BDB] uppercase tracking-wider mb-2.5">
                      {(selectedTransaction?.flowType ?? "Transaction").toString()}
                    </div>
                    <div className="text-[13px] font-bold mb-3.5 uppercase tracking-tight text-[#111827]">
                      {selectedTransaction?.description ?? "Transaction"}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-bold text-[#9CA3AF]">{formatDateLabel(selectedTransaction?.date)}</div>
                      <div className={`text-[15px] font-bold ${Number(selectedTransaction?.amount ?? 0) >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                        {formatCurrency(Number(selectedTransaction?.amount ?? 0))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[10px] bg-[#FAF5FF] p-4 border border-[#F3E8FF] shadow-[0_2px_10px_0_rgba(147,51,234,0.03)]">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 shrink-0 bg-[#F3E8FF] h-6 w-6 rounded-full flex items-center justify-center border border-[#E9D5FF]">
                        <Sparkles className="h-3 w-3 text-[#9333EA]" />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#9333EA]">
                          Suggestion: {selectedTransaction?.coaName ?? "Uncategorized"}
                        </div>
                        <div className="text-[11px] font-bold text-[#A855F7] mt-1.5 leading-snug">
                          Based on description context
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 pt-2">
                    <div>
                      <label className="mb-2.5 block text-[12px] font-bold text-[#111827]">Chart of Accounts</label>
                      <div className="relative">
                        <select className="h-[42px] w-full appearance-none rounded-[8px] border border-[#EEF1F6] bg-white pl-3.5 pr-10 text-[13px] font-bold text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                          {coaLoading ? (
                            <option>Loading chart of accounts...</option>
                          ) : coaError ? (
                            <option>{coaError}</option>
                          ) : coaOptions.length === 0 ? (
                            <option>No COA entries available</option>
                          ) : (
                            coaOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))
                          )}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2.5 block text-[12px] font-bold text-[#111827]">Budget Head <span className="text-[#3AA5F3] font-medium ml-1">[Optional]</span></label>
                      <div className="relative">
                        <select className="h-[42px] w-full appearance-none rounded-[8px] border border-[#EEF1F6] bg-white pl-3.5 pr-10 text-[13px] font-medium text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                          <option>Select a budget...</option>
                          <option>Missions</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2.5 block text-[12px] font-bold text-[#111827]">Notes</label>
                      <textarea 
                        className="w-full rounded-[8px] border border-[#EEF1F6] bg-white p-3.5 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all min-h-[70px] resize-none shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]"
                        placeholder="Add a note about this transaction..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[#EEF1F6] bg-gray-50/30">
                  <button
                    onClick={handleVerify}
                    disabled={verifying || !selectedTransactionId}
                    className="flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#3B5BDB] text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(59,91,219,0.25)] hover:bg-[#3451b2] transition-colors mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {verifying ? "Verifying..." : "Verify & Save"}
                  </button>
                  {verifyError && (
                    <div className="mb-3 text-[12px] font-semibold text-rose-500">
                      {verifyError}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button className="flex-1 h-[40px] items-center justify-center rounded-[8px] border border-[#EEF1F6] bg-white text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
                      Split
                    </button>
                    <button className="flex-1 h-[40px] items-center justify-center rounded-[8px] border border-[#FEE2E2] bg-[#FFF5F5] text-[12px] font-bold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors shadow-sm">
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}
