"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import AddServiceLogModal from "./AddServiceLogModal"
import {
  SERVICE_ATTENDANCE_LOG,
  SERVICE_TYPES,
  SERVICE_TYPE_STYLES,
  entryTotal,
  type ServiceAttendanceEntry,
} from "./attendance-data"

const PAGE_SIZE = 6

/**
 * Branch-scoped service attendance log. Shared by the Admin view (which records
 * entries) and the Branch Pastor view (which reviews them) — `editable`
 * decides whether the add/edit/delete affordances are rendered.
 */
export default function ServiceAttendanceLog({
  branchLabel,
  title,
  subtitle,
  editable = false,
  showServiceBreakdown = false,
}: {
  branchLabel: string
  title: string
  subtitle: string
  editable?: boolean
  showServiceBreakdown?: boolean
}) {
  const [entries, setEntries] = useState<ServiceAttendanceEntry[]>(SERVICE_ATTENDANCE_LOG)
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState("All Services")
  const [periodFilter, setPeriodFilter] = useState("This Month")
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ServiceAttendanceEntry | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return entries.filter((entry) => {
      const matchesService = serviceFilter === "All Services" || entry.serviceType === serviceFilter
      const matchesTerm =
        !term ||
        entry.serviceTheme.toLowerCase().includes(term) ||
        entry.serviceType.toLowerCase().includes(term) ||
        entry.serviceDate.toLowerCase().includes(term)
      return matchesService && matchesTerm
    })
  }, [entries, search, serviceFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const totalAttendance = entries.reduce((sum, entry) => sum + entryTotal(entry), 0)
  const totalServices = entries.length
  const averagePerService = totalServices ? Math.round(totalAttendance / totalServices) : 0

  const serviceBreakdown = useMemo(
    () =>
      SERVICE_TYPES.map((type) => {
        const rows = entries.filter((entry) => entry.serviceType === type)
        const total = rows.reduce((sum, entry) => sum + entryTotal(entry), 0)
        return {
          type,
          services: rows.length,
          total,
          average: rows.length ? Math.round(total / rows.length) : 0,
          share: totalAttendance ? Math.round((total / totalAttendance) * 100) : 0,
        }
      }).filter((row) => row.services > 0),
    [entries, totalAttendance]
  )

  const openNewEntry = () => {
    setEditingEntry(null)
    setModalOpen(true)
  }

  const openEditEntry = (entry: ServiceAttendanceEntry) => {
    setEditingEntry(entry)
    setModalOpen(true)
  }

  const handleSave = (entry: ServiceAttendanceEntry) => {
    setEntries((prev) => {
      const exists = prev.some((row) => row.id === entry.id)
      return exists ? prev.map((row) => (row.id === entry.id ? entry : row)) : [entry, ...prev]
    })
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((row) => row.id !== id))
  }

  const stats = [
    {
      label: "Total Month Attendance",
      value: totalAttendance.toLocaleString(),
      hint: "+12% from last month",
      hintClass: "text-emerald-600",
    },
    { label: "Total Services", value: String(totalServices), hint: "Logged this month", hintClass: "text-[#9CA3AF]" },
    {
      label: "Avg. Per Service",
      value: String(averagePerService),
      hint: "Across all service types",
      hintClass: "text-[#9CA3AF]",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-[26px] font-extrabold leading-tight text-[#111827]">{title}</h1>
          <p className="mt-2 text-[13px] font-medium text-[#3B5BDB]">{subtitle}</p>
        </div>
        {editable ? (
          <button
            type="button"
            onClick={openNewEntry}
            className="inline-flex h-[40px] shrink-0 items-center gap-2 rounded-[8px] bg-[#2563EB] px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Add Log Entry
          </button>
        ) : null}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
            <div className="text-[12px] font-semibold text-[#6B7280]">{stat.label}</div>
            <div className="mt-2 text-[26px] font-extrabold leading-none text-[#111827]">{stat.value}</div>
            <div className={cn("mt-2 text-[11px] font-semibold", stat.hintClass)}>{stat.hint}</div>
          </div>
        ))}
      </div>

      {/* Service type breakdown (Branch Pastor oversight view) */}
      {showServiceBreakdown ? (
        <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-[#111827]">Attendance by Service Type</h2>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            How the month&apos;s congregation is distributed across services at {branchLabel}.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {serviceBreakdown.map((row) => (
              <div key={row.type} className="rounded-[10px] border border-[#EEF1F6] bg-[#F8FAFC] p-4">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                    SERVICE_TYPE_STYLES[row.type]
                  )}
                >
                  {row.type}
                </span>
                <div className="mt-3 text-[20px] font-extrabold text-[#111827]">
                  {row.total.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] font-medium text-[#6B7280]">
                  {row.services} {row.services === 1 ? "service" : "services"} · avg {row.average}
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div className="h-full rounded-full bg-[#3B5BDB]" style={{ width: `${row.share}%` }} />
                </div>
                <div className="mt-1.5 text-[11px] font-semibold text-[#3B5BDB]">{row.share}% of total</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Log table */}
      <div className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[320px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search entries..."
              className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={serviceFilter}
                onChange={(event) => {
                  setServiceFilter(event.target.value)
                  setPage(1)
                }}
                aria-label="Filter by service type"
                className="h-[38px] appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-3.5 pr-9 text-[13px] font-medium text-[#4B5563] outline-none focus:border-[#2563EB]"
              >
                <option>All Services</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={periodFilter}
                onChange={(event) => setPeriodFilter(event.target.value)}
                aria-label="Filter by period"
                className="h-[38px] appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-9 pr-9 text-[13px] font-medium text-[#4B5563] outline-none focus:border-[#2563EB]"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="bg-[#EEF2FF] text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                <th rowSpan={2} className="px-4 py-3 align-bottom">
                  #
                </th>
                <th rowSpan={2} className="px-4 py-3 align-bottom">
                  Service Date
                </th>
                <th rowSpan={2} className="px-4 py-3 align-bottom">
                  Service Type
                </th>
                <th rowSpan={2} className="px-4 py-3 align-bottom">
                  Service Theme
                </th>
                <th colSpan={2} className="border-b border-white/70 px-4 py-2 text-center">
                  Main Auditorium
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center align-bottom">
                  Teens
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center align-bottom">
                  Children
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center align-bottom">
                  Total
                </th>
                {editable ? (
                  <th rowSpan={2} className="px-4 py-3 text-center align-bottom">
                    Actions
                  </th>
                ) : null}
              </tr>
              <tr className="bg-[#EEF2FF] text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                <th className="px-4 pb-3 text-center">Male</th>
                <th className="px-4 pb-3 text-center">Female</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry, index) => (
                <tr key={entry.id} className="border-b border-[#F3F4F6] text-[13px] last:border-b-0">
                  <td className="px-4 py-4 font-medium text-[#9CA3AF]">{pageStart + index + 1}</td>
                  <td className="px-4 py-4 font-bold text-[#111827]">{entry.serviceDate}</td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-[11px] font-bold",
                        SERVICE_TYPE_STYLES[entry.serviceType]
                      )}
                    >
                      {entry.serviceType}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-[#4B5563]">{entry.serviceTheme}</td>
                  <td className="px-4 py-4 text-center text-[#4B5563]">{entry.male}</td>
                  <td className="px-4 py-4 text-center text-[#4B5563]">{entry.female}</td>
                  <td className="px-4 py-4 text-center text-[#4B5563]">{entry.teens}</td>
                  <td className="px-4 py-4 text-center text-[#4B5563]">{entry.children}</td>
                  <td className="px-4 py-4 text-center font-extrabold text-[#111827]">{entryTotal(entry)}</td>
                  {editable ? (
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditEntry(entry)}
                          aria-label={`Edit ${entry.serviceType} on ${entry.serviceDate}`}
                          className="text-[#6B7280] hover:text-[#2563EB]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          aria-label={`Delete ${entry.serviceType} on ${entry.serviceDate}`}
                          className="text-[#6B7280] hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}

              {visible.length === 0 ? (
                <tr>
                  <td colSpan={editable ? 10 : 9} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]">
                    No attendance entries match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#EEF1F6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] font-medium text-[#6B7280]">
            Showing{" "}
            <span className="font-bold text-[#111827]">
              {filtered.length === 0 ? 0 : pageStart + 1}-{pageStart + visible.length}
            </span>{" "}
            of <span className="font-bold text-[#111827]">{filtered.length}</span> entries · {periodFilter}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-[34px] rounded-[8px] border border-[#E5E7EB] px-4 text-[12px] font-semibold text-[#4B5563] disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-[34px] rounded-[8px] border border-[#E5E7EB] px-4 text-[12px] font-semibold text-[#4B5563] disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <AddServiceLogModal
          key={editingEntry?.id ?? "new-entry"}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          branchLabel={branchLabel}
          entry={editingEntry}
        />
      ) : null}
    </div>
  )
}
