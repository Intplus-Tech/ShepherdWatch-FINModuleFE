"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Loader2, Search, X } from "lucide-react"

import { useUsers } from "@/components/hooks/useUsers"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { initials } from "@/lib/hr/normalize"
import { cn } from "@/lib/utils"

/**
 * Picks an existing user account to attach an employee profile to.
 *
 * `EmployeeProfile.userId` is required and unique in the backend model, so an
 * employee record cannot be created from a free-typed name and email — the
 * person must already have a ShepherdWatch account (invite them from User
 * Management first).
 */

export type PickedUser = {
  id: string
  name: string
  email: string
}

function readUsers(payload: unknown): PickedUser[] {
  const root = (payload ?? {}) as Record<string, unknown>
  const candidates = [root.data, (root.data as Record<string, unknown>)?.data, root.items, root]
  const list = candidates.find((candidate) => Array.isArray(candidate)) as unknown[] | undefined
  if (!list) return []

  return list
    .map((entry) => {
      const user = (entry ?? {}) as Record<string, unknown>
      const id = String(user._id ?? user.id ?? "")
      const first = typeof user.firstName === "string" ? user.firstName : ""
      const last = typeof user.lastName === "string" ? user.lastName : ""
      const full = typeof user.fullName === "string" ? user.fullName : ""
      const email = typeof user.email === "string" ? user.email : ""
      return {
        id,
        name: full.trim() || [first, last].filter(Boolean).join(" ").trim() || email,
        email,
      }
    })
    .filter((user) => user.id)
}

export function UserAccountPicker({
  value,
  onChange,
  branchId,
  disabled,
  placeholder = "Search staff accounts by name or email...",
}: {
  value: string
  onChange: (userId: string, user: PickedUser | null) => void
  branchId?: string
  disabled?: boolean
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<PickedUser | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debounced = useDebouncedValue(query)
  const users = useUsers({ limit: 10, search: debounced || undefined, branchId })

  /**
   * The parent owns the id, so a cleared `value` means no selection — derived
   * here rather than synced back through an effect.
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

  const options = useMemo(() => readUsers(users.data), [users.data])

  if (active) {
    return (
      <div className="mt-1.5 flex h-[42px] items-center gap-3 rounded-md border border-[#E5E7EB] bg-white px-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-bold text-[#2563EB]">
          {initials(active.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[#111827]">{active.name}</div>
          <div className="truncate text-[11px] text-[#9CA3AF]">{active.email}</div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => {
              setSelected(null)
              onChange("", null)
            }}
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
    <div ref={containerRef} className="relative mt-1.5">
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

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg">
          {users.isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-[12px] text-[#6B7280]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching…
            </div>
          ) : users.error ? (
            <div className="px-3 py-4 text-center text-[12px] text-red-600">
              Couldn&apos;t load user accounts.
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">
              No accounts found. Invite the person from User Management first.
            </div>
          ) : (
            options.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  setSelected(user)
                  onChange(user.id, user)
                  setOpen(false)
                  setQuery("")
                }}
                className={cn("flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F8FAFC]")}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[10px] font-bold text-[#2563EB]">
                  {initials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[#111827]">
                    {user.name}
                  </div>
                  <div className="truncate text-[11px] text-[#9CA3AF]">{user.email}</div>
                </div>
                {value === user.id && <Check className="h-4 w-4 shrink-0 text-[#2563EB]" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
