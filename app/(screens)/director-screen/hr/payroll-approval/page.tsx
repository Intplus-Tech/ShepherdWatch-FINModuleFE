"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import {
  useHrPayrollOverview,
  useHrPayrollByBranch,
  usePayrollMutations,
} from "@/components/hooks/useHrPayroll"
import { useDirectorHrDashboard } from "@/components/hooks/useHrDashboard"
import { formatNaira } from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import {
  Search,
  UserPlus,
  Download,
  AlertTriangle,
  Users,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"

export default function Page() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [titleFilter, setTitleFilter] = useState("")
  const [authorizingId, setAuthorizingId] = useState<string | null>(null)

  const { overview, loading: overviewLoading, error, refresh: refreshOverview } =
    useHrPayrollOverview()
  // Branch names come from the executive dashboard; the money per branch comes
  // from each branch's current payroll run.
  const { dashboard } = useDirectorHrDashboard()
  const branches = useMemo(
    () =>
      dashboard.headcountByBranch
        .filter((branch) => branch.branchId)
        .map((branch) => ({ id: branch.branchId, name: branch.branchName || "Unnamed branch" })),
    [dashboard.headcountByBranch]
  )

  const { rows, loading, refresh } = useHrPayrollByBranch(branches)
  const { authorizeRun } = usePayrollMutations()

  const filtered = useMemo(() => {
    const q = titleFilter.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesBranch = branchFilter === "All Branches" || row.branchName === branchFilter
      const matchesTitle = !q || row.branchName.toLowerCase().includes(q)
      return matchesBranch && matchesTitle
    })
  }, [rows, branchFilter, titleFilter])

  const grossTotal = overview?.totalGrossPayroll ?? 0
  const deductionsTotal = overview
    ? overview.totalTaxWithheld + overview.totalPensionWithheld + overview.totalLoanRecovered
    : 0
  const deductionShare = grossTotal ? Math.round((deductionsTotal / grossTotal) * 1000) / 10 : 0
  const submittedCount = overview?.statusDistribution?.submitted ?? 0

  const handleAuthorize = async (runId: string, branchName: string) => {
    setAuthorizingId(runId)
    try {
      await authorizeRun(runId)
      pushToast(`Payroll authorized for ${branchName}`, "success")
      refresh()
      refreshOverview()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to authorize this run", "error")
    } finally {
      setAuthorizingId(null)
    }
  }

  const handleExport = () => {
    const exported = exportHrRows(
      "payroll-by-branch",
      filtered.map((row) => ({
        Branch: row.branchName,
        "Staff Count": row.staffCount,
        "Gross Pay": row.grossPay,
        Deductions: row.deductions,
        "Net Payable": row.netPayable,
        Status: row.status,
      }))
    )
    if (!exported) pushToast("Nothing to export yet", "info")
  }

  const clearFilters = () => {
    setBranchFilter("All Branches")
    setTitleFilter("")
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/payroll-approval"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Payroll Overview
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Review and authorize Payrolls across all branches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={titleFilter}
                  onChange={(event) => setTitleFilter(event.target.value)}
                  placeholder="Search branches..."
                  aria-label="Search branches"
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] sm:w-[240px]"
                />
              </div>
              <button
                type="button"
                onClick={() => router.push("/director-screen/hr/add-employee")}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters card */}
          <div className="mb-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">
                  Filter by Branch
                </label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="All Branches">All Branches</option>
                  {rows.map((row) => (
                    <option key={row.branchId} value={row.branchName}>
                      {row.branchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">
                  Job Title
                </label>
                <input
                  type="text"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  placeholder="Title search..."
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-[13px] font-semibold text-[#3B5BDB] lg:mb-3"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Notice banner */}
          <div className="mb-6 flex items-center gap-3 rounded bg-amber-50 border-l-4 border-amber-400 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <span className="text-[13px] font-bold text-[#111827]">
              Payroll Summary for {overview?.period || (overviewLoading ? "…" : "the current period")}
              {submittedCount ? ` · ${submittedCount} run${submittedCount === 1 ? "" : "s"} awaiting authorization` : ""}
            </span>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Employees */}
            <div className="relative overflow-hidden rounded-xl border border-[#EEF1F6] bg-white p-5">
              <Users className="pointer-events-none absolute right-4 top-4 h-10 w-10 text-[#F1F3F9]" />
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Total Employees
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">
                {overview?.totalStaffCount ?? 0}
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                Across {overview?.totalBranches ?? 0} branches
              </div>
            </div>

            {/* Total Gross Pay */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Total Gross Pay
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">
                {formatNaira(grossTotal)}
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                <div
                  className="h-full rounded-full bg-[#3B5BDB]"
                  style={{ width: `${Math.min(100 - deductionShare, 100)}%` }}
                />
              </div>
            </div>

            {/* Total Deductions */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Total Deductions
              </div>
              <div className="mt-2 text-[28px] font-bold text-rose-600">
                {formatNaira(deductionsTotal)}
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">{deductionShare}% of Gross</div>
            </div>

            {/* Net Pay Payable (dark) */}
            <div className="rounded-xl border border-[#111827] bg-[#111827] p-5 text-white">
              <div className="text-[12px] font-semibold text-white/70">
                Net Pay Payable
              </div>
              <div className="mt-2 text-[28px] font-bold text-white">
                {formatNaira(overview?.totalNetPayable ?? 0)}
              </div>
              <div className="mt-1 text-[12px] text-white/60">
                {error ? "Unable to load payroll" : "Ready for Disbursement"}
              </div>
            </div>
          </div>

          {/* Payroll Breakdown by Branch */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[18px] font-bold text-[#111827]">
                Payroll Breakdown by Branch
              </h2>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#111827] hover:text-[#3B5BDB]"
              >
                <Download className="h-4 w-4" />
                Export Detailed CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Branch/Unit
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Staff Count
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Gross Pay
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Deductions
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Net Payable
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {filtered.map((row) => (
                    <tr key={row.branchId}>
                      <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                        {row.branchName}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.staffCount}</td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatNaira(row.grossPay)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatNaira(row.deductions)}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                        {formatNaira(row.netPayable)}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex justify-end">
                          {row.status === "submitted" ? (
                            <button
                              type="button"
                              onClick={() => handleAuthorize(row.runId, row.branchName)}
                              disabled={authorizingId === row.runId}
                              className="rounded-md bg-[#111827] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black disabled:opacity-50"
                            >
                              {authorizingId === row.runId ? "Authorizing…" : "Authorize"}
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold uppercase text-[#9CA3AF]">
                              {row.status === "none" ? "No run" : row.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#6B7280]">
                        No branches match your filters.
                      </td>
                    </tr>
                  ) : null}

                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#6B7280]">
                        Loading payroll by branch…
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="w-full rounded-b-xl bg-[#F8FAFC] px-4 py-3 text-center text-[13px] font-semibold text-[#6B7280]">
              Showing {filtered.length} of {rows.length} reporting branches
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
