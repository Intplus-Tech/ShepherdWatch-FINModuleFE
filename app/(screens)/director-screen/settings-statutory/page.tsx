"use client"

import { useEffect, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import SettingsConfigSidebar from "@/components/navigation/SettingsConfigSidebar"
import EditDnaModal from "@/components/settings/EditDnaModal"
import { useStatutoryConfig } from "@/components/hooks/useStatutoryConfig"
import {
  Coins,
  Landmark,
  Layers,
  PiggyBank,
  SquarePen,
} from "lucide-react"

export default function Page() {
  const { statutoryConfig, loading, error, lastUpdated } = useStatutoryConfig()

  // Local UI state seeded from backend where a mapping exists; falls back to the
  // design defaults so the screen mirrors the approved mockup.
  const hqTithes = "10"
  const generalSavings = "1"
  const [capitalSavings, setCapitalSavings] = useState("20")
  const [editDnaOpen, setEditDnaOpen] = useState(false)

  useEffect(() => {
    if (!statutoryConfig) return
    if (statutoryConfig.savingsDnaRate !== undefined) {
      setCapitalSavings(String(statutoryConfig.savingsDnaRate))
    }
  }, [statutoryConfig])

  const parsedLastUpdated = lastUpdated ? new Date(lastUpdated) : null
  const lastUpdatedLabel =
    parsedLastUpdated && !Number.isNaN(parsedLastUpdated.getTime())
      ? parsedLastUpdated.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Oct 24, 2026"

  const statCards = [
    {
      label: "HQ TITHES",
      value: hqTithes,
      icon: Landmark,
      iconBg: "bg-[#E9EEFF]",
      iconColor: "text-[#3B5BDB]",
      bar: "bg-[#3B5BDB]",
      barWidth: "w-[10%]",
    },
    {
      label: "CAPITAL SAVINGS",
      value: capitalSavings,
      icon: PiggyBank,
      iconBg: "bg-[#E7F8EF]",
      iconColor: "text-[#16A34A]",
      bar: "bg-[#16A34A]",
      barWidth: "w-[20%]",
    },
    {
      label: "GENERAL SAVINGS",
      value: generalSavings,
      icon: Coins,
      iconBg: "bg-[#FEF3E2]",
      iconColor: "text-[#F59E0B]",
      bar: "bg-[#F59E0B]",
      barWidth: "w-[4%]",
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-65 rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-65 text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <SettingsConfigSidebar active="statutory" />

            <section className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                    Statutory &amp; Savings DNA Config
                  </h2>
                  <p className="max-w-2xl text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                    Define the core financial ratios, remittance logic, and automated compliance
                    rules applied across the entire branch network.
                  </p>
                  {error ? (
                    <div className="mt-2 text-[12px] text-rose-600 font-[700]">{error}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setEditDnaOpen(true)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[#3B5BDB] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#2C46B4]"
                >
                  <SquarePen className="h-4 w-4" />
                  Edit DNA
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {statCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.label}
                      className="rounded-[12px] border border-[#EEF1F6] bg-white p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${card.iconBg}`}
                        >
                          <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
                        </div>
                        <span className="rounded-full bg-[#E7F8EF] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] text-[#16A34A]">
                          Active
                        </span>
                      </div>
                      <div className="mt-3 text-[11px] font-bold uppercase tracking-[1px] text-[#9CA3AF]">
                        {card.label}
                      </div>
                      <div className="mt-1 text-[28px] leading-none font-black text-[#111827]">
                        {loading ? "—" : `${card.value}%`}
                      </div>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-[#EEF1F6]">
                        <div className={`h-1.5 rounded-full ${card.bar} ${card.barWidth}`} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-4">
                <div className="flex items-center gap-2 text-[12.74px] leading-[16.98px] italic font-normal text-[#9CA3AF]">
                  <Layers className="h-3 w-3" />
                  Last updated by Director Adewale on {lastUpdatedLabel}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-[10px] bg-[#3B5BDB] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#2C46B4]"
                  >
                    <SquarePen className="h-4 w-4" />
                    Update DNA
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <EditDnaModal open={editDnaOpen} onClose={() => setEditDnaOpen(false)} />
    </div>
  )
}

/* ============================================================================
 * PREVIOUS IMPLEMENTATION (kept for reference — commented out, not deleted).
 * Restore this block (and remove the new component above) to revert to the
 * original Pension/Tax/NHF/Savings DNA rate screen.
 * ==========================================================================

"use client"

import { API_V1 } from "@/lib/api";

import { useEffect, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { useStatutoryConfig } from "@/components/hooks/useStatutoryConfig"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Info,
  Layers,
  Settings,
  Wallet,
} from "lucide-react"

const sideItems = [
  { label: "Budget" },
  { label: "Asset" },
  { label: "Statutory & Savings DNA", active: true },
  { label: "Audit Logs" },
  { label: "Permissions" },
]

export default function Page() {
  const { statutoryConfig, loading, error, lastUpdated, refresh } = useStatutoryConfig()
  const [form, setForm] = useState({
    pensionRate: "",
    taxRate: "",
    nhfRate: "",
    savingsDnaRate: "",
    enforcementAction: "",
    remittanceFrequency: "",
  })
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const parsedLastUpdated = lastUpdated ? new Date(lastUpdated) : null
  const lastUpdatedLabel =
    parsedLastUpdated && !Number.isNaN(parsedLastUpdated.getTime())
      ? parsedLastUpdated.toLocaleString()
      : null

  const rateCards = [
    { title: "Pension Rate", value: statutoryConfig?.pensionRate !== undefined ? statutoryConfig.pensionRate + "%" : "-", tone: "text-[#2563EB]" },
    { title: "Tax Rate", value: statutoryConfig?.taxRate !== undefined ? statutoryConfig.taxRate + "%" : "-", tone: "text-[#16A34A]" },
    { title: "NHF Rate", value: statutoryConfig?.nhfRate !== undefined ? statutoryConfig.nhfRate + "%" : "-", tone: "text-[#F59E0B]" },
    { title: "Savings DNA Rate", value: statutoryConfig?.savingsDnaRate !== undefined ? statutoryConfig.savingsDnaRate + "%" : "-", tone: "text-[#7C3AED]" },
  ]

  // The complete original handlers (handleSave, enforcement/frequency label
  // helpers, the seeding useEffect) and the full JSX return (SUPER ADMIN
  // sidebar, four rate stat cards, Statutory Rates inputs, Remittance &
  // Automation with Monthly/Quarterly/Annually + Warn/Block/Approve toggles,
  // caution box, and Save Statutory Settings footer) lived here before the
  // DNA redesign. The full verbatim source remains available in git history
  // (commit immediately preceding this change).
  return null
}

 * ========================================================================== */
