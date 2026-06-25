"use client"

import Link from "next/link"
import { Info, ShieldCheck, Wallet, Boxes } from "lucide-react"

/**
 * Shared "SUPER ADMIN / Global Configuration" sub-navigation used across the
 * director settings screens (Budget, Asset, Statutory & Savings DNA, ...).
 *
 * Replaces the previously duplicated inline <button> lists that did not
 * actually navigate between the settings pages.
 */

export type SettingsConfigKey =
  | "budget"
  | "asset"
  | "statutory"
  | "departmental"
  | "audit"
  | "permissions"

type NavItem = {
  key: SettingsConfigKey
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { key: "budget", label: "Budget", href: "/director-screen/settings", icon: Wallet },
  { key: "asset", label: "Asset", href: "/director-screen/settings-asset", icon: Boxes },
  {
    key: "statutory",
    label: "Statutory & Savings DNA",
    href: "/director-screen/settings-statutory",
    icon: ShieldCheck,
  },
]

export default function SettingsConfigSidebar({
  active,
  note = "These settings are global. Changes here affect all department budgets and fiscal cycles immediately.",
  items = NAV_ITEMS,
}: Readonly<{
  active: SettingsConfigKey
  note?: string
  items?: NavItem[]
}>) {
  return (
    <aside className="space-y-4">
      <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
        <div className="text-[12.74px] leading-[16.98px] font-bold uppercase tracking-[1.27px] text-[#9CA3AF]">
          SUPER ADMIN
        </div>
        <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">
          Global Configuration
        </div>
        <div className="mt-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.key === active
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-[14.86px] leading-[21.23px] transition-colors ${
                  isActive
                    ? "bg-[#E9EEFF] text-[#3B5BDB] font-bold"
                    : "text-[#6B7280] font-medium hover:bg-[#F3F5F9]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-4">
        <div className="flex items-center gap-2 text-[10px] font-medium text-[#2563EB]">
          <Info className="h-3.5 w-3.5" />
          Director&apos;s Note
        </div>
        <p className="mt-2 text-[9px] text-[#6B7280]">{note}</p>
      </div>
    </aside>
  )
}
