"use client"

import { useEffect, useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import {
  AlertTriangle,
  ArrowUpDown,
  Banknote,
  Building2,
  ChevronDown,
  Download,
  Plus,
  Search,
  TrendingUp,
  ShieldAlert,
} from "lucide-react"

type RegionApiItem = {
  id?: string
  regionId?: string
  name?: string
  regionName?: string
  description?: string
  regionDescription?: string
  location?: string
  regionLocation?: string
  status?: string
}

type RegionCard = {
  id: string
  name: string
  description: string
  location: string
  status: string
  statusTone: string
  statusDot: string
}

type TenantApiItem = {
  _id?: string
  id?: string
  tenantId?: string
  branchName?: string
  name?: string
  status?: string
  location?: string
  branchType?: string
}

type TenantCard = {
  id: string
  name: string
  location: string
  status: string
  statusTone: string
  statusDot: string
}

type BranchHealthSummary = {
  totalBranches: number
  activeBranches: number
  networkHealthPercent: number
  totalRemittanceYTD: number
  criticalAlertsCount: number
  pendingAuditsCount: number
}

const normalizeTenant = (tenant: TenantApiItem, index: number): TenantCard => {
  const name = tenant.branchName ?? tenant.name ?? `Branch ${index + 1}`
  const location = tenant.location ?? "Location not specified"
  const statusRaw = (tenant.status ?? "ACTIVE").toUpperCase()
  const statusStyle = statusStyles[statusRaw] ?? statusStyles.ACTIVE

  return {
    id: tenant._id ?? tenant.tenantId ?? tenant.id ?? `${index + 1}`,
    name,
    location,
    status: statusRaw,
    statusTone: statusStyle.tone,
    statusDot: statusStyle.dot,
  }
}
const statusStyles: Record<string, { tone: string; dot: string }> = {
  ACTIVE: { tone: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  INACTIVE: { tone: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
  PENDING: { tone: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  REVIEW: { tone: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  SUSPENDED: { tone: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
  ONBOARDING: { tone: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
}

const normalizeRegion = (region: RegionApiItem, index: number): RegionCard => {
  const name = region.regionName ?? region.name ?? `Region ${index + 1}`
  const description = region.regionDescription ?? region.description ?? "No description provided"
  const location = region.regionLocation ?? region.location ?? "Location not specified"
  const statusRaw = (region.status ?? "ACTIVE").toUpperCase()
  const statusStyle = statusStyles[statusRaw] ?? statusStyles.ACTIVE

  return {
    id: region.regionId ?? region.id ?? `${index + 1}`,
    name,
    description,
    location,
    status: statusRaw,
    statusTone: statusStyle.tone,
    statusDot: statusStyle.dot,
  }
}

export default function Page() {
  const [regions, setRegions] = useState<RegionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<RegionCard | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createLocation, setCreateLocation] = useState("")
  const [createStatus, setCreateStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [createError, setCreateError] = useState("")
  const [createTouched, setCreateTouched] = useState({ name: false, description: false, location: false })
  const [optimisticRegion, setOptimisticRegion] = useState<RegionCard | null>(null)
  const [lastCreatedRegionId, setLastCreatedRegionId] = useState<string | null>(null)
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editRegionStatus, setEditRegionStatus] = useState("ACTIVE")
  const [editStatus, setEditStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [editError, setEditError] = useState("")
  const [editTouched, setEditTouched] = useState({ name: false, description: false, location: false })
  const [optimisticUpdate, setOptimisticUpdate] = useState<RegionCard | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [togglingRegionId, setTogglingRegionId] = useState<string | null>(null)
  const { pushToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [descriptionFilter, setDescriptionFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [totalItems, setTotalItems] = useState<number | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [tenants, setTenants] = useState<TenantCard[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(false)
  const [tenantsError, setTenantsError] = useState("")
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null)
  const [branchEditName, setBranchEditName] = useState("")
  const [branchEditAddress, setBranchEditAddress] = useState("")
  const [branchEditRegionId, setBranchEditRegionId] = useState("")
  const [branchEditLeadPastorId, setBranchEditLeadPastorId] = useState("")
  const [branchEditAccountantId, setBranchEditAccountantId] = useState("")
  const [branchEditCurrency, setBranchEditCurrency] = useState("")
  const [branchEditTouched, setBranchEditTouched] = useState({
    name: false,
    address: false,
    regionId: false,
  })
  const [branchEditStatus, setBranchEditStatus] = useState<"idle" | "saving">("idle")
  const [branchOptimisticBackup, setBranchOptimisticBackup] = useState<TenantCard | null>(null)
  const [branchStatusUpdatingId, setBranchStatusUpdatingId] = useState<string | null>(null)
  const [branchEditLoading, setBranchEditLoading] = useState(false)
  const [showCreateBranch, setShowCreateBranch] = useState(false)
  const [branchName, setBranchName] = useState("")
  const [branchAddress, setBranchAddress] = useState("")
  const [branchRegion, setBranchRegion] = useState("")
  const [branchType, setBranchType] = useState("")
  const [branchCurrency, setBranchCurrency] = useState("")
  const [branchLeadPastorId, setBranchLeadPastorId] = useState("")
  const [branchAccountantId, setBranchAccountantId] = useState("")
  const [branchRegionOptions, setBranchRegionOptions] = useState<RegionCard[]>([])
  const [regionOptionsLoaded, setRegionOptionsLoaded] = useState(false)
  const [regionOptionsLoading, setRegionOptionsLoading] = useState(false)
  const [branchTouched, setBranchTouched] = useState({
    name: false,
    address: false,
    region: false,
    branchType: false,
  })
  const [branchStatus, setBranchStatus] = useState<"idle" | "saving">("idle")
  const [branchHealthSummary, setBranchHealthSummary] = useState<BranchHealthSummary | null>(null)
  const [branchSummaryLoading, setBranchSummaryLoading] = useState(false)
  const [branchSummaryError, setBranchSummaryError] = useState<string | null>(null)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value)

  useEffect(() => {
    let isMounted = true

    const fetchBranchSummary = async () => {
      try {
        setBranchSummaryLoading(true)
        setBranchSummaryError(null)
        const response = await fetch("/api/branches/summary", {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch branch summary.")
        }

        const data = (payload?.data ?? payload ?? {}) as Record<string, unknown>
        const totalBranches = Number(data.totalBranches ?? 0)
        const activeBranches = Number(data.activeBranches ?? 0)
        const networkHealthPercentRaw = Number(data.networkHealthPercent)
        const networkHealthPercent = Number.isFinite(networkHealthPercentRaw)
          ? networkHealthPercentRaw
          : totalBranches > 0
            ? (activeBranches / totalBranches) * 100
            : 0
        const totalRemittanceYTD = Number(data.totalRemittanceYTD ?? 0)
        const criticalAlertsCount = Number(data.criticalAlertsCount ?? data.criticalAlerts ?? 0)
        const pendingAuditsCount = Number(data.pendingAuditsCount ?? data.pendingAudits ?? 0)

        if (isMounted) {
          setBranchHealthSummary({
            totalBranches: Number.isFinite(totalBranches) ? totalBranches : 0,
            activeBranches: Number.isFinite(activeBranches) ? activeBranches : 0,
            networkHealthPercent: Number.isFinite(networkHealthPercent) ? networkHealthPercent : 0,
            totalRemittanceYTD: Number.isFinite(totalRemittanceYTD) ? totalRemittanceYTD : 0,
            criticalAlertsCount: Number.isFinite(criticalAlertsCount) ? criticalAlertsCount : 0,
            pendingAuditsCount: Number.isFinite(pendingAuditsCount) ? pendingAuditsCount : 0,
          })
        }
      } catch (error) {
        if (isMounted) {
          setBranchHealthSummary(null)
          setBranchSummaryError(error instanceof Error ? error.message : "Unable to fetch branch summary.")
        }
      } finally {
        if (isMounted) {
          setBranchSummaryLoading(false)
        }
      }
    }

    fetchBranchSummary()

    return () => {
      isMounted = false
    }
  }, [])

  const statCards = useMemo(() => {
    const totalBranches = Number(branchHealthSummary?.totalBranches ?? 0)
    const totalIncome = Number(branchHealthSummary?.totalRemittanceYTD ?? 0)
    const complianceAvg = Number(branchHealthSummary?.networkHealthPercent ?? 0)
    const criticalAlerts = Number(branchHealthSummary?.criticalAlertsCount ?? 0)
    const pendingAudits = Number(branchHealthSummary?.pendingAuditsCount ?? 0)

    return [
      {
        title: "Global Network Health",
        value: totalBranches ? `${complianceAvg.toFixed(1)}%` : "—",
        meta: totalBranches ? `${totalBranches} branches monitored` : "Awaiting branch summaries",
        metaTone: complianceAvg >= 70 ? "text-emerald-600" : "text-amber-600",
        icon: TrendingUp,
        tone: "text-[#3B5BDB]",
        iconBg: "bg-[#E9EEFF]",
      },
      {
        title: "Total Remittance (YTD)",
        value: totalBranches ? formatCurrency(totalIncome) : "—",
        meta: totalBranches ? "Aggregated branch income" : "Awaiting branch summaries",
        metaTone: "text-emerald-600",
        icon: Banknote,
        tone: "text-emerald-600",
        iconBg: "bg-[#EAF8F1]",
      },
      {
        title: "Critical Alerts",
        value: totalBranches ? String(criticalAlerts) : "—",
        meta: totalBranches ? "Compliance below 70%" : "Awaiting branch summaries",
        metaTone: "text-rose-600",
        icon: ShieldAlert,
        tone: "text-rose-600",
        iconBg: "bg-[#FDECEC]",
      },
      {
        title: "Pending Audits",
        value: totalBranches ? String(pendingAudits) : "—",
        meta: totalBranches ? "Reported by branches" : "Awaiting branch summaries",
        metaTone: "text-amber-600",
        icon: AlertTriangle,
        tone: "text-amber-600",
        iconBg: "bg-[#FFF4E6]",
      },
    ]
  }, [branchHealthSummary])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const debounce = setTimeout(() => {
      loadRegions()
    }, 300)

    async function loadRegions() {
      try {
        const params = new URLSearchParams()
        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim())
        }
        if (nameFilter.trim()) {
          params.set("regionNameLike", nameFilter.trim())
        }
        if (descriptionFilter.trim()) {
          params.set("regionDescriptionLike", descriptionFilter.trim())
        }
        if (locationFilter.trim()) {
          params.set("regionLocationLike", locationFilter.trim())
        }
        if (statusFilter !== "ALL") {
          params.set("status", statusFilter)
        }
        params.set("page", String(page))
        params.set("size", String(pageSize))

        const res = await fetch(`/api/core/regions?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        })
        if (!res.ok) {
          if (active) setRegions([])
          return
        }
        const payload = await res.json()
        const data = Array.isArray(payload?.data)
          ? payload.data
          : payload?.data?.content ?? payload?.data?.items ?? payload?.data ?? payload
        const list = Array.isArray(data) ? data : []
        if (active) {
          setRegions(list.map((item: RegionApiItem, index: number) => normalizeRegion(item, index)))
          setTotalItems(
            typeof payload?.data?.totalElements === "number"
              ? payload.data.totalElements
              : typeof payload?.data?.total === "number"
                ? payload.data.total
                : null
          )
          setTotalPages(
            typeof payload?.data?.totalPages === "number"
              ? payload.data.totalPages
              : null
          )
        }
      } catch {
        if (active) setRegions([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadRegions()
    return () => {
      active = false
      controller.abort()
      clearTimeout(debounce)
    }
  }, [searchTerm, nameFilter, descriptionFilter, locationFilter, statusFilter, page, pageSize])

  const regionCards = useMemo(() => {
    if (!optimisticRegion) return regions
    const exists = regions.some((region) => region.id === optimisticRegion.id)
    return exists ? regions : [optimisticRegion, ...regions]
  }, [regions, optimisticRegion])

  const displayTotal = totalItems ?? regionCards.length
  const displayPage = totalPages ?? Math.max(1, Math.ceil(displayTotal / pageSize))

  const handleFetchTenants = async () => {
    setTenantsLoading(true)
    setTenantsError("")
    try {
      const res = await fetch("/api/branches", { credentials: "include" })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.message ?? "Unable to fetch branches")
      }
      const payload = await res.json()
      const data = Array.isArray(payload?.data)
        ? payload.data
        : payload?.data?.content ?? payload?.data?.items ?? payload?.data ?? payload
      const list = Array.isArray(data) ? data : []
      setTenants(list.map((item: TenantApiItem, index: number) => normalizeTenant(item, index)))
      pushToast("Branches loaded.", "success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch branches"
      setTenantsError(message)
      pushToast(message, "error")
    } finally {
      setTenantsLoading(false)
    }
  }

  const handleBranchEditStart = async (tenant: TenantCard) => {
    setEditingBranchId(tenant.id)
    setBranchEditName(tenant.name)
    setBranchEditAddress("")
    setBranchEditRegionId("")
    setBranchEditLeadPastorId("")
    setBranchEditAccountantId("")
    setBranchEditCurrency("")
    setBranchEditTouched({ name: false, address: false, regionId: false })
    setBranchEditLoading(true)

    try {
      const res = await fetch(`/api/branches/${tenant.id}`, { credentials: "include" })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to fetch branch details")
      }
      const data = payload?.data ?? payload
      setBranchEditName(data?.branchName ?? data?.name ?? tenant.name)
      setBranchEditAddress(data?.branchAddress ?? data?.address ?? "")
      setBranchEditRegionId(data?.regionId ?? data?.region ?? "")
      setBranchEditLeadPastorId(data?.leadPastorId ?? "")
      setBranchEditAccountantId(data?.assignedAccountantId ?? "")
      setBranchEditCurrency(data?.currency ?? "")
    } catch (error) {
      // keep existing
      const message = error instanceof Error ? error.message : "Unable to fetch branch details"
      pushToast(message, "error")
    } finally {
      setBranchEditLoading(false)
    }
  }

  const handleBranchEditCancel = () => {
    setEditingBranchId(null)
    setBranchEditTouched({ name: false, address: false, regionId: false })
  }

  const handleBranchEditSave = async () => {
    setBranchEditTouched({
      name: true,
      address: true,
      regionId: true,
    })

    if (
      !branchEditName.trim() ||
      !branchEditAddress.trim() ||
      !branchEditRegionId.trim()
    ) {
      pushToast("Please fill in all required branch fields.", "error")
      return
    }

    if (!editingBranchId) return

    setBranchEditStatus("saving")
    try {
      const optimistic = tenants.find((tenant) => tenant.id === editingBranchId) ?? null
      if (optimistic) {
        setBranchOptimisticBackup(optimistic)
        setTenants((prev) =>
          prev.map((item) =>
            item.id === editingBranchId
              ? {
                  ...item,
                  name: branchEditName.trim(),
                  location: branchEditAddress.trim(),
                }
              : item
          )
        )
      }

      const res = await fetch(`/api/branches/${editingBranchId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: branchEditName.trim() || undefined,
          address: branchEditAddress.trim() || undefined,
          region: branchEditRegionId.trim() || undefined,
          leadPastorId: branchEditLeadPastorId.trim() || undefined,
          assignedAccountantId: branchEditAccountantId.trim() || undefined,
          currency: branchEditCurrency.trim() || undefined,
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to update branch")
      }

      const data = payload?.data ?? payload
      const updated = normalizeTenant(data, 0)
      setTenants((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      pushToast("Branch updated successfully.", "success")
      setEditingBranchId(null)
    } catch (error) {
      if (branchOptimisticBackup) {
        setTenants((prev) => prev.map((item) => (item.id === branchOptimisticBackup.id ? branchOptimisticBackup : item)))
      }
      const message = error instanceof Error ? error.message : "Unable to update branch"
      pushToast(message, "error")
    } finally {
      setBranchEditStatus("idle")
    }
  }

  const handleBranchStatusToggle = async (tenant: TenantCard) => {
    if (branchStatusUpdatingId) return
    const currentStatus = tenant.status.toUpperCase()
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    const optimistic: TenantCard = {
      ...tenant,
      status: nextStatus,
      statusTone: statusStyles[nextStatus]?.tone ?? statusStyles.ACTIVE.tone,
      statusDot: statusStyles[nextStatus]?.dot ?? statusStyles.ACTIVE.dot,
    }

    setBranchStatusUpdatingId(tenant.id)
    setTenants((prev) => prev.map((item) => (item.id === tenant.id ? optimistic : item)))

    try {
      const res = await fetch(`/api/branches/${tenant.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus.toLowerCase() }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to update branch status")
      }

      const data = payload?.data ?? payload
      const updated = normalizeTenant(data, 0)
      setTenants((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      pushToast(`Branch status set to ${updated.status}.`, "success")
    } catch (error) {
      setTenants((prev) => prev.map((item) => (item.id === tenant.id ? tenant : item)))
      const message = error instanceof Error ? error.message : "Unable to update branch status"
      pushToast(message, "error")
    } finally {
      setBranchStatusUpdatingId(null)
    }
  }

  const handleCreateBranch = async () => {
    setBranchTouched({
      name: true,
      address: true,
      region: true,
      branchType: true,
    })

    if (
      !branchName.trim() ||
      !branchAddress.trim() ||
      !branchRegion.trim() ||
      !branchType.trim()
    ) {
      pushToast("Please fill in all required branch fields.", "error")
      return
    }

    setBranchStatus("saving")
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: branchName.trim(),
          branchType,
          region: branchRegion.trim(),
          address: branchAddress.trim(),
          leadPastorId: branchLeadPastorId.trim() || undefined,
          assignedAccountantId: branchAccountantId.trim() || undefined,
          currency: branchCurrency.trim() || undefined,
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to create branch")
      }

      const data = payload?.data ?? payload
      const created = normalizeTenant(data, 0)
      setTenants((prev) => [created, ...prev.filter((item) => item.id !== created.id)])
      pushToast("Branch created successfully.", "success")
      setShowCreateBranch(false)
      setBranchName("")
      setBranchAddress("")
      setBranchRegion("")
      setBranchType("")
      setBranchCurrency("")
      setBranchLeadPastorId("")
      setBranchAccountantId("")
      setBranchTouched({ name: false, address: false, region: false, branchType: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create branch"
      pushToast(message, "error")
    } finally {
      setBranchStatus("idle")
    }
  }

  useEffect(() => {
    if (!showCreateBranch) return
    loadRegionOptions()
  }, [showCreateBranch])

  const loadRegionOptions = async () => {
    if (regionOptionsLoaded) return
    try {
      setRegionOptionsLoading(true)
      const res = await fetch("/api/core/regions?page=1&size=100", { credentials: "include" })
      if (!res.ok) return
      const payload = await res.json()
      const data = Array.isArray(payload?.data)
        ? payload.data
        : payload?.data?.content ?? payload?.data?.items ?? payload?.data ?? payload
      const list = Array.isArray(data) ? data : []
      setBranchRegionOptions(list.map((item: RegionApiItem, index: number) => normalizeRegion(item, index)))
      setRegionOptionsLoaded(true)
    } catch {
      // ignore
    } finally {
      setRegionOptionsLoading(false)
    }
  }

  const handleRegionSelect = async (region: RegionCard) => {
    setSelectedRegion(region)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/core/regions/${region.id}`, { credentials: "include" })
      if (!res.ok) return
      const payload = await res.json()
      const data = payload?.data ?? payload
      const normalized = normalizeRegion(data, 0)
      setSelectedRegion(normalized)
    } catch {
      // keep existing selection
    } finally {
      setDetailLoading(false)
    }
  }

  const handleEditStart = (region: RegionCard) => {
    setEditingRegionId(region.id)
    setEditName(region.name)
    setEditDescription(region.description)
    setEditLocation(region.location)
    setEditRegionStatus(region.status)
    setEditStatus("idle")
    setEditError("")
    setEditTouched({ name: false, description: false, location: false })
    setHasUnsavedChanges(false)
  }

  const handleEditCancel = () => {
    if (hasUnsavedChanges && !window.confirm("Discard unsaved changes?")) {
      return
    }
    setEditingRegionId(null)
    setEditStatus("idle")
    setEditError("")
    setHasUnsavedChanges(false)
  }


  const handleEditSave = async () => {
    const nextTouched = { name: true, description: true, location: true }
    setEditTouched(nextTouched)

    if (!editName.trim() || !editDescription.trim() || !editLocation.trim()) {
      setEditStatus("error")
      setEditError("Please fill in all required fields.")
      return
    }

    if (!editingRegionId) return

    setEditStatus("saving")
    setEditError("")

    const optimisticRegion: RegionCard = {
      id: editingRegionId,
      name: editName.trim(),
      description: editDescription.trim(),
      location: editLocation.trim(),
      status: editRegionStatus,
      statusTone: statusStyles[editRegionStatus]?.tone ?? statusStyles.ACTIVE.tone,
      statusDot: statusStyles[editRegionStatus]?.dot ?? statusStyles.ACTIVE.dot,
    }

    setOptimisticUpdate(optimisticRegion)
    setRegions((prev) => prev.map((item) => (item.id === optimisticRegion.id ? optimisticRegion : item)))
    if (selectedRegion?.id === optimisticRegion.id) {
      setSelectedRegion(optimisticRegion)
    }

    try {
      const res = await fetch(`/api/core/regions/${editingRegionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
          location: editLocation.trim(),
          status: editRegionStatus,
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to update region")
      }

      const data = payload?.data ?? payload
      const updated = normalizeRegion(data, 0)
      setRegions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      if (selectedRegion?.id === updated.id) {
        setSelectedRegion(updated)
      }
      setOptimisticUpdate(null)
      setEditStatus("success")
      setEditingRegionId(null)
      setHasUnsavedChanges(false)
      pushToast("Region updated successfully.", "success")
    } catch (error) {
      if (optimisticUpdate) {
        setRegions((prev) => prev.map((item) => (item.id === optimisticUpdate.id ? optimisticUpdate : item)))
      }
      setOptimisticUpdate(null)
      setEditStatus("error")
      const message = error instanceof Error ? error.message : "Unable to update region"
      setEditError(message)
      pushToast(message, "error")
    }
  }

  const handleToggleStatus = async (region: RegionCard) => {
    if (togglingRegionId) return
    const nextStatus = region.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    const optimistic: RegionCard = {
      ...region,
      status: nextStatus,
      statusTone: statusStyles[nextStatus]?.tone ?? statusStyles.ACTIVE.tone,
      statusDot: statusStyles[nextStatus]?.dot ?? statusStyles.ACTIVE.dot,
    }

    setTogglingRegionId(region.id)
    setRegions((prev) => prev.map((item) => (item.id === region.id ? optimistic : item)))
    if (selectedRegion?.id === region.id) {
      setSelectedRegion(optimistic)
    }

    try {
      const res = await fetch(`/api/core/regions/${region.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to update region status")
      }

      const data = payload?.data ?? payload
      const updated = normalizeRegion(data, 0)
      setRegions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      if (selectedRegion?.id === updated.id) {
        setSelectedRegion(updated)
      }
      pushToast(`Region status set to ${updated.status}.`, "success")
    } catch (error) {
      setRegions((prev) => prev.map((item) => (item.id === region.id ? region : item)))
      if (selectedRegion?.id === region.id) {
        setSelectedRegion(region)
      }
      const message = error instanceof Error ? error.message : "Unable to update region status"
      pushToast(message, "error")
    } finally {
      setTogglingRegionId(null)
    }
  }
  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ""
  }

  const handleCreateRegion = async () => {
    const nextTouched = { name: true, description: true, location: true }
    setCreateTouched(nextTouched)

    if (!createName.trim() || !createDescription.trim() || !createLocation.trim()) {
      setCreateStatus("error")
      setCreateError("Please fill in all required fields.")
      return
    }

    setCreateStatus("saving")
    setCreateError("")

    try {
      const res = await fetch("/api/core/regions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim(),
          location: createLocation.trim(),
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to create region")
      }

      const data = payload?.data ?? payload
      const created = normalizeRegion(data, 0)
      setOptimisticRegion(created)
      setLastCreatedRegionId(created.id)
      setRegions((prev) => [created, ...prev.filter((region) => region.id !== created.id)])
      setCreateStatus("success")
      setCreateName("")
      setCreateDescription("")
      setCreateLocation("")
      setCreateTouched({ name: false, description: false, location: false })
      setShowCreate(false)
      setPage(1)
      setStatusFilter("ALL")
      setNameFilter("")
      setDescriptionFilter("")
      setLocationFilter("")
      setLoading(true)
      setRegions([])
      setTotalItems(null)
      setTotalPages(null)
      pushToast("Region created successfully.", "success")
    } catch (error) {
      setCreateStatus("error")
      const message = error instanceof Error ? error.message : "Unable to create region"
      setCreateError(message)
      pushToast(message, "error")
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/branch-management"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <section className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#111827]">Branch Management &amp; Health</h2>
                <p className="text-[13px] text-[#6B7280] mt-1">
                  Monitor financial status, remittance, and compliance scores across all global branches.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                  onClick={handleFetchTenants}
                >
                  <Building2 className="h-4 w-4" /> Get All Branches
                </Button>
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  <Download className="h-4 w-4" /> Export Report
                </Button>
                <Button
                  className="h-8 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                  onClick={() => setShowCreateBranch((prev) => !prev)}
                >
                  <Plus className="h-4 w-4" /> New Branch
                </Button>
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                  onClick={() => setShowCreate((prev) => !prev)}
                >
                  <Plus className="h-4 w-4" /> New Region
                </Button>
              </div>
            </div>

            {showCreateBranch && (
              <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                <div className="text-[14px] font-bold text-[#111827]">Create New Branch</div>
                <div className={`mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 ${branchEditLoading ? "opacity-70 pointer-events-none" : ""}`}>
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      branchTouched.name && !branchName.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Branch name"
                    value={branchName}
                    onChange={(event) => setBranchName(event.target.value)}
                    onBlur={() => setBranchTouched((prev) => ({ ...prev, name: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      branchTouched.address && !branchAddress.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Branch address"
                    value={branchAddress}
                    onChange={(event) => setBranchAddress(event.target.value)}
                    onBlur={() => setBranchTouched((prev) => ({ ...prev, address: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      branchTouched.region && !branchRegion.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Region"
                    value={branchRegion}
                    onChange={(event) => setBranchRegion(event.target.value)}
                    onBlur={() => setBranchTouched((prev) => ({ ...prev, region: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      branchTouched.branchType && !branchType.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Branch type"
                    value={branchType}
                    onChange={(event) => setBranchType(event.target.value)}
                    onBlur={() => setBranchTouched((prev) => ({ ...prev, branchType: true }))}
                  />
                  <Input
                    className="h-10 rounded-md bg-white text-[12px] text-[#6B7280] border-[#E5E7EB]"
                    placeholder="Currency (optional)"
                    value={branchCurrency}
                    onChange={(event) => setBranchCurrency(event.target.value)}
                  />
                  <Input
                    className="h-10 rounded-md bg-white text-[12px] text-[#6B7280] border-[#E5E7EB]"
                    placeholder="Lead pastor ID (optional)"
                    value={branchLeadPastorId}
                    onChange={(event) => setBranchLeadPastorId(event.target.value)}
                  />
                  <Input
                    className="h-10 rounded-md bg-white text-[12px] text-[#6B7280] border-[#E5E7EB]"
                    placeholder="Accountant ID (optional)"
                    value={branchAccountantId}
                    onChange={(event) => setBranchAccountantId(event.target.value)}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                    onClick={handleCreateBranch}
                    disabled={branchStatus === "saving"}
                  >
                    {branchStatus === "saving" ? "Creating..." : "Create Branch"}
                  </Button>
                  <Button
                    className="h-9 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                    variant="outline"
                    onClick={() => setShowCreateBranch(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {showCreate && (
              <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                <div className="text-[14px] font-bold text-[#111827]">Create New Region</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      createTouched.name && !createName.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Region name"
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                    onBlur={() => setCreateTouched((prev) => ({ ...prev, name: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      createTouched.description && !createDescription.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Description"
                    value={createDescription}
                    onChange={(event) => setCreateDescription(event.target.value)}
                    onBlur={() => setCreateTouched((prev) => ({ ...prev, description: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      createTouched.location && !createLocation.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Location"
                    value={createLocation}
                    onChange={(event) => setCreateLocation(event.target.value)}
                    onBlur={() => setCreateTouched((prev) => ({ ...prev, location: true }))}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                    onClick={handleCreateRegion}
                    disabled={createStatus === "saving"}
                  >
                    {createStatus === "saving" ? "Creating..." : "Create Region"}
                  </Button>
                  <Button
                    className="h-9 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {tenantsLoading && (
              <div className="mt-6 rounded-xl border border-dashed border-[#E5E7EB] bg-white p-6 text-[13px] text-[#6B7280]">
                Loading branches...
              </div>
            )}
            {tenantsError && (
              <div className="mt-6 rounded-xl border border-dashed border-rose-200 bg-rose-50 p-6 text-[13px] text-rose-600">
                {tenantsError}
              </div>
            )}

            {editingRegionId && (
              <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                <div className="text-[14px] font-bold text-[#111827]">Update Region</div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      editTouched.name && !editName.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Region name"
                    value={editName}
                    onChange={(event) => {
                      setEditName(event.target.value)
                      setHasUnsavedChanges(true)
                    }}
                    onBlur={() => setEditTouched((prev) => ({ ...prev, name: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      editTouched.description && !editDescription.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Description"
                    value={editDescription}
                    onChange={(event) => {
                      setEditDescription(event.target.value)
                      setHasUnsavedChanges(true)
                    }}
                    onBlur={() => setEditTouched((prev) => ({ ...prev, description: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      editTouched.location && !editLocation.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Location"
                    value={editLocation}
                    onChange={(event) => {
                      setEditLocation(event.target.value)
                      setHasUnsavedChanges(true)
                    }}
                    onBlur={() => setEditTouched((prev) => ({ ...prev, location: true }))}
                  />
                  <select
                    className="h-10 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#6B7280]"
                    value={editRegionStatus}
                    onChange={(event) => {
                      setEditRegionStatus(event.target.value)
                      setHasUnsavedChanges(true)
                    }}
                  >
                    <option value="ACTIVE">Status: Active</option>
                    <option value="INACTIVE">Status: Inactive</option>
                    <option value="PENDING">Status: Pending</option>
                  </select>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                    onClick={handleEditSave}
                    disabled={editStatus === "saving"}
                  >
                    {editStatus === "saving" ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    className="h-9 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                    variant="outline"
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {branchSummaryLoading && (
                <div className="col-span-full text-[12px] text-[#6B7280]">Loading branch summaries...</div>
              )}
              {branchSummaryError && (
                <div className="col-span-full text-[12px] text-rose-500">{branchSummaryError}</div>
              )}
              {!branchSummaryLoading && !branchSummaryError && statCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-medium text-[#9CA3AF]">{card.title}</div>
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${card.iconBg}`}>
                        <Icon className={`h-4 w-4 ${card.tone}`} />
                      </div>
                    </div>
                    <div className="mt-3 text-[18px] font-bold text-[#111827]">{card.value}</div>
                    <div className={`mt-1 text-[11px] ${card.metaTone}`}>{card.meta}</div>
                  </div>
                )}
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-1 flex-col gap-3 min-w-[240px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input
                    className="h-10 rounded-md border-[#E5E7EB] bg-white pl-9 text-[12px] text-[#6B7280]"
                    placeholder="Search all fields"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Input
                    className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]"
                    placeholder="Name contains..."
                    value={nameFilter}
                    onChange={(event) => {
                      setNameFilter(event.target.value)
                      setPage(1)
                    }}
                  />
                  <Input
                    className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]"
                    placeholder="Description contains..."
                    value={descriptionFilter}
                    onChange={(event) => {
                      setDescriptionFilter(event.target.value)
                      setPage(1)
                    }}
                  />
                  <Input
                    className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]"
                    placeholder="Location contains..."
                    value={locationFilter}
                    onChange={(event) => {
                      setLocationFilter(event.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                >
                  Region: All
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <select
                    className="h-8 rounded-md border border-[#E5E7EB] bg-white pl-3 pr-7 text-[12px] font-medium text-[#4B5563] shadow-sm appearance-none"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value)
                      setPage(1)
                    }}
                  >
                    <option value="ALL">Status: All</option>
                    <option value="ACTIVE">Status: Active</option>
                    <option value="INACTIVE">Status: Inactive</option>
                    <option value="PENDING">Status: Pending</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                >
                  Compliance: &lt; 70
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  <ArrowUpDown className="h-4 w-4" /> Sort: Highest Deficit
                </Button>
                <select
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] font-medium text-[#4B5563] shadow-sm"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setPage(1)
                  }}
                >
                  <option value={6}>6 / page</option>
                  <option value={12}>12 / page</option>
                  <option value={18}>18 / page</option>
                </select>
              </div>
            </div>

            {(searchTerm || nameFilter || descriptionFilter || locationFilter || statusFilter !== "ALL") && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
                {searchTerm && (
                  <button
                    className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[#4B5563]"
                    onClick={() => setSearchTerm("")}
                  >
                    Search: {searchTerm} ×
                  </button>
                )}
                {nameFilter && (
                  <button
                    className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[#4B5563]"
                    onClick={() => setNameFilter("")}
                  >
                    Name: {nameFilter} ×
                  </button>
                )}
                {descriptionFilter && (
                  <button
                    className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[#4B5563]"
                    onClick={() => setDescriptionFilter("")}
                  >
                    Description: {descriptionFilter} ×
                  </button>
                )}
                {locationFilter && (
                  <button
                    className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[#4B5563]"
                    onClick={() => setLocationFilter("")}
                  >
                    Location: {locationFilter} ×
                  </button>
                )}
                {statusFilter !== "ALL" && (
                  <button
                    className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[#4B5563]"
                    onClick={() => setStatusFilter("ALL")}
                  >
                    Status: {statusFilter} ×
                  </button>
                )}
                <button
                  className="rounded-full border border-transparent bg-[#EEF2FF] px-3 py-1 text-[#3B5BDB]"
                  onClick={() => {
                    setSearchTerm("")
                    setNameFilter("")
                    setDescriptionFilter("")
                    setLocationFilter("")
                    setStatusFilter("ALL")
                    setPage(1)
                  }}
                >
                  Clear all
                </button>
              </div>
            )}

            {selectedRegion && (
              <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-bold text-[#111827]">
                      {selectedRegion.name}
                    </div>
                    <div className="text-[12px] text-[#9CA3AF]">ID: {selectedRegion.id}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedRegion.statusTone}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedRegion.statusDot}`} />
                    {selectedRegion.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 text-[12px] text-[#6B7280]">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">Description</div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      {selectedRegion.description}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">Location</div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      {selectedRegion.location}
                    </div>
                  </div>
                </div>
                {detailLoading && (
                  <div className="mt-3 text-[11px] text-[#9CA3AF]">Refreshing region details...</div>
                )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tenants.length === 0 && loading && (
                <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-6 text-[13px] text-[#6B7280]">
                  Loading regions...
                </div>
              )}
              {tenants.length === 0 && !loading && regionCards.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-6 text-[13px] text-[#6B7280]">
                  No regions found.
                </div>
              )}
              {tenants.length > 0 &&
                tenants.map((tenant) => (
                  <div key={tenant.id} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-semibold text-[#111827]">{tenant.name}</div>
                        <div className="text-[11px] text-[#9CA3AF]">ID: {tenant.id}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${tenant.statusTone}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${tenant.statusDot}`} />
                        {tenant.status}
                      </span>
                    </div>
                  <div className="mt-4 text-[11px] text-[#9CA3AF]">
                    Location
                    <div className="text-[13px] font-semibold text-[#111827]">{tenant.location}</div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 h-9 w-full rounded-md text-[12px] font-medium border-[#E5E7EB] bg-white text-[#4B5563]"
                    onClick={() => handleBranchEditStart(tenant)}
                  >
                    Edit Branch
                  </Button>
                  <Button
                    variant="outline"
                    className="mt-2 h-9 w-full rounded-md text-[12px] font-medium border-[#E5E7EB] bg-white text-[#4B5563]"
                    onClick={() => handleBranchStatusToggle(tenant)}
                    disabled={branchStatusUpdatingId === tenant.id}
                  >
                    {branchStatusUpdatingId === tenant.id
                      ? "Updating..."
                      : tenant.status === "ACTIVE"
                        ? "Suspend Branch"
                        : "Activate Branch"}
                  </Button>
                </div>
              ))}
              {tenants.length === 0 &&
                regionCards.map((region) => {
                  const isNew = lastCreatedRegionId === region.id
                  return (
                  <div
                    key={region.id}
                    className={`rounded-xl border bg-white p-5 shadow-sm ${
                      isNew ? "border-emerald-200 ring-1 ring-emerald-100" : "border-[#EEF1F6]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-semibold text-[#111827]">{region.name}</div>
                        <div className="text-[11px] text-[#9CA3AF]">ID: {region.id}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${region.statusTone}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${region.statusDot}`} />
                        {region.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-[#9CA3AF]">
                      <div>
                        <div>Description</div>
                        <div className="text-[13px] font-semibold text-[#111827] line-clamp-2">{region.description}</div>
                      </div>
                      <div>
                        <div>Location</div>
                        <div className="text-[13px] font-semibold text-[#111827]">{region.location}</div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4 h-9 w-full rounded-md text-[12px] font-medium border-[#E5E7EB] bg-white text-[#4B5563]"
                      onClick={() => handleRegionSelect(region)}
                    >
                      Manage Region
                    </Button>
                    <Button
                      variant="outline"
                      className="mt-2 h-9 w-full rounded-md text-[12px] font-medium border-[#E5E7EB] bg-white text-[#4B5563]"
                      onClick={() => handleEditStart(region)}
                    >
                      Edit Region
                    </Button>
                    <Button
                      variant="outline"
                      className="mt-2 h-9 w-full rounded-md text-[12px] font-medium border-[#E5E7EB] bg-white text-[#4B5563]"
                      onClick={() => handleToggleStatus(region)}
                      disabled={togglingRegionId === region.id}
                    >
                      {togglingRegionId === region.id ? "Updating..." : "Toggle Status"}
                    </Button>
                  </div>
                )})}
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center gap-1 rounded-md border border-[#EEF1F6] bg-white px-2 py-1 text-[12px] text-[#6B7280]">
                <button
                  className="px-2 py-1 text-[#9CA3AF]"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  &lt;
                </button>
                <button className="h-7 w-7 rounded bg-[#3B5BDB] text-white">{page}</button>
                <span className="px-1 text-[#9CA3AF]">/</span>
                <button className="h-7 min-w-[28px] rounded">{displayPage}</button>
                <button
                  className="px-2 py-1 text-[#9CA3AF]"
                  onClick={() => setPage((prev) => Math.min(displayPage, prev + 1))}
                  disabled={page >= displayPage}
                >
                  &gt;
                </button>
              </div>
              <div className="ml-4 text-[12px] text-[#9CA3AF]">
                Total: <span className="text-[#111827] font-semibold">{displayTotal}</span>
              </div>
            </div>

            {editingBranchId && (
              <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                <div className="text-[14px] font-bold text-[#111827]">Update Branch</div>
                {branchEditLoading && (
                  <div className="mt-3 text-[12px] text-[#6B7280]">Loading branch details...</div>
                )}
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      branchEditTouched.name && !branchEditName.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Branch name"
                    value={branchEditName}
                    onChange={(event) => setBranchEditName(event.target.value)}
                    onBlur={() => setBranchEditTouched((prev) => ({ ...prev, name: true }))}
                  />
                  <Input
                    className={`h-10 rounded-md bg-white text-[12px] text-[#6B7280] ${
                      branchEditTouched.address && !branchEditAddress.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    placeholder="Branch address"
                    value={branchEditAddress}
                    onChange={(event) => setBranchEditAddress(event.target.value)}
                    onBlur={() => setBranchEditTouched((prev) => ({ ...prev, address: true }))}
                  />
                  <select
                    className="h-10 rounded-md bg-white px-2 text-[12px] text-[#6B7280] border-[#E5E7EB]"
                    value={branchEditCurrency}
                    onChange={(event) => setBranchEditCurrency(event.target.value)}
                  >
                    <option value="">Select currency</option>
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <Input
                    className="h-10 rounded-md bg-white text-[12px] text-[#6B7280] border-[#E5E7EB]"
                    placeholder="Lead Pastor ID (optional)"
                    value={branchEditLeadPastorId}
                    onChange={(event) => setBranchEditLeadPastorId(event.target.value)}
                  />
                  <Input
                    className="h-10 rounded-md bg-white text-[12px] text-[#6B7280] border-[#E5E7EB]"
                    placeholder="Assigned Accountant ID (optional)"
                    value={branchEditAccountantId}
                    onChange={(event) => setBranchEditAccountantId(event.target.value)}
                  />
                  <select
                    className={`h-10 rounded-md bg-white px-2 text-[12px] text-[#6B7280] ${
                      branchEditTouched.regionId && !branchEditRegionId.trim()
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#E5E7EB]"
                    }`}
                    value={branchEditRegionId}
                    onChange={(event) => setBranchEditRegionId(event.target.value)}
                    onBlur={() => setBranchEditTouched((prev) => ({ ...prev, regionId: true }))}
                    onFocus={loadRegionOptions}
                  >
                    <option value="">Select region</option>
                    {branchRegionOptions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                    onClick={handleBranchEditSave}
                    disabled={branchEditStatus === "saving"}
                  >
                    {branchEditStatus === "saving" ? "Saving..." : "Save Branch"}
                  </Button>
                  <Button
                    className="h-9 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                    variant="outline"
                    onClick={handleBranchEditCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}





