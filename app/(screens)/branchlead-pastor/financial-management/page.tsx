"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  Bell,
  Search,
  ChevronDown,
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  BarChart3,
  Settings,
  HelpCircle,
  ArrowLeft,
  AlertCircle,
  Lightbulb,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Menu,
  Clock,
  FolderKanban
} from "lucide-react"

type MaintenanceRecord = {
  _id?: string
  id?: string
  assetId?: string | { _id?: string; name?: string }
  branchId?: string | { _id?: string; name?: string }
  serviceType?: string
  description?: string
  provider?: string
  cost?: number
  currency?: string
  status?: string
  scheduledDate?: string
  completedDate?: string
  verifiedBy?: { _id?: string; firstName?: string; lastName?: string; email?: string }
}

type EventColorType = "scheduled" | "completed" | "overdue"
type CalendarEvent = { title: string; sub?: string; colorType: EventColorType }

export default function MaintenanceManagementPage() {
  const { user } = useAuth()
  const [urgentAlerts, setUrgentAlerts] = useState<
    { id: string; title: string; meta: string; daysOverdue: number }[]
  >([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertsError, setAlertsError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [historyRecords, setHistoryRecords] = useState<MaintenanceRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historySummary, setHistorySummary] = useState<{ totalCost: number; count: number } | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [scheduleRecords, setScheduleRecords] = useState<MaintenanceRecord[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const branchId = useMemo(
    () => user?.branchId ?? user?.branch?.id ?? "",
    [user]
  )

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return
    setDeletingId(taskId)
    setDeleteError(null)

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/api/core/financial/maintenance-tasks/${taskId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete maintenance task.")
      }
      setUrgentAlerts((prev) => prev.filter((alert) => alert.id !== taskId))
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete maintenance task.")
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchHistory = async () => {
      if (!branchId) {
        setUrgentAlerts([])
        setHistoryRecords([])
        setAlertsError("Branch is required to load maintenance alerts.")
        setHistoryError("Branch is required to load maintenance history.")
        return
      }

      try {
        setHistoryLoading(true)
        setHistoryError(null)
        const end = new Date()
        const start = new Date(end)
        start.setMonth(end.getMonth() - 11)
        start.setDate(1)

        const params = new URLSearchParams({
          branchId,
          startDate: formatDateParam(start),
          endDate: formatDateParam(end),
          page: "1",
          limit: "50",
        })

        const response = await fetch(`/api/maintenance/history?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance history.")
        }

        const payloadData = payload?.data ?? {}
        const records = payloadData?.data ?? payloadData?.items ?? payload?.data ?? []
        const list = Array.isArray(records) ? records : []
        const summary = payloadData?.summary ?? payload?.summary ?? null

        if (isMounted) {
          setHistoryRecords(list)
          setHistorySummary(
            summary && typeof summary?.totalCost === "number" && typeof summary?.count === "number"
              ? summary
              : null
          )
        }
      } catch (error) {
        if (isMounted) {
          setHistoryRecords([])
          setHistorySummary(null)
          const message = error instanceof Error ? error.message : "Unable to load maintenance history."
          setHistoryError(message)
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [branchId])

  useEffect(() => {
    let isMounted = true

    const fetchAlerts = async () => {
      if (!branchId) {
        setUrgentAlerts([])
        setAlertsError("Branch is required to load maintenance alerts.")
        return
      }

      try {
        setAlertsLoading(true)
        setAlertsError(null)
        const params = new URLSearchParams({ branchId })

        const response = await fetch(`/api/maintenance/alerts?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance alerts.")
        }

        const records = payload?.data ?? payload?.items ?? []
        const list = Array.isArray(records) ? records : []
        const today = new Date()
        const mapped = list.map((record: MaintenanceRecord, index: number) => {
          const scheduled = record?.scheduledDate ? new Date(record.scheduledDate) : null
          const diffDays = scheduled
            ? Math.max(0, Math.floor((today.getTime() - scheduled.getTime()) / 86400000))
            : 0
          const { assetName, branchName } = getRecordNames(record)
          return {
            id: String(record?._id ?? record?.id ?? `alert-${index}`),
            title: assetName ?? record?.description ?? "Maintenance Alert",
            meta: branchName ?? record?.serviceType ?? "Overdue maintenance",
            daysOverdue: diffDays,
          }
        })

        if (isMounted) {
          setUrgentAlerts(mapped)
        }
      } catch (error) {
        if (isMounted) {
          setUrgentAlerts([])
          setAlertsError(error instanceof Error ? error.message : "Unable to load maintenance alerts.")
        }
      } finally {
        if (isMounted) {
          setAlertsLoading(false)
        }
      }
    }

    fetchAlerts()

    return () => {
      isMounted = false
    }
  }, [branchId])

  const formatDateParam = (value: Date) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getEventStyles = (colorType: EventColorType) => {
    switch (colorType) {
      case "completed":
        return {
          container: "bg-[#F0FDF4] border border-[#BBF7D0]",
          title: "text-[#15803D]",
          sub: "text-[#86EFAC]",
        }
      case "overdue":
        return {
          container: "bg-[#FEF2F2] border border-[#FECACA]",
          title: "text-[#DC2626]",
          sub: "text-[#F87171]",
        }
      default:
        return {
          container: "bg-[#EFF6FF] border border-[#BFDBFE]",
          title: "text-[#2563EB]",
          sub: "text-[#60A5FA]",
        }
    }
  }

  const formatCurrency = (value: number, currency?: string) => {
    const cur = currency && ["NGN", "USD", "GBP", "EUR"].includes(currency) ? currency : "NGN"
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getRecordNames = (record: MaintenanceRecord) => {
    const assetName = typeof record.assetId === "object" ? record.assetId?.name : undefined
    const branchName = typeof record.branchId === "object" ? record.branchId?.name : undefined
    return { assetName, branchName }
  }

  const weekStart = useMemo(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = (day + 6) % 7
    const start = new Date(today)
    start.setDate(today.getDate() - diff)
    start.setHours(0, 0, 0, 0)
    return start
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchSchedule = async () => {
      if (!branchId) {
        setScheduleRecords([])
        setScheduleError("Branch is required to load maintenance schedule.")
        return
      }

      try {
        setScheduleLoading(true)
        setScheduleError(null)

        const end = new Date(weekStart)
        end.setDate(weekStart.getDate() + 6)

        const params = new URLSearchParams({
          branchId,
          startDate: formatDateParam(weekStart),
          endDate: formatDateParam(end),
        })

        const response = await fetch(`/api/maintenance/schedule?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance schedule.")
        }

        const records = payload?.data ?? payload?.items ?? []
        const list = Array.isArray(records) ? records : []

        if (isMounted) {
          setScheduleRecords(list)
        }
      } catch (error) {
        if (isMounted) {
          setScheduleRecords([])
          setScheduleError(error instanceof Error ? error.message : "Unable to load maintenance schedule.")
        }
      } finally {
        if (isMounted) {
          setScheduleLoading(false)
        }
      }
    }

    fetchSchedule()

    return () => {
      isMounted = false
    }
  }, [branchId, weekStart])

  const calendarDays = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const label = date
        .toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" })
        .toUpperCase()
      const isToday = new Date().toDateString() === date.toDateString()
      const events: CalendarEvent[] = scheduleRecords
        .filter((record) => {
          if (!record?.scheduledDate) return false
          const recordDate = new Date(record.scheduledDate)
          return recordDate.toDateString() === date.toDateString()
        })
        .map((record) => {
          const status = String(record?.status ?? "").toLowerCase()
          const colorType: EventColorType =
            status === "completed" ? "completed" : status === "overdue" ? "overdue" : "scheduled"
          const { assetName, branchName } = getRecordNames(record)
          return {
            title: assetName ?? record?.description ?? "Maintenance Task",
            sub: branchName ?? record?.provider ?? record?.serviceType,
            colorType,
          }
        })

      return { label, isToday, events }
    })

    return days
  }, [scheduleRecords, weekStart])

  const weekRangeLabel = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    return `Week ${weekStart.toLocaleDateString("en-GB", { month: "short", day: "2-digit" })} - ${end.toLocaleDateString("en-GB", { month: "short", day: "2-digit" })}`
  }, [weekStart])

  const scheduleHeaderLabel = useMemo(() => {
    const current = weekStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    return `${current} Schedule`
  }, [weekStart])

  const completedMaintenance = useMemo(() => {
    return historyRecords.map((record) => ({
      id: String(record?._id ?? record?.id ?? ""),
      date: record?.completedDate
        ? new Date(record.completedDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      asset: record?.description ?? "Maintenance Task",
      service: record?.serviceType ?? "Service",
      technician: record?.provider ?? "N/A",
      cost:
        record?.cost !== undefined && record?.cost !== null
          ? formatCurrency(record.cost, record.currency)
          : "N/A",
      status: record?.status ? String(record.status).toUpperCase() : "COMPLETED",
      verified: Boolean(record?.verifiedBy),
    }))
  }, [historyRecords])

  const completedTotal = useMemo(() => {
    if (historySummary?.totalCost) {
      return historySummary.totalCost
    }
    return historyRecords.reduce((sum, record) => sum + (Number(record?.cost) || 0), 0)
  }, [historyRecords, historySummary])

  const completedTitle = useMemo(() => {
    const completed = historyRecords
      .map((record) => (record?.completedDate ? new Date(record.completedDate) : null))
      .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()))

    if (completed.length === 0) {
      return "Completed Maintenance"
    }

    const sorted = [...completed].sort((a, b) => a.getTime() - b.getTime())
    const start = sorted[0]
    const end = sorted[sorted.length - 1]
    const format = (date: Date) =>
      date.toLocaleDateString("en-GB", { month: "short", day: "2-digit" })
    return `Completed Maintenance (${format(start)} - ${format(end)})`
  }, [historyRecords])

  const handleVerify = async (recordId: string) => {
    if (!recordId) return
    setVerifyError(null)
    setVerifyingId(recordId)
    try {
      const response = await fetch(`/api/maintenance/${recordId}/verify`, {
        method: "POST",
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to verify maintenance record.")
      }
      const verifiedBy = payload?.data?.verifiedBy ?? payload?.verifiedBy ?? null
      setHistoryRecords((prev) =>
        prev.map((record) =>
          String(record?._id ?? record?.id ?? "") === recordId
            ? { ...record, verifiedBy }
            : record
        )
      )
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Unable to verify maintenance record.")
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <div 
      className="min-h-screen bg-[#F4F6F9] text-sm flex overflow-hidden lg:flex-row flex-col"
      style={{ fontFamily: '"Public Sans", sans-serif' }}
    >
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-[#EEF1F6] bg-[#FAFAFC] flex-col justify-between hidden lg:flex flex-shrink-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-[#EEF2FF] p-1.5 rounded-lg flex items-center justify-center">
              <Image src="/images/icon-shepherdwatch.svg" alt="Logo" width={22} height={22} className="brightness-100" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#3B5BDB] font-bold mt-1 tracking-wide">Lead Pastor&apos;s View</div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Maintenance Management", icon: FolderKanban, hasDropdown: true },
              { label: "Assets", icon: Wallet, active: true },
              { label: "Budget", icon: ShieldCheck },
              { label: "Compliance & Remittance", icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-bold cursor-pointer transition-colors ${
                    item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#475569] hover:bg-gray-100 hover:text-[#111827]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="h-[18px] w-[18px] stroke-[2]" />
                    {item.label}
                  </div>
                  {item.hasDropdown && <ChevronDown className="h-4 w-4 stroke-[2]" />}
                </div>
              )
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-[#EEF1F6]">
          <div className="space-y-1.5 mb-6">
            <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 text-[13px] font-bold text-[#475569] hover:bg-gray-100 cursor-pointer transition-colors">
              <Settings className="h-[18px] w-[18px] stroke-[2]" />
              Settings
            </div>
            <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 text-[13px] font-bold text-[#475569] hover:bg-gray-100 cursor-pointer transition-colors">
              <HelpCircle className="h-[18px] w-[18px] stroke-[2]" />
              Help Center
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-3.5 pt-2">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shrink-0 shadow-sm">
              <img src="/images/Beared%20Guy02-min%201.jpg" alt="Alex Morgan" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-[14px] font-extrabold text-[#111827]">Alex Morgan</div>
              <div className="text-[11px] text-[#94A3B8] font-bold mt-0.5 tracking-wide">Lead Pastor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-[#F4F6F9]">
        {/* Top Header */}
        <header className="shrink-0 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between gap-4 border-b border-[#EEF1F6] z-10 w-full relative">
          <div className="text-[17px] font-extrabold text-[#111827] flex items-center gap-3 shrink-0 tracking-tight">
            <button className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <span className="hidden sm:inline-block">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
            <div className="relative flex-1 sm:flex-none sm:w-[320px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] stroke-[2.5]" />
              <Input 
                placeholder="Search requisitions..." 
                className="pl-9 h-10 w-full bg-[#FAFAFC] border-transparent focus:border-[#EEF1F6] shadow-sm rounded-[8px] text-[13px] focus-visible:ring-1 focus-visible:ring-[#3B5BDB] placeholder:text-[#94A3B8] placeholder:font-bold"
              />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-[8px] bg-white border border-transparent shadow-sm flex items-center justify-center text-[#94A3B8] hover:text-[#111827] cursor-pointer transition-colors relative">
              <Bell className="h-[22px] w-[22px] stroke-[2]" />
              <div className="absolute top-2.5 right-2 w-[8px] h-[8px] bg-[#EF4444] rounded-full border-[1.5px] border-white" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 lg:p-10 max-w-[1440px] mx-auto w-full">
            
            {/* Header Titles */}
            <div className="mb-8">
              <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors mb-5 w-fit">
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                Back
              </button>
              <h1 className="text-[32px] sm:text-[36px] font-extrabold text-[#111827] tracking-tight leading-none mb-2.5" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>Maintenance Management Hub</h1>
              <p className="text-[14.5px] text-[#64748B] font-bold">Oversee asset upkeep and service schedules for the sanctuary and grounds.</p>
            </div>

            {/* Top Multi-Panel Layout */}
            <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 mb-10 w-full">
              
              {/* Left Column: Urgent Alerts */}
              <div className="w-full xl:w-[360px] 2xl:w-[400px] shrink-0 flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle className="text-[#EF4444] h-[22px] w-[22px] stroke-[2.5]" />
                  <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-none">Urgent Alerts</h2>
                </div>

                <div className="space-y-4 flex-1">
                  {alertsLoading && (
                    <div className="text-[12px] font-medium text-[#64748B]">Loading overdue tasks...</div>
                  )}
                  {alertsError && (
                    <div className="text-[12px] font-medium text-[#EF4444]">{alertsError}</div>
                  )}
                  {deleteError && (
                    <div className="text-[12px] font-medium text-[#EF4444]">{deleteError}</div>
                  )}
                  {!alertsLoading && !alertsError && urgentAlerts.length === 0 && (
                    <div className="text-[12px] font-medium text-[#64748B]">No overdue maintenance tasks.</div>
                  )}
                  {urgentAlerts.map((alert) => {
                    const severityLabel = alert.daysOverdue >= 14 ? "CRITICAL" : "OVERDUE"
                    return (
                      <div key={alert.id} className="bg-white rounded-[16px] p-6 shadow-sm border-2 border-red-100 hover:border-red-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-red-50 text-[#DC2626] text-[10.5px] font-extrabold uppercase px-2.5 py-1 rounded-[6px] tracking-widest border border-red-100">
                            {severityLabel}
                          </span>
                          <span className="text-[#EF4444] font-extrabold text-[12px]">{alert.daysOverdue} Days</span>
                        </div>
                        <h3 className="text-[16px] font-extrabold text-[#111827] mb-2 tracking-tight">{alert.title}</h3>
                        <p className="text-[#64748B] text-[13px] font-medium leading-relaxed mb-6">{alert.meta}</p>
                        <button
                          onClick={() => handleDeleteTask(alert.id)}
                          disabled={deletingId === alert.id}
                          className="w-full bg-red-50 hover:bg-red-100 transition-colors text-[#DC2626] font-extrabold text-[13.5px] py-3 rounded-[10px] border border-red-100/50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deletingId === alert.id ? "Deleting..." : "Delete Task"}
                        </button>
                      </div>
                    )
                  })}

                  {/* Tip Card */}
                  <div className="bg-[#EFF6FF] rounded-[16px] p-6 border border-[#DBEAFE]/80 shadow-sm mt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="text-[#3B5BDB] h-[18px] w-[18px] stroke-[2.5]" />
                      <h4 className="text-[#3B5BDB] font-extrabold text-[14px]">Maintenance Tip</h4>
                    </div>
                    <p className="text-[#1E40AF] text-[13px] italic leading-relaxed font-medium pr-2">
                      Proactive maintenance on cooling systems can reduce energy costs by up to 15% during peak usage months.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Schedule Calendar */}
              <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0px_2px_16px_rgba(0,0,0,0.03)] border border-[#EEF1F6] flex flex-col overflow-hidden relative">
                
                {/* Legend Header Overlay */}
                <div className="absolute top-7 right-8 hidden sm:flex items-center gap-4 text-[12px] font-bold text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
                    Overdue
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3B5BDB]"></div>
                    Scheduled
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                    Completed
                  </div>
                </div>

                <div className="p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#EEF1F6]">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="text-[#3B5BDB] h-[24px] w-[24px] stroke-[2]" />
                    <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-none">{scheduleHeaderLabel}</h2>
                  </div>
                  <div className="flex items-center border border-[#E2E8F0] rounded-[10px] bg-white shadow-sm overflow-hidden text-[13px] font-extrabold text-[#111827]">
                    <button className="px-3.5 py-2.5 hover:bg-gray-50 text-[#94A3B8] hover:text-[#111827] transition-colors border-r border-[#E2E8F0]">
                      <ChevronLeft className="h-[18px] w-[18px] stroke-[2.5]" />
                    </button>
                    <span className="px-5 py-2.5 tracking-tight">{weekRangeLabel}</span>
                    <button className="px-3.5 py-2.5 hover:bg-gray-50 text-[#94A3B8] hover:text-[#111827] transition-colors border-l border-[#E2E8F0]">
                      <ChevronRight className="h-[18px] w-[18px] stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid Container */}
                <div className="flex-1 p-8 overflow-x-auto">
                  <div className="flex gap-4 min-w-[750px] h-full items-stretch">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`flex-1 flex flex-col ${
                          day.isToday
                            ? "bg-[#EEF2FF] rounded-[12px] p-2 -my-2 -mx-2 border-2 border-[#A5B4FC]"
                            : ""
                        }`}
                      >
                        <div
                          className={`text-center mb-5 border-b pb-3 ${
                            day.isToday ? "border-[#C7D2FE]" : "border-[#EEF1F6]"
                          } ${day.isToday ? "mt-2" : ""}`}
                        >
                          <span
                            className={`text-[11.5px] font-extrabold tracking-widest uppercase ${
                              day.isToday ? "text-[#3B5BDB]" : "text-[#94A3B8]"
                            }`}
                          >
                            {day.label} {day.isToday && <span>(TODAY)</span>}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {scheduleLoading && (
                            <div className="text-[11px] font-bold text-[#CBD5F5] text-center">Loading schedule...</div>
                          )}
                          {!scheduleLoading && scheduleError && (
                            <div className="text-[11px] font-bold text-[#EF4444] text-center">{scheduleError}</div>
                          )}
                          {!scheduleLoading && !scheduleError && day.events.length === 0 && (
                            <div className="text-[11px] font-bold text-[#CBD5F5] text-center">No tasks</div>
                          )}
                          {day.events.map((event, eventIndex) => {
                            const styles = getEventStyles(event.colorType)
                            return (
                              <div
                                key={eventIndex}
                                className={`${styles.container} rounded-[10px] p-3 text-left`}
                              >
                                <div className={`text-[12.5px] font-extrabold ${styles.title} mb-1`}>
                                  {event.title}
                                </div>
                                {event.sub && (
                                  <div className={`text-[11px] font-bold ${styles.sub}`}>{event.sub}</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Section: Completed Maintenance Table */}
            <div className="bg-white rounded-[24px] shadow-[0px_2px_16px_rgba(0,0,0,0.02)] border border-[#EEF1F6] overflow-hidden">
              <div className="px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-[#10B981] h-[24px] w-[24px] stroke-[2.5]" />
                  <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-none">{completedTitle}</h2>
                </div>
                <button className="text-[13px] font-extrabold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors tracking-tight">
                  View All History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px] min-w-[950px] border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-[#F1F5F9]">
                      <th className="py-5 px-8 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Date</th>
                      <th className="py-5 px-4 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Asset</th>
                      <th className="py-5 px-4 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Service Type</th>
                      <th className="py-5 px-4 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Technician / Provider</th>
                      <th className="py-5 px-4 text-right text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Cost (NGN)</th>
                      <th className="py-5 px-8 text-center text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading && (
                      <tr>
                        <td colSpan={6} className="py-6 px-8 text-[12px] font-medium text-[#64748B]">
                          Loading maintenance history...
                        </td>
                      </tr>
                    )}
                    {!historyLoading && historyError && (
                      <tr>
                        <td colSpan={6} className="py-6 px-8 text-[12px] font-medium text-[#EF4444]">
                          {historyError}
                        </td>
                      </tr>
                    )}
                    {!historyLoading && !historyError && verifyError && (
                      <tr>
                        <td colSpan={6} className="py-3 px-8 text-[12px] font-medium text-[#EF4444]">
                          {verifyError}
                        </td>
                      </tr>
                    )}
                    {!historyLoading && !historyError && completedMaintenance.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 px-8 text-[12px] font-medium text-[#64748B]">
                          No completed maintenance yet.
                        </td>
                      </tr>
                    )}
                    {completedMaintenance.map((row, i) => (
                      <tr key={i} className="border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC]/60 transition-colors bg-[#FFFFFF]">
                        <td className="py-5 px-8 align-middle">
                          <span className="font-bold text-[#64748B] text-[13.5px]">{row.date}</span>
                        </td>
                        <td className="py-5 px-4 align-middle">
                          <span className="font-extrabold text-[#111827] text-[13.5px]">{row.asset}</span>
                        </td>
                        <td className="py-5 px-4 align-middle">
                          <span className="font-bold text-[#64748B] text-[13.5px]">{row.service}</span>
                        </td>
                        <td className="py-5 px-4 align-middle">
                          <span className="font-extrabold text-[#3B5BDB] text-[13.5px] hover:underline cursor-pointer">{row.technician}</span>
                        </td>
                        <td className="py-5 px-4 align-middle text-right">
                          <span className="font-extrabold text-[#111827] text-[14px]">{row.cost}</span>
                        </td>
                        <td className="py-5 px-8 align-middle text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-block bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] font-extrabold text-[10.5px] tracking-wide px-3.5 py-1.5 rounded-full">
                              {row.status}
                            </span>
                            {row.verified ? (
                              <span className="inline-block bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-extrabold text-[10px] tracking-wide px-2.5 py-1 rounded-full">
                                Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerify(row.id)}
                                disabled={verifyingId === row.id}
                                className="text-[10px] font-[800] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0] disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {verifyingId === row.id ? "Verifying..." : "Verify"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Footer */}
                  <tfoot>
                    <tr className="bg-white border-t-2 border-[#EEF1F6]">
                      <td colSpan={4} className="py-7 px-4 align-middle text-right">
                        <span className="font-extrabold text-[#111827] text-[14px] tracking-tight">Total Maintenance Cost:</span>
                      </td>
                      <td className="py-7 px-4 align-middle text-right">
                        <span className="font-extrabold text-[#3B5BDB] text-[16px] tracking-tight">
                          {formatCurrency(completedTotal, "NGN")}
                        </span>
                      </td>
                      <td className="py-7 px-8"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="h-12 w-full"></div> {/* Bottom scroll padding */}
          </div>
        </div>
      </main>
    </div>
  )
}

