"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Coins,
  Scale,
  Wallet,
  Building2,
  Users,
  Settings,
  Search,
  ChevronDown,
  Download,
  AlertTriangle,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  Flag,
  Upload,
  RefreshCw,
  X,
  Calendar,
  Eye,
  Check,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useTransactions } from "@/components/hooks/useTransactions"
import BranchesDropdown from "@/components/navigation/BranchesDropdown"

const navItems = [
  { label: "Dashboard", href: "/director-screen/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/director-screen/transaction", icon: ArrowLeftRight },
  { label: "Budgeting", href: "/director-screen/budgeting", icon: Coins },
  { label: "Compliance", href: "/director-screen/compliance", icon: Scale },
  { label: "Asset", href: "/director-screen/assets", icon: Wallet },
  { label: "Branch Management", href: "/director-screen/branch-management", icon: Building2 },
  { label: "Users", href: "/director-screen/users", icon: Users },
  { label: "Settings", href: "/director-screen/settings", icon: Settings },
]

type CoaTreeNode = {
  id?: string
  _id?: string
  coaId?: string
  code?: string
  accountCode?: string
  number?: string
  name?: string
  accountName?: string
  title?: string
  accountType?: string
  children?: CoaTreeNode[]
}

function flattenCoaTree(nodes: CoaTreeNode[]): CoaTreeNode[] {
  const flat: CoaTreeNode[] = []
  const queue = [...nodes]
  while (queue.length > 0) {
    const node = queue.shift()
    if (!node) continue
    flat.push(node)
    if (Array.isArray(node.children) && node.children.length > 0) {
      queue.push(...node.children)
    }
  }
  return flat
}

export default function Page() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNVERIFIED" | "VERIFIED">("ALL")
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
    const handler = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1) }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])
  const { transactions: rawTransactions, pagination, loading: txLoading, error: txError, refresh: refreshTransactions } = useTransactions({
    ...(statusFilter === "ALL" ? {} : { status: statusFilter }),
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
  const [selectedCoaId, setSelectedCoaId] = useState<string>("")
  const [coaLoading, setCoaLoading] = useState(true)
  const [coaError, setCoaError] = useState<string | null>(null)
  const [coaDeleteError, setCoaDeleteError] = useState<string | null>(null)
  const [deletingCoa, setDeletingCoa] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [parseOpen, setParseOpen] = useState(false)
  const [parseSubject, setParseSubject] = useState("")
  const [parseFrom, setParseFrom] = useState("")
  const [parseBody, setParseBody] = useState("")
  const [parseLoading, setParseLoading] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseResults, setParseResults] = useState<Array<Record<string, unknown>>>([])
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

      return {
        id: tx.id ?? `tx-${idx}`,
        date: formatDateLabel(tx.date),
        description: tx.description || "Transaction",
        amount: `${isPositive ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}`,
        amountColor: isPositive ? "text-emerald-600" : "text-gray-600",
        tag: tagLabel,
        tagBg: isPositive ? "bg-purple-50" : "bg-gray-100",
        tagColor: isPositive ? "text-purple-600" : "text-gray-500",
        status: isVerified ? "Verified" : "Unverified",
        statusBg: isVerified ? "bg-transparent" : "bg-amber-100/50",
        statusColor: isVerified ? "text-emerald-500" : "text-amber-600",
        checked: idx === 0,
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

  const handleDeleteSelectedCoa = async () => {
    if (!selectedCoaId) return
    setDeletingCoa(true)
    setCoaDeleteError(null)
    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/api/core/financial/coa/${encodeURIComponent(selectedCoaId)}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete chart of account.")
      }

      setCoaOptions((prev) => {
        const next = prev.filter((option) => option.id !== selectedCoaId)
        setSelectedCoaId(next[0]?.id ?? "")
        return next
      })
    } catch (error) {
      setCoaDeleteError(error instanceof Error ? error.message : "Unable to delete chart of account.")
    } finally {
      setDeletingCoa(false)
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

  const stats = useMemo(() => {
    const unverifiedCount = rawTransactions.filter((tx) =>
      String(tx.status ?? "").toUpperCase().includes("UNVERIFIED")
    ).length
    const inflowMonth = rawTransactions
      .filter((tx) => String(tx.flowType ?? "").toUpperCase() === "INFLOW")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0)

    return [
      {
        title: "UNVERIFIED",
        value: String(unverifiedCount),
        trend: "Action Needed",
        trendColor: "text-amber-500",
        icon: AlertTriangle,
        iconBaseColor: "text-amber-100",
        iconColor: "text-amber-500",
      },
      {
        title: "INFLOW (MONTH)",
        value: formatCurrency(inflowMonth),
        trend: inflowMonth ? "↑12%" : "",
        trendColor: "text-emerald-500",
        icon: ArrowUpRight,
        iconBaseColor: "text-emerald-100",
        iconColor: "text-emerald-500",
      },
      {
        title: "PENDING REVIEW",
        value: "0",
        trend: "",
        trendColor: "",
        icon: MoreHorizontal,
        iconBaseColor: "text-gray-100",
        iconColor: "text-gray-400",
      },
    ]
  }, [rawTransactions])

  useEffect(() => {
    let isMounted = true

    const loadCoaOptions = async () => {
      setCoaLoading(true)
      setCoaError(null)

      try {
        const url = tenantId
          ? `/api/core/financial/coa/tree?branchId=${encodeURIComponent(tenantId)}`
          : "/api/core/financial/coa/tree"

        const coaResponse = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const coaData = await coaResponse.json().catch(() => null)

        if (!coaResponse.ok) {
          throw new Error(coaData?.message ?? "Unable to fetch chart of accounts.")
        }

        const rawTree = Array.isArray(coaData?.data)
          ? coaData.data
          : Array.isArray(coaData?.items)
            ? coaData.items
            : Array.isArray(coaData)
              ? coaData
              : []

        const rawItems = flattenCoaTree(rawTree as CoaTreeNode[]).filter(
          (item) => String(item.accountType ?? "").toLowerCase() === "revenue"
        )

        const options = rawItems.map((item: CoaTreeNode, index: number) => {
          const name =
            item?.name ?? item?.accountName ?? item?.title ?? `COA ${index + 1}`
          const code = item?.code ?? item?.accountCode ?? item?.number
          return {
            id: String(item?.id ?? item?._id ?? item?.coaId ?? `${index}`),
            label: code ? `${code} - ${name}` : name,
          }
        })

        if (isMounted) {
          setCoaOptions(options)
          setSelectedCoaId((prev) => prev || options[0]?.id || "")
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
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col border-r border-[#EEF1F6] bg-[#FAFBFF] xl:flex">
        <div className="flex flex-col gap-1 px-6 pt-6 lg:pt-8 pb-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={160} height={36} className="object-contain" />
          </div>
          <span className="text-[10px] font-medium text-[#3B5BDB] ml-9 -mt-1">Super Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 mt-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/director-screen/transaction"
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#3B5BDB] text-white shadow-sm"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#EEF1F6] p-5 mt-auto">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0">
              <Image
                src="/images/Beared%20Guy02-min%201.jpg"
                alt="User avatar"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#111827]">Rev. Thomas M.</span>
              <span className="text-[11px] font-medium text-[#6B7280]">Director</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="w-full px-4 pt-5 pb-6 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 lg:pb-8">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-5 sm:pb-6">
            <div className="pt-1">
              <h1 className="text-[20px] sm:text-[24px] leading-tight font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[12px] sm:text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <BranchesDropdown label="All Branches" />
              
              <button className="flex w-full sm:w-auto items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] sm:text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                <Calendar className="h-4 w-4 text-[#6B7280]" />
                This Month
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>

              <div className="flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm w-full sm:w-auto">
                <button className="rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white">NGN</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">USD</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">EUR</button>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex w-full sm:w-auto items-center gap-2 rounded-md bg-[#3B5BDB] px-3.5 py-2 text-[11px] sm:text-[12px] font-medium text-white shadow hover:bg-blue-700 ml-0 sm:ml-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
          {exportError && (
            <div className="mb-4 text-[12px] font-semibold text-rose-500">
              {exportError}
            </div>
          )}
          {deleteError && (
            <div className="mb-4 text-[12px] font-semibold text-rose-500">
              {deleteError}
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Left Main Pane (Bank Transactions) */}
            <div className="flex-1 flex flex-col">
              
              {/* Internal Header for Bank Transactions */}
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-3">
                <div>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111827]">Bank Transactions</h2>
                  <p className="text-[12px] sm:text-[13px] text-[#9CA3AF] mt-1">Reconcile imported bank feeds with your chart of accounts.</p>
                </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
                  <button className="flex w-full sm:w-auto items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors">
                    <Upload className="h-4 w-4 text-[#4B5563]" strokeWidth={2.5} /> Upload CSV
                  </button>
                  <button
                    onClick={() => setParseOpen((prev) => !prev)}
                    className="flex w-full sm:w-auto items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Parse Email Alert
                  </button>
                  <button
                    onClick={handleReconcile}
                    disabled={reconciling || !selectedTransactionId}
                    className="flex w-full sm:w-auto items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 ml-0 sm:ml-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="h-4 w-4" strokeWidth={2.5} /> {reconciling ? "Reconciling..." : "Sync Feed"}
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

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                      <p className="text-[11px] font-bold text-[#6B7280] tracking-wider mb-2">{stat.title}</p>
                      <div className="flex items-end gap-3 mt-2">
                        <h3 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#111827]">{stat.value}</h3>
                        {stat.trend && (
                          <span className={`text-[12px] font-bold mb-1.5 ${stat.trendColor}`}>{stat.trend}</span>
                        )}
                      </div>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 opacity-30 ${stat.iconColor}`}>
                         <Icon className="w-full h-full" strokeWidth={1} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* White Box for Table */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden flex-1">
                {/* Filters */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                  <div className="flex items-center gap-2 p-1 rounded-lg bg-[#F3F4F6] self-start md:self-auto">
                    <button
                      onClick={() => setStatusFilter("ALL")}
                      className={`rounded-md px-5 py-1.5 text-[12px] font-bold shadow-sm ${
                        statusFilter === "ALL" ? "bg-white text-[#4B5563]" : "text-[#6B7280]"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter("UNVERIFIED")}
                      className={`rounded-md px-4 py-1.5 text-[12px] font-bold ${
                        statusFilter === "UNVERIFIED" ? "bg-white text-[#3B5BDB] shadow-sm" : "text-[#6B7280]"
                      }`}
                    >
                      Unverified
                    </button>
                    <button
                      onClick={() => setStatusFilter("VERIFIED")}
                      className={`rounded-md px-4 py-1.5 text-[12px] font-bold ${
                        statusFilter === "VERIFIED" ? "bg-white text-[#3B5BDB] shadow-sm" : "text-[#6B7280]"
                      }`}
                    >
                      Verified
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-[320px]">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by description or amount..."
                        className="flex h-[36px] w-full items-center rounded-md border border-[#E5E7EB] bg-white pl-10 pr-3 py-2 text-[12px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 shadow-sm transition-all"
                      />
                    </div>
                    <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm w-full sm:w-auto justify-center">
                      <Calendar className="h-4 w-4 text-[#6B7280]" /> {dateLabel}
                    </button>
                  </div>
                </div>

                {/* Table */}
                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-[#EEF1F6]">
                  {txLoading ? (
                    <div className="p-6 text-center text-[12px] text-[#6B7280]">
                      Loading transactions…
                    </div>
                  ) : txError ? (
                    <div className="p-6 text-center text-[12px] text-rose-500">
                      {txError}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="p-6 text-center text-[12px] text-[#6B7280]">
                      No transactions available.
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`p-4 ${String(selectedTransactionId) === String(tx.id) ? 'bg-[#EEF2FF]' : ''}`}
                        onClick={() => setSelectedTransactionId(String(tx.id))}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[12px] font-bold text-[#6B7280]">{tx.date}</div>
                            <div className="text-[12px] font-bold text-[#4B5563] uppercase tracking-wide mt-1">{tx.description}</div>
                          </div>
                          <div className={`text-[12px] font-bold ${tx.amountColor}`}>{tx.amount}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                        <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.tagBg} ${tx.tagColor}`}>
                          {tx.tag}
                        </span>
                          <div className="flex items-center gap-2">
                            {tx.status === "Verified" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                <CheckCircle2 className="h-3.5 w-3.5" /> {tx.status}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.statusBg} ${tx.statusColor}`}>
                                {tx.status}
                              </span>
                            )}
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteTransaction(String(tx.id))
                              }}
                              disabled={deletingId === String(tx.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {deletingId === String(tx.id) ? (
                                <span className="text-[9px] font-bold">...</span>
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 w-12 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6]">
                          <div className="h-4 w-4 rounded-[4px] border-2 border-[#D1D5DB] border-dashed"></div>
                        </th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6]">DATE</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6]">DESCRIPTION</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6] text-center w-32">AMOUNT</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6] text-center">SUGGESTED TAG</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6] text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {txLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                            Loading transactions…
                          </td>
                        </tr>
                      ) : txError ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-rose-500">
                            {txError}
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                            No transactions available.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className={`hover:bg-gray-50 font-medium ${String(selectedTransactionId) === String(tx.id) ? 'bg-[#EEF2FF]' : ''}`}
                          >
                            <td className="px-6 py-5">
                              <button
                                type="button"
                                onClick={() => setSelectedTransactionId(String(tx.id))}
                                className={`h-4 w-4 rounded-[4px] flex items-center justify-center ${
                                  String(selectedTransactionId) === String(tx.id)
                                    ? "bg-[#3B5BDB]"
                                    : "border-2 border-[#D1D5DB]"
                                }`}
                              >
                                {String(selectedTransactionId) === String(tx.id) && (
                                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-5 text-[12px] font-bold text-[#6B7280]">{tx.date}</td>
                            <td className="px-4 py-5 text-[12px] font-bold text-[#4B5563] uppercase tracking-wide">{tx.description}</td>
                            <td className={`px-4 py-5 text-[12px] font-bold text-center ${tx.amountColor}`}>{tx.amount}</td>
                            <td className="px-4 py-5 text-center">
                              <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.tagBg} ${tx.tagColor}`}>
                                {tx.tag}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              {tx.status === "Verified" ? (
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500`}>
                                  <CheckCircle2 className="h-3.5 w-3.5" /> {tx.status}
                                </span>
                              ) : (
                                <span className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.statusBg} ${tx.statusColor}`}>
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

                {/* Table Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#EEF1F6] p-5">
                  <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
                    Showing {pagination && pagination.total > 0
                      ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}`
                      : "0"} of {pagination?.total ?? 0} transactions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination || pagination.page <= 1}
                      className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination?.pages ?? 1, p + 1))}
                      disabled={!pagination || pagination.page >= (pagination?.pages ?? 1)}
                      className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Pane (Verification) */}
            <div className="w-full xl:w-[350px]">
              <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8 pb-5 border-b border-[#EEF1F6]">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Verification</h3>
                      <p className="text-[11px] font-medium text-[#9CA3AF] mt-1">
                        Transaction #{selectedTransaction?.id ?? "—"}
                      </p>
                    </div>
                    <button className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Transfer details block */}
                  <div className="flex flex-col gap-1 rounded-xl bg-[#F8FAFF] border border-[#EEF2FC] p-4 pb-5 mb-4 relative overflow-hidden">
                    <p className="text-[10px] font-bold text-[#3B5BDB] tracking-wider mb-2">INCOMING TRANSFER</p>
                    <p className="text-[12px] font-semibold text-[#111827] uppercase leading-snug">
                      {selectedTransaction?.description ?? "Transaction"}
                    </p>
                    <div className="flex items-end justify-between mt-3">
                      <p className="text-[11px] font-semibold text-[#9CA3AF]">{formatDateLabel(selectedTransaction?.date)}</p>
                      <p className={`text-[18px] font-bold tracking-tight ${Number(selectedTransaction?.amount ?? 0) >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {formatCurrency(Number(selectedTransaction?.amount ?? 0))}
                      </p>
                    </div>
                  </div>

                  {/* Suggestion block */}
                  <div className="flex items-start gap-3 rounded-xl bg-[#FCF8FF] border border-[#F3E8FF] p-4 mb-8">
                     <span className="text-[#A855F7] mt-0.5 font-bold">*</span>
                     <div>
                       <p className="text-[12px] font-bold text-[#a442f5] mb-1">
                         Suggestion: {selectedTransaction?.coaName ?? "Uncategorized"}
                       </p>
                       <p className="text-[10px] text-[#C084FC] font-medium leading-relaxed">
                         Based on description context
                       </p>
                     </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex flex-col gap-5 mb-8">
                    <div className="flex flex-col gap-2">
                       <label className="text-[12px] font-bold text-[#111827]">Chart of Accounts</label>
                       <div className="relative">
                        <select
                          value={selectedCoaId}
                          onChange={(event) => setSelectedCoaId(event.target.value)}
                          className="h-[42px] w-full appearance-none rounded-[8px] border border-[#EEF1F6] bg-white pl-3.5 pr-10 text-[13px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]"
                        >
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
                       <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleDeleteSelectedCoa}
                          disabled={!selectedCoaId || deletingCoa}
                          className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deletingCoa ? "Removing..." : "Delete Selected COA"}
                        </button>
                        {coaDeleteError && (
                          <span className="text-[11px] font-medium text-rose-500">{coaDeleteError}</span>
                        )}
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-[12px] font-bold text-[#111827] flex items-center gap-1">Budget Head <span className="text-[#9CA3AF] font-medium text-[11px]">(Optional)</span></label>
                       <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-3 text-[13px] font-medium text-[#9CA3AF] shadow-sm cursor-pointer">
                         Select a budget...
                         <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                       </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       <label className="text-[12px] font-bold text-[#111827]">Notes</label>
                       <textarea 
                          placeholder="Add a note about this transaction..."
                          className="w-full rounded-md border border-[#E5E7EB] bg-white px-3.5 py-3 text-[13px] font-medium text-[#4B5563] shadow-sm resize-none h-[80px] outline-none"
                       />
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleVerify}
                      disabled={verifying || !selectedTransactionId}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B5BDB] py-3 text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" strokeWidth={3} /> {verifying ? "Verifying..." : "Verify & Save"}
                    </button>
                    {verifyError && (
                      <div className="text-[12px] font-semibold text-rose-500">
                        {verifyError}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors">Split</button>
                      <button className="flex-1 rounded-lg border border-rose-100 bg-white py-3 text-[14px] font-bold text-rose-500 hover:bg-rose-50 transition-colors">Ignore</button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}



