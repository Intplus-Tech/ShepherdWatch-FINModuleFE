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
  Upload,
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
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { ModalShell } from "@/components/ui/modal-shell"
import { AmountInput, parseAmount } from "@/components/ui/amount-input"

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

// ---------------------------------------------------------------------------
// Shared Bank Transactions flow (used by Super Admin & Branch Accountant pages)
// ---------------------------------------------------------------------------

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

const DEMO_ROWS: DemoRow[] = [
  {
    id: "1",
    date: "Oct 23, 2023",
    txId: "TXN-89021",
    payee: "Sunday General Offering",
    description: "",
    account: "General Offerings (0012337821)",
    expense: null,
    income: 14250,
    category: "General Offering",
    status: "cleared",
    linkedGroup: "G1",
  },
  {
    id: "2",
    date: "Oct 23, 2023",
    txId: "TXN-89022",
    payee: "Monthly Tithe - John Doe",
    description: "",
    account: "General Offerings (0012337821)",
    expense: null,
    income: 123250,
    category: "General Offering",
    status: "cleared",
    linkedGroup: "G1",
  },
  {
    id: "3",
    date: "Oct 23, 2023",
    txId: "TXN-89023",
    payee: "Building Fund Donation",
    description: "",
    account: "Capital Project (0012117811)",
    expense: null,
    income: 14250,
    category: "Capital Project",
    status: "pending",
    linkedGroup: null,
  },
  {
    id: "4",
    date: "Oct 23, 2023",
    txId: "TXN-89024",
    payee: "Benevolence Fund - Smith Family",
    description: "",
    account: "Thanksgiving (7820176218)",
    expense: null,
    income: 14250,
    category: "-",
    status: "uncategorized",
    linkedGroup: null,
  },
  {
    id: "5",
    date: "Oct 23, 2023",
    txId: "TXN-89021",
    payee: "Sunday General Offering",
    description: "",
    account: "General Offerings (0012337821)",
    expense: null,
    income: 14250,
    category: "General Offering",
    status: "cleared",
    linkedGroup: null,
    reconcilable: true,
  },
  {
    id: "6",
    date: "Oct 23, 2023",
    txId: "TXN-89021",
    payee: "Sunday General Offering",
    description: "",
    account: "General Offerings (0012337821)",
    expense: null,
    income: 14250,
    category: "General Offering",
    status: "none",
    linkedGroup: null,
  },
  {
    id: "7",
    date: "Oct 23, 2023",
    txId: "TXN-89021",
    payee: "New AC Purchase for church",
    description: "",
    account: "",
    expense: 14250,
    income: null,
    category: "Operational Expense",
    status: "none",
    linkedGroup: null,
  },
  {
    id: "8",
    date: "Oct 23, 2023",
    txId: "TXN-89021",
    payee: "ShopForFree",
    description: "",
    account: "",
    expense: 14250,
    income: null,
    category: "Program Project",
    status: "none",
    linkedGroup: null,
  },
  {
    id: "9",
    date: "Oct 23, 2023",
    txId: "TXN-89021",
    payee: "Building Project",
    description: "",
    account: "",
    expense: 14250,
    income: null,
    category: "Capital Project",
    status: "none",
    linkedGroup: null,
  },
  {
    id: "10",
    date: "Oct 22, 2023",
    txId: "TXN-89030",
    payee: "Wednesday Service Offering",
    description: "",
    account: "General Offerings (0012337821)",
    expense: null,
    income: 58400,
    category: "General Offering",
    status: "cleared",
    linkedGroup: null,
    reconcilable: true,
  },
  {
    id: "11",
    date: "Oct 22, 2023",
    txId: "TXN-89031",
    payee: "Harvest Thanksgiving",
    description: "",
    account: "Thanksgiving (7820176218)",
    expense: null,
    income: 240000,
    category: "Thanksgiving",
    status: "pending",
    linkedGroup: null,
  },
  {
    id: "12",
    date: "Oct 21, 2023",
    txId: "TXN-89032",
    payee: "Generator Diesel Supply",
    description: "",
    account: "",
    expense: 96500,
    income: null,
    category: "Operational Expense",
    status: "none",
    linkedGroup: null,
  },
  {
    id: "13",
    date: "Oct 21, 2023",
    txId: "TXN-89033",
    payee: "Monthly Tithe - Mary Grace",
    description: "",
    account: "General Offerings (0012337821)",
    expense: null,
    income: 75000,
    category: "Tithe",
    status: "cleared",
    linkedGroup: null,
  },
  {
    id: "14",
    date: "Oct 20, 2023",
    txId: "TXN-89034",
    payee: "Unidentified Bank Credit",
    description: "",
    account: "Thanksgiving (7820176218)",
    expense: null,
    income: 32000,
    category: "-",
    status: "uncategorized",
    linkedGroup: null,
  },
  {
    id: "15",
    date: "Oct 20, 2023",
    txId: "TXN-89035",
    payee: "Youth Camp Materials",
    description: "",
    account: "",
    expense: 41200,
    income: null,
    category: "Program Project",
    status: "pending",
    linkedGroup: null,
  },
]

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

export function BankTransactions() {
  const [tab, setTab] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL")
  const [search, setSearch] = useState("")
  const [rows, setRows] = useState<DemoRow[]>(DEMO_ROWS)
  const [accountFilter, setAccountFilter] = useState("All Accounts")
  const [month, setMonth] = useState("Oct 2023")
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 5

  const accountNames = useMemo(
    () => Array.from(new Set(rows.map((r) => r.account).filter(Boolean))),
    [rows],
  )

  // Modal open state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false)

  const updateCategory = (id: string, category: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, category } : r)))
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
      value: formatMoneyWhole(128840250),
      icon: Landmark,
      iconColor: "text-[#3B5BDB]",
      iconBg: "bg-[#EEF2FF]",
      trend: null as string | null,
    },
    {
      title: "EXPENSE (MONTH)",
      value: formatMoneyWhole(8840250),
      icon: ArrowUpRight,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
      trend: "+12%",
    },
    {
      title: "INCOME (MONTH)",
      value: formatMoneyWhole(8840250),
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
            onClick={() => setUploadOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" strokeWidth={2.5} /> Upload Statements
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
              {filteredRows.length === 0 ? (
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
                      <div className="relative">
                        <select
                          value={categoriesForRow(row).includes(row.category) ? row.category : "-"}
                          onChange={(e) => updateCategory(row.id, e.target.value)}
                          className="h-[34px] w-full min-w-[150px] appearance-none rounded-md border border-[#E5E7EB] bg-white pl-3 pr-8 text-[12px] font-semibold text-[#4B5563] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
                        >
                          {categoriesForRow(row).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusPill status={row.status} />
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
        onProcess={() => {
          setUploadOpen(false)
          setSummaryOpen(true)
        }}
      />
      <StatementUploadSummaryModal open={summaryOpen} onClose={() => setSummaryOpen(false)} />
      <RecordIncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} />
      <RecordExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <ManageAccountsModal open={accountsOpen} onClose={() => setAccountsOpen(false)} />
      <ReconcileBankDepositModal open={reconcileOpen} onClose={() => setReconcileOpen(false)} />
      <ReconciledGroupDetailsModal open={groupDetailsOpen} onClose={() => setGroupDetailsOpen(false)} />
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
}: {
  title: string
  onClose: () => void
  titleClassName?: string
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[#EEF1F6]">
      <h2 className={`text-[16px] font-bold ${titleClassName}`}>{title}</h2>
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

function StatementUploadSummaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tiles = [
    { label: "Total Transactions", value: "42", color: "text-[#111827]" },
    { label: "Net Amount", value: formatMoney(6299750), color: "text-[#111827]" },
    { label: "Total Credit", value: `+${formatMoney(8450200)}`, color: "text-emerald-600" },
    { label: "Total Debit", value: `-${formatMoney(2150450)}`, color: "text-rose-600" },
  ]
  const details = [
    { label: "Account", value: "General Offerings (0012337821)" },
    { label: "Date Range", value: "Oct 01 - Oct 31, 2024" },
    { label: "File Name", value: "firstbank_stmt_oct.csv" },
  ]

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader title="Statement Upload Summary" onClose={onClose} />

      <div className="px-6 py-5 space-y-5">
        {/* Success banner */}
        <div className="flex items-center gap-3 rounded-[10px] bg-emerald-50 border border-emerald-100 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-[13px] font-bold text-emerald-700">File processed successfully. 42 transactions identified.</p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          onClick={onClose}
          className="rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Confirm &amp; Import
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
}

const INITIAL_ACCOUNTS: AccountRow[] = [
  { id: "a1", number: "0012337821", name: "General Offering", description: "Primary operating account" },
  { id: "a2", number: "0011298745", name: "Building Project", description: "Foreign mission support" },
  { id: "a3", number: "0017654398", name: "ShopForFree", description: "Facility maintenance" },
  { id: "a4", number: "0013349087", name: "Youth Ministry", description: "Events and curriculum" },
]

function ManageAccountsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [accounts, setAccounts] = useState<AccountRow[]>(INITIAL_ACCOUNTS)
  const [number, setNumber] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setAccounts(INITIAL_ACCOUNTS)
      setNumber("")
      setName("")
      setDescription("")
      setEditingId(null)
    }
  }, [open])

  const resetForm = () => {
    setNumber("")
    setName("")
    setDescription("")
    setEditingId(null)
  }

  const removeAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    if (editingId === id) resetForm()
  }

  const startEdit = (account: AccountRow) => {
    setEditingId(account.id)
    setNumber(account.number)
    setName(account.name)
    setDescription(account.description)
  }

  const saveAccount = () => {
    if (!number.trim() && !name.trim()) return
    if (editingId) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, number: number.trim() || "—", name: name.trim() || "Untitled", description: description.trim() }
            : a,
        ),
      )
    } else {
      setAccounts((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, number: number.trim() || "—", name: name.trim() || "Untitled", description: description.trim() },
      ])
    }
    resetForm()
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
                {["NUMBER", "NAME", "DESCRIPTION", "ACTIONS"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] ${i === 3 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-[12px] font-bold text-[#3B5BDB] whitespace-nowrap">{a.number}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#111827]">{a.name}</td>
                  <td className="px-4 py-3 text-[12px] font-medium text-[#6B7280]">{a.description}</td>
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
                        onClick={() => removeAccount(a.id)}
                        className="text-[#9CA3AF] hover:text-rose-500 transition-colors"
                        aria-label={`Delete ${a.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            <Field label="Description">
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className={inputClass} />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveAccount}
              className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              {editingId ? (
                <>
                  <Save className="h-4 w-4" strokeWidth={2.5} /> Update Account
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Account
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
          Save Changes
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// 4. Record New Expense modal
// ---------------------------------------------------------------------------

function RecordExpenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [date, setDate] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("Transfer")
  const [payee, setPayee] = useState("")
  const [category, setCategory] = useState("Operational Expense")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open) {
      setDate("")
      setAmount("")
      setType("Transfer")
      setPayee("")
      setCategory("Operational Expense")
      setNotes("")
    }
  }, [open])

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader title="Record New Expense" onClose={onClose} />

      <div className="px-6 py-5 space-y-4">
        <p className="text-[12px] text-[#9CA3AF] -mt-1">Enter the manual transaction details for the ledger.</p>

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
          <Field label="Transaction Type">
            <SelectField value={type} onChange={setType}>
              <option value="Transfer">Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Card">Card</option>
            </SelectField>
          </Field>
          <Field label="Payee / Vendor">
            <input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="e.g. City Power Ltd" className={inputClass} />
          </Field>
        </div>

        <Field label="Category">
          <SelectField value={category} onChange={setCategory}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </Field>

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
          Save Expense
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
  CAD: { label: "Canadian Dollar (C$)", rate: 1130 },
}

function RecordIncomeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [date, setDate] = useState("")
  const [currency, setCurrency] = useState("NGN")
  const [amount, setAmount] = useState("")
  const [incomeType, setIncomeType] = useState("General Offering")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open) {
      setDate("")
      setCurrency("NGN")
      setAmount("")
      setIncomeType("General Offering")
      setNotes("")
    }
  }, [open])

  const isNaira = currency === "NGN"
  const numericAmount = parseAmount(amount)
  const localValue = numericAmount * (CURRENCY_RATES[currency]?.rate ?? 1)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader title="Record New Income" onClose={onClose} />

      <div className="px-6 py-5 space-y-4">
        <p className="-mt-2 text-[12.5px] text-[#6B7280]">Enter the manual transaction details for the ledger.</p>
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

        <Field label="Income Type">
          <SelectField value={incomeType} onChange={setIncomeType}>
            {INCOME_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </Field>

        <Field label="Notes/Description">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Enter specific details about this expense..."
            className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20"
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-md bg-[#3B5BDB] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Income
        </button>
      </div>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// 6. Reconciled Group Details modal
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
}

const INITIAL_FILES: UploadFile[] = [
  { id: "f1", name: "october-statement.csv", size: "248 KB", progress: 100 },
  { id: "f2", name: "savings-account.csv", size: "112 KB", progress: 64 },
]

export function UploadTransactionsModal({
  open,
  onClose,
  onProcess,
}: {
  open: boolean
  onClose: () => void
  onProcess?: () => void
}) {
  const [files, setFiles] = useState<UploadFile[]>(INITIAL_FILES)
  const [account, setAccount] = useState("")

  // Reset selection state whenever the modal is opened.
  useEffect(() => {
    if (open) {
      setFiles(INITIAL_FILES)
      setAccount("")
    }
  }, [open])

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      <ModalHeader title="Upload Transactions" onClose={onClose} />

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
              <option value="">Choose an account...</option>
              <option value="current">Current Account - 1023456789</option>
              <option value="savings">Savings Account - 2098765432</option>
              <option value="building">Building Fund Account - 3055512345</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>

        {/* Drag & drop */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-[#D1D5DB] bg-[#F8FAFC] px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
            <Upload className="h-5 w-5 text-[#3B5BDB]" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#111827]">Drag &amp; drop statement of account here</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">Upload CSV only</p>
          </div>
          <button className="mt-1 flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors">
            Browse Files
          </button>
        </div>

        {/* Selected files */}
        {files.length > 0 && (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 rounded-[10px] border border-[#EEF1F6] bg-white p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] shrink-0">
                  <FileSpreadsheet className="h-4 w-4 text-[#3B5BDB]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-[#111827] truncate">{file.name}</span>
                    <span className="text-[11px] font-medium text-[#9CA3AF] shrink-0">{file.size}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-[#EEF1F6] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${file.progress >= 100 ? "bg-emerald-500" : "bg-[#3B5BDB]"}`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold shrink-0 ${file.progress >= 100 ? "text-emerald-600" : "text-[#3B5BDB]"}`}>
                      {file.progress >= 100 ? "Complete" : `Uploading ${file.progress}%`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-[#9CA3AF] hover:text-rose-500 transition-colors shrink-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#EEF1F6]">
        <button
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => (onProcess ? onProcess() : onClose())}
          className="rounded-md bg-[#3B5BDB] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Process Upload
        </button>
      </div>
    </ModalShell>
  )
}
