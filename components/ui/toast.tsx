"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"

export type ToastItem = {
  id: string
  type: "success" | "error" | "info"
  message: string
}

type ToastContextValue = {
  pushToast: (message: string, type: ToastItem["type"]) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = useCallback((message: string, type: ToastItem["type"]) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ pushToast, dismissToast }), [pushToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onClose={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return ctx
}

type ToastProps = {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

function ToastStack({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem
  onClose: (id: string) => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-[12px] font-medium shadow-sm transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
      } ${
        toast.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : toast.type === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-[#E5E7EB] bg-white text-[#4B5563]"
      }`}
    >
      <div className="flex-1">{toast.message}</div>
      <button
        className="rounded p-0.5 text-[#9CA3AF] hover:text-[#111827] transition-colors"
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
