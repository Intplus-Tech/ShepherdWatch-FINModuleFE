"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * Lightweight modal shell: a blurred, dimmed full-screen backdrop with a
 * centered panel. Closes on Escape and on backdrop click, and locks body
 * scroll while open.
 */
export function ModalShell({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm supports-[backdrop-filter]:bg-black/30 sm:py-10"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-2xl rounded-[12px] border border-[#EEF1F6] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
