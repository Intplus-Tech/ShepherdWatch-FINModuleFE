"use client"

import { cn } from "@/lib/utils"

/* --------------------------------- Badges --------------------------------- */

const EMERALD = new Set([
  "ACTIVE",
  "APPROVED",
  "VERIFIED",
  "DISBURSED",
  "CREDIT",
])
const AMBER = new Set([
  "PENDING",
  "PENDING APPROVAL",
  "IN PROGRESS",
  "ON LEAVE",
  "CURRENTLY REVIEWING",
])
const ROSE = new Set(["REJECTED", "DEBIT", "CLOSED"])
const SLATE = new Set(["COMPLETED", "ASSIGNED", "LONG TERM", "UPCOMING"])

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const key = status.toUpperCase()
  let tone = "bg-slate-100 text-slate-600"
  if (EMERALD.has(key)) tone = "bg-emerald-100 text-emerald-700"
  else if (AMBER.has(key)) tone = "bg-amber-100 text-amber-700"
  else if (ROSE.has(key)) tone = "bg-rose-100 text-rose-700"
  else if (SLATE.has(key)) tone = "bg-slate-100 text-slate-600"
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
        tone,
        className
      )}
    >
      {status}
    </span>
  )
}

/* ------------------------------ Section card ------------------------------ */

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#EEF1F6] bg-white p-5",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeading({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className={cn("text-[16px] font-bold text-[#111827]", className)}>
      {children}
    </h2>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
      {children}
    </div>
  )
}

/* --------------------------------- Fields --------------------------------- */

export function Field({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
        {value}
      </div>
    </div>
  )
}

/* ------------------------------- Stat card -------------------------------- */

export function StatCard({
  label,
  value,
  sub,
  valueClassName,
  children,
  className,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  valueClassName?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#EEF1F6] bg-white p-5",
        className
      )}
    >
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
        {label}
      </div>
      <div className={cn("mt-2 text-[24px] font-bold text-[#111827]", valueClassName)}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-[12px] text-[#6B7280]">{sub}</div> : null}
      {children}
    </div>
  )
}

/* ------------------------------ Progress bar ------------------------------ */

export function ProgressBar({
  percent,
  tone = "blue",
  className,
}: {
  percent: number
  tone?: "blue" | "emerald"
  className?: string
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]", className)}>
      <div
        className={cn(
          "h-full rounded-full",
          tone === "emerald" ? "bg-emerald-500" : "bg-[#3B5BDB]"
        )}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

/* --------------------------------- Table ---------------------------------- */

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]",
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-[13px]", className)}>{children}</td>
}

/* --------------------------------- Buttons -------------------------------- */

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#3149b8]"
export const btnDark =
  "inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-medium text-white hover:bg-black"
export const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]"
export const btnRoseOutline =
  "inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 px-4 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50"
