"use client"

import { API_V1 } from "@/lib/api";

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AmountInput, parseAmount, formatAmount } from "@/components/ui/amount-input"
import {
  ArrowLeft,
  ChevronDown,
  GripVertical,
  Info,
  PieChart,
  PlusCircle,
  Trash2,
  Workflow,
  Save,
  XCircle,
} from "lucide-react"

type CoaOption = {
  id: string
  label: string
}

type BudgetCategory = "Operational" | "Program" | "Capital"
type AllocationType = "Percentage" | "Fixed"

type LineItemForm = {
  id: string
  category: BudgetCategory
  chartOfAccountId: string
  name: string
  description: string
  allocationType: AllocationType
  defaultAmount: string
}

function getCsrfToken() {
  if (typeof document === "undefined") return ""
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrf_token="))
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
}

function makeLineItem(category: BudgetCategory = "Operational"): LineItemForm {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    chartOfAccountId: "",
    name: "",
    description: "",
    allocationType: "Percentage",
    defaultAmount: "",
  }
}

function PageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [templateName, setTemplateName] = useState("")
  const [description, setDescription] = useState("")
  const [fiscalYear, setFiscalYear] = useState("FY 2025")
  const [branchType, setBranchType] = useState("")
  const [activeCategory, setActiveCategory] = useState<BudgetCategory>("Operational")
  const [lineItems, setLineItems] = useState<LineItemForm[]>(() => [
    { ...makeLineItem("Operational"), name: "Staff Salaries & Wages", allocationType: "Percentage", defaultAmount: "35" },
    { ...makeLineItem("Operational"), name: "Facility Maintenance", allocationType: "Fixed", defaultAmount: "1,200,000" },
    { ...makeLineItem("Operational"), name: "Administrative Costs", allocationType: "Percentage", defaultAmount: "10" },
  ])
  const [templateLookupId, setTemplateLookupId] = useState("")
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [coaOptions, setCoaOptions] = useState<CoaOption[]>([])
  const [coaLoading, setCoaLoading] = useState(true)
  const [coaError, setCoaError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const hydrateFromTemplate = (template: Record<string, unknown>) => {
    const name = String(template.name ?? template.title ?? "").trim()
    const templateDescription = String(template.description ?? "").trim()
    const rawLineItems = Array.isArray(template.lineItems) ? template.lineItems : []

    const mappedItems: LineItemForm[] = rawLineItems
      .map((item) => {
        if (!item || typeof item !== "object") return null
        const row = item as Record<string, unknown>
        const coaRaw = row.chartOfAccountId
        const chartOfAccountId =
          typeof coaRaw === "string"
            ? coaRaw
            : coaRaw && typeof coaRaw === "object"
              ? String((coaRaw as Record<string, unknown>)._id ?? (coaRaw as Record<string, unknown>).id ?? "")
              : ""
        const lineDescription = String(row.description ?? "").trim()
        const lineName = String(row.name ?? row.budgetHead ?? lineDescription ?? "").trim()
        const defaultAmount = Number(row.defaultAmount)
        if (!chartOfAccountId || !Number.isFinite(defaultAmount)) return null
        const rawCategory = String(row.category ?? "Operational")
        const category: BudgetCategory =
          rawCategory === "Program" || rawCategory === "Capital" ? rawCategory : "Operational"
        const allocationType: AllocationType =
          String(row.allocationType ?? "").toLowerCase() === "fixed" ? "Fixed" : "Percentage"
        return {
          id: makeLineItem().id,
          category,
          chartOfAccountId,
          name: lineName,
          description: lineDescription,
          allocationType,
          defaultAmount: formatAmount(String(defaultAmount)),
        }
      })
      .filter((row): row is LineItemForm => row !== null)

    setTemplateName(name)
    setDescription(templateDescription)
    setLineItems(mappedItems.length > 0 ? mappedItems : [makeLineItem(activeCategory)])
  }

  useEffect(() => {
    let active = true
    const loadCoa = async () => {
      setCoaLoading(true)
      setCoaError(null)
      try {
        const response = await fetch(`${API_V1}/financial/coa?page=1&limit=200`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load chart of accounts.")
        }

        const rows = Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.data)
            ? payload.data
            : []

        const options: CoaOption[] = rows
          .map((item: Record<string, unknown>) => {
            const id = String(item._id ?? item.id ?? "").trim()
            const code = String(item.code ?? "").trim()
            const name = String(item.name ?? "").trim()
            if (!id || !name) return null
            return {
              id,
              label: code ? `${code} - ${name}` : name,
            }
          })
          .filter((item: CoaOption | null): item is CoaOption => item !== null)

        if (active) {
          setCoaOptions(options)
        }
      } catch (error) {
        if (active) {
          setCoaError(error instanceof Error ? error.message : "Unable to load chart of accounts.")
          setCoaOptions([])
        }
      } finally {
        if (active) setCoaLoading(false)
      }
    }

    loadCoa()
    return () => {
      active = false
    }
  }, [])

  const visibleLineItems = useMemo(
    () => lineItems.filter((row) => row.category === activeCategory),
    [lineItems, activeCategory]
  )

  const totalPercentage = useMemo(
    () =>
      lineItems
        .filter((row) => row.allocationType === "Percentage")
        .reduce((sum, row) => sum + parseAmount(row.defaultAmount), 0),
    [lineItems]
  )

  const totalFixed = useMemo(
    () =>
      lineItems
        .filter((row) => row.allocationType === "Fixed")
        .reduce((sum, row) => sum + parseAmount(row.defaultAmount), 0),
    [lineItems]
  )

  const updateLineItem = <K extends keyof LineItemForm>(id: string, field: K, value: LineItemForm[K]) => {
    setLineItems((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const addLineItem = () => {
    setLineItems((prev) => [...prev, makeLineItem(activeCategory)])
  }

  const removeLineItem = (id: string) => {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev))
  }

  const resetForm = () => {
    setTemplateName("")
    setDescription("")
    setBranchType("")
    setLineItems([makeLineItem(activeCategory)])
    setTemplateLookupId("")
    setActiveTemplateId(null)
  }

  const loadTemplateById = async (providedId?: string) => {
    setSubmitError(null)
    setSubmitSuccess(null)
    const id = (providedId ?? templateLookupId).trim()
    if (!id) {
      setSubmitError("Template ID is required to load a template.")
      return
    }

    setLoadingTemplate(true)
    try {
      const response = await fetch(`${API_V1}/financial/budget-templates/${encodeURIComponent(id)}`, {
        method: "GET",
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to load budget template.")
      }
      const template = (payload?.data ?? payload ?? {}) as Record<string, unknown>
      hydrateFromTemplate(template)
      setTemplateLookupId(id)
      setActiveTemplateId(id)
      setSubmitSuccess("Template loaded successfully.")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to load budget template.")
    } finally {
      setLoadingTemplate(false)
    }
  }

  useEffect(() => {
    const idFromQuery = searchParams.get("templateId")
    if (!idFromQuery) return
    setTemplateLookupId(idFromQuery)
    loadTemplateById(idFromQuery).catch(() => null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSaveTemplate = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)

    const name = templateName.trim()
    if (!name) {
      setSubmitError("Template name is required.")
      return
    }

    const cleanedLineItems = lineItems
      .map((row) => {
        const amount = parseAmount(row.defaultAmount)
        return {
          category: row.category,
          chartOfAccountId: row.chartOfAccountId.trim(),
          name: row.name.trim(),
          description: row.description.trim(),
          allocationType: row.allocationType,
          defaultAmount: amount,
        }
      })
      .filter((row) => row.name && Number.isFinite(row.defaultAmount) && row.defaultAmount >= 0)

    if (cleanedLineItems.length === 0) {
      setSubmitError("Add at least one valid line item with a budget head name and amount.")
      return
    }

    setSubmitting(true)
    try {
      const isUpdate = Boolean(activeTemplateId)
      const response = await fetch(
        isUpdate
          ? `${API_V1}/financial/budget-templates/${encodeURIComponent(activeTemplateId ?? "")}`
          : `${API_V1}/financial/budget-templates`,
        {
        method: isUpdate ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          description: description.trim(),
          lineItems: cleanedLineItems,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? `Unable to ${isUpdate ? "update" : "create"} budget template.`)
      }

      if (isUpdate) {
        setSubmitSuccess(payload?.message ?? "Budget template updated successfully.")
      } else {
        const createdId = String(payload?.data?._id ?? payload?.data?.id ?? "").trim()
        if (createdId) {
          setTemplateLookupId(createdId)
          setActiveTemplateId(createdId)
        }
        setSubmitSuccess(payload?.message ?? "Budget template created successfully.")
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save budget template.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTemplate = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)
    const id = (activeTemplateId ?? templateLookupId).trim()
    if (!id) {
      setSubmitError("Load a template before deleting.")
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`${API_V1}/financial/budget-templates/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete budget template.")
      }

      resetForm()
      setSubmitSuccess(payload?.message ?? "Budget template deleted successfully.")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to delete budget template.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/budgeting"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <button
            onClick={() => router.push("/director-screen/budgeting")}
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <section className="w-full flex flex-col gap-4 md:flex-row md:items-end justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] sm:text-[32px] leading-tight font-black tracking-[-0.8px] text-[#111827]">
                Create New Budget Template
              </h1>
              <p className="max-w-xl text-[14px] leading-relaxed font-normal text-[#6B7280]">
                Define standard financial structures for branch implementation. These settings will apply to the FY
                {new Date().getFullYear()} cycle.
              </p>
            </div>
            <div className="flex items-center gap-[26.82px]">
              <Input
                value={templateLookupId}
                onChange={(event) => setTemplateLookupId(event.target.value)}
                className="h-[33.78px] w-[180px] rounded-[7.11px] border-[0.89px] border-[#E5E7EB] bg-white text-[12px]"
                placeholder="Template ID"
              />
              <Button
                variant="outline"
                className="w-[98.44px] h-[33.78px] p-0 rounded-[7.11px] border-[0.89px] border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#374151] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-[#F9FAFB]"
              >
                Import CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => loadTemplateById()}
                disabled={loadingTemplate}
                className="w-[98.44px] h-[33.78px] p-0 rounded-[7.11px] border-[0.89px] border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#374151] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-[#F9FAFB]"
              >
                {loadingTemplate ? "Loading..." : "Load Previous"}
              </Button>
            </div>
          </section>

          <section className="mt-8 space-y-[28px]">
            <div className="rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-6 py-5.5 text-[15px] font-bold text-[#111827]">
                <div className="bg-[#EFF6FF] p-1.5 rounded-full">
                  <Info className="h-4 w-4 text-[#3B5BDB]" />
                </div>
                General Information
              </div>
              <div className="grid grid-cols-1 gap-6 px-6 py-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-[13px] font-bold text-[#111827]">
                      Template Name <span className="text-[#EF4444]">*</span>
                    </div>
                    <Input
                      value={templateName}
                      onChange={(event) => setTemplateName(event.target.value)}
                      className="h-11 rounded-[6px] border-[#E5E7EB] bg-[#F9FAFB] text-[14px] placeholder:text-[#9CA3AF] shadow-sm"
                      placeholder="e.g., FY2025 Urban Branch Standard"
                    />
                    <p className="text-[11px] text-[#6B7280]">Must be unique across the organization.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[13px] font-bold text-[#111827]">
                      Fiscal Year
                    </div>
                    <div className="relative">
                      <select
                        value={fiscalYear}
                        onChange={(event) => setFiscalYear(event.target.value)}
                        className="w-full h-11 appearance-none rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[14px] text-[#374151] shadow-sm focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                      >
                        <option value="FY 2025">FY 2025</option>
                        <option value="FY 2026">FY 2026</option>
                        <option value="FY 2027">FY 2027</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[13px] font-bold text-[#111827]">Description</div>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="w-full flex min-h-[96px] rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[14px] font-medium placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] resize-none shadow-sm"
                    placeholder="Add internal notes about this template structure..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-6 py-6">
              <div className="space-y-2">
                <div className="text-[13px] font-bold text-[#111827]">
                  Branch Type <span className="text-[#EF4444]">*</span>
                </div>
                <div className="relative">
                  <select
                    value={branchType}
                    onChange={(event) => setBranchType(event.target.value)}
                    className={`w-full h-11 appearance-none rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[14px] shadow-sm focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] ${branchType ? "text-[#374151]" : "text-[#9CA3AF]"}`}
                  >
                    <option value="" disabled>e.g. Established</option>
                    <option value="Established">Established</option>
                    <option value="Developing">Developing</option>
                    <option value="New Plant">New Plant</option>
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E7EB] px-6 py-5 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[16px] font-bold text-[#111827]">
                    <Workflow className="h-5 w-5 text-[#3B5BDB]" />
                    Budget Structure
                  </div>
                  <div className="mt-1 text-[14px] text-[#6B7280]">Configure line items grouped by category.</div>
                </div>
                <div className="flex items-center text-[13px] font-semibold">
                  <div className="flex rounded-[6px] border border-[#E5E7EB] p-1 bg-[#F9FAFB]">
                    {(["Operational", "Program", "Capital"] as BudgetCategory[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveCategory(tab)}
                        className={`rounded-[4px] px-5 py-1.5 transition-colors ${
                          activeCategory === tab
                            ? "bg-white shadow-sm text-[#111827] border border-[#E5E7EB]"
                            : "text-[#6B7280] hover:text-[#111827]"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-center justify-between rounded-[8px] bg-[#EFF6FF] px-4 py-3.5 border border-[#DBEAFE]">
                  <div className="flex items-center gap-2 font-bold text-[#1E40AF] text-[13px]">
                    <PieChart className="h-4 w-4" />
                    {activeCategory} Allocation Target:
                  </div>
                  <div className="font-bold text-[#1E40AF] text-[14px]">45% of Total Income</div>
                </div>

                <div className="mt-4 text-[12px]">
                  {coaLoading && <span className="text-[#64748B]">Loading chart of accounts...</span>}
                  {coaError && <span className="text-rose-600">{coaError}</span>}
                </div>

                <div className="mt-4">
                  <table className="w-full text-[14px]">
                    <thead className="bg-transparent text-[#9CA3AF] text-[11px] font-[600] tracking-wider">
                      <tr className="border-b-2 border-[#E5E7EB]">
                        <th className="py-3 px-2 text-left w-[40px]">SORT</th>
                        <th className="py-3 px-2 text-left">BUDGET HEAD NAME</th>
                        <th className="py-3 px-2 text-left w-[220px]">ALLOCATION TYPE</th>
                        <th className="py-3 px-2 text-left w-[180px]">DEFAULT VALUE</th>
                        <th className="py-3 px-2 text-center w-[80px]">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLineItems.length === 0 ? (
                        <tr className="border-b border-[#E5E7EB]">
                          <td colSpan={5} className="py-6 px-2 text-center text-[13px] text-[#9CA3AF]">
                            No {activeCategory.toLowerCase()} line items yet. Use the button below to add one.
                          </td>
                        </tr>
                      ) : (
                        visibleLineItems.map((row) => (
                          <tr key={row.id} className="border-b border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB]">
                            <td className="py-4 px-2 text-[#9CA3AF]">
                              <GripVertical className="h-4 w-4" />
                            </td>
                            <td className="py-4 px-2">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(event) => updateLineItem(row.id, "name", event.target.value)}
                                placeholder="Budget head name"
                                className="h-10 w-full rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-bold shadow-sm focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                              />
                            </td>
                            <td className="py-4 px-2">
                              <div className="relative">
                                <select
                                  value={row.allocationType}
                                  onChange={(event) => updateLineItem(row.id, "allocationType", event.target.value as AllocationType)}
                                  className="h-10 w-full appearance-none rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#374151] font-medium shadow-sm focus:border-[#3B5BDB] focus:outline-none"
                                >
                                  <option value="Percentage">Percentage (%)</option>
                                  <option value="Fixed">Fixed Amount (₦)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                  <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              {row.allocationType === "Percentage" ? (
                                <div className="relative">
                                  <AmountInput
                                    value={row.defaultAmount}
                                    onValueChange={(formatted) => updateLineItem(row.id, "defaultAmount", formatted)}
                                    className="h-10 w-full rounded-[6px] border border-[#E5E7EB] bg-white text-[13px] shadow-sm text-right pr-8 pl-3 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                                  />
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-[13px] text-[#6B7280]">%</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative flex items-center">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-[13px] text-[#6B7280]">₦</span>
                                  </div>
                                  <AmountInput
                                    value={row.defaultAmount}
                                    onValueChange={(formatted) => updateLineItem(row.id, "defaultAmount", formatted)}
                                    className="h-10 w-full rounded-[6px] border border-[#E5E7EB] bg-white text-[13px] shadow-sm text-right pr-3 pl-8 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeLineItem(row.id)}
                                className="inline-flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] transition-colors outline-none bg-transparent border-transparent"
                              >
                                <Trash2 className="h-[16px] w-[16px]" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={addLineItem}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-[#3B5BDB] bg-white hover:bg-[#F3F4F6] transition-colors py-3.5 text-[14px] font-medium text-[#3B5BDB]"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add {activeCategory} Line Item
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="w-full bg-white mt-auto border-t-[0.89px] border-[#EEF1F6] h-[70.22px] px-6 lg:px-10 flex items-center">
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
            <div>
              <div className="text-[11px] font-[600] text-[#9CA3AF] uppercase tracking-wider">TOTAL ALLOCATION</div>
              <div className="mt-0.5 text-[15px] leading-[24.89px] font-bold text-[#111827] flex items-center gap-1">
                {totalPercentage}%
                <span className="text-[#9CA3AF] font-medium text-[14px]">+ {formatCurrency(totalFixed)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {submitSuccess && <div className="text-[12px] font-semibold text-emerald-600">{submitSuccess}</div>}
              {submitError && <div className="text-[12px] font-semibold text-rose-600">{submitError}</div>}
              <Button
                variant="outline"
                onClick={resetForm}
                className="h-[36px] px-6 rounded-[6px] border-[#E5E7EB] bg-white text-[13px] font-[600] text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={submitting || deleting}
                className="h-[36px] px-6 rounded-[6px] bg-[#1d8eed] hover:bg-[#1570EF] text-[13px] font-[600] text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Save & Next Branch
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  )
}
