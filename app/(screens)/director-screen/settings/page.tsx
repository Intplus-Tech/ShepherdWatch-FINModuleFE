"use client"

import { useEffect, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { useBudgetConfig } from "@/components/hooks/useBudgetConfig"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  FolderKanban,
  Info,
  Layers,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const sideItems = [
  { label: "Budget", active: true },
  { label: "Overview" },
  { label: "Departmental" },
  { label: "Audit Logs" },
  { label: "Permissions" },
]

export default function Page() {
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [revokingSessions, setRevokingSessions] = useState(false)
  const {
    budgetConfig,
    loading: budgetConfigLoading,
    error: budgetConfigError,
    lastUpdated,
    refresh: refreshBudgetConfig,
  } = useBudgetConfig()
  const [revokeMessage, setRevokeMessage] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [sessionDetailsLoading, setSessionDetailsLoading] = useState(false)
  const [sessionDetailsError, setSessionDetailsError] = useState<string | null>(null)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: "",
    purpose: "",
    subject: "",
    body: "",
    branchId: "",
    isActive: true,
  })
  const [templateSubmitting, setTemplateSubmitting] = useState(false)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [templateFilters, setTemplateFilters] = useState({
    purpose: "",
    branchId: "",
    isActive: "",
  })
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [templateEdit, setTemplateEdit] = useState({
    name: "",
    purpose: "",
    subject: "",
    body: "",
    branchId: "",
    isActive: true,
  })
  const [templateUpdating, setTemplateUpdating] = useState(false)
  const [templateEditError, setTemplateEditError] = useState<string | null>(null)
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditError, setAuditError] = useState<string | null>(null)
  const [auditFilters, setAuditFilters] = useState({
    action: "",
    userId: "",
    startDate: "",
    endDate: "",
    search: "",
  })
  const [headerFooterForm, setHeaderFooterForm] = useState({
    type: "header",
    content: "",
    isActive: true,
  })
  const [headerFooterSubmitting, setHeaderFooterSubmitting] = useState(false)
  const [headerFooterMessage, setHeaderFooterMessage] = useState<string | null>(null)
  const [headerFooterError, setHeaderFooterError] = useState<string | null>(null)
  const [purposeForm, setPurposeForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  })
  const [purposeSubmitting, setPurposeSubmitting] = useState(false)
  const [purposeMessage, setPurposeMessage] = useState<string | null>(null)
  const [purposeError, setPurposeError] = useState<string | null>(null)
  const [purposes, setPurposes] = useState<any[]>([])
  const [purposesLoading, setPurposesLoading] = useState(true)
  const [purposesError, setPurposesError] = useState<string | null>(null)
  const [selectedPurpose, setSelectedPurpose] = useState<any | null>(null)
  const [purposeDetailsLoading, setPurposeDetailsLoading] = useState(false)
  const [purposeDetailsError, setPurposeDetailsError] = useState<string | null>(null)
  const [purposeEdit, setPurposeEdit] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  })
  const [updatingPurpose, setUpdatingPurpose] = useState(false)
  const [deletingPurposeId, setDeletingPurposeId] = useState<string | null>(null)
  const [headerFooters, setHeaderFooters] = useState<any[]>([])
  const [headerFootersLoading, setHeaderFootersLoading] = useState(true)
  const [headerFootersError, setHeaderFootersError] = useState<string | null>(null)
  const [activeHeader, setActiveHeader] = useState<any | null>(null)
  const [activeFooter, setActiveFooter] = useState<any | null>(null)
  const [budgetForm, setBudgetForm] = useState({
    fiscalYearStart: "",
    defaultCurrency: "",
    enforcementAction: "",
    reportingInterval: "",
    varianceThresholdPercent: "",
  })
  const [budgetSaveMessage, setBudgetSaveMessage] = useState<string | null>(null)
  const [budgetSaveError, setBudgetSaveError] = useState<string | null>(null)
  const [budgetSaving, setBudgetSaving] = useState(false)

  const enforcementAction = budgetForm.enforcementAction || budgetConfig?.enforcementAction
  const reportingInterval = budgetForm.reportingInterval || budgetConfig?.reportingInterval
  const isWarnOnly = enforcementAction === "warn_only"
  const isBlockTransactions = enforcementAction === "block_transactions"
  const isRequireApproval = enforcementAction === "require_approval"
  const fiscalYearStartValue = budgetForm.fiscalYearStart
    ? Number(budgetForm.fiscalYearStart)
    : budgetConfig?.fiscalYearStart
  const fiscalYearStartMonth =
    fiscalYearStartValue && fiscalYearStartValue >= 1 && fiscalYearStartValue <= 12
      ? monthNames[fiscalYearStartValue - 1]
      : null
  const parsedLastUpdated = lastUpdated ? new Date(lastUpdated) : null
  const lastUpdatedLabel =
    parsedLastUpdated && !Number.isNaN(parsedLastUpdated.getTime())
      ? parsedLastUpdated.toLocaleString()
      : null

  useEffect(() => {
    if (!budgetConfig) return
    const enforcement =
      budgetConfig.enforcementAction === "block"
        ? "block_transactions"
        : budgetConfig.enforcementAction === "notify"
          ? "require_approval"
          : budgetConfig.enforcementAction ?? ""
    const interval =
      budgetConfig.reportingInterval === "yearly"
        ? "annually"
        : budgetConfig.reportingInterval ?? ""
    setBudgetForm({
      fiscalYearStart:
        budgetConfig.fiscalYearStart !== undefined ? String(budgetConfig.fiscalYearStart) : "",
      defaultCurrency: budgetConfig.defaultCurrency ?? "",
      enforcementAction: enforcement,
      reportingInterval: interval,
      varianceThresholdPercent:
        budgetConfig.varianceThresholdPercent !== undefined
          ? String(budgetConfig.varianceThresholdPercent)
          : "",
    })
  }, [budgetConfig])

  useEffect(() => {
    setSessionsLoading(true)
    setSessionsError(null)
    fetch("/api/sessions?page=1&limit=20")
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(data?.message || "Unable to load sessions")
        }
        const items = data?.data?.data ?? []
        setSessions(items)
      })
      .catch((err) => {
        setSessionsError(err instanceof Error ? err.message : "Unable to load sessions")
      })
      .finally(() => setSessionsLoading(false))
  }, [])

  const handleRevokeAllSessions = async () => {
    setRevokeMessage(null)
    setRevokingSessions(true)
    try {
      const res = await fetch("/api/sessions/revoke-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to revoke sessions")
      }
      setRevokeMessage(data?.message || "All sessions revoked successfully.")
      setSessions((prev) => prev.map((session) => ({ ...session, isActive: false })))
    } catch (err: any) {
      setSessionsError(err.message || "Unable to revoke sessions")
    } finally {
      setRevokingSessions(false)
    }
  }

  const handleViewSession = async (sessionId: string) => {
    setSessionDetailsLoading(true)
    setSessionDetailsError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load session details")
      }
      setSelectedSession(data?.data ?? null)
    } catch (err: any) {
      setSessionDetailsError(err.message || "Unable to load session details")
    } finally {
      setSessionDetailsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId)
    setSessionsError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/revoke`, { method: "PATCH" })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to revoke session")
      }
      setSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, isActive: false } : session
        )
      )
      if (selectedSession?._id === sessionId) {
        setSelectedSession({ ...selectedSession, isActive: false })
      }
    } catch (err: any) {
      setSessionsError(err.message || "Unable to revoke session")
    } finally {
      setRevokingSessionId(null)
    }
  }

  const handleTemplateChange = (field: string, value: string | boolean) => {
    setTemplateForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateTemplate = async () => {
    setTemplateSubmitting(true)
    setTemplateMessage(null)
    setTemplateError(null)
    try {
      const payload: any = {
        name: templateForm.name,
        purpose: templateForm.purpose,
        subject: templateForm.subject,
        body: templateForm.body,
        isActive: templateForm.isActive,
      }
      if (templateForm.branchId) {
        payload.branchId = templateForm.branchId
      }
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Unable to create template")
      }
      setTemplateMessage(data.message || "Template created successfully.")
      setTemplateForm({
        name: "",
        purpose: "",
        subject: "",
        body: "",
        branchId: "",
        isActive: true,
      })
    } catch (err: any) {
      setTemplateError(err.message || "Unable to create template")
    } finally {
      setTemplateSubmitting(false)
    }
  }

  const fetchTemplates = async () => {
    setTemplatesLoading(true)
    setTemplatesError(null)
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("limit", "20")
    if (templateFilters.purpose) params.set("purpose", templateFilters.purpose)
    if (templateFilters.branchId) params.set("branchId", templateFilters.branchId)
    if (templateFilters.isActive) params.set("isActive", templateFilters.isActive)
    try {
      const res = await fetch(`/api/templates?${params.toString()}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load templates")
      }
      setTemplates(data?.data?.data ?? [])
    } catch (err: any) {
      setTemplatesError(err.message || "Unable to load templates")
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleEditTemplate = (tpl: any) => {
    setSelectedTemplate(tpl)
    setTemplateEdit({
      name: tpl?.name ?? "",
      purpose: tpl?.purpose ?? "",
      subject: tpl?.subject ?? "",
      body: tpl?.body ?? "",
      branchId: tpl?.branchId ?? "",
      isActive: tpl?.isActive ?? true,
    })
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate?._id) return
    setTemplateUpdating(true)
    setTemplateEditError(null)
    try {
      const res = await fetch(`/api/templates/${selectedTemplate._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateEdit.name,
          purpose: templateEdit.purpose,
          subject: templateEdit.subject,
          body: templateEdit.body,
          branchId: templateEdit.branchId || null,
          isActive: templateEdit.isActive,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Unable to update template")
      }
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl._id === selectedTemplate._id ? { ...tpl, ...templateEdit } : tpl
        )
      )
    } catch (err: any) {
      setTemplateEditError(err.message || "Unable to update template")
    } finally {
      setTemplateUpdating(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    setDeletingTemplateId(id)
    setTemplateEditError(null)
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Unable to delete template")
      }
      setTemplates((prev) => prev.filter((tpl) => tpl._id !== id))
      if (selectedTemplate?._id === id) {
        setSelectedTemplate(null)
      }
    } catch (err: any) {
      setTemplateEditError(err.message || "Unable to delete template")
    } finally {
      setDeletingTemplateId(null)
    }
  }

  const fetchAuditLogs = async () => {
    setAuditLoading(true)
    setAuditError(null)
    const params = new URLSearchParams()
    params.set("page", "1")
    params.set("limit", "20")
    if (auditFilters.action) params.set("action", auditFilters.action)
    if (auditFilters.userId) params.set("userId", auditFilters.userId)
    if (auditFilters.startDate) params.set("startDate", auditFilters.startDate)
    if (auditFilters.endDate) params.set("endDate", auditFilters.endDate)
    if (auditFilters.search) params.set("search", auditFilters.search)
    try {
      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load audit logs")
      }
      setAuditLogs(data?.data ?? [])
    } catch (err: any) {
      setAuditError(err.message || "Unable to load audit logs")
    } finally {
      setAuditLoading(false)
    }
  }

  const handleHeaderFooterSubmit = async () => {
    setHeaderFooterSubmitting(true)
    setHeaderFooterMessage(null)
    setHeaderFooterError(null)
    try {
      const res = await fetch("/api/templates/header-footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: headerFooterForm.type,
          content: headerFooterForm.content,
          isActive: headerFooterForm.isActive,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Unable to save header/footer")
      }
      setHeaderFooterMessage(data.message || "Header/footer saved successfully.")
      setHeaderFooterForm((prev) => ({ ...prev, content: "" }))
    } catch (err: any) {
      setHeaderFooterError(err.message || "Unable to save header/footer")
    } finally {
      setHeaderFooterSubmitting(false)
    }
  }

  const handleCreatePurpose = async () => {
    setPurposeSubmitting(true)
    setPurposeMessage(null)
    setPurposeError(null)
    try {
      const payload: any = {
        name: purposeForm.name,
        slug: purposeForm.slug,
        description: purposeForm.description,
        isActive: purposeForm.isActive,
      }
      const res = await fetch("/api/templates/purposes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Unable to create purpose")
      }
      setPurposeMessage(data.message || "Purpose created successfully.")
      setPurposeForm({
        name: "",
        slug: "",
        description: "",
        isActive: true,
      })
    } catch (err: any) {
      setPurposeError(err.message || "Unable to create purpose")
    } finally {
      setPurposeSubmitting(false)
    }
  }

  const fetchPurposes = async () => {
    setPurposesLoading(true)
    setPurposesError(null)
    try {
      const res = await fetch("/api/templates/purposes?page=1&limit=20")
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load purposes")
      }
      setPurposes(data?.data ?? [])
    } catch (err: any) {
      setPurposesError(err.message || "Unable to load purposes")
    } finally {
      setPurposesLoading(false)
    }
  }

  const handleViewPurpose = async (id: string) => {
    setPurposeDetailsLoading(true)
    setPurposeDetailsError(null)
    try {
      const res = await fetch(`/api/templates/purposes/${id}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load purpose")
      }
      const purpose = data?.data ?? null
      setSelectedPurpose(purpose)
      setPurposeEdit({
        name: purpose?.name ?? "",
        slug: purpose?.slug ?? "",
        description: purpose?.description ?? "",
        isActive: purpose?.isActive ?? true,
      })
    } catch (err: any) {
      setPurposeDetailsError(err.message || "Unable to load purpose")
    } finally {
      setPurposeDetailsLoading(false)
    }
  }

  const handleUpdatePurpose = async () => {
    if (!selectedPurpose?._id) return
    setUpdatingPurpose(true)
    setPurposeDetailsError(null)
    try {
      const res = await fetch(`/api/templates/purposes/${selectedPurpose._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purposeEdit),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Unable to update purpose")
      }
      setSelectedPurpose({ ...selectedPurpose, ...purposeEdit })
      setPurposes((prev) =>
        prev.map((p) => (p._id === selectedPurpose._id ? { ...p, ...purposeEdit } : p))
      )
    } catch (err: any) {
      setPurposeDetailsError(err.message || "Unable to update purpose")
    } finally {
      setUpdatingPurpose(false)
    }
  }

  const handleDeletePurpose = async (id: string) => {
    setDeletingPurposeId(id)
    setPurposeDetailsError(null)
    try {
      const res = await fetch(`/api/templates/purposes/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Unable to delete purpose")
      }
      setPurposes((prev) => prev.filter((p) => p._id !== id))
      if (selectedPurpose?._id === id) {
        setSelectedPurpose(null)
      }
    } catch (err: any) {
      setPurposeDetailsError(err.message || "Unable to delete purpose")
    } finally {
      setDeletingPurposeId(null)
    }
  }

  const fetchHeaderFooters = async () => {
    setHeaderFootersLoading(true)
    setHeaderFootersError(null)
    try {
      const res = await fetch("/api/templates/header-footer")
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load header/footer")
      }
      setHeaderFooters(data?.data ?? [])
    } catch (err: any) {
      setHeaderFootersError(err.message || "Unable to load header/footer")
    } finally {
      setHeaderFootersLoading(false)
    }
  }

  const fetchActiveHeaderFooter = async (type: "header" | "footer") => {
    try {
      const res = await fetch(`/api/templates/header-footer/${type}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || `Unable to load ${type}`)
      }
      if (type === "header") setActiveHeader(data?.data ?? null)
      if (type === "footer") setActiveFooter(data?.data ?? null)
    } catch (err: any) {
      setHeaderFootersError(err.message || "Unable to load header/footer")
    }
  }

  const handleBudgetSave = async () => {
    setBudgetSaveMessage(null)
    setBudgetSaveError(null)

    const fiscalYearStart = Number(budgetForm.fiscalYearStart)
    const varianceThresholdPercent = Number(budgetForm.varianceThresholdPercent)

    if (!Number.isFinite(fiscalYearStart) || fiscalYearStart < 1 || fiscalYearStart > 12) {
      setBudgetSaveError("Fiscal year start must be a month between 1 and 12.")
      return
    }
    if (!budgetForm.defaultCurrency) {
      setBudgetSaveError("Default currency is required.")
      return
    }
    if (!budgetForm.enforcementAction) {
      setBudgetSaveError("Enforcement action is required.")
      return
    }
    if (!budgetForm.reportingInterval) {
      setBudgetSaveError("Reporting interval is required.")
      return
    }
    if (
      !Number.isFinite(varianceThresholdPercent) ||
      varianceThresholdPercent < 0 ||
      varianceThresholdPercent > 100
    ) {
      setBudgetSaveError("Variance threshold must be between 0 and 100.")
      return
    }

    setBudgetSaving(true)
    try {
      const res = await fetch("/api/settings/budget-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fiscalYearStart,
          defaultCurrency: budgetForm.defaultCurrency,
          enforcementAction: budgetForm.enforcementAction,
          reportingInterval: budgetForm.reportingInterval,
          varianceThresholdPercent,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to save budget configuration")
      }
      setBudgetSaveMessage(data?.message || "Settings updated successfully.")
      refreshBudgetConfig()
    } catch (err: any) {
      setBudgetSaveError(err.message || "Unable to save budget configuration")
    } finally {
      setBudgetSaving(false)
    }
  }

  const handleBudgetReset = async () => {
    setBudgetSaveMessage(null)
    setBudgetSaveError(null)
    setBudgetSaving(true)
    try {
      const res = await fetch("/api/settings/budget-config/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to reset budget configuration")
      }
      setBudgetSaveMessage(data?.message || "Settings reset successfully.")
      refreshBudgetConfig()
    } catch (err: any) {
      setBudgetSaveError(err.message || "Unable to reset budget configuration")
    } finally {
      setBudgetSaving(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
    fetchHeaderFooters()
    fetchActiveHeaderFooter("header")
    fetchActiveHeaderFooter("footer")
    fetchPurposes()
    fetchAuditLogs()
  }, [])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[12.74px] leading-[16.98px] font-bold uppercase tracking-[1.27px] text-[#9CA3AF]">
                  SUPER ADMIN
                </div>
                <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">
                  Global Configuration
                </div>
                <div className="mt-3 space-y-1">
                  {sideItems.map((item) => (
                    <button
                      key={item.label}
                      className={`flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-[14.86px] leading-[21.23px] ${
                        item.active
                          ? "bg-[#E9EEFF] text-[#3B5BDB] font-bold"
                          : "text-[#6B7280] font-medium hover:bg-[#F3F5F9]"
                      }`}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium text-[#2563EB]">
                  <Info className="h-3.5 w-3.5" />
                  Director&apos;s Note
                </div>
                <p className="mt-2 text-[9px] text-[#6B7280]">
                  These settings are global. Changes here affect all department budgets and fiscal cycles immediately.
                </p>
              </div>
            </aside>

            <section className="space-y-6">
              <div>
                <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                  Global Budget Configuration
                </h2>
                <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                  Define organization-wide budget streams, tolerance policies, and temporal cycles.
                </p>
                {budgetConfigError ? (
                  <div className="mt-2 text-[12px] text-rose-600 font-[700]">
                    {budgetConfigError}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <FolderKanban className="h-4 w-4 text-[#3B5BDB]" />
                    Budget Streams &amp; Categories
                  </div>
                  <button
                    disabled
                    className="text-[14.86px] leading-[21.23px] font-bold text-center text-[#3B5BDB] opacity-60 cursor-not-allowed"
                  >
                    + Add Stream
                  </button>
                </div>

                <div className="px-4 py-6 text-[12.74px] leading-[16.98px] text-[#9CA3AF]">
                  No budget streams are configured in this module yet.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[19.11px] leading-[29.72px] font-bold text-[#111827]">
                    <SlidersHorizontal className="h-4 w-4 text-[#3B5BDB]" />
                    Variation Tolerance
                  </div>
                  <div className="mt-3 text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                    Global Tolerance Flex
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      className="h-8 w-16 rounded-[10px] border-[#E5E7EB] text-[12.74px] leading-[16.98px]"
                      type="number"
                      min={0}
                      max={100}
                      value={budgetForm.varianceThresholdPercent}
                      onChange={(e) =>
                        setBudgetForm((prev) => ({
                          ...prev,
                          varianceThresholdPercent: e.target.value,
                        }))
                      }
                    />
                    <span className="text-[14.86px] leading-[21.23px] font-bold text-[#9CA3AF]">%</span>
                  </div>
                  <div className="mt-2 text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                    Allowed spending above budget before restriction.
                  </div>
                  <div className="mt-4 text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                    Enforcement Action
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBudgetForm((prev) => ({ ...prev, enforcementAction: "warn_only" }))
                      }
                      className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                        isWarnOnly
                          ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#3B5BDB]"
                          : "border-[#E5E7EB] bg-white text-[#6B7280]"
                      }`}
                    >
                      Soft Warning
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBudgetForm((prev) => ({
                          ...prev,
                          enforcementAction: "block_transactions",
                        }))
                      }
                      className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                        isBlockTransactions
                          ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#3B5BDB]"
                          : "border-[#E5E7EB] bg-white text-[#6B7280]"
                      }`}
                    >
                      Block Transactions
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBudgetForm((prev) => ({
                          ...prev,
                          enforcementAction: "require_approval",
                        }))
                      }
                      className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                        isRequireApproval
                          ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#3B5BDB]"
                          : "border-[#E5E7EB] bg-white text-[#6B7280]"
                      }`}
                    >
                      Require Approval
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[19.11px] leading-[29.72px] font-bold text-[#111827]">
                    <Calendar className="h-4 w-4 text-[#3B5BDB]" />
                    Time Segmentation
                  </div>
                  <div className="mt-3 text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">
                    Reporting Interval
                  </div>
                  <div className="mt-2 space-y-2">
                    <div
                      onClick={() =>
                        setBudgetForm((prev) => ({ ...prev, reportingInterval: "monthly" }))
                      }
                      className={`flex items-start gap-2 rounded-[12px] border p-3 ${
                        reportingInterval === "monthly"
                          ? "border-[#DBEAFE] bg-[#F0F7FF]"
                          : "border-[#EEF1F6] bg-white"
                      } cursor-pointer`}
                    >
                      <div
                        className={`mt-0.5 h-3.5 w-3.5 rounded-full border ${
                          reportingInterval === "monthly"
                            ? "border-[#3B5BDB] bg-[#3B5BDB]"
                            : "border-[#D1D5DB] bg-white"
                        }`}
                      />
                      <div>
                        <div
                          className={`text-[12.74px] leading-[16.98px] font-semibold ${
                            reportingInterval === "monthly" ? "text-[#1E3A8A]" : "text-[#111827]"
                          }`}
                        >
                          Monthly Defaults
                        </div>
                        <div className="text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">
                          12 budgeting cycles per year
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() =>
                        setBudgetForm((prev) => ({ ...prev, reportingInterval: "quarterly" }))
                      }
                      className={`flex items-start gap-2 rounded-[12px] border p-3 ${
                        reportingInterval === "quarterly"
                          ? "border-[#DBEAFE] bg-[#F0F7FF]"
                          : "border-[#EEF1F6] bg-white"
                      } cursor-pointer`}
                    >
                      <div
                        className={`mt-0.5 h-3.5 w-3.5 rounded-full border ${
                          reportingInterval === "quarterly"
                            ? "border-[#3B5BDB] bg-[#3B5BDB]"
                            : "border-[#D1D5DB] bg-white"
                        }`}
                      />
                      <div>
                        <div
                          className={`text-[12.74px] leading-[16.98px] font-semibold ${
                            reportingInterval === "quarterly" ? "text-[#1E3A8A]" : "text-[#111827]"
                          }`}
                        >
                          Quarterly Defaults
                        </div>
                        <div className="text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">
                          4 budgeting cycles per year
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() =>
                        setBudgetForm((prev) => ({ ...prev, reportingInterval: "annually" }))
                      }
                      className={`flex items-start gap-2 rounded-[12px] border p-3 ${
                        reportingInterval === "annually"
                          ? "border-[#DBEAFE] bg-[#F0F7FF]"
                          : "border-[#EEF1F6] bg-white"
                      } cursor-pointer`}
                    >
                      <div
                        className={`mt-0.5 h-3.5 w-3.5 rounded-full border ${
                          reportingInterval === "annually"
                            ? "border-[#3B5BDB] bg-[#3B5BDB]"
                            : "border-[#D1D5DB] bg-white"
                        }`}
                      />
                      <div>
                        <div
                          className={`text-[12.74px] leading-[16.98px] font-semibold ${
                            reportingInterval === "annually" ? "text-[#1E3A8A]" : "text-[#111827]"
                          }`}
                        >
                          Annual Defaults
                        </div>
                        <div className="text-[12.74px] leading-[16.98px] font-normal text-[#6B7280]">
                          1 budgeting cycle per year
                        </div>
                      </div>
                    </div>
                    {!budgetConfigLoading &&
                    reportingInterval &&
                    reportingInterval !== "monthly" &&
                    reportingInterval !== "quarterly" &&
                    reportingInterval !== "annually" ? (
                      <div className="text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                        Current interval: {reportingInterval}
                      </div>
                    ) : null}
                    {!budgetConfigLoading && !reportingInterval ? (
                      <div className="text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                        Reporting interval not configured yet.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[19.11px] leading-[29.72px] font-bold text-[#111827]">
                  <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                  Fiscal Year &amp; Currency
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                      Fiscal Year Starts
                    </div>
                    <select
                      value={budgetForm.fiscalYearStart}
                      onChange={(e) =>
                        setBudgetForm((prev) => ({ ...prev, fiscalYearStart: e.target.value }))
                      }
                      className="h-8 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14.86px] leading-[21.23px] font-semibold text-[#111827]"
                    >
                      <option value="">Select month</option>
                      {monthNames.map((month, index) => (
                        <option key={month} value={String(index + 1)}>
                          {month} (Month {index + 1})
                        </option>
                      ))}
                    </select>
                    {fiscalYearStartMonth ? (
                      <div className="text-[11.68px] leading-[14.6px] text-[#9CA3AF]">
                        Current selection: {fiscalYearStartMonth}
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#6B7280]">
                      Default Currency
                    </div>
                    <select
                      value={budgetForm.defaultCurrency}
                      onChange={(e) =>
                        setBudgetForm((prev) => ({ ...prev, defaultCurrency: e.target.value }))
                      }
                      className="h-8 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14.86px] leading-[21.23px] font-semibold text-[#111827]"
                    >
                      <option value="">Select currency</option>
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[12.74px] leading-[16.98px] italic font-normal text-[#9CA3AF]">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3 w-3" />
                    {lastUpdatedLabel
                      ? `Last updated on ${lastUpdatedLabel}`
                      : "Last updated timestamp unavailable"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {budgetSaveMessage ? (
                    <div className="text-[12px] text-emerald-600 font-[700]">
                      {budgetSaveMessage}
                    </div>
                  ) : null}
                  {budgetSaveError ? (
                    <div className="text-[12px] text-rose-600 font-[700]">
                      {budgetSaveError}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleBudgetReset} disabled={budgetSaving}>
                      {budgetSaving ? "Resetting..." : "Reset Defaults"}
                    </Button>
                    <Button size="sm" onClick={handleBudgetSave} disabled={budgetSaving}>
                      {budgetSaving ? "Saving..." : "Save All Configuration"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="mt-8 rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3 gap-4">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    Active Sessions
                  </div>
                  <button
                    onClick={handleRevokeAllSessions}
                    disabled={revokingSessions}
                    className="h-[34px] px-3 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] font-[700] hover:bg-[#2f4cc2] transition-colors disabled:opacity-70 whitespace-nowrap"
                  >
                    {revokingSessions ? "Revoking..." : "Log out of all devices"}
                  </button>
                </div>

                {sessionsLoading ? (
                  <div className="p-6 text-[#64748B] text-[14px]">Loading sessions...</div>
                ) : revokeMessage ? (
                  <div className="p-6 text-emerald-600 text-[13.5px] font-[600]">{revokeMessage}</div>
                ) : sessionsError ? (
                  <div className="p-6 text-rose-600 text-[13.5px] font-[600]">{sessionsError}</div>
                ) : sessions.length === 0 ? (
                  <div className="p-6 text-[#64748B] text-[14px]">No active sessions found.</div>
                ) : (
                  <div className="p-6 grid grid-cols-1 gap-4">
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        className="border border-[#EEF1F6] rounded-[12px] p-4 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[#111827] text-[14px] font-[800]">
                            {session.device || "Unknown Device"}
                          </div>
                          <div className={`text-[12px] font-[700] ${session.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                            {session.isActive ? "Active" : "Expired"}
                          </div>
                        </div>
                        <div className="text-[#64748B] text-[13px] font-[500]">
                          {session.browser || "Unknown Browser"} • {session.os || "Unknown OS"}
                        </div>
                        <div className="text-[#64748B] text-[12.5px] font-[500]">
                          IP: {session.ipAddress || "Unknown"} • {session.location || "Unknown location"}
                        </div>
                        <div className="text-[#94A3B8] text-[12px] font-[500]">
                          Created: {session.createdAt ? new Date(session.createdAt).toLocaleString() : "N/A"} •
                          Expires: {session.expiresAt ? new Date(session.expiresAt).toLocaleString() : "N/A"}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewSession(session._id)}
                            className="text-[12px] font-[700] text-[#3B5BDB] hover:underline"
                          >
                            View details
                          </button>
                          <button
                            onClick={() => handleRevokeSession(session._id)}
                            disabled={revokingSessionId === session._id || !session.isActive}
                            className="text-[12px] font-[700] text-rose-600 hover:underline disabled:opacity-60"
                          >
                            {revokingSessionId === session._id ? "Revoking..." : "Revoke"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {sessionDetailsLoading ? (
                  <div className="px-6 pb-6 text-[#64748B] text-[13px]">Loading session details...</div>
                ) : sessionDetailsError ? (
                  <div className="px-6 pb-6 text-rose-600 text-[13px] font-[600]">{sessionDetailsError}</div>
                ) : selectedSession ? (
                  <div className="px-6 pb-6 text-[13px] text-[#64748B]">
                    Viewing: {selectedSession.device || "Unknown Device"} • {selectedSession.browser || "Unknown Browser"} • {selectedSession.os || "Unknown OS"} • {selectedSession.location || "Unknown location"}
                  </div>
                ) : null}
              </div>

              {/* Email Templates */}
              <div className="mt-8 rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    Email Templates
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Template Name</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => handleTemplateChange("name", e.target.value)}
                      className="h-[42px] w-full px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Purpose</label>
                    <input
                      type="text"
                      value={templateForm.purpose}
                      onChange={(e) => handleTemplateChange("purpose", e.target.value)}
                      className="h-[42px] w-full px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Subject</label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => handleTemplateChange("subject", e.target.value)}
                      className="h-[42px] w-full px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Body</label>
                    <textarea
                      value={templateForm.body}
                      onChange={(e) => handleTemplateChange("body", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Branch ID (optional)</label>
                    <input
                      type="text"
                      value={templateForm.branchId}
                      onChange={(e) => handleTemplateChange("branchId", e.target.value)}
                      className="h-[42px] w-full px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Active</label>
                    <select
                      value={templateForm.isActive ? "true" : "false"}
                      onChange={(e) => handleTemplateChange("isActive", e.target.value === "true")}
                      className="h-[42px] w-full px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-2">
                  {templateMessage ? (
                    <p className="text-emerald-600 text-[12px] font-[700]">{templateMessage}</p>
                  ) : null}
                  {templateError ? (
                    <p className="text-rose-600 text-[12px] font-[700]">{templateError}</p>
                  ) : null}
                  <button
                    onClick={handleCreateTemplate}
                    disabled={templateSubmitting}
                    className="h-[36px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] font-[700] hover:bg-[#2f4cc2] transition-colors disabled:opacity-70"
                  >
                    {templateSubmitting ? "Creating..." : "Create Template"}
                  </button>
                </div>

                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Filter by purpose"
                      value={templateFilters.purpose}
                      onChange={(e) => setTemplateFilters((prev) => ({ ...prev, purpose: e.target.value }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    />
                    <input
                      type="text"
                      placeholder="Filter by branchId"
                      value={templateFilters.branchId}
                      onChange={(e) => setTemplateFilters((prev) => ({ ...prev, branchId: e.target.value }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    />
                    <select
                      value={templateFilters.isActive}
                      onChange={(e) => setTemplateFilters((prev) => ({ ...prev, isActive: e.target.value }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <button
                    onClick={fetchTemplates}
                    className="h-[34px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] font-[700] hover:bg-[#2f4cc2]"
                  >
                    Apply Filters
                  </button>
                </div>

                <div className="px-6 pb-6">
                  {templatesLoading ? (
                    <div className="text-[12px] text-[#64748B]">Loading templates...</div>
                  ) : templatesError ? (
                    <div className="text-[12px] text-rose-600 font-[600]">{templatesError}</div>
                  ) : templates.length === 0 ? (
                    <div className="text-[12px] text-[#64748B]">No templates found.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {templates.map((tpl) => (
                        <div key={tpl._id} className="border border-[#EEF1F6] rounded-[10px] p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-[13px] font-[800] text-[#111827]">{tpl.name}</div>
                            <div className={`text-[11px] font-[700] ${tpl.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                              {tpl.isActive ? "Active" : "Inactive"}
                            </div>
                          </div>
                          <div className="text-[12px] text-[#6B7280]">Purpose: {tpl.purpose}</div>
                          <div className="text-[12px] text-[#6B7280]">Subject: {tpl.subject}</div>
                          <div className="text-[11px] text-[#9CA3AF]">Branch: {tpl.branchId || "Global"}</div>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => handleEditTemplate(tpl)}
                              className="text-[11px] font-[700] text-[#3B5BDB] hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(tpl._id)}
                              disabled={deletingTemplateId === tpl._id}
                              className="text-[11px] font-[700] text-rose-600 hover:underline disabled:opacity-60"
                            >
                              {deletingTemplateId === tpl._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTemplate ? (
                  <div className="px-6 pb-6">
                    <div className="text-[12px] font-[800] text-[#111827] mb-2">Edit Template</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={templateEdit.name}
                        onChange={(e) => setTemplateEdit((prev) => ({ ...prev, name: e.target.value }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={templateEdit.purpose}
                        onChange={(e) => setTemplateEdit((prev) => ({ ...prev, purpose: e.target.value }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Purpose"
                      />
                      <input
                        type="text"
                        value={templateEdit.subject}
                        onChange={(e) => setTemplateEdit((prev) => ({ ...prev, subject: e.target.value }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Subject"
                      />
                      <input
                        type="text"
                        value={templateEdit.branchId}
                        onChange={(e) => setTemplateEdit((prev) => ({ ...prev, branchId: e.target.value }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Branch ID (optional)"
                      />
                      <textarea
                        value={templateEdit.body}
                        onChange={(e) => setTemplateEdit((prev) => ({ ...prev, body: e.target.value }))}
                        rows={3}
                        className="md:col-span-2 px-3 py-2 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Body"
                      />
                      <select
                        value={templateEdit.isActive ? "true" : "false"}
                        onChange={(e) => setTemplateEdit((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    {templateEditError ? (
                      <div className="text-[12px] text-rose-600 font-[700] mt-2">{templateEditError}</div>
                    ) : null}
                    <button
                      onClick={handleUpdateTemplate}
                      disabled={templateUpdating}
                      className="mt-3 h-[32px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[11px] font-[700] hover:bg-[#2f4cc2] disabled:opacity-70"
                    >
                      {templateUpdating ? "Updating..." : "Update Template"}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Email Header/Footer */}
              <div className="mt-8 rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    Email Header/Footer
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Type</label>
                    <select
                      value={headerFooterForm.type}
                      onChange={(e) => setHeaderFooterForm((prev) => ({ ...prev, type: e.target.value }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    >
                      <option value="header">Header</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Active</label>
                    <select
                      value={headerFooterForm.isActive ? "true" : "false"}
                      onChange={(e) => setHeaderFooterForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Content (HTML)</label>
                    <textarea
                      value={headerFooterForm.content}
                      onChange={(e) => setHeaderFooterForm((prev) => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    />
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-2">
                  {headerFooterMessage ? (
                    <p className="text-emerald-600 text-[12px] font-[700]">{headerFooterMessage}</p>
                  ) : null}
                  {headerFooterError ? (
                    <p className="text-rose-600 text-[12px] font-[700]">{headerFooterError}</p>
                  ) : null}
                  <button
                    onClick={handleHeaderFooterSubmit}
                    disabled={headerFooterSubmitting}
                    className="h-[34px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] font-[700] hover:bg-[#2f4cc2]"
                  >
                    {headerFooterSubmitting ? "Saving..." : "Save Header/Footer"}
                  </button>
                </div>

                <div className="px-6 pb-6">
                  {headerFootersLoading ? (
                    <div className="text-[12px] text-[#64748B]">Loading headers/footers...</div>
                  ) : headerFootersError ? (
                    <div className="text-[12px] text-rose-600 font-[600]">{headerFootersError}</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {headerFooters.map((hf) => (
                        <div key={hf._id} className="border border-[#EEF1F6] rounded-[10px] p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-[12px] font-[800] text-[#111827] capitalize">{hf.type}</div>
                            <div className={`text-[11px] font-[700] ${hf.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                              {hf.isActive ? "Active" : "Inactive"}
                            </div>
                          </div>
                          <div className="text-[11px] text-[#6B7280] truncate">{hf.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <div className="text-[12px] font-[800] text-[#111827] mb-2">Active Header/Footer</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-[#EEF1F6] rounded-[10px] p-4">
                      <div className="text-[11px] font-[700] text-[#6B7280] mb-1">Header</div>
                      <div className="text-[11px] text-[#111827] truncate">{activeHeader?.content || "None"}</div>
                    </div>
                    <div className="border border-[#EEF1F6] rounded-[10px] p-4">
                      <div className="text-[11px] font-[700] text-[#6B7280] mb-1">Footer</div>
                      <div className="text-[11px] text-[#111827] truncate">{activeFooter?.content || "None"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Purposes */}
              <div className="mt-8 rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    Template Purposes
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Name</label>
                    <input
                      type="text"
                      value={purposeForm.name}
                      onChange={(e) => setPurposeForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Slug (lowercase)</label>
                    <input
                      type="text"
                      value={purposeForm.slug}
                      onChange={(e) => setPurposeForm((prev) => ({ ...prev, slug: e.target.value }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Description</label>
                    <textarea
                      value={purposeForm.description}
                      onChange={(e) => setPurposeForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[800] text-[#111827]">Active</label>
                    <select
                      value={purposeForm.isActive ? "true" : "false"}
                      onChange={(e) => setPurposeForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                      className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-2">
                  {purposeMessage ? (
                    <p className="text-emerald-600 text-[12px] font-[700]">{purposeMessage}</p>
                  ) : null}
                  {purposeError ? (
                    <p className="text-rose-600 text-[12px] font-[700]">{purposeError}</p>
                  ) : null}
                  <button
                    onClick={handleCreatePurpose}
                    disabled={purposeSubmitting}
                    className="h-[34px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] font-[700] hover:bg-[#2f4cc2]"
                  >
                    {purposeSubmitting ? "Creating..." : "Create Purpose"}
                  </button>
                </div>

                <div className="px-6 pb-6">
                  {purposesLoading ? (
                    <div className="text-[12px] text-[#64748B]">Loading purposes...</div>
                  ) : purposesError ? (
                    <div className="text-[12px] text-rose-600 font-[600]">{purposesError}</div>
                  ) : purposes.length === 0 ? (
                    <div className="text-[12px] text-[#64748B]">No purposes found.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {purposes.map((p) => (
                        <div key={p._id} className="border border-[#EEF1F6] rounded-[10px] p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-[12px] font-[800] text-[#111827]">{p.name}</div>
                            <div className={`text-[11px] font-[700] ${p.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                              {p.isActive ? "Active" : "Inactive"}
                            </div>
                          </div>
                        <div className="text-[11px] text-[#6B7280]">Slug: {p.slug}</div>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => handleViewPurpose(p._id)}
                              className="text-[11px] font-[700] text-[#3B5BDB] hover:underline"
                            >
                              View / Edit
                            </button>
                            <button
                              onClick={() => handleDeletePurpose(p._id)}
                              disabled={deletingPurposeId === p._id}
                              className="text-[11px] font-[700] text-rose-600 hover:underline disabled:opacity-60"
                            >
                              {deletingPurposeId === p._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {purposeDetailsLoading ? (
                  <div className="px-6 pb-6 text-[#64748B] text-[12px]">Loading purpose details...</div>
                ) : purposeDetailsError ? (
                  <div className="px-6 pb-6 text-rose-600 text-[12px] font-[600]">{purposeDetailsError}</div>
                ) : selectedPurpose ? (
                  <div className="px-6 pb-6">
                    <div className="text-[12px] font-[800] text-[#111827] mb-2">Edit Purpose</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={purposeEdit.name}
                        onChange={(e) => setPurposeEdit((prev) => ({ ...prev, name: e.target.value }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={purposeEdit.slug}
                        onChange={(e) => setPurposeEdit((prev) => ({ ...prev, slug: e.target.value }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Slug"
                      />
                      <textarea
                        value={purposeEdit.description}
                        onChange={(e) => setPurposeEdit((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="md:col-span-2 px-3 py-2 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                        placeholder="Description"
                      />
                      <select
                        value={purposeEdit.isActive ? "true" : "false"}
                        onChange={(e) => setPurposeEdit((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                        className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <button
                      onClick={handleUpdatePurpose}
                      disabled={updatingPurpose}
                      className="mt-3 h-[32px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[11px] font-[700] hover:bg-[#2f4cc2] disabled:opacity-70"
                    >
                      {updatingPurpose ? "Updating..." : "Update Purpose"}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Audit Logs */}
              <div className="mt-8 rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    Audit Logs
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="Action"
                    value={auditFilters.action}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, action: e.target.value }))}
                    className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                  />
                  <input
                    type="text"
                    placeholder="User ID"
                    value={auditFilters.userId}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, userId: e.target.value }))}
                    className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                  />
                  <input
                    type="date"
                    value={auditFilters.startDate}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                  />
                  <input
                    type="date"
                    value={auditFilters.endDate}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                  />
                  <input
                    type="text"
                    placeholder="Search"
                    value={auditFilters.search}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="h-[38px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-[500]"
                  />
                </div>
                <div className="px-6 pb-4">
                  <button
                    onClick={fetchAuditLogs}
                    className="h-[34px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] font-[700] hover:bg-[#2f4cc2]"
                  >
                    Apply Filters
                  </button>
                </div>

                <div className="px-6 pb-6">
                  {auditLoading ? (
                    <div className="text-[12px] text-[#64748B]">Loading audit logs...</div>
                  ) : auditError ? (
                    <div className="text-[12px] text-rose-600 font-[600]">{auditError}</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-[12px] text-[#64748B]">No audit logs found.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {auditLogs.map((log) => (
                        <div key={log._id} className="border border-[#EEF1F6] rounded-[10px] p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-[12px] font-[800] text-[#111827]">{log.action}</div>
                            <div className="text-[11px] text-[#9CA3AF]">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                            </div>
                          </div>
                          <div className="text-[12px] text-[#6B7280]">
                            By: {log.performedBy?.firstName || ""} {log.performedBy?.lastName || ""}
                          </div>
                          <div className="text-[11px] text-[#9CA3AF]">
                            Target: {log.targetResource || "N/A"} {log.targetResourceId ? `• ${log.targetResourceId}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
