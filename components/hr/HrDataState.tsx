"use client"

import { AlertCircle, Inbox, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * The three non-data states every wired HR screen needs.
 *
 * These exist so an empty branch reads as "no records yet" instead of silently
 * rendering the fixture rows these screens used to ship with, and so a failed
 * request says so rather than looking like an empty table.
 */

export function HrLoadingRow({ colSpan, label = "Loading…" }: { colSpan: number; label?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12">
        <div className="flex items-center justify-center gap-2 text-[13px] text-[#6B7280]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {label}
        </div>
      </td>
    </tr>
  )
}

export function HrEmptyRow({
  colSpan,
  title = "Nothing to show yet",
  description,
}: {
  colSpan: number
  title?: string
  description?: string
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <Inbox className="h-5 w-5 text-[#9CA3AF]" />
          <p className="text-[13px] font-bold text-[#111827]">{title}</p>
          {description ? <p className="text-[12px] text-[#6B7280]">{description}</p> : null}
        </div>
      </td>
    </tr>
  )
}

export function HrErrorRow({
  colSpan,
  error,
  onRetry,
}: {
  colSpan: number
  error: unknown
  onRetry?: () => void
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-[13px] font-bold text-[#111827]">Couldn&apos;t load this data</p>
          <p className="text-[12px] text-[#6B7280]">{hrErrorMessage(error)}</p>
          {onRetry ? (
            <button
              onClick={onRetry}
              className="mt-1 rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-bold text-[#111827] hover:bg-[#F9FAFB]"
            >
              Try again
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

/**
 * Picks the right row for a table body, or `null` when real rows should render.
 * Keeps the loading/error/empty precedence identical across every HR table.
 */
export function HrTableState({
  colSpan,
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
}: {
  colSpan: number
  isLoading: boolean
  error: unknown
  isEmpty: boolean
  emptyTitle?: string
  emptyDescription?: string
  onRetry?: () => void
}) {
  if (isLoading) return <HrLoadingRow colSpan={colSpan} />
  if (error) return <HrErrorRow colSpan={colSpan} error={error} onRetry={onRetry} />
  if (isEmpty) {
    return <HrEmptyRow colSpan={colSpan} title={emptyTitle} description={emptyDescription} />
  }
  return null
}

/** Block-level equivalent for card grids and detail panels. */
export function HrPanelState({
  isLoading,
  error,
  isEmpty,
  emptyTitle = "Nothing to show yet",
  emptyDescription,
  onRetry,
  className,
}: {
  isLoading: boolean
  error: unknown
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onRetry?: () => void
  className?: string
}) {
  if (!isLoading && !error && !isEmpty) return null

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-[#EEF1F6] bg-white p-10 text-center",
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-[#6B7280]" />
          <p className="text-[13px] text-[#6B7280]">Loading…</p>
        </>
      ) : error ? (
        <>
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-[13px] font-bold text-[#111827]">Couldn&apos;t load this data</p>
          <p className="text-[12px] text-[#6B7280]">{hrErrorMessage(error)}</p>
          {onRetry ? (
            <button
              onClick={onRetry}
              className="mt-1 rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-bold text-[#111827] hover:bg-[#F9FAFB]"
            >
              Try again
            </button>
          ) : null}
        </>
      ) : (
        <>
          <Inbox className="h-5 w-5 text-[#9CA3AF]" />
          <p className="text-[13px] font-bold text-[#111827]">{emptyTitle}</p>
          {emptyDescription ? (
            <p className="text-[12px] text-[#6B7280]">{emptyDescription}</p>
          ) : null}
        </>
      )}
    </div>
  )
}

/** Inline placeholder for a KPI tile while its request is in flight. */
export function HrStatValue({
  isLoading,
  error,
  value,
}: {
  isLoading: boolean
  error?: unknown
  value: string | number
}) {
  if (isLoading) {
    return <span className="inline-block h-6 w-12 animate-pulse rounded bg-[#F3F4F6]" />
  }
  if (error) return <span className="text-[#9CA3AF]">—</span>
  return <>{value}</>
}

export function hrErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return "Something went wrong. Please try again."
}
