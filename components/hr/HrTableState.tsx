"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { rangeLabel } from "@/lib/hr/display"
import type { HrPagination } from "@/lib/hr/client"

/**
 * The loading / error / empty row every HR table shows in place of its rows,
 * plus the shared pagination footer. Keeps 40-odd tables consistent.
 */
export function HrTableStateRow({
  colSpan,
  loading,
  error,
  isEmpty,
  emptyMessage = "No records match your filters.",
  onRetry,
}: Readonly<{
  colSpan: number
  loading: boolean
  error: string | null
  isEmpty: boolean
  emptyMessage?: string
  onRetry?: () => void
}>) {
  if (!loading && !error && !isEmpty) return null

  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-[13px]">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </span>
        ) : error ? (
          <span className="inline-flex flex-col items-center gap-2 text-rose-600">
            {error}
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md border border-rose-200 px-3 py-1 text-[12px] font-medium text-rose-600 hover:bg-rose-50"
              >
                Try again
              </button>
            ) : null}
          </span>
        ) : (
          <span className="text-[#9CA3AF]">{emptyMessage}</span>
        )}
      </td>
    </tr>
  )
}

/** Page numbers around the current page, capped at five buttons. */
function pageWindow(current: number, pages: number): number[] {
  if (pages <= 5) return Array.from({ length: Math.max(pages, 1) }, (_, index) => index + 1)
  const start = Math.min(Math.max(current - 2, 1), pages - 4)
  return Array.from({ length: 5 }, (_, index) => start + index)
}

export function HrPaginationBar({
  pagination,
  onPageChange,
  noun = "records",
  className,
}: Readonly<{
  pagination: HrPagination
  onPageChange: (page: number) => void
  noun?: string
  className?: string
}>) {
  const { page, limit, total, pages } = pagination
  const lastPage = Math.max(pages, 1)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-[#EEF1F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="text-[12px] text-[#6B7280]">{rangeLabel(page, limit, total, noun)}</div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageWindow(page, lastPage).map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] font-semibold",
              entry === page
                ? "bg-[#111827] text-white"
                : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"
            )}
          >
            {entry}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
