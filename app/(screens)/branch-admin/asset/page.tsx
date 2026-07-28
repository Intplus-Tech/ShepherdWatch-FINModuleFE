"use client"

import { API_V1 } from "@/lib/api";

import React, { useMemo, useState } from "react"
import { Inter } from "next/font/google"
import {
  Wrench,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  ChevronDown,
  Download,
  CreditCard,
  Package,
  FileText,
  Clock,
  MoreVertical,
  Laptop,
  User,
  LayoutGrid,
  PenLine,
  Calendar,
  Truck,
  RefreshCw,
  Trash2,
  Eye,
  SlidersHorizontal,
  UploadCloud,
  Check,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { useAuth } from "@/components/auth/AuthProvider"
import { useAssetOverview, type AssetOverviewItem } from "@/components/hooks/useAssetOverview"
import {
  useAssetMovements,
  useRecordAssetMovement,
  type AssetMovement,
} from "@/components/hooks/useAssetMovements"
import { formatCurrency, formatRelative } from "@/lib/format"
import { ModalShell } from "@/components/ui/modal-shell"
import AssetDetailModal from "@/components/branch-admin/AssetDetailModal"
import EditAssetDetailsModal from "@/components/branch-admin/EditAssetDetailsModal"
import {
  TopUpCashModal,
  UpdateStockModal,
  ScheduleMaintenanceModal,
  FullMovementHistoryModal,
} from "@/components/branch-admin/AssetActionModals"

const inter = Inter({ subsets: ["latin"] })

const currentAssets = [
  {
    assetId: "AS-1024",
    name: "Petty Cash Box",
    category: "Cash Imprest",
    valuation: "₦ 50,000.00",
    condition: "Excellent"
  },
  {
    assetId: "AS-1045",
    name: "Printer Paper Stock (A4)",
    category: "Supplies",
    valuation: "₦ 120,000.00",
    condition: "Good"
  },
  {
    assetId: "AS-1050",
    name: "Cleaning Supplies",
    category: "Supplies",
    valuation: "₦ 35,000.00",
    condition: "Good"
  }
]

const nonCurrentAssets = [
  {
    assetId: "EQ-2041",
    name: "Dell OptiPlex 7090",
    category: "IT Equipment",
    valuation: "₦ 450,000.00",
    condition: "Fair",
    actionType: "Update"
  },
  {
    assetId: "FN-3022",
    name: "Reception Sofa Set",
    category: "Furniture",
    valuation: "₦ 800,000.00",
    condition: "Requires Repair",
    actionType: "Repair"
  },
  {
    assetId: "EQ-2045",
    name: "HVAC Unit - Main Hall",
    category: "Equipment",
    valuation: "₦ 1,200,000.00",
    condition: "Excellent",
    actionType: "None"
  },
  {
    assetId: "FN-3025",
    name: "Executive Desk",
    category: "Furniture",
    valuation: "₦ 250,000.00",
    condition: "Good",
    actionType: "None"
  }
]

const movementLogs = [
  {
    iconType: "printer",
    itemName: "HP LaserJet Pro M404n",
    actionText: "Moved to Front Desk",
    timeText: "2 mins ago • J. Doe",
    iconBg: "bg-blue-50 border-blue-100",
    iconCol: "text-blue-500"
  },
  {
    iconType: "chair",
    itemName: "Meeting Room Chair #4",
    actionText: "Moved to Storage B",
    timeText: "1 hour ago • M. Smith",
    iconBg: "bg-purple-50 border-purple-100",
    iconCol: "text-purple-500"
  },
  {
    iconType: "laptop",
    itemName: 'MacBook Pro 16"',
    actionText: "Assigned to Sarah K.",
    timeText: "Yesterday • Admin",
    iconBg: "bg-indigo-50 border-indigo-100",
    iconCol: "text-indigo-500"
  }
]

// Demo rows for the "All Current Assets" modal (matches Figma)
const allCurrentAssetsDemo = [
  { assetId: "AS-1024", name: "Petty Cash Box", category: "Cash Imprest", location: "Head Office", value: "₦ 50,000.00", status: "Active" },
  { assetId: "AS-1045", name: "Printer Paper Stock (A4)", category: "Supplies", location: "Ikeja Branch", value: "₦ 120,000.00", status: "In Stock" },
  { assetId: "AS-1050", name: "Cleaning Supplies", category: "Supplies", location: "Lekki Branch", value: "₦ 35,000.00", status: "Low Stock" },
  { assetId: "AS-1061", name: "Bank Float Account", category: "Cash Imprest", location: "Head Office", value: "₦ 250,000.00", status: "Active" },
  { assetId: "AS-1072", name: "Toner Cartridges", category: "Supplies", location: "Abuja Branch", value: "₦ 90,000.00", status: "Reserved" },
  { assetId: "AS-1083", name: "First Aid Inventory", category: "Supplies", location: "Lekki Branch", value: "₦ 18,000.00", status: "Critical" },
  { assetId: "AS-1090", name: "Stationery Stock", category: "Supplies", location: "Ikeja Branch", value: "₦ 64,000.00", status: "In Stock" },
]

export default function AssetsHubPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const { user } = useAuth()
  const [creatingAsset, setCreatingAsset] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  // Modal open state
  const [isAllAssetsOpen, setIsAllAssetsOpen] = useState(false)
  const [openAssetMenuId, setOpenAssetMenuId] = useState<string | null>(null)
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isAssetDetailOpen, setIsAssetDetailOpen] = useState(false)
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false)
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isMovementHistoryOpen, setIsMovementHistoryOpen] = useState(false)

  // Export modal selections
  const [exportRegister, setExportRegister] = useState(true)
  const [exportMaintenance, setExportMaintenance] = useState(false)
  const [exportFormat, setExportFormat] = useState<"Excel" | "CSV" | "PDF">("CSV")

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const { items: assetItems, isLoading: assetsLoading } = useAssetOverview({ branchId: tenantId })

  const {
    items: movementItems,
    isLoading: movementsLoading,
    error: movementsError,
  } = useAssetMovements()

  // Asset id targeted by the "Log Movement/Transfer" row action
  const [movementAssetId, setMovementAssetId] = useState<string | null>(null)
  const recordMovement = useRecordAssetMovement(movementAssetId)
  const [movementFeedback, setMovementFeedback] = useState<string | null>(null)

  const handleLogMovement = async (assetId: string) => {
    if (!assetId) return
    setMovementAssetId(assetId)
    setMovementFeedback(null)
    try {
      await recordMovement.mutateAsync({ movementType: "TRANSFER" })
      setMovementFeedback("Movement logged successfully.")
    } catch (err) {
      setMovementFeedback(err instanceof Error ? err.message : "Unable to log movement.")
    }
  }

  // Map backend movements onto the existing Movement Log card shape
  const displayMovementLogs = useMemo(() => {
    if (movementItems.length === 0) return [] as typeof movementLogs
    const palettes = [
      { iconType: "printer", iconBg: "bg-blue-50 border-blue-100", iconCol: "text-blue-500" },
      { iconType: "chair", iconBg: "bg-purple-50 border-purple-100", iconCol: "text-purple-500" },
      { iconType: "laptop", iconBg: "bg-indigo-50 border-indigo-100", iconCol: "text-indigo-500" },
    ]
    return movementItems.slice(0, 8).map((m: AssetMovement, idx) => {
      const palette = palettes[idx % palettes.length]
      const itemName = String(m.assetName ?? m.assetId ?? "Asset")
      const destination = m.toLocation ? `Moved to ${m.toLocation}` : String(m.movementType ?? "Movement recorded")
      const handler = String(m.handledBy ?? m.movedBy ?? "")
      const when = formatRelative(m.movedAt ?? m.createdAt)
      return {
        ...palette,
        itemName,
        actionText: destination,
        timeText: handler ? `${when} • ${handler}` : when,
      }
    })
  }, [movementItems])

  const hasLiveMovements = displayMovementLogs.length > 0
  const movementLogsToRender = hasLiveMovements ? displayMovementLogs : movementLogs

  const { liveCurrentAssets, liveNonCurrentAssets } = useMemo(() => {
    const isCurrent = (cat?: string) => {
      const c = (cat ?? "").toLowerCase()
      return c.includes("cash") || c.includes("supplies") || c.includes("imprest") || c.includes("inventory") || c.includes("stock")
    }
    const mapItem = (item: AssetOverviewItem) => {
      const id = String(item.assetCode ?? item.id ?? item._id ?? "")
      const name = String(item.name ?? item.assetName ?? "Unnamed asset")
      const category = String(item.category ?? "Uncategorized")
      const valueRaw = item.currentValue ?? item.nbv ?? item.value ?? item.purchaseValue ?? item.cost
      const valuation = typeof valueRaw === "number" ? formatCurrency(valueRaw, { currency: "NGN" }) : "\u2014"
      const status = String(item.status ?? "")
      const condition =
        status.toLowerCase() === "active" ? "Good"
        : status.toLowerCase() === "requires_repair" || status.toLowerCase() === "repair" ? "Requires Repair"
        : status.toLowerCase() === "excellent" ? "Excellent"
        : status || "Good"
      return { assetId: id, name, category, valuation, condition, raw: item }
    }
    const current: ReturnType<typeof mapItem>[] = []
    const nonCurrent: (ReturnType<typeof mapItem> & { actionType: string })[] = []
    for (const item of assetItems) {
      const mapped = mapItem(item)
      if (isCurrent(mapped.category)) {
        current.push(mapped)
      } else {
        const actionType =
          mapped.condition === "Requires Repair" ? "Repair"
          : mapped.condition === "Fair" ? "Update"
          : "None"
        nonCurrent.push({ ...mapped, actionType })
      }
    }
    return { liveCurrentAssets: current, liveNonCurrentAssets: nonCurrent }
  }, [assetItems])

  const displayCurrentAssets = liveCurrentAssets.length > 0 ? liveCurrentAssets : currentAssets
  const displayNonCurrentAssets = liveNonCurrentAssets.length > 0 ? liveNonCurrentAssets : nonCurrentAssets

  const handleAssetRowClick = (assetId: string) => {
    if (!assetId) return
    setIsAssetDetailOpen(true)
  }

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleCreateAsset = async () => {
    if (!tenantId) {
      setCreateError("Tenant is required to create a fixed asset.")
      return
    }

    setCreatingAsset(true)
    setCreateError(null)
    setCreateSuccess(null)

    try {
      const csrfToken = getCsrfToken()
      const assetCode = `GEN-${String(Date.now()).slice(-4)}`
      const response = await fetch(`${API_V1}/financial/fixed-assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          assetCode,
          description: "Perkins 150KVA Diesel Generator",
          category: "Machinery",
          location: "Main Church Building",
          status: "ACTIVE",
          purchaseDate: new Date().toISOString(),
          purchaseValue: 8500000,
          currentValue: 8500000,
          depreciationMethod: "STRAIGHT_LINE",
          usefulLifeYears: 10,
          residualValue: 850000,
          tenantId,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to create fixed asset.")
      }

      setCreateSuccess(`Fixed asset ${assetCode} created successfully.`)
      setIsAddAssetOpen(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unable to create fixed asset.")
    } finally {
      setCreatingAsset(false)
    }
  }

  // Status Badge Component
  const ConditionBadge = ({ condition }: { condition: string }) => {
    let classes = ""
    switch (condition) {
      case "Available":
      case "Excellent":
        classes = "border-[#10B981] text-[#10B981] bg-[#ECFDF5]" // Green
        break
      case "Good":
        classes = "border-[#3B82F6] text-[#3B82F6] bg-[#EFF6FF]" // Blue
        break
      case "Fair":
        classes = "border-[#F59E0B] text-[#F59E0B] bg-[#FEF3C7]" // Yellow
        break
      case "Requires Repair":
        classes = "border-[#EF4444] text-[#EF4444] bg-[#FEF2F2]" // Red
        break
      default:
        classes = "border-[#6B7280] text-[#6B7280] bg-[#F3F4F6]" // Gray
    }
    return (
      <span className={`text-[10px] font-[800] uppercase tracking-wider px-2.5 py-1 rounded-[6px] border ${classes}`}>
        {condition}
      </span>
    )
  }

  // Status badge for the All Current Assets modal
  const AssetStatusBadge = ({ status }: { status: string }) => {
    let classes = ""
    switch (status) {
      case "Active":
      case "In Stock":
        classes = "border-[#10B981] text-[#10B981] bg-[#ECFDF5]" // Green
        break
      case "Low Stock":
        classes = "border-[#F59E0B] text-[#F59E0B] bg-[#FEF3C7]" // Amber
        break
      case "Reserved":
        classes = "border-[#3B82F6] text-[#3B82F6] bg-[#EFF6FF]" // Blue
        break
      case "Critical":
        classes = "border-[#EF4444] text-[#EF4444] bg-[#FEF2F2]" // Red
        break
      default:
        classes = "border-[#6B7280] text-[#6B7280] bg-[#F3F4F6]" // Gray
    }
    return (
      <span className={`text-[10px] font-[800] uppercase tracking-wider px-2.5 py-1 rounded-[6px] border ${classes}`}>
        {status}
      </span>
    )
  }

  return (
    <div className={`flex flex-col lg:flex-row min-h-[100dvh] bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <BranchAdminSidebar
        activeHref="/branch-admin/asset"
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">

        {/* Top Header */}
        <header className="h-[64px] sm:h-[73px] bg-white border-b border-[#EEF1F6] flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#4B5563]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1
              className="text-[#111827] hidden sm:block"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "13.33px",
                lineHeight: "18.67px",
                letterSpacing: "0%",
                verticalAlign: "middle",
                width: "71.3501px",
                height: "18.6667px"
              }}
            >
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end">
            <div className="relative w-full max-w-[180px] sm:max-w-[240px] md:max-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 text-[13px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#6B7280] relative">
              <Bell className="h-5 w-5" strokeWidth={2} />
              <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></div>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 pt-3 sm:pt-6 pb-10 sm:pb-12 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-[1440px] flex flex-col gap-6 lg:gap-8">

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div className="max-w-[650px]">
                <h1
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: "24px",
                    letterSpacing: "-0.63px",
                    verticalAlign: "middle"
                  }}
                >
                  Branch Assets & Maintenance Hub
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#6B7280] font-[500] leading-relaxed">
                  Manage inventory, track conditions, and monitor asset movements.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-end w-full sm:w-auto md:ml-auto md:justify-end">
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="h-[36px] sm:h-[44px] px-3 sm:px-6 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center gap-2 text-[11px] sm:text-[14px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm shrink-0 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 text-[#6B7280]" strokeWidth={2.5} />
                  Export Report
                </button>
                <button
                  onClick={() => setIsAddAssetOpen(true)}
                  className="h-[36px] sm:h-[44px] px-3 sm:px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center gap-2 text-[11px] sm:text-[14px] font-[800] text-white transition-colors shadow-sm shrink-0 w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                  Add New Asset
                </button>
              </div>
            </div>
            {(createError || createSuccess) && (
              <div className={`mt-3 rounded-[10px] border px-4 py-2 text-[12px] font-semibold ${createError ? "border-rose-200 bg-rose-50 text-rose-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {createError ?? createSuccess}
              </div>
            )}

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              
              {/* Left Column (Cards 1 and 2) */}
              <div className="contents">
                
                {/* Card 1 */}
                <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-[700] text-[#6B7280]">Total Asset Valuation</span>
                    <div className="h-7 w-7 rounded-[6px] bg-[#EFF6FF] flex items-center justify-center">
                      <CreditCard className="h-3.5 w-3.5 text-[#2563EB]" strokeWidth={2.5}/>
                    </div>
                  </div>
                  <div
                    className="text-[#111827] mb-2 text-[20px] leading-[24px] sm:text-[25.1px] sm:leading-[30.12px]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0%",
                      verticalAlign: "middle"
                    }}
                  >
                    ₦ 45,200,000
                  </div>
                  <div className="text-[12px] font-[700] text-[#10B981] flex items-center gap-1 mt-auto">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    +2.5% from last month
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-[700] text-[#6B7280]">Items Requiring Repair</span>
                    <div className="h-7 w-7 rounded-[6px] bg-[#FFF7ED] flex items-center justify-center">
                      <Wrench className="h-3.5 w-3.5 text-[#F97316]" strokeWidth={2.5}/>
                    </div>
                  </div>
                  <div
                    className="text-[#111827] mb-2 text-[20px] leading-[24px] sm:text-[25.1px] sm:leading-[30.12px]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0%",
                      verticalAlign: "middle"
                    }}
                  >
                    3
                  </div>
                  <div className="text-[12px] font-[700] text-[#F97316] mt-auto">Action Required - Critical</div>
                </div>
              </div>

              {/* Right Column (Card 3) */}
              <div className="contents">
                {/* Card 3 */}
                <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-[700] text-[#6B7280]">Assets Moved (This Month)</span>
                    <div className="h-7 w-7 rounded-[6px] bg-[#F3E8FF] flex items-center justify-center">
                      <Package className="h-3.5 w-3.5 text-[#A855F7]" strokeWidth={2.5}/>
                    </div>
                  </div>
                  <div
                    className="text-[#111827] mb-2 text-[20px] leading-[24px] sm:text-[25.1px] sm:leading-[30.12px]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0%",
                      verticalAlign: "middle"
                    }}
                  >
                    12
                  </div>
                  <div className="text-[12px] font-[600] text-[#9CA3AF] mt-auto">Last movement: 2 mins ago</div>
                </div>
              </div>

            </div>

            {/* Split Main Area */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Left Column (Tables) */}
              <div className="w-full lg:flex-[2] min-w-0 flex flex-col gap-6">

                {/* Current Assets Table */}
                <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm flex flex-col relative overflow-hidden">

                  {/* Table Header */}
                  <div className="p-5 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EEF1F6]">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#9CA3AF] shrink-0" strokeWidth={2.5} />
                      <h2 className="text-[16px] font-[900] text-[#111827] tracking-tight">Current Assets</h2>
                      <span className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-[12px] font-[700] rounded-full hidden sm:block">Supplies & Cash</span>
                    </div>
                    <button onClick={() => setIsAllAssetsOpen(true)} className="text-[13px] font-[800] text-[#2563EB] hover:underline self-end sm:self-auto">View All</button>
                  </div>

                  {/* Table Content */}
                  <div className="w-full overflow-x-auto sm:max-h-[420px] sm:overflow-y-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead>
                        <tr className="border-b border-[#EEF1F6] bg-white">
                          <th className="py-4 px-5 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[35%]">ASSET ID / NAME</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[20%]">CATEGORY</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[20%]">VALUATION</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">CONDITION</th>
                          <th className="py-4 px-5 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[10%] text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEF1F6]">
                        {assetsLoading && liveCurrentAssets.length === 0 && (
                          <tr><td colSpan={5} className="py-6 px-5 text-[12px] text-[#6B7280]">Loading assets\u2026</td></tr>
                        )}
                        {displayCurrentAssets.map((asset, idx) => (
                          <tr
                            key={asset.assetId || idx}
                            onClick={() => handleAssetRowClick(asset.assetId)}
                            className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                          >
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-1">
                                <div className="text-[13px] font-[800] text-[#2563EB]">{asset.assetId}</div>
                                <div className="text-[13px] font-[600] text-[#4B5563]">{asset.name}</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13px] font-[500] text-[#6B7280]">{asset.category}</div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13.5px] font-[800] text-[#111827]">{asset.valuation}</div>
                            </td>
                            <td className="py-4 px-2">
                              <ConditionBadge condition={asset.condition} />
                            </td>
                            <td className="py-4 px-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setOpenActionId(openActionId === asset.assetId ? null : asset.assetId)} className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 rounded-md hover:bg-gray-100 float-right">
                                <MoreVertical className="h-4.5 w-4.5" />
                              </button>
                              {openActionId === asset.assetId && (
                                <div className="absolute right-6 top-6 mt-1 w-[180px] bg-white rounded-[8px] shadow-lg border border-[#EEF1F6] z-50 py-1 overflow-hidden" style={{ textAlign: "left" }}>
                                  <button
                                    onClick={() => { setOpenActionId(null); setIsTopUpOpen(true) }}
                                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 text-[12.5px] font-[600] text-[#4B5563] flex items-center gap-2"
                                  >
                                    <CreditCard className="h-4 w-4 text-[#9CA3AF]" /> Top-up Cash
                                  </button>
                                  <button
                                    onClick={() => { setOpenActionId(null); setIsUpdateStockOpen(true) }}
                                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 text-[12.5px] font-[600] text-[#4B5563] flex items-center gap-2"
                                  >
                                    <LayoutGrid className="h-4 w-4 text-[#9CA3AF]" /> Update Stock Level
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Non-Current Assets Table */}
                <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm flex flex-col relative overflow-hidden">

                  {/* Table Header */}
                  <div className="p-5 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="h-5 w-5 text-[#9CA3AF] shrink-0" strokeWidth={2.5} />
                      <h2 className="text-[16px] font-[900] text-[#111827] tracking-tight">Non-Current Assets</h2>
                      <span className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-[12px] font-[700] rounded-full hidden md:inline-block">Equipment & Furniture</span>
                    </div>

                    <div className="relative w-full sm:w-[180px] shrink-0">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5} />
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="h-[36px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-4 text-[13px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Table Content */}
                  <div className="w-full overflow-x-auto sm:max-h-[420px] sm:overflow-y-auto">
                    <table className="w-full min-w-[750px] text-left">
                      <thead>
                        <tr className="border-b border-[#EEF1F6] bg-white">
                          <th className="py-4 px-5 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[30%]">ASSET ID / NAME</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[20%]">CATEGORY</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">VALUATION</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[20%]">CONDITION</th>
                          <th className="py-4 px-5 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%] text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEF1F6]">
                        {assetsLoading && liveNonCurrentAssets.length === 0 && (
                          <tr><td colSpan={5} className="py-6 px-5 text-[12px] text-[#6B7280]">Loading assets\u2026</td></tr>
                        )}
                        {displayNonCurrentAssets.map((asset, idx) => (
                          <tr
                            key={asset.assetId || idx}
                            onClick={() => handleAssetRowClick(asset.assetId)}
                            className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                          >
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-1">
                                <div className="text-[13px] font-[800] text-[#2563EB]">{asset.assetId}</div>
                                <div className="text-[13px] font-[600] text-[#4B5563]">{asset.name}</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13px] font-[500] text-[#6B7280]">{asset.category}</div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13.5px] font-[800] text-[#111827]">{asset.valuation}</div>
                            </td>
                            <td className="py-4 px-2">
                              <ConditionBadge condition={asset.condition} />
                            </td>
                            <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                              {asset.actionType === "Update" && (
                                <button className="inline-flex items-center gap-1.5 h-[32px] px-3 border border-[#E5E7EB] bg-white text-[12px] font-[800] text-[#4B5563] rounded-[6px] hover:bg-gray-50 transition-colors shadow-sm float-right">
                                  <PenLine className="h-3.5 w-3.5 text-[#6B7280]" strokeWidth={2.5} />
                                  Update
                                </button>
                              )}
                              {asset.actionType === "Repair" && (
                                <button onClick={() => setIsScheduleOpen(true)} className="inline-flex items-center gap-1.5 h-[32px] px-3 border border-[#E5E7EB] bg-white text-[12px] font-[800] text-[#4B5563] rounded-[6px] hover:bg-gray-50 transition-colors shadow-sm float-right">
                                  <Wrench className="h-3.5 w-3.5 text-[#6B7280]" strokeWidth={2.5} />
                                  Repair
                                </button>
                              )}
                              {asset.actionType === "None" && (
                                <div className="relative">
                                  <button onClick={() => setOpenActionId(openActionId === asset.assetId ? null : asset.assetId)} className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 rounded-md hover:bg-gray-100 float-right">
                                    <MoreVertical className="h-4.5 w-4.5" />
                                  </button>
                                  {openActionId === asset.assetId && (
                                    <div className="absolute right-6 top-[20px] mt-1 w-[200px] bg-white rounded-[8px] shadow-xl border border-[#EEF1F6] z-50 py-1.5 overflow-hidden" style={{ textAlign: "left" }}>
                                      <button
                                        onClick={() => { setOpenActionId(null); setIsScheduleOpen(true) }}
                                        className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 text-[12.5px] font-[600] text-[#4B5563] flex items-center gap-2.5"
                                      >
                                        <Calendar className="h-4 w-4 text-[#9CA3AF]" /> Schedule Maintenance
                                      </button>
                                      <button
                                        onClick={() => { setOpenActionId(null); handleLogMovement(asset.assetId) }}
                                        className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 text-[12.5px] font-[600] text-[#4B5563] flex items-center gap-2.5"
                                      >
                                        <Truck className="h-4 w-4 text-[#9CA3AF]" /> Log Movement/Transfer
                                      </button>
                                      <button className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 text-[12.5px] font-[600] text-[#4B5563] flex items-center gap-2.5">
                                        <RefreshCw className="h-4 w-4 text-[#9CA3AF]" /> Revalue Asset
                                      </button>
                                      <button className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 text-[12.5px] font-[600] text-red-500 flex items-center gap-2.5">
                                        <Trash2 className="h-4 w-4 text-red-500" /> Mark for Disposal
                                      </button>
                                      <button className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 text-[12.5px] font-[600] text-[#4B5563] flex items-center gap-2.5">
                                        <Eye className="h-4 w-4 text-[#9CA3AF]" /> View Full Details
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (Movement Log) */}
              <div className="w-full lg:flex-[1] min-w-0">
                <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm flex flex-col w-full h-auto lg:h-[540px] lg:sticky top-[105px]">

                  {/* Log Header */}
                  <div className="p-5 pb-4 flex items-center justify-between border-b border-[#EEF1F6] shrink-0">
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-5 w-5 text-[#9CA3AF]" strokeWidth={2.5} />
                      <h2 className="text-[16px] font-[900] text-[#111827]">Movement Log</h2>
                    </div>
                    <button onClick={() => setIsMovementHistoryOpen(true)} className="text-[13px] font-[800] text-[#2563EB] hover:underline">See All</button>
                  </div>

                  {/* Log Items */}
                  <div className="flex flex-col flex-1 p-5 gap-7 overflow-y-auto">
                    {movementsLoading && !hasLiveMovements && (
                      <div className="text-[12px] font-[600] text-[#6B7280]">Loading movements…</div>
                    )}
                    {!movementsLoading && movementsError && !hasLiveMovements && (
                      <div className="text-[12px] font-[600] text-[#9CA3AF]">Showing recent activity.</div>
                    )}
                    {movementFeedback && (
                      <div className="text-[12px] font-[600] text-[#2563EB]">{movementFeedback}</div>
                    )}
                    {movementLogsToRender.map((log, idx) => {
                      let IconComponent = User;
                      if (log.iconType === "laptop") IconComponent = Laptop;
                      else if (log.iconType === "chair") IconComponent = LayoutGrid;

                      return (
                        <div key={idx} className="flex gap-4 items-start relative">
                          {idx !== movementLogsToRender.length - 1 && (
                            <div className="absolute left-[20px] top-[40px] bottom-[-28px] w-[1.5px] bg-[#EEF1F6] z-0"></div>
                          )}
                          <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full ${log.iconBg} flex items-center justify-center shrink-0 border z-10`}>
                            <IconComponent className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${log.iconCol}`} strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col gap-1 pt-0.5">
                            <div className="text-[13px] font-[800] text-[#111827] leading-tight flex items-center gap-1.5 flex-wrap">
                              {log.itemName}
                            </div>
                            <div className="text-[12px] font-[600] text-[#6B7280]">
                              {log.actionText}
                            </div>
                            <div className="text-[11px] font-[500] text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-[#D1D5DB]"></span> {log.timeText}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Log Footer */}
                  <div className="p-4 border-t border-[#EEF1F6] flex items-center justify-center shrink-0">
                    <button onClick={() => setIsMovementHistoryOpen(true)} className="text-[13px] font-[800] text-[#4B5563] hover:text-[#111827] transition-colors flex items-center gap-1 group">
                      View Full History
                      <ChevronDown className="h-4 w-4 -rotate-90 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* ============ MODAL 1: All Current Assets ============ */}
      <ModalShell open={isAllAssetsOpen} onClose={() => setIsAllAssetsOpen(false)} className="max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[#EEF1F6]">
          <div>
            <h2 className="text-[18px] font-[900] text-[#111827] tracking-tight">All Current Assets</h2>
            <p className="text-[13px] font-[500] text-[#6B7280] mt-1">Detailed view of operational and liquid assets across all branches.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="h-[38px] px-4 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center gap-2 text-[13px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
              <Download className="h-4 w-4 text-[#6B7280]" strokeWidth={2.5} />
              Export
            </button>
            <button
              onClick={() => setIsAllAssetsOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-full text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-5 border-b border-[#EEF1F6]">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5} />
            <input
              type="search"
              placeholder="Search by Asset ID or Name..."
              className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 text-[13px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="h-[40px] px-3.5 rounded-[8px] border border-[#E5E7EB] bg-white flex items-center gap-2 text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
              All Categories
              <ChevronDown className="h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5} />
            </button>
            <button className="h-[40px] px-3.5 rounded-[8px] border border-[#E5E7EB] bg-white flex items-center gap-2 text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
              All Locations
              <ChevronDown className="h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5} />
            </button>
            <button className="h-[40px] px-3.5 rounded-[8px] border border-[#E5E7EB] bg-white flex items-center gap-2 text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-4 w-4 text-[#6B7280]" strokeWidth={2.5} />
              Advanced
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto max-h-[50vh] overflow-y-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-[#EEF1F6]">
                <th className="py-3.5 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF]">Asset Details</th>
                <th className="py-3.5 px-3 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF]">Category</th>
                <th className="py-3.5 px-3 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF]">Location</th>
                <th className="py-3.5 px-3 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF]">Value (₦)</th>
                <th className="py-3.5 px-3 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF]">Status</th>
                <th className="py-3.5 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {allCurrentAssetsDemo.map((row) => (
                <tr key={row.assetId} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-6">
                    <div className="text-[13px] font-[700] text-[#111827]">{row.name}</div>
                    <div className="text-[12px] font-[600] text-[#2563EB] mt-0.5">{row.assetId}</div>
                  </td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-1 bg-[#F3F4F6] text-[#4B5563] text-[11px] font-[700] rounded-full whitespace-nowrap">{row.category}</span>
                  </td>
                  <td className="py-4 px-3 text-[13px] font-[500] text-[#6B7280]">{row.location}</td>
                  <td className="py-4 px-3 text-[13px] font-[800] text-[#111827]">{row.value}</td>
                  <td className="py-4 px-3"><AssetStatusBadge status={row.status} /></td>
                  <td className="py-4 px-6 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        aria-label="Asset actions"
                        onClick={() =>
                          setOpenAssetMenuId((cur) => (cur === row.assetId ? null : row.assetId))
                        }
                        className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4.5 w-4.5" />
                      </button>
                      {openAssetMenuId === row.assetId && (
                        <>
                          <button
                            type="button"
                            aria-label="Close menu"
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setOpenAssetMenuId(null)}
                          />
                          <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-[10px] border border-[#EEF1F6] bg-white py-1 text-left shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                            <button
                              type="button"
                              onClick={() => setOpenAssetMenuId(null)}
                              className="block w-full px-4 py-2.5 text-left text-[12px] font-[600] text-[#374151] hover:bg-[#F9FAFB]"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenAssetMenuId(null)}
                              className="block w-full px-4 py-2.5 text-left text-[12px] font-[600] text-[#374151] hover:bg-[#F9FAFB]"
                            >
                              Edit Asset
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenAssetMenuId(null)}
                              className="block w-full px-4 py-2.5 text-left text-[12px] font-[600] text-[#374151] hover:bg-[#F9FAFB]"
                            >
                              Move / Transfer
                            </button>
                            <div className="my-1 border-t border-[#EEF1F6]" />
                            <button
                              type="button"
                              onClick={() => setOpenAssetMenuId(null)}
                              className="block w-full px-4 py-2.5 text-left text-[12px] font-[600] text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-[#EEF1F6]">
          <div className="text-[13px] font-[600] text-[#6B7280]">Showing 1 to 7 of 42 results</div>
          <div className="flex items-center gap-2">
            <button className="h-[36px] px-4 rounded-[8px] border border-[#E5E7EB] bg-white text-[13px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors">Previous</button>
            <button className="h-[36px] px-4 rounded-[8px] border border-[#E5E7EB] bg-white text-[13px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </ModalShell>

      {/* ============ MODAL 2: Add New Asset ============ */}
      <ModalShell open={isAddAssetOpen} onClose={() => setIsAddAssetOpen(false)} className="max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[#EEF1F6]">
          <div>
            <h2 className="text-[18px] font-[900] text-[#111827] tracking-tight">Add New Asset</h2>
            <p className="text-[13px] font-[500] text-[#6B7280] mt-1">Enter details for the new inventory item.</p>
          </div>
          <button
            onClick={() => setIsAddAssetOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-full text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827] transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[800] text-[#374151]">Asset Type</label>
              <div className="relative">
                <select className="h-[42px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-3.5 pr-9 text-[13px] font-[600] text-[#111827] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all">
                  <option>Current Asset (Cash/Supplies)</option>
                  <option>Non-Current Asset (Equipment)</option>
                  <option>Non-Current Asset (Furniture)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[800] text-[#374151]">Category</label>
              <div className="relative">
                <select className="h-[42px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-3.5 pr-9 text-[13px] font-[600] text-[#111827] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all">
                  <option>Cash Imprest</option>
                  <option>Supplies</option>
                  <option>IT Equipment</option>
                  <option>Furniture</option>
                  <option>Machinery</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-[800] text-[#374151]">Asset Name / Description</label>
              <input
                type="text"
                placeholder="e.g. Dell OptiPlex 7090 Desktop"
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] font-[600] text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-[500] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-[800] text-[#374151]">Serial Number</label>
              <input
                type="text"
                placeholder="e.g. SN-0099283"
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] font-[600] text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-[500] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-[800] text-[#374151]">Technical Specifications</label>
              <textarea
                rows={3}
                placeholder="Enter technical details, dimensions, capacity, etc."
                className="w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-[13px] font-[600] text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-[500] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-[800] text-[#374151]">Responsible</label>
              <input
                type="text"
                placeholder="Who is responsible for this asset"
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] font-[600] text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-[500] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[800] text-[#374151]">Acquisition Date</label>
              <input
                type="date"
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] font-[600] text-[#111827] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[800] text-[#374151]">Cost (₦)</label>
              <input
                type="number"
                placeholder="0.00"
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] font-[600] text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-[500] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-[800] text-[#374151]">Initial Condition</label>
              <div className="relative">
                <select className="h-[42px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-3.5 pr-9 text-[13px] font-[600] text-[#111827] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all">
                  <option>Brand New</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Requires Repair</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] pointer-events-none" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-[800] text-[#374151]">Receipt / Proof of Purchase</label>
              <label className="flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-7 cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 transition-colors text-center">
                <UploadCloud className="h-7 w-7 text-[#9CA3AF]" strokeWidth={2} />
                <div className="text-[13px] font-[700] text-[#4B5563]">
                  <span className="text-[#2563EB]">Click to upload</span> or drag and drop
                </div>
                <div className="text-[11px] font-[500] text-[#9CA3AF]">SVG, PNG, JPG or PDF (MAX. 5MB)</div>
                <input type="file" accept=".svg,.png,.jpg,.jpeg,.pdf" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#EEF1F6]">
          <button
            onClick={() => setIsAddAssetOpen(false)}
            className="h-[42px] px-5 rounded-[8px] border border-[#E5E7EB] bg-white text-[13px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAsset}
            disabled={creatingAsset}
            className="h-[42px] px-5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-[13px] font-[800] text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creatingAsset ? "Saving..." : "Save Asset"}
          </button>
        </div>
      </ModalShell>

      {/* ============ MODAL 3: Export Assets ============ */}
      <ModalShell open={isExportOpen} onClose={() => setIsExportOpen(false)} className="max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[#EEF1F6]">
          <div>
            <h2 className="text-[18px] font-[900] text-[#111827] tracking-tight">Export Assets</h2>
            <p className="text-[13px] font-[500] text-[#6B7280] mt-1">Select data to include in your report.</p>
          </div>
          <button
            onClick={() => setIsExportOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-full text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827] transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Data Selection */}
          <div className="flex flex-col gap-3">
            <div className="text-[12px] font-[900] text-[#374151] uppercase tracking-wider">Data Selection</div>
            <button
              type="button"
              onClick={() => setExportRegister((v) => !v)}
              className={`flex items-center gap-3 w-full text-left rounded-[10px] border p-3.5 transition-colors ${exportRegister ? "border-[#2563EB] bg-[#EFF6FF]/50" : "border-[#E5E7EB] bg-white hover:bg-gray-50"}`}
            >
              <span className={`h-5 w-5 rounded-[6px] border flex items-center justify-center shrink-0 ${exportRegister ? "bg-[#2563EB] border-[#2563EB]" : "bg-white border-[#D1D5DB]"}`}>
                {exportRegister && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </span>
              <span>
                <span className="block text-[13px] font-[800] text-[#111827]">Asset Register</span>
                <span className="block text-[12px] font-[500] text-[#6B7280] mt-0.5">Complete list including current valuations</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setExportMaintenance((v) => !v)}
              className={`flex items-center gap-3 w-full text-left rounded-[10px] border p-3.5 transition-colors ${exportMaintenance ? "border-[#2563EB] bg-[#EFF6FF]/50" : "border-[#E5E7EB] bg-white hover:bg-gray-50"}`}
            >
              <span className={`h-5 w-5 rounded-[6px] border flex items-center justify-center shrink-0 ${exportMaintenance ? "bg-[#2563EB] border-[#2563EB]" : "bg-white border-[#D1D5DB]"}`}>
                {exportMaintenance && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </span>
              <span>
                <span className="block text-[13px] font-[800] text-[#111827]">Maintenance History</span>
                <span className="block text-[12px] font-[500] text-[#6B7280] mt-0.5">Repair logs and condition updates</span>
              </span>
            </button>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-2">
            <div className="text-[12px] font-[900] text-[#374151] uppercase tracking-wider">Date Range</div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] font-[600] text-[#111827] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
              <input
                type="date"
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] font-[600] text-[#111827] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Export Format */}
          <div className="flex flex-col gap-2">
            <div className="text-[12px] font-[900] text-[#374151] uppercase tracking-wider">Export Format</div>
            <div className="grid grid-cols-3 gap-1 rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6] p-1">
              {(["Excel", "CSV", "PDF"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`h-[38px] rounded-[8px] text-[13px] font-[800] transition-colors ${exportFormat === fmt ? "bg-white text-[#2563EB] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"}`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#EEF1F6]">
          <button
            onClick={() => setIsExportOpen(false)}
            className="h-[42px] px-5 rounded-[8px] border border-[#E5E7EB] bg-white text-[13px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setIsExportOpen(false)}
            className="h-[42px] px-5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-[13px] font-[800] text-white transition-colors shadow-sm flex items-center gap-2"
          >
            <Download className="h-4 w-4" strokeWidth={2.5} />
            Export Report
          </button>
        </div>
      </ModalShell>

      {/* Asset detail + edit */}
      <AssetDetailModal
        open={isAssetDetailOpen}
        onClose={() => setIsAssetDetailOpen(false)}
        onEdit={() => {
          setIsAssetDetailOpen(false)
          setIsEditAssetOpen(true)
        }}
      />
      <EditAssetDetailsModal open={isEditAssetOpen} onClose={() => setIsEditAssetOpen(false)} />

      {/* Asset action modals */}
      <TopUpCashModal open={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <UpdateStockModal open={isUpdateStockOpen} onClose={() => setIsUpdateStockOpen(false)} />
      <ScheduleMaintenanceModal open={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      <FullMovementHistoryModal open={isMovementHistoryOpen} onClose={() => setIsMovementHistoryOpen(false)} />
    </div>
  )
}


