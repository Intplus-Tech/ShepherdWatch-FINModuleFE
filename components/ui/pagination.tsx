"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-[#EEF0F2] px-1 pt-3 text-[12px] text-[#6B7280]",
        className,
      )}
    >
      <div>
        Showing <span className="font-medium text-[#111827]">{start}-{end}</span> of{" "}
        <span className="font-medium text-[#111827]">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(safePage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span>
          Page <span className="font-medium text-[#111827]">{safePage}</span> / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => canNext && onPageChange(safePage + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
