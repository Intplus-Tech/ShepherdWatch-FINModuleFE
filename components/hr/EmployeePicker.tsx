"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Loader2, Search, X } from "lucide-react"

import { useEmployees } from "@/components/hooks/hr/useHrEmployees"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { employeeEmail, initials, userName } from "@/lib/hr/normalize"
import type { EmployeeProfile } from "@/lib/hr/types"
import { cn } from "@/lib/utils"

/**
 * Type-ahead employee selector backed by `GET /hr/employees?search=`.
 *
 * Every HR form that used to say "Search for a branch staff member…" over a
 * dead input now uses this, so the id it submits is a real `EmployeeProfile._id`
 * rather than a display string.
 */
export function EmployeePicker({
  value,
  onChange,
  placeholder = "Search for a branch staff member...",
  disabled,
  className,
}: {
  value: string
  onChange: (employeeId: string, employee: EmployeeProfile | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<EmployeeProfile | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debounced = useDebouncedValue(query)

  const employees = useEmployees({
    limit: 10,
    search: debounced || undefined,
    employmentStatus: "all",
    enabled: open,
  })

  /**
   * The parent owns the id, so a cleared `value` (e.g. after submit) means no
   * selection — derived here rather than synced back through an effect.
   */
  const active = value ? selected : null

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  const options = useMemo(() => employees.data?.items ?? [], [employees.data])

  function select(employee: EmployeeProfile) {
    setSelected(employee)
    onChange(employee._id, employee)
    setOpen(false)
    setQuery("")
  }

  function clear() {
    setSelected(null)
    onChange("", null)
    setQuery("")
  }

  if (active) {
    return (
      <div
        className={cn(
          "mt-1.5 flex h-[42px] items-center gap-3 rounded-[8px] border border-[#E5E7EB] bg-white px-3",
          className,
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-bold text-[#2563EB]">
          {initials(userName(active.userId, active.employeeId))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[#111827]">
            {userName(active.userId, active.employeeId)}
          </div>
          <div className="truncate text-[11px] text-[#9CA3AF]">
            {active.jobTitle} · #{active.employeeId}
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear selection"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative mt-1.5", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
      <input
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB] disabled:bg-[#F9FAFB]"
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-[8px] border border-[#E5E7EB] bg-white py-1 shadow-lg">
          {employees.isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-[12px] text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching…
            </div>
          ) : employees.error ? (
            <div className="px-3 py-4 text-center text-[12px] text-red-600">
              {employees.error instanceof Error
                ? employees.error.message
                : "Couldn't load employees."}
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">
              No employees found.
            </div>
          ) : (
            options.map((employee) => (
              <button
                key={employee._id}
                type="button"
                onClick={() => select(employee)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F8FAFC]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-bold text-[#2563EB]">
                  {initials(userName(employee.userId, employee.employeeId))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[#111827]">
                    {userName(employee.userId, employee.employeeId)}
                  </div>
                  <div className="truncate text-[11px] text-[#9CA3AF]">
                    {employee.jobTitle}
                    {employeeEmail(employee) ? ` · ${employeeEmail(employee)}` : ""}
                  </div>
                </div>
                {value === employee._id && <Check className="h-4 w-4 shrink-0 text-[#2563EB]" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Multi-select variant for enrolment flows.
 *
 * `POST /trainings/:id/participants` takes `employeeIds`, so the forms that
 * used to collect free-typed participant names now collect real profile ids.
 */
export function EmployeeMultiPicker({
  value,
  onChange,
  disabled,
  placeholder = "Search staff to enrol...",
}: {
  value: EmployeeProfile[]
  onChange: (employees: EmployeeProfile[]) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debounced = useDebouncedValue(query)
  const employees = useEmployees({
    limit: 10,
    search: debounced || undefined,
    employmentStatus: "active",
    enabled: open,
  })

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  const selectedIds = useMemo(() => new Set(value.map((e) => e._id)), [value])
  const options = employees.data?.items ?? []

  function toggle(employee: EmployeeProfile) {
    if (selectedIds.has(employee._id)) {
      onChange(value.filter((e) => e._id !== employee._id))
    } else {
      onChange([...value, employee])
    }
  }

  return (
    <div ref={containerRef} className="relative mt-1.5">
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((employee) => (
            <span
              key={employee._id}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] py-1 pl-2.5 pr-1.5 text-[12px] font-semibold text-[#2563EB]"
            >
              {userName(employee.userId, employee.employeeId)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggle(employee)}
                  aria-label={`Remove ${userName(employee.userId, employee.employeeId)}`}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[#2563EB]/15"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB] disabled:bg-[#F9FAFB]"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
          {employees.isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-[12px] text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching…
            </div>
          ) : employees.error ? (
            <div className="px-3 py-4 text-center text-[12px] text-red-600">
              Couldn&apos;t load employees.
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">
              No employees found.
            </div>
          ) : (
            options.map((employee) => (
              <button
                key={employee._id}
                type="button"
                onClick={() => toggle(employee)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F8FAFC]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-bold text-[#2563EB]">
                  {initials(userName(employee.userId, employee.employeeId))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[#111827]">
                    {userName(employee.userId, employee.employeeId)}
                  </div>
                  <div className="truncate text-[11px] text-[#9CA3AF]">{employee.jobTitle}</div>
                </div>
                {selectedIds.has(employee._id) && (
                  <Check className="h-4 w-4 shrink-0 text-[#2563EB]" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
