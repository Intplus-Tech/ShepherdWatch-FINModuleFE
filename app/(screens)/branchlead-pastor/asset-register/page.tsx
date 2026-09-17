"use client"

import { API_V1 } from "@/lib/api";

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
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
  FolderKanban,
  Settings,
  HelpCircle,
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  User,
  Menu
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"

type AssetRow = {
  id: string
  rawId: string
  title: string
  desc: string
  category: string
  location: string
  status: string
  statusColor: string
  value: string
  selected: boolean
  /** Detail-panel fields, straight from the asset record. */
  cost: number
  bookValue: number
  method: string
  purchaseDate: string
  responsible: string
  attachments: { name: string; uploadedAt: string; url: string }[]
}


export default function AssetRegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const displayName = user?.name || user?.email || "User"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const [activeCategory, setActiveCategory] = useState("All Assets")
  const [assets, setAssets] = useState<AssetRow[]>([])
  const selected = assets.find((a) => a.selected) ?? assets[0] ?? null
  const formatPanelDate = (value: string) => {
    if (!value) return "—"
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount)

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized.includes("operational") || normalized.includes("active")) {
      return "text-emerald-700 bg-emerald-100"
    }
    if (normalized.includes("maintenance") || normalized.includes("service")) {
      return "text-amber-700 bg-amber-100"
    }
    if (normalized.includes("pending") || normalized.includes("disposal")) {
      return "text-rose-700 bg-rose-100"
    }
    return "text-slate-700 bg-slate-100"
  }

  const formatId = (value: string) => value.split("-").join("\n")

  useEffect(() => {
    let isMounted = true

    const fetchAssets = async () => {
      if (!tenantId) {
        setAssets([])
        setAssetsError("Tenant is required to load assets.")
        return
      }

      try {
        setAssetsLoading(true)
        setAssetsError(null)

        const params = new URLSearchParams()
        params.set("tenantId", tenantId)
        const categoryMap: Record<string, string> = {
          "All Assets": "",
          Electronics: "Electronics",
          Vehicles: "Vehicle",
          Furniture: "Furniture",
          "Musical Equipment": "Musical Equipment",
        }
        const categoryParam = categoryMap[activeCategory] ?? activeCategory
        if (categoryParam) {
          params.set("category", categoryParam)
        }

        const response = await fetch(`${API_V1}/financial/fixed-assets?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load assets.")
        }

        const data =
          payload?.data?.content ??
          payload?.data ??
          payload?.content ??
          []
        const mapped = (Array.isArray(data) ? data : []).map((asset, index) => {
          const rawId = asset?.assetCode ?? asset?.assetTag ?? asset?.code ?? asset?.id ?? `ASSET-${index + 1}`
          const title = asset?.name ?? asset?.description ?? asset?.assetName ?? "Unnamed Asset"
          const desc = asset?.description ?? asset?.details ?? ""
          const category = asset?.category ?? "General"
          const location = asset?.location ?? "N/A"
          const status = asset?.status ?? "Active"
          const valueAmount = asset?.currentValue ?? asset?.purchaseValue ?? asset?.value ?? 0

          return {
            id: formatId(String(rawId)),
            rawId: String(rawId),
            title,
            desc,
            category,
            location,
            status,
            statusColor: getStatusColor(String(status)),
            value: formatCurrency(Number(valueAmount) || 0),
            selected: index === 0,
            cost: Number(asset?.cost ?? asset?.purchaseValue ?? asset?.purchaseCost ?? 0) || 0,
            bookValue: Number(asset?.currentBookValue ?? asset?.netBookValue ?? asset?.currentValue ?? asset?.cost ?? 0) || 0,
            method: String(asset?.depreciationMethod ?? "").replace(/_/g, " "),
            purchaseDate: String(asset?.acquisitionDate ?? asset?.purchaseDate ?? ""),
            responsible: String(
              asset?.responsiblePersonId?.firstName
                ? `${asset.responsiblePersonId.firstName} ${asset.responsiblePersonId.lastName ?? ""}`.trim()
                : asset?.custodianId?.firstName
                  ? `${asset.custodianId.firstName} ${asset.custodianId.lastName ?? ""}`.trim()
                  : asset?.responsiblePerson ?? asset?.custodian ?? ""
            ),
            attachments: (Array.isArray(asset?.attachments) ? asset.attachments : [])
              .map((f: Record<string, unknown>) => ({
                name: String(f?.fileName ?? f?.filename ?? f?.name ?? "Attachment"),
                uploadedAt: String(f?.createdAt ?? f?.uploadedAt ?? ""),
                url: String(f?.url ?? ""),
              })),
          } as AssetRow
        })

        if (isMounted) {
          setAssets(mapped)
        }
      } catch (error) {
        if (isMounted) {
          setAssets([])
          setAssetsError(error instanceof Error ? error.message : "Unable to load assets.")
        }
      } finally {
        if (isMounted) {
          setAssetsLoading(false)
        }
      }
    }

    fetchAssets()

    return () => {
      isMounted = false
    }
  }, [activeCategory, tenantId])

  return (
    <div 
      className="min-h-screen bg-[#F7F9FC] text-sm flex overflow-hidden lg:flex-row flex-col"
      style={{ fontFamily: '"Public Sans", sans-serif' }}
    >
      <BranchLeadPastorSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-white lg:bg-[#F7F9FC]">
        {/* Top Header */}
        <header className="shrink-0 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 border-b border-[#EEF1F6] z-20">
          <div className="text-[16px] font-extrabold text-[#111827] flex items-center gap-3 shrink-0">
            <button className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <span className="hidden sm:inline-block">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
            <div className="relative flex-1 sm:flex-none sm:w-[320px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search requisitions..." 
                className="pl-9 h-10 w-full bg-[#F8FAFC] border-transparent focus:border-gray-200 rounded-[10px] text-[13px] shadow-none focus-visible:ring-[#3B5BDB]"
              />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-[10px] bg-white border border-transparent flex items-center justify-center text-gray-400 shadow-sm cursor-pointer hover:bg-gray-50 relative">
              <Bell className="h-5 w-5" />
              <div className="absolute top-2.5 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white" />
            </div>
          </div>
        </header>
        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-[#F7F9FC]">
          <div className="flex flex-col lg:flex-row p-4 sm:p-8 gap-6 xl:gap-8 max-w-[1600px] mx-auto w-full">
            
            {/* Main List Pane */}
            <div className="flex-1 min-w-0 flex flex-col">
              <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[14px] font-bold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors mb-6 w-fit">
                <ArrowLeft className="h-4 w-4 stroke-[2]" />
                Back
              </button>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-[32px] font-extrabold text-[#111827] tracking-tight leading-none">Asset Register</h1>
                  <p className="text-[14px] text-gray-500 mt-2 font-medium">Detailed directory of church properties and equipment.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none">
                  <Button
                    onClick={() => router.push("/branchlead-pastor/depreciation")}
                    className="w-full sm:w-auto bg-[#EF4444] hover:bg-[#DC2626] text-white px-6 h-11 rounded-[8px] font-bold shadow-sm text-[13px]"
                  >
                    Asset Depreciation
                  </Button>
                  <Button
                    onClick={() => router.push("/branchlead-pastor/maintenance")}
                    className="w-full sm:w-auto bg-[#3B5BDB] hover:bg-[#2e4ac0] text-white px-6 h-11 rounded-[8px] font-bold shadow-sm text-[13px]"
                  >
                    Maintenance Schedule
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex justify-start gap-2.5 mb-6 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                {["All Assets", "Electronics", "Vehicles", "Furniture", "Musical Equipment"].map((label) => (
                  <button
                    key={label}
                    onClick={() => setActiveCategory(label)}
                    className={`shrink-0 px-5 h-[38px] rounded-[10px] text-[13px] font-bold transition-colors whitespace-nowrap leading-none pt-0.5 ${
                      activeCategory === label
                        ? "bg-[#3B5BDB] text-white shadow-sm"
                        : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white rounded-[16px] border border-[#EEF1F6] overflow-hidden shadow-[0px_2px_12px_rgba(0,0,0,0.02)]">
                {(assetsLoading || assetsError) && (
                  <div className="px-5 pt-4">
                    {assetsLoading && <p className="text-[12px] font-medium text-[#64748B]">Loading assets...</p>}
                    {assetsError && <p className="text-[12px] font-medium text-[#EF4444]">{assetsError}</p>}
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[750px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#EEF1F6]">
                        <th className="py-5 px-5 pb-4 text-left text-[11px] font-extrabold text-[#64748B] tracking-widest w-[100px] uppercase align-bottom leading-relaxed">ASSET<br/>TAG</th>
                        <th className="py-5 px-5 pb-4 text-left text-[11px] font-extrabold text-[#64748B] tracking-widest w-[200px] uppercase align-bottom">DESCRIPTION</th>
                        <th className="py-5 px-5 pb-4 text-center text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">CATEGORY</th>
                        <th className="py-5 px-5 pb-4 text-center text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">LOCATION</th>
                        <th className="py-5 px-5 pb-4 text-center text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">STATUS</th>
                        <th className="py-5 px-5 pb-4 text-left text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">CURRENT VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((row, i) => (
                        <tr
                          key={i}
                          onClick={() => setAssets((prev) => prev.map((a, j) => ({ ...a, selected: j === i })))}
                          className={`border-b border-[#EEF1F6] last:border-0 transition-colors relative cursor-pointer ${row.selected ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50/50'}`}
                        >
                          <td className="py-6 px-5 align-top relative">
                            {row.selected && (
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#3B5BDB]" />
                            )}
                            <span className={`text-[13px] font-bold leading-relaxed whitespace-pre-line tracking-wide ${row.selected ? 'text-[#3B5BDB]' : 'text-[#64748B]'}`}>
                              {row.id}
                            </span>
                          </td>
                          <td className="py-6 px-5 align-top">
                            <div className="text-[#111827] mb-1.5" style={{ fontWeight: 700, fontSize: '18.31px', lineHeight: '25.63px', verticalAlign: 'middle' }}>{row.title}</div>
                            <div className="text-[#64748B] whitespace-pre-line leading-relaxed text-[12px] max-w-[160px]">{row.desc}</div>
                          </td>
                          <td className="py-6 px-5 align-middle text-center w-[140px]">
                            <span className="bg-[#F1F5F9] text-[#64748B] text-[10px] font-bold px-4 py-1.5 rounded-full inline-block tracking-wide">
                              {row.category}
                            </span>
                          </td>
                          <td className="py-6 px-5 align-middle text-[#64748B] font-medium whitespace-pre-line leading-relaxed text-[13px] text-center w-[140px]">
                            {row.location}
                          </td>
                          <td className="py-6 px-5 align-middle text-center w-[140px]">
                            <span className={`${row.statusColor} text-[10px] font-bold px-4 py-1.5 rounded-[6px] tracking-wide inline-block leading-none`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-6 px-5 align-middle font-extrabold text-[#111827] text-[14px]">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar Details Pane (Card) */}
            <div className="hidden lg:block w-[360px] xl:w-[400px] shrink-0 mt-[44px]">
              <div className="bg-white rounded-[16px] shadow-[0px_2px_24px_rgba(0,0,0,0.03)] border border-[#EEF1F6] p-7 2xl:p-8">
                <div className="flex items-center justify-between mb-8">
                  <span className="bg-[#EEF2FF] text-[#3B5BDB] text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap">
                    ASSET DETAILS
                  </span>
                  <button className="text-[#64748B] hover:text-[#111827] transition-colors p-1 bg-white hover:bg-gray-100 rounded-lg">
                    <X className="h-[22px] w-[22px]" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="mb-8 border-b border-[#EEF1F6] pb-8">
                  <h2 className="text-[28px] xl:text-[32px] font-extrabold text-[#111827] mb-1.5 tracking-tight">{selected?.title ?? "No asset selected"}</h2>
                  <div className="text-[#64748B] font-medium text-[14px] mb-6">{selected?.id ?? "—"}</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[32px] xl:text-[36px] font-extrabold text-[#3B5BDB] tracking-tight">{selected ? formatCurrency(selected.cost) : "—"}</span>
                    
                  </div>
                </div>

                {/* Financial Info */}
                <div className="mb-10">
                  <h3 className="text-[#64748B] text-[11px] font-extrabold tracking-widest mb-5">FINANCIAL INFO</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#64748B] font-medium">Depreciation Method</span>
                      <span className="text-[#111827] font-extrabold capitalize">{selected?.method || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#64748B] font-medium">Purchase Date</span>
                      <span className="text-[#111827] font-extrabold">{formatPanelDate(selected?.purchaseDate ?? "")}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#64748B] font-medium">Book Value</span>
                      <span className="text-[#111827] font-extrabold text-[14px]">{selected ? formatCurrency(selected.bookValue) : "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Responsibility */}
                <div className="mb-10">
                  <h3 className="text-[#64748B] text-[11px] font-extrabold tracking-widest mb-5">RESPONSIBILITY</h3>
                  <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-[12px] border border-[#EEF1F6]">
                    <div className="h-[42px] w-[42px] bg-[#E0E7FF] text-[#4F46E5] rounded-full flex items-center justify-center shrink-0">
                      <User className="h-[20px] w-[20px]" />
                    </div>
                    <span className="font-extrabold text-[#111827] text-[14px]">{selected?.responsible || "Not assigned"}</span>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[#64748B] text-[11px] font-extrabold tracking-widest">ATTACHMENTS</h3>
                    {(selected?.attachments ?? []).length === 0 ? (
                      <div className="text-[12px] text-[#9CA3AF]">No attachments on this asset.</div>
                    ) : (
                      selected!.attachments.map((file, index) => (
                        <a key={index} href={file.url || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[10px] border border-[#EEF1F6] p-3 hover:bg-[#F8FAFC] transition-colors">
                          <FileText className="h-5 w-5 shrink-0 text-[#3B5BDB]" />
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-bold text-[#111827]">{file.name}</div>
                            <div className="text-[10px] text-[#9CA3AF] font-medium">{file.uploadedAt ? `Uploaded ${formatPanelDate(file.uploadedAt)}` : ""}</div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}


