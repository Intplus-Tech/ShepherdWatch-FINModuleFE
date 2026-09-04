"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SERVICE_TYPES, type ServiceAttendanceEntry, type ServiceType } from "./attendance-data"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const fieldCls =
  "mt-1.5 h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

type HeadCountKey = "male" | "female" | "teens" | "children"

const HEAD_COUNTS: { key: HeadCountKey; label: string }[] = [
  { key: "male", label: "Main Auditorium — Male" },
  { key: "female", label: "Main Auditorium — Female" },
  { key: "teens", label: "Teens" },
  { key: "children", label: "Children" },
]

function formatDisplayDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default function AddServiceLogModal({
  open,
  onClose,
  onSave,
  branchLabel,
  entry,
}: {
  open: boolean
  onClose: () => void
  onSave: (entry: ServiceAttendanceEntry) => void
  branchLabel: string
  /** Present when editing an existing row; omitted when logging a new service. */
  entry?: ServiceAttendanceEntry | null
}) {
  const isEditing = Boolean(entry)
  const [serviceDate, setServiceDate] = useState("2024-10-27")
  const [serviceType, setServiceType] = useState<ServiceType>(entry?.serviceType ?? "1st Service")
  const [serviceTheme, setServiceTheme] = useState(entry?.serviceTheme ?? "")
  const [counts, setCounts] = useState<Record<HeadCountKey, string>>({
    male: entry ? String(entry.male) : "",
    female: entry ? String(entry.female) : "",
    teens: entry ? String(entry.teens) : "",
    children: entry ? String(entry.children) : "",
  })
  const [error, setError] = useState<string | null>(null)

  const numeric = (key: HeadCountKey) => Number(counts[key] || 0)
  const total = HEAD_COUNTS.reduce((sum, field) => sum + numeric(field.key), 0)

  const handleSubmit = () => {
    if (!serviceTheme.trim()) {
      setError("Service theme is required.")
      return
    }
    if (total <= 0) {
      setError("Enter at least one attendance count.")
      return
    }

    onSave({
      id: entry?.id ?? `log-${Date.now()}`,
      serviceDate: entry && !serviceDate ? entry.serviceDate : formatDisplayDate(serviceDate),
      serviceType,
      serviceTheme: serviceTheme.trim(),
      male: numeric("male"),
      female: numeric("female"),
      teens: numeric("teens"),
      children: numeric("children"),
    })
    onClose()
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">
            {isEditing ? "Edit Log Entry" : "Add Log Entry"}
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Record congregational attendance for a service at {branchLabel}.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="service-date">
              Service Date
            </label>
            <input
              id="service-date"
              type="date"
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="service-type">
              Service Type
            </label>
            <select
              id="service-type"
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value as ServiceType)}
              className={fieldCls}
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="service-theme">
            Service Theme
          </label>
          <input
            id="service-theme"
            type="text"
            value={serviceTheme}
            onChange={(event) => {
              setServiceTheme(event.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Faith That Moves Mountains"
            className={fieldCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {HEAD_COUNTS.map((field) => (
            <div key={field.key}>
              <label className={labelCls} htmlFor={`count-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`count-${field.key}`}
                type="number"
                min={0}
                inputMode="numeric"
                value={counts[field.key]}
                onChange={(event) => {
                  setCounts((prev) => ({ ...prev, [field.key]: event.target.value }))
                  if (error) setError(null)
                }}
                placeholder="0"
                className={fieldCls}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-[10px] bg-[#F8FAFC] px-4 py-3">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280]">
            Total Attendance
          </span>
          <span className="text-[20px] font-extrabold text-[#111827]">{total}</span>
        </div>

        {error ? <p className="text-[12px] font-medium text-rose-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="h-[40px] rounded-[8px] border border-[#E5E7EB] px-5 text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="h-[40px] rounded-[8px] bg-[#2563EB] px-5 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          {isEditing ? "Save Changes" : "Save Entry"}
        </button>
      </div>
    </ModalShell>
  )
}
