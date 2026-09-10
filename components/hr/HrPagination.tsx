"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import type { Pagination } from "@/lib/hr/types"
import { cn } from "@/lib/utils"

/**
 * Table footer driven by the backend's pagination block.
 *
 * The HR tables previously hardcoded "Showing 1 - 5 of 124 records" with a
 * fixed 1/2/3/…/25 pager; this renders the real range and only the pages that
 * actually exist.
 */
export function HrPagination({
  pagination,
  page,
  onPageChange,
  itemCount,
  noun = "records",
}: {
  pagination: Pagination | undefined
  page: number
  onPageChange: (page: number) => void
  itemCount: number
  noun?: string
}) {
  const total = pagination?.total ?? itemCount
  const pages = Math.max(1, pagination?.pages ?? 1)
  const limit = pagination?.limit ?? itemCount

  const first = total === 0 ? 0 : (page - 1) * (limit || 1) + 1
  const last = total === 0 ? 0 : Math.min(first + itemCount - 1, total)

  const windowed = pageWindow(page, pages)

  return (
    <div className="flex flex-col gap-3 border-t border-[#EEF1F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-[12px] text-[#6B7280]">
        {total === 0 ? `No ${noun}` : `Showing ${first} - ${last} of ${total} ${noun}`}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {windowed.map((entry, index) =>
            entry === "gap" ? (
              <span key={`gap-${index}`} className="px-1 text-[12px] text-[#9CA3AF]">
                …
              </span>
            ) : (
              <button
                key={entry}
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? "page" : undefined}
                className={cn(
                  "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] font-semibold",
                  entry === page
                    ? "bg-[#111827] text-white"
                    : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]",
                )}
              >
                {entry}
              </button>
            ),
          )}

          <button
            aria-label="Next page"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

/** First, last, and the pages either side of the current one. */
function pageWindow(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)

  const entries: (number | "gap")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pages - 1, page + 1)

  if (start > 2) entries.push("gap")
  for (let i = start; i <= end; i += 1) entries.push(i)
  if (end < pages - 1) entries.push("gap")
  entries.push(pages)

  return entries
}
