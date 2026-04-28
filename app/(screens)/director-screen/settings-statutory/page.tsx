"use client"

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
    {
      title: "Pension Rate",
      value:
        statutoryConfig?.pensionRate !== undefined ? `${statutoryConfig.pensionRate}%` : "—",
      tone: "text-[#2563EB]",
    },
    {
      title: "Tax Rate",
      value: statutoryConfig?.taxRate !== undefined ? `${statutoryConfig.taxRate}%` : "—",
      tone: "text-[#16A34A]",
    },
    {
      title: "NHF Rate",
      value: statutoryConfig?.nhfRate !== undefined ? `${statutoryConfig.nhfRate}%` : "—",
      tone: "text-[#F59E0B]",
    },
    {
      title: "Savings DNA Rate",
      value:
        statutoryConfig?.savingsDnaRate !== undefined
          ? `${statutoryConfig.savingsDnaRate}%`
          : "—",
      tone: "text-[#7C3AED]",
    },
  ]

  const enforcementActionLabel =
    form.enforcementAction === "warn_only"
      ? "Warn Only"
      : form.enforcementAction === "block_transactions"
        ? "Block Transactions"
        : form.enforcementAction === "require_approval"
          ? "Require Approval"
          : "Not configured"

  const remittanceFrequencyLabel =
    form.remittanceFrequency === "monthly"
      ? "Monthly"
      : form.remittanceFrequency === "quarterly"
        ? "Quarterly"
        : form.remittanceFrequency === "annually"
          ? "Annually"
          : "Not configured"

  useEffect(() => {
    if (!statutoryConfig) return
    const enforcement =
      statutoryConfig.enforcementAction === "block"
        ? "block_transactions"
        : statutoryConfig.enforcementAction === "notify"
          ? "require_approval"
          : statutoryConfig.enforcementAction ?? ""
    const frequency =
      statutoryConfig.remittanceFrequency === "yearly"
        ? "annually"
        : statutoryConfig.remittanceFrequency ?? ""
    setForm({
      pensionRate:
        statutoryConfig.pensionRate !== undefined ? String(statutoryConfig.pensionRate) : "",
      taxRate: statutoryConfig.taxRate !== undefined ? String(statutoryConfig.taxRate) : "",
      nhfRate: statutoryConfig.nhfRate !== undefined ? String(statutoryConfig.nhfRate) : "",
      savingsDnaRate:
        statutoryConfig.savingsDnaRate !== undefined
          ? String(statutoryConfig.savingsDnaRate)
          : "",
      enforcementAction: enforcement,
      remittanceFrequency: frequency,
    })
  }, [statutoryConfig])

  const handleSave = async () => {
    setSaveMessage(null)
    setSaveError(null)

    const pensionRate = Number(form.pensionRate)
    const taxRate = Number(form.taxRate)
    const nhfRate = Number(form.nhfRate)
    const savingsDnaRate = Number(form.savingsDnaRate)

    if (!Number.isFinite(pensionRate)) {
      setSaveError("Pension rate is required.")
      return
    }
    if (!Number.isFinite(taxRate)) {
      setSaveError("Tax rate is required.")
      return
    }
    if (!Number.isFinite(nhfRate)) {
      setSaveError("NHF rate is required.")
      return
    }
    if (!Number.isFinite(savingsDnaRate)) {
      setSaveError("Savings DNA rate is required.")
      return
    }
    if (!form.enforcementAction) {
      setSaveError("Enforcement action is required.")
      return
    }
    if (!form.remittanceFrequency) {
      setSaveError("Remittance frequency is required.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/v1/settings/statutory-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pensionRate,
          taxRate,
          nhfRate,
          savingsDnaRate,
          enforcementAction: form.enforcementAction,
          remittanceFrequency: form.remittanceFrequency,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to save statutory configuration")
      }
      setSaveMessage(data?.message || "Statutory settings updated successfully.")
      refresh()
    } catch (err: any) {
      setSaveError(err.message || "Unable to save statutory configuration")
    } finally {
      setSaving(false)
    }
  }

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
                <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">Global Configuration</div>
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
                      <Settings className="h-4 w-4" />
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
                  These settings are global. Changes here affect statutory deductions and remittance rules immediately.
                </p>
              </div>
            </aside>

            <section className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                    Statutory &amp; Savings DNA Config
                  </h2>
                  <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                    Define the core financial rules, remittance logic, and automated compliance rules
                    applied across the entire branch network.
                  </p>
                  {error ? (
                    <div className="mt-2 text-[12px] text-rose-600 font-[700]">{error}</div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {rateCards.map((card) => (
                  <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                    <div className="flex items-center justify-between text-[12.74px] leading-[16.98px] font-semibold text-[#6B7280]">
                      {card.title}
                    </div>
                    <div className={`mt-3 text-[24px] font-bold ${card.tone}`}>{card.value}</div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-[#EEF1F6]">
                      <div className="h-1.5 w-1/3 rounded-full bg-[#3B5BDB]" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                  <Wallet className="h-4 w-4 text-[#3B5BDB]" />
                  Statutory Rates
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                      Pension Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.pensionRate}
                      onChange={(e) => setForm((prev) => ({ ...prev, pensionRate: e.target.value }))}
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.taxRate}
                      onChange={(e) => setForm((prev) => ({ ...prev, taxRate: e.target.value }))}
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                      NHF Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.nhfRate}
                      onChange={(e) => setForm((prev) => ({ ...prev, nhfRate: e.target.value }))}
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                      Savings DNA Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.savingsDnaRate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, savingsDnaRate: e.target.value }))
                      }
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                  <Wallet className="h-4 w-4 text-[#3B5BDB]" />
                  Remittance &amp; Automation
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                      Remittance Frequency
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, remittanceFrequency: "monthly" }))
                        }
                        className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                          form.remittanceFrequency === "monthly"
                            ? "border-[#DBEAFE] bg-[#EEF2FF] text-[#3B5BDB]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280]"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, remittanceFrequency: "quarterly" }))
                        }
                        className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                          form.remittanceFrequency === "quarterly"
                            ? "border-[#DBEAFE] bg-[#EEF2FF] text-[#3B5BDB]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280]"
                        }`}
                      >
                        Quarterly
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, remittanceFrequency: "annually" }))
                        }
                        className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                          form.remittanceFrequency === "annually"
                            ? "border-[#DBEAFE] bg-[#EEF2FF] text-[#3B5BDB]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280]"
                        }`}
                      >
                        Annually
                      </button>
                    </div>
                    <div className="mt-2 text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                      Selected: {loading ? "Loading..." : remittanceFrequencyLabel}
                    </div>
                  </div>

                  <div>
                    <div className="text-[12.44px] leading-[17.78px] font-bold text-[#6B7280]">
                      Enforcement Action
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, enforcementAction: "warn_only" }))
                        }
                        className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                          form.enforcementAction === "warn_only"
                            ? "border-[#DBEAFE] bg-[#EEF2FF] text-[#3B5BDB]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280]"
                        }`}
                      >
                        Warn Only
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            enforcementAction: "block_transactions",
                          }))
                        }
                        className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                          form.enforcementAction === "block_transactions"
                            ? "border-[#DBEAFE] bg-[#EEF2FF] text-[#3B5BDB]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280]"
                        }`}
                      >
                        Block Transactions
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            enforcementAction: "require_approval",
                          }))
                        }
                        className={`rounded-[10px] border px-3 py-1.5 text-[12.74px] leading-[16.98px] font-semibold ${
                          form.enforcementAction === "require_approval"
                            ? "border-[#DBEAFE] bg-[#EEF2FF] text-[#3B5BDB]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280]"
                        }`}
                      >
                        Require Approval
                      </button>
                    </div>
                    <div className="mt-2 text-[11.68px] leading-[14.6px] font-normal text-[#9CA3AF]">
                      Selected: {loading ? "Loading..." : enforcementActionLabel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
                  <div>
                    <div className="text-[12.74px] leading-[16.98px] font-semibold text-[#92400E]">
                      Caution: Global DNA Changes
                    </div>
                    <p className="mt-1 text-[11.68px] leading-[14.6px] font-normal text-[#A16207]">
                      Updating statutory rates or remittance settings affects all branches immediately and should be coordinated with payroll and compliance teams.
                    </p>
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
                  {saveMessage ? (
                    <div className="text-[12px] text-emerald-600 font-[700]">{saveMessage}</div>
                  ) : null}
                  {saveError ? (
                    <div className="text-[12px] text-rose-600 font-[700]">{saveError}</div>
                  ) : null}
                  <Button size="sm" className="h-8 rounded-[10px]" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Statutory Settings"}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
