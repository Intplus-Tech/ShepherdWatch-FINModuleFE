"use client"

import { API_V1 } from "@/lib/api";

import { useEffect, useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { ModalShell } from "@/components/ui/modal-shell"
import {
  AlertTriangle,
  ArrowUpDown,
  Ban,
  Banknote,
  Building2,
  Calculator,
  ChevronDown,
  Download,
  History,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  X,
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
  country?: string
  branchType?: string
  averageIncome?: number | string
  currency?: string
  residentPastor?: string
  leadPastorName?: string
  email?: string
  contactEmail?: string
}

type TenantCard = {
  id: string
  name: string
  location: string
  status: string
  statusTone: string
  statusDot: string
  branchType: string
  averageIncome: string
  residentPastor: string
  email: string
}

type UserApiItem = {
  _id?: string
  id?: string
  firstName?: string
  lastName?: string
  name?: string
  fullName?: string
  email?: string
  role?: string
  roleName?: string
  status?: string
}

type UserOption = {
  id: string
  name: string
  email: string
  role: string
}

const normalizeTenant = (tenant: TenantApiItem, index: number): TenantCard => {
  const name = tenant.branchName ?? tenant.name ?? `Branch ${index + 1}`
  const location = tenant.location ?? tenant.country ?? "Location not specified"
  const statusRaw = (tenant.status ?? "ACTIVE").toUpperCase()
  const statusStyle = statusStyles[statusRaw] ?? statusStyles.ACTIVE

  const averageIncomeRaw = tenant.averageIncome
  let averageIncome = "—"
  if (averageIncomeRaw !== undefined && averageIncomeRaw !== null && `${averageIncomeRaw}`.trim() !== "") {
    const numeric = Number(averageIncomeRaw)
    averageIncome = Number.isFinite(numeric)
      ? `${tenant.currency ? `${tenant.currency} ` : ""}${numeric.toLocaleString()}`
      : `${averageIncomeRaw}`
  }

  return {
    id: tenant._id ?? tenant.tenantId ?? tenant.id ?? `${index + 1}`,
    name,
    location,
    status: statusRaw,
    statusTone: statusStyle.tone,
    statusDot: statusStyle.dot,
    branchType: tenant.branchType?.trim() || "—",
    averageIncome,
    residentPastor: tenant.residentPastor?.trim() || tenant.leadPastorName?.trim() || "—",
    email: tenant.email?.trim() || tenant.contactEmail?.trim() || "—",
  }
}
const statusStyles: Record<string, { tone: string; dot: string }> = {
  ACTIVE: { tone: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  INACTIVE: { tone: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
  PENDING: { tone: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  REVIEW: { tone: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  SUSPENDED: { tone: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
  ONBOARDING: { tone: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
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

const extractApiList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return []

  const source = payload as Record<string, unknown>
  const data = source.data as Record<string, unknown> | unknown[] | undefined
  const candidates = [
    source.data,
    data && typeof data === "object" && !Array.isArray(data) ? data.data : undefined,
    data && typeof data === "object" && !Array.isArray(data) ? data.content : undefined,
    data && typeof data === "object" && !Array.isArray(data) ? data.items : undefined,
    source.content,
    source.items,
    source.users,
  ]

  return candidates.find((candidate): candidate is unknown[] => Array.isArray(candidate)) ?? []
}

const normalizeUserOption = (user: UserApiItem, index: number): UserOption | null => {
  const id = String(user._id ?? user.id ?? "").trim()
  if (!id) return null

  const firstName = String(user.firstName ?? "").trim()
  const lastName = String(user.lastName ?? "").trim()
  const fallbackName = `${firstName} ${lastName}`.trim()
  const email = String(user.email ?? "").trim()
  const name = String(user.fullName ?? user.name ?? fallbackName ?? email ?? `User ${index + 1}`).trim()
  const role = String(user.roleName ?? user.role ?? "").trim()

  return {
    id,
    name: name || email || `User ${index + 1}`,
    email,
    role,
  }
}

const isLeadPastorOption = (user: UserOption) => user.role.toLowerCase().includes("pastor")

const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value.trim())

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
  const [showRegionsModal, setShowRegionsModal] = useState(false)
  const [showAddRegion, setShowAddRegion] = useState(false)
  const [deletingRegionId, setDeletingRegionId] = useState<string | null>(null)
  const { pushToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [descriptionFilter, setDescriptionFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [regionFilter, setRegionFilter] = useState("ALL")
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
  const [branchCode, setBranchCode] = useState("")
  const [branchAddress, setBranchAddress] = useState("")
  const [branchRegion, setBranchRegion] = useState("")
  const [branchType, setBranchType] = useState("")
  const [branchCurrency, setBranchCurrency] = useState("")
  const [branchLeadPastorId, setBranchLeadPastorId] = useState("")
  const [branchAccountantId, setBranchAccountantId] = useState("")
  const [branchRegionOptions, setBranchRegionOptions] = useState<RegionCard[]>([])
  const [regionOptionsLoaded, setRegionOptionsLoaded] = useState(false)
  const [regionOptionsLoading, setRegionOptionsLoading] = useState(false)
  const [leadPastorOptions, setLeadPastorOptions] = useState<UserOption[]>([])
  const [leadPastorOptionsLoaded, setLeadPastorOptionsLoaded] = useState(false)
  const [leadPastorOptionsLoading, setLeadPastorOptionsLoading] = useState(false)
  const [branchTouched, setBranchTouched] = useState({
    name: false,
    code: false,
    address: false,
    region: false,
    branchType: false,
  })
  const [branchStatus, setBranchStatus] = useState<"idle" | "saving">("idle")
  const [viewBranch, setViewBranch] = useState<TenantCard | null>(null)
  const [viewBranchOpen, setViewBranchOpen] = useState(false)
  const [viewTab, setViewTab] = useState<"details" | "personnel">("details")
  const [viewEditMode, setViewEditMode] = useState(false)
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false)

  const handleViewBranchOpen = (tenant: TenantCard) => {
    setViewBranch(tenant)
    setViewTab("details")
    setViewEditMode(false)
    setViewBranchOpen(true)
  }

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

        const res = await fetch(`${API_V1}/regions?${params.toString()}`, {
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

  const regionFilterOptions = useMemo(() => {
    const fallback = ["Nigeria", "United Kingdom", "Japan", "Brazil", "UAE", "Canada"]
    const fromTenants = tenants
      .map((tenant) => tenant.location?.trim())
      .filter((value): value is string => Boolean(value) && value !== "—")
    const distinct = Array.from(new Set([...fromTenants, ...fallback]))
    return ["ALL", ...distinct]
  }, [tenants])

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const statusMatch =
        statusFilter === "ALL" ||
        tenant.status.toLowerCase() === statusFilter.toLowerCase()
      const regionMatch =
        regionFilter === "ALL" ||
        tenant.location.toLowerCase().includes(regionFilter.toLowerCase())
      return statusMatch && regionMatch
    })
  }, [tenants, statusFilter, regionFilter])

  const handleFetchTenants = async (silent = false) => {
    setTenantsLoading(true)
    setTenantsError("")
    try {
      const res = await fetch(`${API_V1}/branches`, { credentials: "include" })
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
      if (!silent) pushToast("Branches loaded.", "success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch branches"
      setTenantsError(message)
      if (!silent) pushToast(message, "error")
    } finally {
      setTenantsLoading(false)
    }
  }

  // Branches load automatically on mount (the manual "Get All Branches" button
  // was removed).
  useEffect(() => {
    void handleFetchTenants(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDeleteRegion = async (region: RegionCard) => {
    if (deletingRegionId) return
    if (typeof window !== "undefined" && !window.confirm(`Delete region "${region.name}"?`)) {
      return
    }
    setDeletingRegionId(region.id)
    try {
      const res = await fetch(`${API_V1}/regions/${region.id}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": getCsrfToken() },
        credentials: "include",
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.message ?? "Unable to delete region")
      }
      setRegions((prev) => prev.filter((item) => item.id !== region.id))
      pushToast("Region deleted successfully.", "success")
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to delete region", "error")
    } finally {
      setDeletingRegionId(null)
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
      const res = await fetch(`${API_V1}/branches/${tenant.id}`, { credentials: "include" })
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

      const res = await fetch(`${API_V1}/branches/${editingBranchId}`, {
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
      const res = await fetch(`${API_V1}/branches/${tenant.id}/status`, {
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
      code: true,
      address: true,
      region: true,
      branchType: true,
    })

    if (!branchName.trim()) {
      pushToast("Branch name is required.", "error")
      return
    }

    const leadPastorId = branchLeadPastorId.trim()
    const assignedAccountantId = branchAccountantId.trim()
    if (leadPastorId && !isMongoObjectId(leadPastorId)) {
      pushToast("Lead pastor ID must be a valid 24-character ID.", "error")
      return
    }
    if (assignedAccountantId && !isMongoObjectId(assignedAccountantId)) {
      pushToast("Accountant ID must be a valid 24-character ID.", "error")
      return
    }

    setBranchStatus("saving")
    try {
      const res = await fetch(`${API_V1}/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: branchName.trim(),
          code: branchCode.trim() || undefined,
          branchType,
          region: branchRegion.trim(),
          address: branchAddress.trim() || undefined,
          leadPastorId: leadPastorId || undefined,
          assignedAccountantId: assignedAccountantId || undefined,
          currency: branchCurrency || undefined,
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
      setBranchCode("")
      setBranchAddress("")
      setBranchRegion("")
      setBranchType("")
      setBranchCurrency("")
      setBranchLeadPastorId("")
      setBranchAccountantId("")
      setBranchTouched({ name: false, code: false, address: false, region: false, branchType: false })
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
    loadLeadPastorOptions()
  }, [showCreateBranch])

  const loadRegionOptions = async () => {
    if (regionOptionsLoaded) return
    try {
      setRegionOptionsLoading(true)
      const res = await fetch(`${API_V1}/regions?page=1&size=100`, { credentials: "include" })
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

  const loadLeadPastorOptions = async () => {
    if (leadPastorOptionsLoaded) return
    try {
      setLeadPastorOptionsLoading(true)
      const params = new URLSearchParams({ page: "1", limit: "100", status: "active" })
      const res = await fetch(`${API_V1}/users?${params.toString()}`, { credentials: "include" })
      if (!res.ok) return
      const payload = await res.json()
      const options = extractApiList(payload)
        .map((item, index) => normalizeUserOption(item as UserApiItem, index))
        .filter((item): item is UserOption => Boolean(item))
        .filter(isLeadPastorOption)

      setLeadPastorOptions(options)
      setLeadPastorOptionsLoaded(true)
    } catch {
      // ignore
    } finally {
      setLeadPastorOptionsLoading(false)
    }
  }

  const handleRegionSelect = async (region: RegionCard) => {
    setSelectedRegion(region)
    setDetailLoading(true)
    try {
      const res = await fetch(`${API_V1}/regions/${region.id}`, { credentials: "include" })
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
      const res = await fetch(`${API_V1}/regions/${editingRegionId}`, {
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
      const res = await fetch(`${API_V1}/regions/${region.id}`, {
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
      const res = await fetch(`${API_V1}/regions`, {
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
      setBranchRegionOptions((prev) => [created, ...prev.filter((region) => region.id !== created.id)])
      setRegionOptionsLoaded(true)
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
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  <Download className="h-4 w-4" /> Export Report
                </Button>
                <Button
                  className="h-8 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                  onClick={() => setShowCreateBranch(true)}
                >
                  <Plus className="h-4 w-4" /> New Branch
                </Button>
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                  onClick={() => setShowRegionsModal(true)}
                >
                  <Plus className="h-4 w-4" /> Regions
                </Button>
              </div>
            </div>

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
              <div className="flex flex-wrap items-center gap-2 lg:self-start">
                <div className="relative">
                  <select
                    aria-label="Filter by region"
                    className="h-10 rounded-md border border-[#E5E7EB] bg-white pl-3 pr-7 text-[12px] font-medium text-[#4B5563] shadow-sm appearance-none"
                    value={regionFilter}
                    onChange={(event) => {
                      setRegionFilter(event.target.value)
                      setPage(1)
                    }}
                  >
                    {regionFilterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "ALL" ? "Region: All" : `Region: ${option}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
                <div className="relative">
                  <select
                    aria-label="Filter by status"
                    className="h-10 rounded-md border border-[#E5E7EB] bg-white pl-3 pr-7 text-[12px] font-medium text-[#4B5563] shadow-sm appearance-none"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value)
                      setPage(1)
                    }}
                  >
                    <option value="ALL">Status: All</option>
                    <option value="ACTIVE">Status: Active</option>
                    <option value="REVIEW">Status: Review</option>
                    <option value="SUSPENDED">Status: Suspended</option>
                    <option value="ONBOARDING">Status: Onboarding</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
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

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              {tenants.length > 0 && filteredTenants.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-6 text-[13px] text-[#6B7280]">
                  No branches match the selected filters.
                </div>
              )}
              {tenants.length > 0 &&
                filteredTenants.map((tenant) => {
                  const statusLabel =
                    tenant.status.charAt(0) + tenant.status.slice(1).toLowerCase()
                  return (
                    <div
                      key={tenant.id}
                      className="flex flex-col rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[14px] font-bold text-[#111827]">{tenant.name}</div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tenant.statusTone}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${tenant.statusDot}`} />
                          {statusLabel}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-[#9CA3AF]">
                        ID: {tenant.id} • {tenant.location}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <div className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                            Branch Type
                          </div>
                          <div className="mt-0.5 text-[13px] font-semibold capitalize text-[#111827]">
                            {tenant.branchType}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                            Average Income
                          </div>
                          <div className="mt-0.5 text-[13px] font-semibold text-[#111827]">
                            {tenant.averageIncome}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                            Resident Pastor
                          </div>
                          <div className="mt-0.5 text-[13px] font-semibold text-[#111827]">
                            {tenant.residentPastor}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                            Email
                          </div>
                          <div className="mt-0.5 truncate text-[13px] font-semibold text-[#111827]">
                            {tenant.email}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="mt-5 h-9 w-full rounded-md border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563]"
                        onClick={() => handleViewBranchOpen(tenant)}
                      >
                        Manage
                      </Button>
                    </div>
                  )
                })}
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

            <div className="mt-6 text-center text-[12px] text-[#9CA3AF]">
              Total branches: <span className="font-semibold text-[#111827]">{displayTotal}</span>
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
                    <option value="CAD">CAD</option>
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

      <ModalShell
        open={showRegionsModal}
        onClose={() => setShowRegionsModal(false)}
        className="max-w-3xl"
      >
        <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">Manage Regions</h2>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              All regions across the organization.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRegionsModal(false)}
            aria-label="Close"
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EEF1F6] text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[13px] text-[#9CA3AF]">
                    No regions found.
                  </td>
                </tr>
              ) : (
                regions.map((region) => (
                  <tr key={region.id} className="border-b border-[#F3F5F9] text-[13px] text-[#374151]">
                    <td className="py-3 pr-3 font-semibold text-[#111827]">{region.name}</td>
                    <td className="py-3 pr-3 text-[#6B7280]">{region.location || "—"}</td>
                    <td className="py-3 pr-3 text-[#6B7280]">{region.description || "—"}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          aria-label="Edit region"
                          onClick={() => {
                            handleEditStart(region)
                            setShowRegionsModal(false)
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] p-1.5 text-[#3B5BDB] hover:bg-[#EEF2FF]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete region"
                          onClick={() => handleDeleteRegion(region)}
                          disabled={deletingRegionId === region.id}
                          className="inline-flex items-center justify-center rounded-md border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showCreate && (
          <div className="border-t border-[#EEF1F6] bg-[#F8FAFC] px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#111827]">Add Region</h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                aria-label="Close add region"
                className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-[12px] font-medium text-[#374151]">Name</label>
                <Input
                  className="mt-1 h-10 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                  placeholder="e.g. Southwest Region"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#374151]">Location</label>
                <Input
                  className="mt-1 h-10 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                  placeholder="e.g. Lagos"
                  value={createLocation}
                  onChange={(event) => setCreateLocation(event.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[12px] font-medium text-[#374151]">Description</label>
                <Input
                  className="mt-1 h-10 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                  placeholder="Briefly describe the fund's purpose"
                  value={createDescription}
                  onChange={(event) => setCreateDescription(event.target.value)}
                />
              </div>
            </div>
            {createError && <div className="mt-2 text-[12px] text-rose-600">{createError}</div>}
            <div className="mt-3 flex justify-end">
              <Button
                className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                onClick={handleCreateRegion}
                disabled={createStatus === "saving"}
              >
                {createStatus === "saving" ? "Adding..." : "Add Region"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-6 py-3">
          <Button
            className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
            onClick={() => setShowCreate((v) => !v)}
          >
            <Plus className="h-4 w-4" /> Add Region
          </Button>
          <button
            type="button"
            onClick={() => {
              setShowCreate(false)
              setShowRegionsModal(false)
            }}
            className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </ModalShell>

      <ModalShell
        open={showCreateBranch}
        onClose={() => setShowCreateBranch(false)}
        className="max-w-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">New Branch Onboarding</h2>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              Initialize a new branch entity in the registry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateBranch(false)}
            aria-label="Close"
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-[12px] font-medium text-[#374151]">Branch Name</label>
              <Input
                className={`mt-1 h-10 rounded-md bg-white text-[12px] text-[#111827] ${
                  branchTouched.name && !branchName.trim()
                    ? "border-rose-300 focus-visible:ring-rose-200"
                    : "border-[#E5E7EB]"
                }`}
                placeholder="Enter branch name"
                value={branchName}
                onChange={(event) => setBranchName(event.target.value)}
                onBlur={() => setBranchTouched((prev) => ({ ...prev, name: true }))}
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#374151]">Assigned Lead Pastor <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
              <select
                aria-label="Assigned Lead Pastor"
                className="mt-1 h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827]"
                value={branchLeadPastorId}
                onChange={(event) => setBranchLeadPastorId(event.target.value)}
                disabled={leadPastorOptionsLoading}
              >
                <option value="">
                  {leadPastorOptionsLoading ? "Loading lead pastors..." : "Select lead pastor"}
                </option>
                {!leadPastorOptionsLoading && leadPastorOptionsLoaded && leadPastorOptions.length === 0 && (
                  <option value="" disabled>
                    No lead pastors found
                  </option>
                )}
                {leadPastorOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}{user.email ? ` - ${user.email}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#374151]">Assigned Accountant <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
              <Input
                className="mt-1 h-10 rounded-md bg-white text-[12px] text-[#111827] border-[#E5E7EB]"
                placeholder="Accountant ID"
                value={branchAccountantId}
                onChange={(event) => setBranchAccountantId(event.target.value)}
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#374151]">Region <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
              <select
                aria-label="Region"
                className="mt-1 h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827]"
                value={branchRegion}
                onChange={(event) => {
                  if (event.target.value === "__add_new__") {
                    setShowAddRegion(true)
                    return
                  }
                  setBranchRegion(event.target.value)
                }}
                disabled={regionOptionsLoading}
              >
                <option value="">
                  {regionOptionsLoading ? "Loading regions..." : "Select region"}
                </option>
                {branchRegionOptions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
                <option value="__add_new__">+ Add New</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#374151]">Currency</label>
              <select
                aria-label="Currency"
                className="mt-1 h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827]"
                value={branchCurrency}
                onChange={(event) => setBranchCurrency(event.target.value)}
              >
                <option value="">Select currency</option>
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            <div className="md:col-span-2 rounded-[10px] border border-[#EEF1F6] bg-[#F8FAFC] p-3.5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#111827]">
                <Banknote className="h-4 w-4 text-[#3B5BDB]" />
                Mandatory Statutory Deductions
              </div>
              <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                Set default remittance percentages for this branch.
              </p>
              <label className="mt-3 block text-[11px] font-medium text-[#6B7280]">
                Select the most appropriate
              </label>
              <select
                aria-label="Mandatory Statutory Deductions"
                className="mt-1 h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827]"
                value={branchType}
                onChange={(event) => setBranchType(event.target.value)}
              >
                <option value="">Select tier</option>
                <option value="pioneer">Pioneer</option>
                <option value="growing">Growing</option>
                <option value="established">Established</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#EEF1F6] px-6 py-3">
          <button
            type="button"
            onClick={() => setShowCreateBranch(false)}
            className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            Cancel
          </button>
          <Button
            className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
            onClick={handleCreateBranch}
            disabled={branchStatus === "saving"}
          >
            {branchStatus === "saving" ? "Creating..." : "Create Branch"}
          </Button>
        </div>
      </ModalShell>

      <ModalShell open={showAddRegion} onClose={() => setShowAddRegion(false)} className="max-w-lg">
        <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-4">
          <h2 className="text-[16px] font-bold text-[#111827]">Add Region</h2>
          <button
            type="button"
            onClick={() => setShowAddRegion(false)}
            aria-label="Close"
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-5">
          <div>
            <label className="text-[12px] font-medium text-[#374151]">Name</label>
            <Input
              className="mt-1 h-10 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
              placeholder="e.g. Southwest Region"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#374151]">Location</label>
            <Input
              className="mt-1 h-10 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
              placeholder="e.g. Lagos"
              value={createLocation}
              onChange={(event) => setCreateLocation(event.target.value)}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#374151]">Description</label>
            <Input
              className="mt-1 h-10 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
              placeholder="Briefly describe the fund's purpose"
              value={createDescription}
              onChange={(event) => setCreateDescription(event.target.value)}
            />
          </div>
          {createError && <div className="text-[12px] text-rose-600">{createError}</div>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#EEF1F6] px-6 py-3">
          <button
            type="button"
            onClick={() => setShowAddRegion(false)}
            className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            Cancel
          </button>
          <Button
            className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
            onClick={handleCreateRegion}
            disabled={createStatus === "saving"}
          >
            {createStatus === "saving" ? "Adding..." : "Add Region"}
          </Button>
        </div>
      </ModalShell>

      <ModalShell
        open={viewBranchOpen}
        onClose={() => setViewBranchOpen(false)}
        className="max-w-3xl"
      >
        {viewBranch && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-4">
              <h2 className="text-[15px] font-bold text-[#111827]">
                VIEW BRANCH - {viewBranch.name.toUpperCase()} ({viewBranch.id})
              </h2>
              <button
                type="button"
                onClick={() => setViewBranchOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
              {/* Sub-row: status / type / region */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#6B7280]">Branch Status:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${viewBranch.statusTone}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${viewBranch.statusDot}`} />
                    {viewBranch.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#6B7280]">Branch Type:</span>
                  <span className="font-medium capitalize text-[#111827]">
                    {viewBranch.branchType !== "—" ? viewBranch.branchType : "Growing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#6B7280]">Region:</span>
                  <span className="font-medium text-[#111827]">
                    {viewBranch.location !== "Location not specified" ? viewBranch.location : "Nigeria"}
                  </span>
                </div>
              </div>

              {/* Info card */}
              <div className="mt-4 grid grid-cols-2 gap-4 rounded-[10px] border border-[#EEF1F6] bg-[#F8FAFC] p-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Branch Established
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#111827]">Oct 20, 2024</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Age
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#3B5BDB]">
                    12 Years, 4 Months
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-5 flex items-center gap-6 border-b border-[#EEF1F6]">
                <button
                  type="button"
                  onClick={() => setViewTab("details")}
                  className={`-mb-px border-b-2 pb-2.5 text-[13px] font-semibold ${
                    viewTab === "details"
                      ? "border-[#3B5BDB] text-[#3B5BDB]"
                      : "border-transparent text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Branch Details
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("personnel")}
                  className={`-mb-px border-b-2 pb-2.5 text-[13px] font-semibold ${
                    viewTab === "personnel"
                      ? "border-[#3B5BDB] text-[#3B5BDB]"
                      : "border-transparent text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Personnel
                </button>
              </div>

              {/* Tab 1: Branch Details */}
              {viewTab === "details" && (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {(() => {
                    const fieldClass = viewEditMode
                      ? "mt-1 h-10 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      : "mt-1 h-10 rounded-md border-[#E5E7EB] bg-[#F8FAFC] text-[12px] text-[#6B7280]"
                    return (
                      <>
                        <div>
                          <label className="text-[12px] font-medium text-[#374151]">Branch Name</label>
                          <Input className={fieldClass} readOnly={!viewEditMode} defaultValue={viewBranch.name} />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-[#374151]">Region</label>
                          <Input
                            className={fieldClass}
                            readOnly={!viewEditMode}
                            defaultValue={
                              viewBranch.location !== "Location not specified" ? viewBranch.location : "Nigeria"
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-[#374151]">Branch Type</label>
                          <Input
                            className={fieldClass}
                            readOnly={!viewEditMode}
                            defaultValue={viewBranch.branchType !== "—" ? viewBranch.branchType : "Growing"}
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-[#374151]">Currency</label>
                          <Input className={fieldClass} readOnly={!viewEditMode} defaultValue="NGN ₦" />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-[#374151]">Email</label>
                          <Input
                            className={fieldClass}
                            readOnly={!viewEditMode}
                            defaultValue={
                              viewBranch.email !== "—" ? viewBranch.email : "branch@shepherdwatch.org"
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-[#374151]">Phone</label>
                          <Input className={fieldClass} readOnly={!viewEditMode} defaultValue="+234 801 234 5678" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[12px] font-medium text-[#374151]">Address</label>
                          <Input
                            className={fieldClass}
                            readOnly={!viewEditMode}
                            defaultValue="12 Adeyemi Crescent, Ikeja, Lagos, Nigeria"
                          />
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Tab 2: Personnel */}
              {viewTab === "personnel" && (
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-[#111827]">
                      <Users className="h-4 w-4 text-[#3B5BDB]" />
                      Current Personnel
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Active Staff (3)
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { icon: User, role: "Pastor", name: "Rev. Victor Adeyemi", started: "Jan 2020" },
                      { icon: Calculator, role: "Accountant", name: "John Adeyemi", started: "Mar 2022" },
                      { icon: Shield, role: "Admin", name: "Sarah Musa", started: "June 2021" },
                    ].map((person) => {
                      const Icon = person.icon
                      return (
                        <div
                          key={person.name}
                          className="rounded-[10px] border border-[#EEF1F6] bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E9EEFF]">
                              <Icon className="h-4 w-4 text-[#3B5BDB]" />
                            </div>
                            <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#3B5BDB]">
                              {person.role}
                            </span>
                          </div>
                          <div className="mt-3 text-[13px] font-bold text-[#111827]">{person.name}</div>
                          <div className="mt-0.5 text-[11px] text-[#9CA3AF]">Started: {person.started}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-[#111827]">
                    <History className="h-4 w-4 text-[#6B7280]" />
                    Personnel History
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#EEF1F6] bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                          <th className="px-4 py-2.5">Role</th>
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Tenure</th>
                          <th className="px-4 py-2.5">Departure Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { role: "Admin", dot: "bg-amber-500", name: "Michael Chen", tenure: "2019 — 2021", reason: "Relocated" },
                          { role: "Pastor", dot: "bg-[#3B5BDB]", name: "Pastor Samuel Adebayo", tenure: "2011 — 2015", reason: "Retired" },
                          { role: "Accountant", dot: "bg-emerald-500", name: "Deborah Martins", tenure: "2014 — 2018", reason: "Transferred to HQ" },
                          { role: "Admin", dot: "bg-amber-500", name: "James Wilson", tenure: "2016 — 2019", reason: "Resigned" },
                        ].map((row) => (
                          <tr key={row.name} className="border-b border-[#F3F5F9] text-[12px] text-[#374151] last:border-0">
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} />
                                {row.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#111827]">{row.name}</td>
                            <td className="px-4 py-3 text-[#6B7280]">{row.tenure}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#4B5563]">
                                {row.reason}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#EEF1F6] px-6 py-3">
              <button
                type="button"
                onClick={() => setDeactivateConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-600 hover:text-rose-700"
              >
                <Ban className="h-4 w-4" />
                Deactivate Branch
              </button>
              {viewEditMode ? (
                <Button
                  className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                  onClick={() => setViewEditMode(false)}
                >
                  <Pencil className="h-4 w-4" /> Update Branch
                </Button>
              ) : (
                <Button
                  className="h-9 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
                  onClick={() => setViewEditMode(true)}
                >
                  <Pencil className="h-4 w-4" /> Edit Branch
                </Button>
              )}
            </div>
          </>
        )}
      </ModalShell>

      <ModalShell
        open={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        className="max-w-lg"
      >
        <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </span>
            <h2 className="text-[15px] font-bold text-[#111827]">DEACTIVATE BRANCH</h2>
          </div>
          <button
            type="button"
            onClick={() => setDeactivateConfirmOpen(false)}
            aria-label="Close"
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-[13px] leading-relaxed text-[#374151]">
            Are you sure you want to deactivate the {viewBranch?.name ?? "branch"} ({viewBranch?.id ?? "—"})?
            This will restrict all branch users from accessing the system and halt all financial processing for
            this location.
          </p>
          <div className="mt-4 rounded-md border-l-4 border-[#3B5BDB] bg-[#EEF2FF] px-4 py-3 text-[12px] text-[#3B5BDB]">
            This action can be reversed by a Director from the Branch Management portal.
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#EEF1F6] px-6 py-3">
          <button
            type="button"
            onClick={() => setDeactivateConfirmOpen(false)}
            className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            CANCEL
          </button>
          <Button
            className="h-9 rounded-md bg-rose-600 text-[12px] font-medium text-white shadow hover:bg-rose-700"
            onClick={() => {
              if (viewBranch) {
                void handleBranchStatusToggle(viewBranch)
              }
              setDeactivateConfirmOpen(false)
            }}
          >
            <Ban className="h-4 w-4" /> DEACTIVATE BRANCH
          </Button>
        </div>
      </ModalShell>

    </div>
  )
}





