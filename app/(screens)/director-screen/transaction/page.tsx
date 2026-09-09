"use client"


import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
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
  Upload,
  EyeOff,
  Mail,
  Split,
  Power,
  PowerOff,
  RefreshCw,
  X,
  Plus,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  Trash2,
  Pencil,
  Clock,
  Check,
  Link2,
  AlertCircle,
  CheckCircle2,
  Printer,
  FileText,
  TrendingUp,
  Hourglass,
  Save,
  ShieldCheck,
  Flag,
  Sparkles,
  UploadCloud,
  CheckSquare,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { ModalShell } from "@/components/ui/modal-shell"
import { AmountInput, parseAmount } from "@/components/ui/amount-input"
import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { useTransactions, type TransactionItem } from "@/components/hooks/useTransactions"
import {
  useTransactionSummaries,
  useTransactionActions,
} from "@/components/hooks/useTransactionSummaries"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { useBranchContext } from "@/components/hooks/useBranchContext"

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

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/transaction"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="w-full px-4 pt-5 pb-6 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 lg:pb-8">
          {/* Top Header (kept) */}
          <div className="mb-6 sm:mb-8 flex items-center justify-end gap-3 border-b border-[#EEF1F6] pb-5 sm:pb-6">
            <button className="flex w-full sm:w-auto items-center gap-2 rounded-md bg-[#3B5BDB] px-3.5 py-2 text-[11px] sm:text-[12px] font-medium text-white shadow hover:bg-blue-700">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>

          <BankTransactions />
        </div>
      </main>
    </div>
  )
}


type RowStatus = "pending" | "uncategorized" | "cleared" | "none"

type DemoRow = {
  id: string
  date: string
  txId: string
  payee: string
  description: string
  account: string
  expense: number | null
  income: number | null
  category: string
  status: RowStatus
  linkedGroup: "G1" | null
  reconcilable?: boolean
}

const INCOME_CATEGORIES = ["General Offering", "Thanksgiving", "Tithe", "Capital Project"]
const EXPENSE_CATEGORIES = ["Program Project", "Operational Expense", "Capital Project"]

function categoriesForRow(row: DemoRow) {
  return [...(row.expense != null ? EXPENSE_CATEGORIES : INCOME_CATEGORIES), "-"]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatMoney(value: number) {
  return "₦" + formatNumber(value)
}

function formatMoneyWhole(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatRowDate(value?: string) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

// Treat CREDIT / INFLOW / INCOME as income; everything else as an expense.
function isCreditFlow(flowType?: string) {
  const f = (flowType ?? "").toUpperCase()
  return f === "CREDIT" || f === "INFLOW" || f === "INCOME"
}

function statusFromApi(status?: string): RowStatus {
  const s = (status ?? "").toUpperCase()
  if (s === "VERIFIED" || s === "CLEARED" || s === "RECONCILED") return "cleared"
  if (s === "PENDING") return "pending"
  if (s === "UNVERIFIED" || s === "UNCATEGORIZED") return "uncategorized"
  return "none"
}

// Map the live API transaction shape to the existing DemoRow shape the table renders.
function mapTransactionToRow(tx: TransactionItem): DemoRow {
  const credit = isCreditFlow(tx.flowType)
  const amount = Number(tx.amount ?? 0)
  return {
    id: tx.id,
    date: formatRowDate(tx.date),
    txId: tx.id,
    payee: tx.description || "—",
    description: "",
    account: tx.coaName ?? "",
    expense: credit ? null : amount,
    income: credit ? amount : null,
    category: tx.category || "-",
    status: statusFromApi(tx.status),
    linkedGroup: null,
  }
}

export function BankTransactions() {
  const [tab, setTab] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL")
  const [search, setSearch] = useState("")
  const [accountFilter, setAccountFilter] = useState("All Accounts")
  const [month, setMonth] = useState("Oct 2023")
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 5

  // Live data
  const { transactions, loading, error, refresh } = useTransactions({ limit: 100 })
  const { pushToast } = useToast()
  const { summary, refresh: refreshSummary } = useTransactionSummaries()
  const { syncFeed, ignoreTransaction } = useTransactionActions()
  const [syncing, setSyncing] = useState(false)
  const [ignoringId, setIgnoringId] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncFeed()
      pushToast("Bank feed synced", "success")
      refresh()
      refreshSummary()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to sync the bank feed", "error")
    } finally {
      setSyncing(false)
    }
  }

  const handleIgnore = async (transactionId: string) => {
    setIgnoringId(transactionId)
    try {
      await ignoreTransaction(transactionId, "Ignored from the reconciliation list")
      pushToast("Transaction ignored", "success")
      refresh()
      refreshSummary()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to ignore this transaction", "error")
    } finally {
      setIgnoringId(null)
    }
  }

  // Local copy of the mapped rows so category edits can be applied optimistically.
  const [rows, setRows] = useState<DemoRow[]>([])
  useEffect(() => {
    setRows(transactions.map(mapTransactionToRow))
  }, [transactions])

  const accountNames = useMemo(
    () => Array.from(new Set(rows.map((r) => r.account).filter(Boolean))),
    [rows],
  )

  // Modal open state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false)
  const [parseEmailOpen, setParseEmailOpen] = useState(false)
  const [splitTarget, setSplitTarget] = useState<DemoRow | null>(null)

  // Per-row action state (verify/flag in flight, and AI category suggestions).
  const [actionRowId, setActionRowId] = useState<string | null>(null)
  const [suggestRowId, setSuggestRowId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})

  // PATCH verify/flag a transaction, then refetch the list. Defensive: a failed
  // request just clears the in-flight flag and leaves the row unchanged.
  const verifyTransaction = async (id: string, status: "verified" | "flagged") => {
    setActionRowId(id)
    try {
      const response = await fetch(`${API_V1}/financial/transactions/${id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie(),
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("verify failed")
      refresh()
    } catch {
      // Swallow; UI stays as-is.
    } finally {
      setActionRowId(null)
    }
  }

  // POST for ranked chart-of-account suggestions, then expose them as extra
  // options in this row's category dropdown. Defensive on shape and failure.
  const suggestCategories = async (id: string) => {
    setSuggestRowId(id)
    try {
      const response = await fetch(
        `${API_V1}/financial/transactions/${id}/categorize-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfTokenFromCookie(),
          },
          credentials: "include",
          body: JSON.stringify({}),
        },
      )
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error("suggest failed")
      const raw = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.suggestions)
          ? data.suggestions
          : Array.isArray(data)
            ? data
            : []
      const names = raw
        .map((s: any) =>
          typeof s === "string"
            ? s
            : String(s?.coaName ?? s?.name ?? s?.category ?? s?.label ?? ""),
        )
        .filter((s: string) => s.length > 0)
      setSuggestions((prev) => ({ ...prev, [id]: names }))
    } catch {
      setSuggestions((prev) => ({ ...prev, [id]: [] }))
    } finally {
      setSuggestRowId(null)
    }
  }

  // PATCH category, optimistically update, then refetch from the server.
  const updateCategory = async (id: string, category: string) => {
    const previous = rows
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, category } : r)))
    try {
      const response = await fetch(`${API_V1}/financial/transactions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie(),
        },
        credentials: "include",
        body: JSON.stringify({ category }),
      })
      if (!response.ok) throw new Error("patch failed")
      refresh()
    } catch {
      // Roll back the optimistic update on failure.
      setRows(previous)
    }
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (tab === "CREDIT" && row.income == null) return false
      if (tab === "DEBIT" && row.expense == null) return false
      if (accountFilter !== "All Accounts" && row.account !== accountFilter) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      const amount = String(row.income ?? row.expense ?? "")
      return (
        row.description.toLowerCase().includes(q) ||
        row.payee.toLowerCase().includes(q) ||
        amount.includes(q)
      )
    })
  }, [rows, tab, search, accountFilter])

  // Keep page in range as filters change.
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  useEffect(() => {
    setPage(0)
  }, [tab, search, accountFilter])

  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * PAGE_SIZE
  const pagedRows = filteredRows.slice(pageStart, pageStart + PAGE_SIZE)
  const showingFrom = filteredRows.length === 0 ? 0 : pageStart + 1
  const showingTo = pageStart + pagedRows.length

  const statCards = [
    {
      title: "BANK BALANCE",
      value: formatMoneyWhole(summary.bankBalance),
      icon: Landmark,
      iconColor: "text-[#3B5BDB]",
      iconBg: "bg-[#EEF2FF]",
      trend: null as string | null,
    },
    {
      title: "EXPENSE (MONTH)",
      value: formatMoneyWhole(summary.totalExpense),
      icon: ArrowUpRight,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
      trend: "+12%",
    },
    {
      title: "INCOME (MONTH)",
      value: formatMoneyWhole(summary.totalIncome),
      icon: ArrowDownLeft,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
      trend: "+12%",
    },
  ]

  return (
    <>
      {/* Page title + actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[24px] leading-tight font-bold text-[#111827]">Bank Transactions</h1>
          <p className="text-[12px] sm:text-[13px] text-[#9CA3AF] mt-1.5">
            Reconcile imported bank feeds with your chart of accounts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} strokeWidth={2.5} />
            {syncing ? "Syncing…" : "Sync Feed"}
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" strokeWidth={2.5} /> Upload Statements
          </button>
          <button
            onClick={() => setParseEmailOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-4 w-4" strokeWidth={2.5} /> Bank Alert
          </button>
          <button
            onClick={() => setIncomeOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Income Entry
          </button>
          <button
            onClick={() => setExpenseOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Expense Entry
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold text-[#6B7280] tracking-wider mb-2">{stat.title}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-[22px] sm:text-[26px] leading-tight font-bold text-[#111827]">{stat.value}</h3>
                {stat.trend && (
                  <span className="mb-1 flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> {stat.trend}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Accounts card */}
        <div className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <p className="text-[11px] font-bold text-[#6B7280] tracking-wider mb-2">ACCOUNTS</p>
          <div className="flex items-end justify-between mt-1">
            <h3 className="text-[22px] sm:text-[26px] leading-tight font-bold text-[#111827]">3</h3>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setAccountsOpen(true)}
                aria-label="New Account"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3B5BDB] text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="text-[10px] font-semibold text-[#9CA3AF]">New Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EEF1F6]">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F3F4F6] self-start">
            {(["ALL", "CREDIT", "DEBIT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-5 py-1.5 text-[12px] font-bold capitalize transition-colors ${
                  tab === t ? "bg-white text-[#3B5BDB] shadow-sm" : "text-[#6B7280]"
                }`}
              >
                {t.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="h-[36px] w-full sm:w-auto appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3.5 pr-9 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
              >
                <option value="All Accounts">All Accounts</option>
                {accountNames.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-[36px] w-full sm:w-auto appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3.5 pr-9 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
              >
                <option value="Oct 2023">Oct 2023</option>
                <option value="Sep 2023">Sep 2023</option>
                <option value="Aug 2023">Aug 2023</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by description or amount..."
                className="flex h-[36px] w-full items-center rounded-md border border-[#E5E7EB] bg-white pl-10 pr-3 py-2 text-[12px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr>
                <th className="px-4 py-4 border-b border-[#EEF1F6] w-10">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#D1D5DB] text-[#3B5BDB] focus:ring-[#3B5BDB]/20" />
                </th>
                {["DATE", "TRANSACTION ID", "PAYEE / DESCRIPTION", "ACCOUNT", "EXPENSE", "INCOME", "CATEGORY", "STATUS", "LINK"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6] ${
                      i === 4 || i === 5 ? "text-right" : ""
                    } ${i === 8 ? "text-center" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-[12px] text-[#6B7280]">
                    Loading transactions…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-[12px] text-[#6B7280]">
                    Unable to load transactions. No data to display.
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-[12px] text-[#6B7280]">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 font-medium">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#D1D5DB] text-[#3B5BDB] focus:ring-[#3B5BDB]/20" />
                    </td>
                    <td className="px-4 py-4 text-[12px] font-bold text-[#6B7280] whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-4 text-[12px] font-semibold text-[#3B5BDB] whitespace-nowrap">{row.txId}</td>
                    <td className="px-4 py-4">
                      <div className="text-[12px] font-bold text-[#111827]">{row.payee}</div>
                      {row.description ? (
                        <div className="text-[11px] text-[#9CA3AF]">{row.description}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-[12px] font-semibold text-[#4B5563] whitespace-nowrap">{row.account}</td>
                    <td className="px-4 py-4 text-[12px] font-bold text-right text-[#4B5563] whitespace-nowrap">
                      {row.expense != null ? formatMoney(row.expense) : "-"}
                    </td>
                    <td className="px-4 py-4 text-[12px] font-bold text-right text-emerald-600 whitespace-nowrap">
                      {row.income != null ? formatMoney(row.income) : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          {(() => {
                            const baseOptions = categoriesForRow(row)
                            const suggested = (suggestions[row.id] ?? []).filter(
                              (s) => !baseOptions.includes(s),
                            )
                            const options = [...baseOptions, ...suggested]
                            return (
                              <select
                                value={options.includes(row.category) ? row.category : "-"}
                                onChange={(e) => updateCategory(row.id, e.target.value)}
                                className="h-[34px] w-full min-w-[150px] appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] font-semibold text-[#4B5563] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
                              >
                                {baseOptions.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                                {suggested.length > 0 && (
                                  <optgroup label="Suggested">
                                    {suggested.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                              </select>
                            )
                          })()}
                          <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                        </div>
                        <button
                          onClick={() => suggestCategories(row.id)}
                          disabled={suggestRowId === row.id}
                          title="Suggest categories"
                          aria-label="Suggest categories"
                          className="inline-flex h-[34px] w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#3B5BDB] hover:bg-[#EEF2FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${suggestRowId === row.id ? "animate-pulse" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleIgnore(row.id)}
                          disabled={ignoringId === row.id}
                          title="Ignore this transaction"
                          aria-label="Ignore transaction"
                          className="inline-flex h-[34px] w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#9CA3AF] transition-colors hover:bg-gray-50 hover:text-rose-600 disabled:opacity-50"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSplitTarget(row)}
                          title="Split this transaction"
                          aria-label="Split transaction"
                          className="inline-flex h-[34px] w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#9CA3AF] transition-colors hover:bg-gray-50 hover:text-[#3B5BDB]"
                        >
                          <Split className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusPill status={row.status} />
                        {row.status !== "cleared" && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => verifyTransaction(row.id, "verified")}
                              disabled={actionRowId === row.id}
                              title="Verify"
                              aria-label="Verify transaction"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => verifyTransaction(row.id, "flagged")}
                              disabled={actionRowId === row.id}
                              title="Flag"
                              aria-label="Flag transaction"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Flag className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <LinkCell
                        row={row}
                        onReconcile={() => setReconcileOpen(true)}
                        onGroupDetails={() => setGroupDetailsOpen(true)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#EEF1F6] p-5">
          <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
            Showing {showingFrom}-{showingTo} of {filteredRows.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadTransactionsModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onProcess={(summary) => {
          setUploadSummary(summary)
          setUploadOpen(false)
          setSummaryOpen(true)
        }}
      />
      <StatementUploadSummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        onConfirm={() => {
          setSummaryOpen(false)
          refresh()
        }}
        summary={uploadSummary}
      />
      <RecordIncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} onSaved={refresh} />
      <RecordExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} onSaved={refresh} />
      <ManageAccountsModal open={accountsOpen} onClose={() => setAccountsOpen(false)} />
      <ReconcileBankDepositModal open={reconcileOpen} onClose={() => setReconcileOpen(false)} />
      <ReconciledGroupDetailsModal open={groupDetailsOpen} onClose={() => setGroupDetailsOpen(false)} />
      <SplitTransactionModal
        transaction={splitTarget}
        onClose={() => setSplitTarget(null)}
        onSplit={() => {
          pushToast("Transaction split", "success")
          refresh()
          refreshSummary()
        }}
      />
      <ParseEmailModal
        open={parseEmailOpen}
        onClose={() => setParseEmailOpen(false)}
        onParsed={() => {
          refresh()
          refreshSummary()
        }}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Status pill + Link cell
// ---------------------------------------------------------------------------

function StatusPill({ status }: { status: RowStatus }) {
  if (status === "none") return null
  if (status === "cleared") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
        <Check className="h-3 w-3" strokeWidth={3} /> Cleared
      </span>
    )
  }
  if (status === "uncategorized") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Uncategorized
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-bold text-[#3B5BDB]">
      <Clock className="h-3 w-3" strokeWidth={2.5} /> Pending
    </span>
  )
}

function LinkCell({
  row,
  onReconcile,
  onGroupDetails,
}: {
  row: DemoRow
  onReconcile: () => void
  onGroupDetails: () => void
}) {
  if (row.status === "none") return null

  // CLEARED -> chain-link icon. With a group it shows the "G1" badge (opens
  // group details); without a group it's just the chain-link icon (opens reconcile).
  if (row.status === "cleared") {
    if (row.linkedGroup) {
      return (
        <button
          onClick={onGroupDetails}
          className="inline-flex items-center gap-1 rounded-md bg-[#EEF2FF] px-2 py-1 text-[11px] font-bold text-[#3B5BDB] hover:bg-[#E0E7FF] transition-colors"
          aria-label={`View reconciled group ${row.linkedGroup}`}
        >
          <Link2 className="h-3.5 w-3.5" />
          {row.linkedGroup}
        </button>
      )
    }
    return (
      <button
        onClick={onReconcile}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#EEF2FF] text-[#3B5BDB] hover:bg-[#E0E7FF] transition-colors"
        aria-label="Reconcile bank deposit"
      >
        <Link2 className="h-4 w-4" />
      </button>
    )
  }

  // UNCATEGORIZED -> bold red "!" (opens reconcile/resolve modal)
  if (row.status === "uncategorized") {
    return (
      <button
        onClick={onReconcile}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
        aria-label="Resolve uncategorized transaction"
      >
        <AlertCircle className="h-4.5 w-4.5" strokeWidth={2.5} />
      </button>
    )
  }

  // PENDING -> hourglass (opens reconcile modal)
  return (
    <button
      onClick={onReconcile}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"
      aria-label="Reconcile pending transaction"
    >
      <Hourglass className="h-4 w-4" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Reusable modal header (X) + footer helpers
// ---------------------------------------------------------------------------

function ModalHeader({
  title,
  onClose,
  titleClassName = "text-[#111827]",
  icon,
}: {
  title: string
  onClose: () => void
  titleClassName?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[#EEF1F6]">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#EEF2FF] text-[#3B5BDB]">
            {icon}
          </span>
        )}
        <h2 className={`text-[18px] font-bold ${titleClassName}`}>{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-bold text-[#111827]">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  "h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// 1. Reconcile Bank Deposit modal
// ---------------------------------------------------------------------------

type ReconcileEntry = {
  id: string
  date: string
  txId: string
  description: string
  subLabel: string
  amount: number
  selected: boolean
}

const RECONCILE_ENTRIES: ReconcileEntry[] = [
  { id: "r1", date: "Oct 22, 2024", txId: "TXN-89021", description: "Sunday Tithe", subLabel: "TITHES", amount: 100, selected: true },
  { id: "r2", date: "Oct 22, 2024", txId: "TXN-89022", description: "Sunday Offering", subLabel: "OFFERINGS", amount: 50, selected: true },
  { id: "r3", date: "Oct 22, 2024", txId: "TXN-89023", description: "Seed Offering", subLabel: "OFFERINGS", amount: 25, selected: false },
]

const BANK_DEPOSIT_TOTAL = 150

function ReconcileBankDepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entries, setEntries] = useState<ReconcileEntry[]>(RECONCILE_ENTRIES)

  useEffect(() => {
    if (open) setEntries(RECONCILE_ENTRIES)
  }, [open])

  const toggle = (id: string) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e)))

  const selected = entries.filter((e) => e.selected)
  const selectedTotal = selected.reduce((sum, e) => sum + e.amount, 0)
  const difference = BANK_DEPOSIT_TOTAL - selectedTotal
  const isMatch = difference === 0
  const unselected = entries.filter((e) => !e.selected)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <ModalHeader title="RECONCILE BANK DEPOSIT - GROUP #G1" onClose={onClose} titleClassName="text-[#3B5BDB]" />

      <div className="px-6 py-5 space-y-5">
        {/* Source card */}
        <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F8FAFC] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">Bank Transaction (Source)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Transaction ID</p>
              <p className="text-[13px] font-bold text-[#3B5BDB] mt-0.5">#BNK-001</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Date</p>
              <p className="text-[13px] font-bold text-[#111827] mt-0.5">Oct 22, 2024</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Description</p>
              <p className="text-[13px] font-bold text-[#111827] mt-0.5">Bank Deposit - Cash &amp; Cheques</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Amount</p>
              <p className="text-[13px] font-bold text-[#3B5BDB] mt-0.5">{formatUSD(150)} <span className="text-[10px] font-semibold text-[#9CA3AF]">(CREDIT)</span></p>
            </div>
            <div className="col-span-3">
              <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Uploaded By</p>
              <p className="text-[13px] font-bold text-[#111827] mt-0.5">Accountant (Maryland Branch)</p>
            </div>
          </div>
        </div>

        {/* Select table */}
        <div className="overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {["SELECT", "DATE", "ID", "DESCRIPTION", "AMOUNT"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] ${i === 4 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={e.selected}
                      onChange={() => toggle(e.id)}
                      className="h-4 w-4 rounded border-[#D1D5DB] text-[#3B5BDB] focus:ring-[#3B5BDB]/20"
                    />
                  </td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] whitespace-nowrap">{e.date}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-[#3B5BDB] whitespace-nowrap">{e.txId}</td>
                  <td className="px-4 py-3">
                    <div className="text-[12px] font-bold text-[#111827]">{e.description}</div>
                    <div className="text-[10px] font-bold uppercase text-[#9CA3AF]">{e.subLabel}</div>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-bold text-right text-[#111827] whitespace-nowrap">{formatUSD(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live summary bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-[10px] border border-[#EEF1F6] bg-[#F8FAFC] p-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Bank Deposit</p>
            <p className="text-[15px] font-bold text-[#111827] mt-0.5">{formatUSD(BANK_DEPOSIT_TOTAL)}</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Selected ({selected.length} of {entries.length})</p>
            <p className="text-[15px] font-bold text-[#3B5BDB] mt-0.5">{formatUSD(selectedTotal)}</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Difference</p>
            <p className={`text-[15px] font-bold mt-0.5 ${isMatch ? "text-emerald-600" : "text-rose-600"}`}>{formatUSD(difference)}</p>
          </div>
          {isMatch && (
            <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> PERFECT MATCH
            </span>
          )}
        </div>

        {/* Info box */}
        <div className="rounded-[10px] border border-[#EEF1F6] bg-white p-4 text-[12px] text-[#4B5563] space-y-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <p>
              All selected entries will be marked as{" "}
              <span className="font-bold text-[#111827]">&apos;Cleared&apos;</span> and linked to{" "}
              <span className="font-bold text-[#3B5BDB]">#BNK-001</span>.
            </p>
          </div>
          {unselected.length > 0 && (
            <>
              <div className="border-t border-[#EEF1F6]" />
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#9CA3AF] mt-0.5" />
                <p>
                  Unselected {unselected.length === 1 ? "entry" : "entries"} (
                  {unselected.map((u) => `${formatUSD(u.amount)} ${u.description}`).join(", ")}) will
                  remain as <span className="font-bold text-[#111827]">&apos;Pending&apos;</span> in the
                  Undeposited Funds account for next week&apos;s bank run.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Link2 className="h-4 w-4" />
          Link &amp; Reconcile Group
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// 2. Statement Upload Summary modal
// ---------------------------------------------------------------------------

export type UploadSummary = {
  totalTransactions: number
  netAmount: number
  totalCredit: number
  totalDebit: number
  accountLabel: string
  dateRange: string
  fileName: string
}

// Map an upload-csv response into the summary shape, tolerating various backend
// field names. Falls back to sensible blanks when a field is absent.
function buildUploadSummary(
  payload: any,
  ctx: { accountLabel?: string; fileName?: string },
): UploadSummary {
  const p = payload ?? {}
  const num = (...keys: string[]) => {
    for (const k of keys) {
      const v = p?.[k] ?? p?.summary?.[k] ?? p?.totals?.[k]
      if (v != null && !Number.isNaN(Number(v))) return Number(v)
    }
    return 0
  }
  const totalCredit = num("totalCredit", "creditTotal", "totalInflow")
  const totalDebit = num("totalDebit", "debitTotal", "totalOutflow")
  const rows = Array.isArray(p?.transactions) ? p.transactions.length : 0
  const startDate = p?.startDate ?? p?.periodStart ?? p?.dateFrom
  const endDate = p?.endDate ?? p?.periodEnd ?? p?.dateTo
  const dateRange =
    startDate && endDate
      ? `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
      : (p?.dateRange ?? "—")
  return {
    totalTransactions: num("totalTransactions", "count", "transactionCount") || rows,
    netAmount: num("netAmount", "net") || totalCredit - totalDebit,
    totalCredit,
    totalDebit,
    accountLabel: String(p?.accountLabel ?? ctx.accountLabel ?? "—"),
    dateRange,
    fileName: String(p?.fileName ?? ctx.fileName ?? "—"),
  }
}

function formatDateLabel(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

function StatementUploadSummaryModal({
  open,
  onClose,
  onConfirm,
  summary,
}: {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  summary: UploadSummary | null
}) {
  const s = summary
  const tiles = [
    { label: "Total Transactions", value: String(s?.totalTransactions ?? 0), color: "text-[#111827]" },
    { label: "Net Amount", value: formatMoney(s?.netAmount ?? 0), color: "text-[#111827]" },
    { label: "Total Credit", value: `+${formatMoney(s?.totalCredit ?? 0)}`, color: "text-emerald-600" },
    { label: "Total Debit", value: `-${formatMoney(s?.totalDebit ?? 0)}`, color: "text-rose-600" },
  ]
  const details = [
    { label: "Account", value: s?.accountLabel ?? "—" },
    { label: "Date Range", value: s?.dateRange ?? "—" },
    { label: "File Name", value: s?.fileName ?? "—" },
  ]

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader
        title="Statement Upload Summary"
        onClose={onClose}
        icon={<CheckSquare className="h-5 w-5" />}
      />

      <div className="px-6 py-5 space-y-5">
        {/* Success banner */}
        <div className="flex items-center gap-3 rounded-[10px] bg-emerald-50 border border-emerald-100 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-[13px] font-bold text-emerald-700">
            File processed successfully. {s?.totalTransactions ?? 0} transactions identified.
          </p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-[10px] border border-[#EEF1F6] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{t.label}</p>
              <p className={`text-[18px] font-bold mt-1 ${t.color}`}>{t.value}</p>
            </div>
          ))}
        </div>

        {/* Import details */}
        <div className="rounded-[10px] border border-[#EEF1F6] overflow-hidden">
          <p className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] bg-[#F8FAFC] border-b border-[#EEF1F6]">
            Import Details
          </p>
          <div className="divide-y divide-[#EEF1F6]">
            {details.map((d) => (
              <div key={d.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-[12px] font-bold text-[#6B7280]">{d.label}</span>
                <span className="text-[12px] font-bold text-[#111827]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => (onConfirm ? onConfirm() : onClose())}
          className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <CheckCircle2 className="h-4 w-4" /> Confirm &amp; Import
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// 3. Manage Accounts modal
// ---------------------------------------------------------------------------

type AccountRow = {
  id: string
  number: string
  name: string
  description: string
  bankName?: string
  branchId?: string
  currency?: string
  isActive: boolean
}

// Map a live bank-account record (various possible backend field names) to the
// AccountRow shape the table renders. `description` repurposes bankName so the
// existing column stays populated.
function mapBankAccountToRow(item: any, index: number): AccountRow {
  const bankName = item?.bankName ?? item?.bank?.name ?? ""
  return {
    id: String(item?.id ?? item?.bankAccountId ?? `acc-${index}`),
    number: String(item?.accountNumber ?? item?.number ?? "—"),
    name: String(item?.accountName ?? item?.name ?? "Untitled"),
    description: String(item?.description ?? ""),
    bankName,
    branchId: item?.branchId ?? item?.branch?.id,
    currency: item?.currency ?? "NGN",
    isActive: item?.isActive ?? item?.active ?? String(item?.status ?? "ACTIVE").toUpperCase() !== "INACTIVE",
  }
}

function ManageAccountsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { branchId, branches, selectBranch } = useBranchContext()

  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [loading, setLoading] = useState(false)
  const [number, setNumber] = useState("")
  const [name, setName] = useState("")
  const [bankName, setBankName] = useState("")
  const [currency, setCurrency] = useState("NGN")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [togglingAccountId, setTogglingAccountId] = useState<string | null>(null)

  // Load live bank accounts whenever the modal opens. Defensive: never throws an
  // overlay; a 401 / empty response just yields an empty table.
  const loadAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_V1}/financial/bank-accounts?limit=100`, {
        method: "GET",
        credentials: "include",
      })
      const data = await response.json().catch(() => null)
      const rawItems = Array.isArray(data?.data?.content)
        ? data.data.content
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : []
      setAccounts(response.ok ? rawItems.map(mapBankAccountToRow) : [])
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setNumber("")
      setName("")
      setBankName("")
      setCurrency("NGN")
      setDescription("")
      setEditingId(null)
      setSaving(false)
      setFormError(null)
      loadAccounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const resetForm = () => {
    setNumber("")
    setName("")
    setBankName("")
    setCurrency("NGN")
    setDescription("")
    setEditingId(null)
    setFormError(null)
  }

  // The backend has no DELETE for bank accounts — retiring one means
  // deactivating it, which keeps its history attached to past transactions.
  const toggleAccountActive = async (account: AccountRow) => {
    const next = !account.isActive
    setTogglingAccountId(account.id)
    setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, isActive: next } : a)))
    try {
      const response = await fetch(
        `${API_V1}/financial/bank-accounts/${account.id}/${next ? "activate" : "deactivate"}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
          credentials: "include",
          body: "{}",
        }
      )
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message ?? "Unable to change the account status.")
      }
      await loadAccounts()
    } catch (error) {
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, isActive: account.isActive } : a)))
      setFormError(error instanceof Error ? error.message : "Unable to change the account status.")
    } finally {
      setTogglingAccountId(null)
    }
  }

  const startEdit = (account: AccountRow) => {
    setEditingId(account.id)
    setNumber(account.number)
    setName(account.name)
    setBankName(account.bankName ?? "")
    setCurrency(account.currency ?? "NGN")
    setDescription(account.description)
  }

  const saveAccount = async () => {
    if (!number.trim() || !name.trim()) {
      setFormError("Please fill Account Number and Account Name.")
      return
    }
    if (!bankName.trim()) {
      setFormError("Please fill Bank Name — the account cannot be created without it.")
      return
    }
    if (!editingId && !branchId) {
      setFormError(
        branches.length > 1
          ? "Choose the branch this account belongs to."
          : "No branch is available for your account. Ask an administrator to assign you to one."
      )
      return
    }
    setSaving(true)
    setFormError(null)

    const fields = {
      number: number.trim(),
      name: name.trim(),
      bankName: bankName.trim(),
      currency,
      description: description.trim(),
    }

    if (editingId) {
      const targetId = editingId
      try {
        const response = await fetch(`${API_V1}/financial/bank-accounts/${targetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
          credentials: "include",
          body: JSON.stringify({
            accountName: fields.name,
            accountNumber: fields.number,
            bankName: fields.bankName || undefined,
            currency: fields.currency || undefined,
            description: fields.description || undefined,
          }),
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to update the bank account.")
        }
        resetForm()
        await loadAccounts()
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Unable to update the bank account.")
      } finally {
        setSaving(false)
      }
      return
    }

    // Add. The account is only shown once the backend has stored it — the
    // previous optimistic row made a failed save look like a success.
    try {
      const response = await fetch(`${API_V1}/financial/bank-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
        credentials: "include",
        body: JSON.stringify({
          accountName: fields.name,
          accountNumber: fields.number,
          bankName: fields.bankName,
          currency: fields.currency,
          branchId,
          ...(fields.description ? { description: fields.description } : {}),
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to create the bank account.")
      }
      resetForm()
      await loadAccounts()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create the bank account.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader title="Manage Accounts" onClose={onClose} />

      <div className="px-6 py-5 space-y-5">
        {/* Accounts table */}
        <div className="overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {["NUMBER", "NAME", "BANK NAME", "CURRENCY", "DESCRIPTION", "STATUS", "ACTIONS"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] ${i === 6 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-[12px] text-[#6B7280]">
                    Loading accounts…
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-[12px] text-[#6B7280]">
                    No bank accounts yet. Add one below.
                  </td>
                </tr>
              ) : (
                accounts.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-[12px] font-bold text-[#3B5BDB] whitespace-nowrap">{a.number}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#111827]">{a.name}</td>
                  <td className="px-4 py-3 text-[12px] font-medium text-[#111827] whitespace-nowrap">{a.bankName || "—"}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] whitespace-nowrap">{a.currency || "NGN"}</td>
                  <td className="px-4 py-3 text-[12px] font-medium text-[#6B7280]">{a.description || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        a.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-[#6B7280]"
                      }`}
                    >
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(a)}
                        className={`transition-colors ${editingId === a.id ? "text-[#3B5BDB]" : "text-[#9CA3AF] hover:text-[#3B5BDB]"}`}
                        aria-label={`Edit ${a.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleAccountActive(a)}
                        disabled={togglingAccountId === a.id}
                        className={`transition-colors disabled:opacity-40 ${
                          a.isActive ? "text-[#9CA3AF] hover:text-rose-500" : "text-[#9CA3AF] hover:text-emerald-600"
                        }`}
                        aria-label={`${a.isActive ? "Deactivate" : "Activate"} ${a.name}`}
                        title={a.isActive ? "Deactivate account" : "Activate account"}
                      >
                        {a.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add new account form */}
        <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F8FAFC] p-4 space-y-4">
          <p className="text-[13px] font-bold text-[#111827]">{editingId ? "Edit Account" : "Add New Account"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Account Number">
              <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. 5005678976" className={inputClass} />
            </Field>
            <Field label="Account Name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welfare" className={inputClass} />
            </Field>
            <Field label="Bank Name">
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. First Bank" className={inputClass} />
            </Field>
            {branches.length > 1 && (
              <Field label="Branch">
                <div className="relative">
                  <select
                    value={branchId}
                    onChange={(e) => selectBranch(e.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">Select a branch…</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                </div>
              </Field>
            )}
            <Field label="Currency">
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="NGN">Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">Pound (£)</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
            </Field>
            <Field label="Description">
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className={inputClass} />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveAccount}
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId ? (
                <>
                  <Save className="h-4 w-4" strokeWidth={2.5} /> {saving ? "Updating…" : "Update Account"}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" strokeWidth={2.5} /> {saving ? "Adding…" : "Add Account"}
                </>
              )}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-[12px] font-bold text-[#6B7280] hover:text-[#4B5563] transition-colors"
              >
                Cancel edit
              </button>
            )}
          </div>
          {formError && (
            <p className="text-[12px] font-medium text-rose-600">{formError}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// 4. Record New Expense modal
// ---------------------------------------------------------------------------

function RecordExpenseModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { branchId, branches, selectBranch } = useBranchContext()
  const { options: coaOptions, loading: coaLoading } = useCoaOptions(open, "expense", branchId)
  const bankAccounts = useBankAccountOptions(open, branchId)

  const [date, setDate] = useState("")
  const [amount, setAmount] = useState("")
  const [payee, setPayee] = useState("")
  const [coaId, setCoaId] = useState("")
  const [bankAccountId, setBankAccountId] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDate(new Date().toISOString().slice(0, 10))
    setAmount("")
    setPayee("")
    setCoaId("")
    setBankAccountId("")
    setReference("")
    setNotes("")
    setSaving(false)
    setSaveError(null)
  }, [open])

  const handleSave = async () => {
    // Every one of these is required by POST /transactions; sending the entry
    // without them is what produced the old "Validation failed" response.
    if (!branchId) {
      setSaveError("Choose the branch this expense belongs to.")
      return
    }
    if (!date) {
      setSaveError("Pick the transaction date.")
      return
    }
    if (parseAmount(amount) <= 0) {
      setSaveError("Enter an amount greater than zero.")
      return
    }
    if (!coaId) {
      setSaveError("Choose the expense account to post against.")
      return
    }
    const description = notes.trim() || payee.trim()
    if (!description) {
      setSaveError("Add a description or a payee.")
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      const response = await fetch(`${API_V1}/financial/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie(),
        },
        credentials: "include",
        body: JSON.stringify({
          type: "expense",
          amount: parseAmount(amount),
          description,
          branchId,
          chartOfAccountId: coaId,
          transactionDate: date,
          ...(bankAccountId ? { bankAccountId } : {}),
          ...(reference.trim() ? { reference: reference.trim() } : {}),
          source: "manual",
          currency: "NGN",
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.message ?? "Unable to save expense.")
      onSaved?.()
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save expense.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader title="Record New Expense" onClose={onClose} />

      <div className="px-6 py-5 space-y-4">
        <p className="text-[12px] text-[#9CA3AF] -mt-1">Enter the manual transaction details for the ledger.</p>

        {branches.length > 1 && (
          <Field label="Branch">
            <SelectField value={branchId} onChange={selectBranch}>
              <option value="">Select a branch…</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </SelectField>
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Transaction Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className={inputClass}
            />
          </Field>
          <Field label="Amount (₦)">
            <AmountInput value={amount} onValueChange={setAmount} placeholder="0.00" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Expense Account">
            <SelectField value={coaId} onChange={setCoaId}>
              <option value="">
                {coaLoading
                  ? "Loading accounts…"
                  : coaOptions.length === 0
                    ? "No expense heads in the chart of accounts yet"
                    : "Select an account…"}
              </option>
              {coaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Field>
          <Field label="Payee / Vendor">
            <input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="e.g. City Power Ltd" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Paid From (optional)">
            <SelectField value={bankAccountId} onChange={setBankAccountId}>
              <option value="">
                {bankAccounts.length === 0 ? "No bank accounts yet" : "Not linked to an account"}
              </option>
              {bankAccounts.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Field>
          <Field label="Reference (optional)">
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. EXP-2026-014" className={inputClass} />
          </Field>
        </div>

        <Field label="Notes / Description">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add a note..."
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
          />
        </Field>
      </div>

      {saveError && (
        <p className="px-6 -mt-2 pb-1 text-[12px] font-medium text-rose-600">{saveError}</p>
      )}

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Expense"}
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// 5. Record New Income modal
// ---------------------------------------------------------------------------

const CURRENCY_RATES: Record<string, { label: string; rate: number }> = {
  NGN: { label: "Naira (₦)", rate: 1 },
  GBP: { label: "Pound Sterling (£)", rate: 1807.046 },
  USD: { label: "US Dollar ($)", rate: 1550 },
  EUR: { label: "Euro (€)", rate: 1670 },
}

function RecordIncomeModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { branchId, branches, selectBranch } = useBranchContext()
  const { options: coaOptions, loading: coaLoading } = useCoaOptions(open, "income", branchId)
  const bankAccounts = useBankAccountOptions(open, branchId)

  const [date, setDate] = useState("")
  const [currency, setCurrency] = useState("NGN")
  const [amount, setAmount] = useState("")
  const [coaId, setCoaId] = useState("")
  const [bankAccountId, setBankAccountId] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDate(new Date().toISOString().slice(0, 10))
    setCurrency("NGN")
    setAmount("")
    setCoaId("")
    setBankAccountId("")
    setReference("")
    setNotes("")
    setSaving(false)
    setSaveError(null)
  }, [open])

  const isNaira = currency === "NGN"
  const numericAmount = parseAmount(amount)
  const localValue = numericAmount * (CURRENCY_RATES[currency]?.rate ?? 1)

  const handleSave = async () => {
    if (!branchId) {
      setSaveError("Choose the branch this income belongs to.")
      return
    }
    if (!date) {
      setSaveError("Pick the transaction date.")
      return
    }
    if (numericAmount <= 0) {
      setSaveError("Enter an amount greater than zero.")
      return
    }
    if (!coaId) {
      setSaveError("Choose the income account to post against.")
      return
    }
    const selectedCoa = coaOptions.find((option) => option.id === coaId)
    const description = notes.trim() || selectedCoa?.label || "Income entry"

    setSaving(true)
    setSaveError(null)
    try {
      const response = await fetch(`${API_V1}/financial/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie(),
        },
        credentials: "include",
        body: JSON.stringify({
          type: "income",
          amount: numericAmount,
          description,
          branchId,
          chartOfAccountId: coaId,
          transactionDate: date,
          currency,
          ...(bankAccountId ? { bankAccountId } : {}),
          ...(reference.trim() ? { reference: reference.trim() } : {}),
          source: "manual",
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.message ?? "Unable to save income.")
      onSaved?.()
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save income.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader title="Record New Income" onClose={onClose} />

      <div className="px-6 py-5 space-y-4">
        <p className="-mt-2 text-[12.5px] text-[#6B7280]">Enter the manual transaction details for the ledger.</p>

        {branches.length > 1 && (
          <Field label="Branch">
            <SelectField value={branchId} onChange={selectBranch}>
              <option value="">Select a branch…</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </SelectField>
          </Field>
        )}

        <Field label="Transaction Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Currency">
            <SelectField value={currency} onChange={setCurrency}>
              {Object.entries(CURRENCY_RATES).map(([code, { label }]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </SelectField>
          </Field>
          <Field label="Amount">
            <AmountInput value={amount} onValueChange={setAmount} placeholder="5,000.00" className={inputClass} />
          </Field>
        </div>

        {!isNaira && (
          <Field label="Local Value">
            <input
              readOnly
              value={`₦ ${formatNumber(localValue)}`}
              className={`${inputClass} bg-[#F3F4F6] text-[#6B7280] cursor-not-allowed`}
            />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Income Account">
            <SelectField value={coaId} onChange={setCoaId}>
              <option value="">
                {coaLoading
                  ? "Loading accounts…"
                  : coaOptions.length === 0
                    ? "No income heads in the chart of accounts yet"
                    : "Select an account…"}
              </option>
              {coaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Field>
          <Field label="Paid Into (optional)">
            <SelectField value={bankAccountId} onChange={setBankAccountId}>
              <option value="">
                {bankAccounts.length === 0 ? "No bank accounts yet" : "Not linked to an account"}
              </option>
              {bankAccounts.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Field>
        </div>

        <Field label="Reference (optional)">
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. OFF-2026-001" className={inputClass} />
        </Field>

        <Field label="Notes/Description">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Enter specific details about this income..."
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
          />
        </Field>
      </div>

      {saveError && (
        <p className="px-6 -mt-2 pb-1 text-[12px] font-medium text-rose-600">{saveError}</p>
      )}

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-[#3B5BDB] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Income"}
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------

function ReconciledGroupDetailsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ledgerEntries = [
    { id: "le1", txId: "TXN-89021", name: "Sunday Tithe", fund: "Tithes & Offerings Fund", amount: 100 },
    { id: "le2", txId: "TXN-89022", name: "Sunday Offering", fund: "General Missions Fund", amount: 50 },
  ]
  const journal = [
    { account: "Bank Account (Asset)", debit: 150, credit: null as number | null },
    { account: "Undeposited Funds (Asset)", debit: null as number | null, credit: 150 },
  ]

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-[#EEF1F6] gap-4">
        <div className="space-y-2">
          <h2 className="text-[16px] font-bold text-[#111827]">RECONCILED GROUP #G1 – DETAILS</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> GROUP STATUS: FULLY RECONCILED
          </span>
        </div>
        <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors shrink-0" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-[10px] border border-[#EEF1F6] bg-[#F8FAFC] p-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Reconciled By</p>
            <p className="text-[13px] font-bold text-[#111827] mt-0.5">Accountant (Maryland)</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Date</p>
            <p className="text-[13px] font-bold text-[#111827] mt-0.5">Oct 22, 2024</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">Time</p>
            <p className="text-[13px] font-bold text-[#111827] mt-0.5">10:32 AM</p>
          </div>
        </div>

        {/* Source of truth */}
        <div className="rounded-[10px] border border-[#EEF1F6] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">Bank Transaction (Source of Truth)</p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold text-[#3B5BDB]">#BNK-001</p>
              <p className="text-[12px] font-medium text-[#6B7280]">Bank Deposit</p>
            </div>
            <p className="text-[15px] font-bold text-emerald-600">{formatUSD(150)}</p>
          </div>
        </div>

        {/* Manual ledger entries */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">Manual Ledger Entries (Income Sources)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ledgerEntries.map((le) => (
              <div key={le.id} className="rounded-[10px] border border-[#EEF1F6] p-4">
                <p className="text-[12px] font-bold text-[#3B5BDB]">#{le.txId}</p>
                <p className="text-[13px] font-bold text-[#111827] mt-1">{le.name}</p>
                <p className="text-[11px] font-medium text-[#6B7280]">{le.fund}</p>
                <p className="text-[13px] font-bold text-emerald-600 mt-2">{formatUSD(le.amount)} <span className="text-[10px] text-emerald-500">CREDIT</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Clearing journal entry */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">Clearing Journal Entry</p>
          <div className="overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Account Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right">Debit</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {journal.map((j) => (
                  <tr key={j.account}>
                    <td className="px-4 py-3 text-[12px] font-bold text-[#111827]">{j.account}</td>
                    <td className="px-4 py-3 text-[12px] font-bold text-right text-[#4B5563]">{j.debit != null ? formatUSD(j.debit) : "-"}</td>
                    <td className="px-4 py-3 text-[12px] font-bold text-right text-[#4B5563]">{j.credit != null ? formatUSD(j.credit) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Back to Ledger
        </button>
        <button className="flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors">
          <FileText className="h-4 w-4" /> Audit Log
        </button>
        <button className="flex items-center justify-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <Printer className="h-4 w-4" /> Print / Export
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// 7. Upload Transactions modal (kept / repurposed)
// ---------------------------------------------------------------------------

type UploadFile = {
  id: string
  name: string
  size: string
  progress: number
  file: File
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// ---------------------------------------------------------------------------
// Split a transaction across several chart-of-account lines
// ---------------------------------------------------------------------------

type SplitLine = { amount: string; description: string; chartOfAccountId: string }

/**
 * Chart-of-account heads for the entry pickers.
 *
 * The backend's account types are asset | liability | equity | revenue |
 * expense — there is no "income", which is why filtering the list for one
 * client-side always came back empty. Income heads are `revenue`, and the
 * filtering is done by the API rather than here so the page size can't hide
 * matches beyond the first 100 rows.
 */
function useCoaOptions(enabled: boolean, kind?: "income" | "expense", branchId?: string) {
  const [options, setOptions] = useState<Array<{ id: string; label: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let active = true
    setLoading(true)

    const accountType = kind === "income" ? "revenue" : kind
    const params = new URLSearchParams({ page: "1", limit: "100" })
    if (accountType) params.set("accountType", accountType)
    if (branchId) params.set("branchId", branchId)

    const read = (data: any) => {
      const raw = Array.isArray(data?.data?.content)
        ? data.data.content
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : []
      return raw
        .map((item: any) => {
          const code = String(item?.code ?? item?.accountCode ?? "")
          const name = String(item?.name ?? item?.accountName ?? item?.title ?? "Untitled")
          return {
            id: String(item?.id ?? item?._id ?? item?.coaId ?? ""),
            label: code ? `${code} — ${name}` : name,
          }
        })
        .filter((option: { id: string }) => option.id)
    }

    fetch(`${API_V1}/financial/coa?${params.toString()}`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then(async (data) => {
        if (!active) return
        let list = data ? read(data) : []

        // A branch with no chart of its own still needs the org-wide heads,
        // otherwise the picker is empty and the entry can never be saved.
        if (list.length === 0 && branchId) {
          const fallbackParams = new URLSearchParams({ page: "1", limit: "100" })
          if (accountType) fallbackParams.set("accountType", accountType)
          const retry = await fetch(`${API_V1}/financial/coa?${fallbackParams.toString()}`, {
            credentials: "include",
          })
            .then((response) => (response.ok ? response.json() : null))
            .catch(() => null)
          if (active && retry) list = read(retry)
        }

        if (active) setOptions(list)
      })
      .catch(() => {
        /* leave the picker empty when the chart of accounts is unavailable */
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled, kind, branchId])

  return { options, loading }
}

/** Bank accounts a manual entry can be posted against. */
function useBankAccountOptions(enabled: boolean, branchId: string) {
  const [options, setOptions] = useState<Array<{ id: string; label: string }>>([])

  useEffect(() => {
    if (!enabled) return
    let active = true
    const params = new URLSearchParams({ page: "1", limit: "100" })
    if (branchId) params.set("branchId", branchId)
    fetch(`${API_V1}/financial/bank-accounts?${params.toString()}`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active || !data) return
        const raw = Array.isArray(data?.data?.content)
          ? data.data.content
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data)
                ? data
                : []
        setOptions(
          raw
            .map((item: any) => {
              const name = String(item?.accountName ?? item?.name ?? "Untitled")
              const number = String(item?.accountNumber ?? "")
              const bank = String(item?.bankName ?? "")
              return {
                id: String(item?.id ?? item?._id ?? ""),
                label: [bank, name, number].filter(Boolean).join(" · "),
              }
            })
            .filter((option: { id: string }) => option.id)
        )
      })
      .catch(() => {
        /* leave the picker empty when bank accounts are unavailable */
      })
    return () => {
      active = false
    }
  }, [enabled, branchId])

  return options
}

function SplitTransactionModal({
  transaction,
  onClose,
  onSplit,
}: {
  transaction: DemoRow | null
  onClose: () => void
  onSplit: () => void
}) {
  const open = Boolean(transaction)
  const { options: coaOptions } = useCoaOptions(open)
  const [lines, setLines] = useState<SplitLine[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLines([
      { amount: "", description: "", chartOfAccountId: "" },
      { amount: "", description: "", chartOfAccountId: "" },
    ])
    setError(null)
    setSaving(false)
  }, [open])

  const updateLine = (index: number, patch: Partial<SplitLine>) =>
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))

  const submit = async () => {
    if (!transaction) return
    const splits = lines
      .filter((line) => line.chartOfAccountId && Number(line.amount) > 0)
      .map((line) => ({
        amount: Number(line.amount),
        description: line.description.trim() || transaction.description,
        chartOfAccountId: line.chartOfAccountId,
      }))

    if (splits.length < 2) {
      setError("A split needs at least two lines with an account and an amount.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`${API_V1}/financial/transactions/${transaction.id}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
        credentials: "include",
        body: JSON.stringify({ splits }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.message ?? "Unable to split this transaction.")
      onSplit()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to split this transaction.")
    } finally {
      setSaving(false)
    }
  }

  if (!transaction) return null

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader title="Split Transaction" onClose={onClose} />

      <div className="px-6 py-5 space-y-4">
        <p className="text-[12px] font-semibold text-[#6B7280]">
          {transaction.description} — {formatMoneyWhole(transaction.income ?? transaction.expense ?? 0)}
        </p>

        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_120px]">
            <select
              value={line.chartOfAccountId}
              onChange={(event) => updateLine(index, { chartOfAccountId: event.target.value })}
              className="h-[38px] rounded-md border border-[#E5E7EB] px-3 text-[12px] font-semibold text-[#111827] outline-none focus:border-[#3B5BDB]"
            >
              <option value="">Select account…</option>
              {coaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              value={line.description}
              onChange={(event) => updateLine(index, { description: event.target.value })}
              placeholder="Description"
              className="h-[38px] rounded-md border border-[#E5E7EB] px-3 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB]"
            />
            <input
              type="number"
              min="0"
              value={line.amount}
              onChange={(event) => updateLine(index, { amount: event.target.value })}
              placeholder="Amount"
              className="h-[38px] rounded-md border border-[#E5E7EB] px-3 text-[12px] font-semibold text-[#111827] outline-none focus:border-[#3B5BDB]"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, { amount: "", description: "", chartOfAccountId: "" }])}
          className="text-[12px] font-bold text-[#3B5BDB] hover:text-[#1D4ED8] transition-colors"
        >
          + Add line
        </button>

        {error && <p className="text-[12px] font-semibold text-rose-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="rounded-md bg-[#3B5BDB] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Splitting…" : "Save Split"}
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Turn a pasted bank alert email into a transaction draft
// ---------------------------------------------------------------------------

function ParseEmailModal({
  open,
  onClose,
  onParsed,
}: {
  open: boolean
  onClose: () => void
  onParsed: () => void
}) {
  const [subject, setSubject] = useState("")
  const [from, setFrom] = useState("")
  const [body, setBody] = useState("")
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSubject("")
    setFrom("")
    setBody("")
    setError(null)
    setResult(null)
    setParsing(false)
  }, [open])

  const submit = async () => {
    if (!subject.trim() || !body.trim()) {
      setError("Both the subject and the email body are required.")
      return
    }
    setParsing(true)
    setError(null)
    try {
      const response = await fetch(`${API_V1}/financial/bank-statement/parse-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
        credentials: "include",
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          ...(from.trim() ? { from: from.trim() } : {}),
          receivedAt: new Date().toISOString(),
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.message ?? "Unable to read that alert.")
      setResult(payload?.message ?? "Draft transaction created from the alert.")
      onParsed()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read that alert.")
    } finally {
      setParsing(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader title="Import from Bank Alert" onClose={onClose} />

      <div className="space-y-4 px-6 py-5">
        <p className="text-[12px] font-medium text-[#6B7280]">
          Paste a credit or debit alert email and it will be read into a draft transaction.
        </p>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Subject — e.g. Credit Alert: NGN 250,000.00 received"
          className="h-[38px] w-full rounded-md border border-[#E5E7EB] px-3 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB]"
        />
        <input
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          placeholder="From (optional) — e.g. noreply@firstbank.ng"
          className="h-[38px] w-full rounded-md border border-[#E5E7EB] px-3 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB]"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={7}
          placeholder="Paste the full email body here…"
          className="w-full rounded-md border border-[#E5E7EB] px-3 py-2.5 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB]"
        />
        {error && <p className="text-[12px] font-semibold text-rose-600">{error}</p>}
        {result && <p className="text-[12px] font-semibold text-emerald-600">{result}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          onClick={submit}
          disabled={parsing}
          className="rounded-md bg-[#3B5BDB] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {parsing ? "Reading…" : "Parse Alert"}
        </button>
      </div>
    </ModalShell>
  )
}

export function UploadTransactionsModal({
  open,
  onClose,
  onProcess,
}: {
  open: boolean
  onClose: () => void
  onProcess?: (summary: UploadSummary | null) => void
}) {
  const { user } = useAuth()
  const branchId = user?.branchId ?? user?.branch?.id ?? ""

  const [files, setFiles] = useState<UploadFile[]>([])
  const [account, setAccount] = useState("")
  const [accountOptions, setAccountOptions] = useState<AccountRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Reset selection state whenever the modal is opened, and load the branch's
  // bank accounts so "Select Target Account" reflects real accounts.
  useEffect(() => {
    if (!open) return
    setFiles([])
    setAccount("")
    setUploading(false)
    setUploadError(null)

    let active = true
    const loadAccounts = async () => {
      try {
        const params = new URLSearchParams({ limit: "200" })
        if (branchId) params.set("branchId", branchId)
        const response = await fetch(`${API_V1}/financial/bank-accounts?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) return
        const raw = Array.isArray(data?.data?.content)
          ? data.data.content
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data)
                ? data
                : []
        if (active) setAccountOptions(raw.map(mapBankAccountToRow))
      } catch {
        /* defensive: leave the dropdown empty on failure */
      }
    }
    loadAccounts()
    return () => {
      active = false
    }
  }, [open, branchId])

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const next = Array.from(list).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 10,
      file,
    }))
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.id))
      return [...prev, ...next.filter((f) => !existing.has(f.id))]
    })
  }

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  // Animate per-file upload progress so a freshly added file shows an
  // "Uploading X%" state that settles to "Complete" (matches the design).
  useEffect(() => {
    if (!files.some((f) => f.progress < 100)) return
    const timer = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => (f.progress < 100 ? { ...f, progress: Math.min(100, f.progress + 17) } : f))
      )
    }, 280)
    return () => clearInterval(timer)
  }, [files])

  const handleProcess = async () => {
    if (files.length === 0) {
      setUploadError("Please select a CSV file to upload.")
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      let lastPayload: any = null
      for (const f of files) {
        const formData = new FormData()
        formData.append("file", f.file)
        if (account) formData.append("bankAccountId", account)
        const response = await fetch(`${API_V1}/financial/transactions/upload-csv`, {
          method: "POST",
          headers: { "x-csrf-token": getCsrfTokenFromCookie() },
          credentials: "include",
          body: formData,
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.message ?? "Unable to upload statement.")
        lastPayload = data?.data ?? data ?? null
      }
      const selected = accountOptions.find((a) => a.id === account)
      const summary = buildUploadSummary(lastPayload, {
        accountLabel: selected ? `${selected.name} (${selected.number})` : undefined,
        fileName: files[files.length - 1]?.name,
      })
      onProcess ? onProcess(summary) : onClose()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Unable to upload statement.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader
        title="Upload Transactions"
        onClose={onClose}
        icon={<FileText className="h-5 w-5" />}
      />

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {/* Target account */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold text-[#111827]">Select Target Account</label>
          <div className="relative">
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="h-[42px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-3.5 pr-10 text-[13px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
            >
              <option value="">
                {accountOptions.length ? "Choose an account..." : "No accounts found"}
              </option>
              {accountOptions.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} - {acc.number}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>

        {/* Drag & drop */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            addFiles(e.dataTransfer.files)
          }}
          className="flex flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-[#D1D5DB] bg-[#F8FAFC] px-6 py-8 text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#EEF1F6]">
            <UploadCloud className="h-6 w-6 text-[#64748B]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#111827]">Drag &amp; drop statement of account here</p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Upload CSV only</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
          >
            Browse Files
          </button>
        </div>

        {/* Selected files */}
        {files.length > 0 && (
          <div className="space-y-3">
            {files.map((file) => {
              const complete = file.progress >= 100
              return (
                <div key={file.id} className="flex items-center gap-3 rounded-[10px] border border-[#EEF1F6] bg-white p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-bold text-[#111827] truncate">{file.name}</span>
                      <span className={`text-[11px] font-bold shrink-0 ${complete ? "text-emerald-600" : "text-amber-500"}`}>
                        {complete ? "Complete" : "Uploading"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#9CA3AF] shrink-0">{file.size}</span>
                      {!complete && (
                        <span className="text-[11px] font-bold text-amber-500 shrink-0">{file.progress}%</span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#EEF1F6] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${complete ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className={`shrink-0 transition-colors ${complete ? "text-rose-500 hover:text-rose-600" : "text-[#9CA3AF] hover:text-[#4B5563]"}`}
                    aria-label={`Remove ${file.name}`}
                  >
                    {complete ? <Trash2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </button>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {uploadError && (
        <p className="px-6 pb-1 text-[12px] font-medium text-rose-600">{uploadError}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleProcess}
          disabled={uploading}
          className="rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Processing…" : "Process Upload"}
        </button>
      </div>
    </ModalShell>
  )
}
