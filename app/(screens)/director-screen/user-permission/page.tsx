"use client"

import { API_V1 } from "@/lib/api";

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonTable } from "@/components/ui/skeleton"
import {
  Filter,
  History,
  ShieldCheck,
  Users,
  Check,
} from "lucide-react"
import {
  flattenRolePermissions,
  formatRoleLabel,
  flattenRoles,
  normalizeRoleKey,
} from "@/lib/role-permissions"

type RoleColumn = {
  key: string
  label: string
  subLabel: string
  textClass: string
}

type MatrixItem = {
  /** The action key the API uses, e.g. `approve_budgets`. */
  action: string
  /** The label the API supplies, e.g. "Approve budgets". */
  label: string
  desc: string
  section: string
}

type MatrixSection = {
  section: string
  items: MatrixItem[]
}

const DEFAULT_ROLE_META: Record<string, Omit<RoleColumn, "key">> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    subLabel: "Full Access",
    textClass: "text-[#7C3AED]",
  },
  PASTOR: {
    label: "Pastor",
    subLabel: "Overseer",
    textClass: "text-[#2563EB]",
  },
  ACCOUNTANT: {
    label: "Accountant",
    subLabel: "Financial Ops",
    textClass: "text-[#16A34A]",
  },
  ADMIN_OFFICER: {
    label: "Admin Officer",
    subLabel: "Administrative",
    textClass: "text-[#6B7280]",
  },
}

const DEFAULT_ROLE_ORDER = [
  "SUPER_ADMIN",
  "PASTOR",
  "ACCOUNTANT",
  "ADMIN_OFFICER",
  "ADMIN",
  "FINANCE",
  "DIRECTOR",
]

const smallText = "text-[10.63px] leading-[14.17px] font-normal"
const bigText = "text-[12.4px] leading-[17.71px] font-medium"

/**
 * The permission action keys a role currently holds.
 *
 * `GET /api/v1/roles/:role` returns every action with a `granted` flag, so the
 * editable state is the subset where `granted` is true. Older shapes that sent
 * a bare list of strings are still accepted.
 */
function grantedActions(role: any): string[] {
  const list = Array.isArray(role?.permissions)
    ? role.permissions
    : Array.isArray(role?.permissionList)
      ? role.permissionList
      : []
  return list
    .filter((perm: any) => (typeof perm === "string" ? true : perm?.granted === true))
    .map((perm: any) => (typeof perm === "string" ? perm : (perm?.action ?? perm?.id)))
    .filter(Boolean)
}

export default function Page() {
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [payload, setPayload] = useState<unknown>(null)
  const [matrixTimestamp, setMatrixTimestamp] = useState<string | null>(null)
  const [matrixState, setMatrixState] = useState<Record<string, Set<string>>>({})
  const [roleKeyMap, setRoleKeyMap] = useState<Record<string, string>>({})
  const [matrixSaving, setMatrixSaving] = useState(false)
  const [matrixSaveError, setMatrixSaveError] = useState<string | null>(null)
  const [matrixSaveMessage, setMatrixSaveMessage] = useState<string | null>(null)
  const [matrixResetting, setMatrixResetting] = useState(false)
  const [rolesPayload, setRolesPayload] = useState<unknown>(null)
  /** Set when the matrix is readable but this account may not save it. */
  const [matrixReadOnly, setMatrixReadOnly] = useState(false)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [createRoleSaving, setCreateRoleSaving] = useState(false)
  const [createRoleError, setCreateRoleError] = useState<string | null>(null)
  const [createRoleForm, setCreateRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [roleDetail, setRoleDetail] = useState<any>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [isEditingRole, setIsEditingRole] = useState(false)
  // `permissions` holds the granted permission *action keys* for the selected
  // role. Roles themselves are enum-backed on the backend, so name, type and
  // tenant are shown for context but cannot be changed.
  const [roleForm, setRoleForm] = useState({
    roleName: "",
    roleDescription: "",
    roleType: "",
    tenantId: "",
    permissions: [] as string[],
  })
  const [roleSaving, setRoleSaving] = useState(false)
  const [roleSaveError, setRoleSaveError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPermissions = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [permissionsResponse, rolesResponse] = await Promise.all([
          fetch(`${API_V1}/permissions/matrix`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${API_V1}/roles`, {
            method: "GET",
            credentials: "include",
          }),
        ])

        const permissionsData = await permissionsResponse.json().catch(() => null)
        const rolesData = await rolesResponse.json().catch(() => null)

        // `GET /permissions/matrix` is super_admin only, while `GET /roles`
        // also allows a director. Losing the matrix must not throw away the
        // roles, or a director sees an empty screen with no reason given.
        if (!isMounted) return

        if (permissionsResponse.ok) {
          setPayload(permissionsData)
          setMatrixTimestamp(permissionsData?.timestamp ?? null)
          setMatrixReadOnly(false)
        } else {
          setPayload(null)
          setMatrixReadOnly(true)
        }

        if (rolesResponse.ok) {
          setRolesPayload(rolesData)
        }

        if (!permissionsResponse.ok && !rolesResponse.ok) {
          throw new Error(
            permissionsData?.message ?? rolesData?.message ?? "Unable to load permissions. Please try again."
          )
        }

        if (!permissionsResponse.ok) {
          setErrorMessage(
            permissionsResponse.status === 403
              ? "Roles are shown below, but editing the permission matrix needs a Super Admin account."
              : permissionsData?.message ?? "The permission matrix could not be loaded."
          )
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load permissions."
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPermissions()

    return () => {
      isMounted = false
    }
  }, [])

  const flattenedPermissions = useMemo(
    () => flattenRolePermissions(rolesPayload),
    [rolesPayload]
  )

  /**
   * Grants from `GET /permissions/matrix`, keyed role -> action. It is the
   * authoritative store, but it carries no labels, so it only overrides the
   * ticks; the rows themselves come from `/roles`.
   */
  const matrixGrants = useMemo(() => {
    const data = (payload as any)?.data ?? payload
    if (!Array.isArray(data)) return null
    const byRole: Record<string, Record<string, boolean>> = {}
    for (const role of data as any[]) {
      const roleKey = normalizeRoleKey(role?.role ?? role?.roleType ?? role?.name)
      if (!roleKey) continue
      const grants: Record<string, boolean> = {}
      for (const perm of Array.isArray(role?.permissions) ? role.permissions : []) {
        const action = perm?.action ?? perm?.id ?? perm?.name
        if (action) grants[String(action)] = perm?.granted === true
      }
      byRole[roleKey] = grants
    }
    return byRole
  }, [payload])

  // The backend identifies a permission by its action key (`approve_budgets`)
  // and carries the label separately, so the toggles below are keyed by action
  // and only display the name.
  const permissionOptions = useMemo(() => {
    const byAction = new Map<string, string>()
    for (const perm of flattenedPermissions) {
      if (perm.id) byAction.set(perm.id, perm.name || perm.id)
    }
    return Array.from(byAction, ([action, label]) => ({ action, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    )
  }, [flattenedPermissions])

  const rolesList = useMemo(() => flattenRoles(rolesPayload), [rolesPayload])

  const { columns, sections } = useMemo(() => {
    const roleSet = new Set<string>()
    const roleMetaMap = new Map<string, { label: string; subLabel: string; textClass: string }>()
    const itemMap = new Map<string, MatrixItem>()
    const sectionOrder: string[] = []

    flattenRoles(rolesPayload).forEach((role) => {
      const key = normalizeRoleKey(role.roleType ?? role.name)
      if (!key) return
      roleSet.add(key)
      roleMetaMap.set(key, {
        label: role.name ?? formatRoleLabel(key),
        subLabel: role.description ?? "Permissions",
        textClass: DEFAULT_ROLE_META[key]?.textClass ?? "text-[#6B7280]",
      })
    })

    flattenedPermissions.forEach((perm) => {
      const roleKey = normalizeRoleKey(perm.roleType)
      if (roleKey) {
        roleSet.add(roleKey)
      }

      const section = perm.section || "General"
      if (!itemMap.has(perm.id)) {
        itemMap.set(perm.id, {
          action: perm.id,
          label: perm.name,
          desc: perm.description,
          section,
        })
        if (!sectionOrder.includes(section)) {
          sectionOrder.push(section)
        }
      }
    })

    const roleKeys =
      roleSet.size > 0 ? Array.from(roleSet) : Object.keys(DEFAULT_ROLE_META)

    const columns: RoleColumn[] = roleKeys
      .sort((a, b) => {
        const aIndex = DEFAULT_ROLE_ORDER.indexOf(a)
        const bIndex = DEFAULT_ROLE_ORDER.indexOf(b)
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
      .map((key) => {
        const meta = roleMetaMap.get(key) ?? DEFAULT_ROLE_META[key]
        return {
          key,
          label: meta?.label ?? formatRoleLabel(key),
          subLabel: meta?.subLabel ?? "Permissions",
          textClass: meta?.textClass ?? "text-[#6B7280]",
        }
      })

    const sections: MatrixSection[] = sectionOrder.map((section) => ({
      section,
      items: Array.from(itemMap.values()).filter(
        (item) => item.section === section
      ),
    }))

    return { columns, sections }
  }, [flattenedPermissions, rolesPayload])

  const formatActionLabel = (value: string) =>
    value
      .toString()
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())

  const filteredSections = useMemo(() => {
    if (!searchText.trim()) return sections
    const term = searchText.toLowerCase()
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(term) ||
            item.action.toLowerCase().includes(term) ||
            item.desc.toLowerCase().includes(term)
        ),
      }))
      .filter((section) => section.items.length > 0)
  }, [searchText, sections])

  const showLockedNote = columns.some((col) => col.key === "SUPER_ADMIN")
  const parsedMatrixUpdated = matrixTimestamp ? new Date(matrixTimestamp) : null
  const matrixUpdatedLabel =
    parsedMatrixUpdated && !Number.isNaN(parsedMatrixUpdated.getTime())
      ? parsedMatrixUpdated.toLocaleString()
      : null

  useEffect(() => {
    const nextMatrix: Record<string, Set<string>> = {}
    const nextRoleMap: Record<string, string> = {}

    // `/roles` carries every action with its own `granted` flag per role.
    for (const perm of flattenedPermissions) {
      const roleKey = normalizeRoleKey(perm.roleType)
      if (!roleKey) continue
      if (!nextRoleMap[roleKey]) nextRoleMap[roleKey] = String(perm.roleType ?? roleKey)
      if (!nextMatrix[roleKey]) nextMatrix[roleKey] = new Set<string>()
      if (perm.granted) nextMatrix[roleKey].add(perm.id)
    }

    // The matrix endpoint is authoritative where it answered.
    if (matrixGrants) {
      for (const [roleKey, grants] of Object.entries(matrixGrants)) {
        const set = nextMatrix[roleKey] ?? new Set<string>()
        for (const [action, granted] of Object.entries(grants)) {
          if (granted) set.add(action)
          else set.delete(action)
        }
        nextMatrix[roleKey] = set
        if (!nextRoleMap[roleKey]) nextRoleMap[roleKey] = roleKey.toLowerCase()
      }
    }

    if (Object.keys(nextMatrix).length === 0) return
    setRoleKeyMap(nextRoleMap)
    setMatrixState(nextMatrix)
  }, [flattenedPermissions, matrixGrants])

  const togglePermission = (roleKey: string, action: string) => {
    // Super Admin always holds everything; the API refuses to revoke it.
    if (roleKey === "SUPER_ADMIN") return
    setMatrixState((prev) => {
      const actionSet = new Set(prev[roleKey] ?? [])
      if (actionSet.has(action)) actionSet.delete(action)
      else actionSet.add(action)
      return { ...prev, [roleKey]: actionSet }
    })
  }

  /** The grants as last reported, to compare the ticks against. */
  const savedGrants = useMemo(() => {
    const saved: Record<string, Set<string>> = {}
    for (const perm of flattenedPermissions) {
      const roleKey = normalizeRoleKey(perm.roleType)
      if (!roleKey) continue
      if (!saved[roleKey]) saved[roleKey] = new Set<string>()
      if (perm.granted) saved[roleKey].add(perm.id)
    }
    if (matrixGrants) {
      for (const [roleKey, grants] of Object.entries(matrixGrants)) {
        const set = saved[roleKey] ?? new Set<string>()
        for (const [action, granted] of Object.entries(grants)) {
          if (granted) set.add(action)
          else set.delete(action)
        }
        saved[roleKey] = set
      }
    }
    return saved
  }, [flattenedPermissions, matrixGrants])

  const isMatrixDirty = useMemo(() => {
    const roleKeys = new Set([...Object.keys(matrixState), ...Object.keys(savedGrants)])
    for (const roleKey of roleKeys) {
      const next = matrixState[roleKey] ?? new Set<string>()
      const saved = savedGrants[roleKey] ?? new Set<string>()
      if (next.size !== saved.size) return true
      for (const action of saved) {
        if (!next.has(action)) return true
      }
    }
    return false
  }, [matrixState, savedGrants])

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ""
  }

  const handleSaveMatrix = async () => {
    setMatrixSaveError(null)
    setMatrixSaveMessage(null)
    setMatrixSaving(true)
    try {
      // Every known action needs an explicit `granted`; omitting one leaves the
      // stored value behind, so an un-tick would never take effect.
      const allActions = sections.flatMap((section) => section.items.map((item) => item.action))
      const matrix = Object.entries(matrixState)
        .filter(([roleKey]) => roleKey !== "SUPER_ADMIN")
        .map(([roleKey, granted]) => ({
          role: roleKeyMap[roleKey] ?? roleKey.toLowerCase(),
          permissions: allActions.map((action) => ({ action, granted: granted.has(action) })),
        }))
      if (matrix.length === 0 || allActions.length === 0) {
        throw new Error("No permissions are loaded yet, so there is nothing to save.")
      }
      const res = await fetch(`${API_V1}/permissions/matrix`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ matrix }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to save permission matrix")
      }
      setMatrixSaveMessage(data?.message || "Permission matrix saved successfully.")
      setPayload(data?.data?.length ? { data: data.data } : payload)
      setMatrixTimestamp(data?.timestamp ?? matrixTimestamp)
    } catch (err: any) {
      setMatrixSaveError(err.message || "Unable to save permission matrix")
    } finally {
      setMatrixSaving(false)
    }
  }

  const handleCreateRole = async () => {
    const name = createRoleForm.name.trim()
    if (!name) {
      setCreateRoleError("Give the role a name.")
      return
    }
    setCreateRoleError(null)
    setCreateRoleSaving(true)
    try {
      const res = await fetch(`${API_V1}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": getCsrfToken() },
        credentials: "include",
        body: JSON.stringify({
          name,
          // The eight built-in roles are keyed like `branch_pastor`, so a new
          // one follows the same convention.
          role: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
          description: createRoleForm.description.trim(),
          permissions: createRoleForm.permissions.map((action) => ({ action, granted: true })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to create the role.")
      }
      setShowCreateRole(false)
      setCreateRoleForm({ name: "", description: "", permissions: [] })
      setMatrixSaveMessage(data?.message || `Role "${name}" created.`)
      // Pull the roles list again so the new column appears.
      const refreshed = await fetch(`${API_V1}/roles`, { credentials: "include" })
      if (refreshed.ok) setRolesPayload(await refreshed.json().catch(() => null))
    } catch (err: any) {
      setCreateRoleError(err?.message || "Unable to create the role.")
    } finally {
      setCreateRoleSaving(false)
    }
  }

  const handleResetMatrix = async () => {
    const confirmed = window.confirm(
      "Reset the permission matrix to system defaults? This will overwrite current customizations."
    )
    if (!confirmed) return
    setMatrixSaveError(null)
    setMatrixSaveMessage(null)
    setMatrixResetting(true)
    try {
      const res = await fetch(`${API_V1}/permissions/matrix/reset`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": getCsrfToken(),
        },
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to reset permission matrix")
      }
      setMatrixSaveMessage(data?.message || "Permission matrix reset successfully.")
      setPayload(data?.data?.length ? { data: data.data } : payload)
      setMatrixTimestamp(data?.timestamp ?? matrixTimestamp)
    } catch (err: any) {
      setMatrixSaveError(err.message || "Unable to reset permission matrix")
    } finally {
      setMatrixResetting(false)
    }
  }

  useEffect(() => {
    if (!selectedRoleId && rolesList.length > 0) {
      setSelectedRoleId(rolesList[0].id)
    }
  }, [rolesList, selectedRoleId])

  useEffect(() => {
    let isMounted = true

    const loadRole = async () => {
      if (!selectedRoleId) {
        setRoleDetail(null)
        return
      }

      setRoleLoading(true)
      setRoleError(null)

      try {
        const response = await fetch(`${API_V1}/roles/${selectedRoleId}`, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ?? "Unable to load role details. Please try again."
          )
        }

        if (isMounted) {
          setRoleDetail(data?.data ?? data)
          setRoleSaveError(null)
          setIsEditingRole(false)
        }
      } catch (error) {
        if (isMounted) {
          setRoleError(
            error instanceof Error ? error.message : "Unable to load role details."
          )
        }
      } finally {
        if (isMounted) {
          setRoleLoading(false)
        }
      }
    }

    loadRole()

    return () => {
      isMounted = false
    }
  }, [selectedRoleId])

  useEffect(() => {
    if (!roleDetail) return
    setRoleForm({
      roleName:
        roleDetail?.roleName ??
        roleDetail?.name ??
        roleDetail?.roleType ??
        "",
      roleDescription:
        roleDetail?.roleDescription ??
        roleDetail?.description ??
        "",
      roleType: roleDetail?.roleType ?? roleDetail?.type ?? "",
      tenantId: roleDetail?.tenantId ?? "",
      permissions: grantedActions(roleDetail),
    })
  }, [roleDetail])

  // Only the permission grants are editable, so they are the only thing that
  // can make the form dirty.
  const isRoleDirty = useMemo(() => {
    if (!roleDetail) return false
    const current = grantedActions(roleDetail)
    return (
      roleForm.permissions.length !== current.length ||
      roleForm.permissions.some((action) => !current.includes(action))
    )
  }, [roleDetail, roleForm])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/users"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <section className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]">User &amp; Role Management</h2>
                <p className={`${smallText} text-[#6B7280] mt-1`}>
                  Manage system access, roles, and permissions across all global branches. Invite new
                  <br />
                  directors or configure granular access controls.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                  onClick={() => {
                    setCreateRoleError(null)
                    setShowCreateRole((open) => !open)
                  }}
                >
                  {showCreateRole ? "Cancel" : "New Role"}
                </Button>
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                  onClick={handleResetMatrix}
                  disabled={matrixResetting || matrixReadOnly}
                  title={matrixReadOnly ? "Only a Super Admin can change the permission matrix" : ""}
                >
                  {matrixResetting ? "Resetting..." : "Reset to Defaults"}
                </Button>
                <Button
                  className="h-8 rounded-md bg-[#3B5BDB] text-[11px] font-medium text-white shadow hover:bg-blue-700"
                  onClick={handleSaveMatrix}
                  disabled={matrixSaving || !isMatrixDirty || matrixReadOnly}
                  title={matrixReadOnly ? "Only a Super Admin can change the permission matrix" : ""}
                >
                  {matrixSaving ? "Saving..." : "Save Matrix"}
                </Button>
              </div>
            </div>
            {matrixSaveError ? (
              <div className="mt-3 text-[11px] text-rose-600">{matrixSaveError}</div>
            ) : null}

            {showCreateRole ? (
              <div className="mt-4 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <h3 className="text-[13px] font-bold text-[#111827]">New role</h3>
                <p className={`${smallText} text-[#6B7280] mt-1`}>
                  Name it, tick what it may do, and it becomes a column in the matrix below.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className={`${smallText} font-semibold text-[#374151]`}>Role name</span>
                    <input
                      value={createRoleForm.name}
                      onChange={(event) =>
                        setCreateRoleForm((form) => ({ ...form, name: event.target.value }))
                      }
                      placeholder="Finance Controller"
                      className="mt-1 h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#111827]"
                    />
                  </label>
                  <label className="block">
                    <span className={`${smallText} font-semibold text-[#374151]`}>Description</span>
                    <input
                      value={createRoleForm.description}
                      onChange={(event) =>
                        setCreateRoleForm((form) => ({ ...form, description: event.target.value }))
                      }
                      placeholder="What this role is responsible for"
                      className="mt-1 h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#111827]"
                    />
                  </label>
                </div>
                <div className="mt-3">
                  <span className={`${smallText} font-semibold text-[#374151]`}>Permissions</span>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.flatMap((section) =>
                      section.items.map((item) => (
                        <label
                          key={item.action}
                          className="flex items-start gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2"
                        >
                          <input
                            type="checkbox"
                            checked={createRoleForm.permissions.includes(item.action)}
                            onChange={(event) =>
                              setCreateRoleForm((form) => ({
                                ...form,
                                permissions: event.target.checked
                                  ? [...form.permissions, item.action]
                                  : form.permissions.filter((action) => action !== item.action),
                              }))
                            }
                            className="mt-0.5"
                          />
                          <span>
                            <span className="block text-[12px] font-semibold text-[#111827]">
                              {item.label || formatActionLabel(item.action)}
                            </span>
                            <span className="block text-[11px] text-[#9CA3AF]">{section.section}</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                {createRoleError ? (
                  <div className="mt-3 text-[11px] text-rose-600">{createRoleError}</div>
                ) : null}
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    className="h-8 rounded-md bg-[#3B5BDB] text-[11px] font-medium text-white shadow hover:bg-blue-700"
                    onClick={handleCreateRole}
                    disabled={createRoleSaving || !createRoleForm.name.trim()}
                  >
                    {createRoleSaving ? "Creating..." : "Create Role"}
                  </Button>
                  <Button
                    className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                    variant="outline"
                    onClick={() => setShowCreateRole(false)}
                    disabled={createRoleSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
            {matrixSaveMessage ? (
              <div className="mt-3 text-[11px] text-emerald-600">{matrixSaveMessage}</div>
            ) : null}

            <div className="mt-5 flex items-center gap-6 border-b border-[#EEF1F6] text-[11px]">
              <Link
                href="/director-screen/users"
                className="flex items-center gap-2 pb-2 text-[#6B7280] hover:text-[#3B5BDB] transition-colors"
              >
                <Users className="h-4 w-4" /> User Directory
              </Link>
              <Link
                href="/director-screen/user-permission"
                className="flex items-center gap-2 border-b-2 border-[#3B5BDB] pb-2 text-[#3B5BDB] font-medium"
              >
                <ShieldCheck className="h-4 w-4" /> Permissions Matrix
              </Link>
              <Link
                href="/director-screen/user-audit"
                className="flex items-center gap-2 pb-2 text-[#6B7280] hover:text-[#3B5BDB] transition-colors"
              >
                <History className="h-4 w-4" /> Audit Log
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input
                    className="h-9 w-[280px] rounded-md border-[#E5E7EB] bg-white pl-9 text-[11px] text-[#6B7280]"
                    placeholder="Filter permissions (e.g. 'budget', 'invite')"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                  />
                </div>
              </div>
              <div className={`${smallText} text-[#6B7280] flex items-center gap-4`}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-[#3B5BDB] bg-[#3B5BDB]" />
                  Granted
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-[#D1D5DB] bg-white" />
                  Revoked
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-[#F9FAFB] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-[#9CA3AF]">
                    ROLE DETAILS
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-[#111827]">
                    {roleDetail?.roleName ??
                      roleDetail?.name ??
                      roleDetail?.roleType ??
                      "Select a role"}
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {roleDetail?.roleDescription ??
                      roleDetail?.description ??
                      "Role description not available."}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 md:w-[260px]">
                  <div className="text-[10px] font-semibold text-[#9CA3AF]">
                    ROLE
                  </div>
                  <div className="relative">
                    <select
                      className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 pr-8 text-[12px] text-[#6B7280] outline-none transition-all focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 appearance-none"
                      value={selectedRoleId}
                      onChange={(event) => setSelectedRoleId(event.target.value)}
                    >
                      {rolesList.length === 0 ? (
                        <option value="">No roles available</option>
                      ) : null}
                      {rolesList.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]">
                      ▾
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                  variant="outline"
                  onClick={() => setIsEditingRole((prev) => !prev)}
                  disabled={!roleDetail || roleLoading}
                >
                  {isEditingRole ? "Close Editor" : "Edit Role"}
                </Button>
                {isEditingRole ? (
                  <>
                    <Button
                      className="h-8 rounded-md bg-[#3B5BDB] text-[11px] font-medium text-white shadow hover:bg-blue-700"
                      onClick={async () => {
                        if (!selectedRoleId || !roleDetail) return
                        setRoleSaving(true)
                        setRoleSaveError(null)
                        const previousRole = roleDetail
                        // The backend replaces a role's grants wholesale, so
                        // every known action is sent with an explicit flag —
                        // anything omitted would be read as revoked.
                        const knownActions = (
                          Array.isArray(roleDetail?.permissions) && roleDetail.permissions.length
                            ? roleDetail.permissions.map(
                                (perm: any) => perm?.action ?? perm?.id ?? perm
                              )
                            : permissionOptions.map((option) => option.action)
                        ).filter(Boolean)

                        const payloadPermissions = knownActions.map((action: string) => ({
                          action,
                          granted: roleForm.permissions.includes(action),
                        }))

                        const optimisticRole = {
                          ...roleDetail,
                          permissions: payloadPermissions,
                        }
                        setRoleDetail(optimisticRole)

                        try {
                          const response = await fetch(
                            `${API_V1}/roles/${selectedRoleId}`,
                            {
                              method: "PUT",
                              credentials: "include",
                              headers: {
                                "Content-Type": "application/json",
                                // The proxy rejects a state change without it.
                                "X-CSRF-Token": getCsrfToken(),
                              },
                              body: JSON.stringify({ permissions: payloadPermissions }),
                            }
                          )
                          const data = await response.json().catch(() => null)
                          if (!response.ok) {
                            throw new Error(
                              data?.message ??
                                "Unable to update role. Please try again."
                            )
                          }
                          setRoleDetail(data?.data ?? data ?? optimisticRole)
                          setIsEditingRole(false)
                        } catch (error) {
                          setRoleDetail(previousRole)
                          setRoleSaveError(
                            error instanceof Error
                              ? error.message
                              : "Unable to update role."
                          )
                        } finally {
                          setRoleSaving(false)
                        }
                      }}
                      disabled={roleSaving || !isRoleDirty}
                    >
                      {roleSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
                      variant="outline"
                      onClick={() => {
                        if (isRoleDirty) {
                          const confirmDiscard = window.confirm(
                            "You have unsaved changes. Discard them?"
                          )
                          if (!confirmDiscard) return
                        }
                        setIsEditingRole(false)
                        if (roleDetail) {
                          setRoleForm({
                            roleName:
                              roleDetail?.roleName ??
                              roleDetail?.name ??
                              roleDetail?.roleType ??
                              "",
                            roleDescription:
                              roleDetail?.roleDescription ??
                              roleDetail?.description ??
                              "",
                            roleType:
                              roleDetail?.roleType ?? roleDetail?.type ?? "",
                            tenantId: roleDetail?.tenantId ?? "",
                            permissions: Array.isArray(roleDetail?.permissions)
                              ? roleDetail.permissions
                              : Array.isArray(roleDetail?.permissionList)
                                ? roleDetail.permissionList
                                : [],
                          })
                        }
                      }}
                      disabled={roleSaving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#6B7280]">
                {roleLoading ? (
                  <span>Loading role details...</span>
                ) : roleError ? (
                  <span className="text-rose-600">{roleError}</span>
                ) : (
                  <>
                    <span>
                      Role Type:{" "}
                      <span className="font-semibold text-[#111827]">
                        {roleDetail?.roleType ??
                          roleDetail?.type ??
                          "Not specified"}
                      </span>
                    </span>
                    <span>
                      Permissions:{" "}
                      <span className="font-semibold text-[#111827]">
                        {Array.isArray(roleDetail?.permissions)
                          ? roleDetail.permissions.length
                          : Array.isArray(roleDetail?.permissionList)
                            ? roleDetail.permissionList.length
                            : "—"}
                      </span>
                    </span>
                    {roleDetail?.tenantId ? (
                      <span>
                        Tenant:{" "}
                        <span className="font-semibold text-[#111827]">
                          {roleDetail.tenantId}
                        </span>
                      </span>
                    ) : null}
                  </>
                )}
                {roleSaveError ? (
                  <span className="text-rose-600">{roleSaveError}</span>
                ) : null}
              </div>
            </div>

            {isEditingRole ? (
              <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <p className="mb-3 text-[11px] text-[#6B7280]">
                  Roles are defined by the system and cannot be renamed, created or
                  deleted. Their permissions are editable below.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      ROLE NAME
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.roleName}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      ROLE TYPE
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.roleType}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      ROLE DESCRIPTION
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.roleDescription}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      TENANT ID (OPTIONAL)
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.tenantId}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] font-semibold text-[#9CA3AF]">
                    PERMISSIONS
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {permissionOptions.map(({ action, label }) => {
                      const isSelected = roleForm.permissions.includes(action)
                      return (
                        <button
                          key={action}
                          type="button"
                          className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-[11px] transition ${
                            isSelected
                              ? "border-[#3B5BDB] bg-[#EEF2FF] text-[#1D4ED8]"
                              : "border-[#E5E7EB] bg-white text-[#6B7280]"
                          }`}
                          onClick={() =>
                            setRoleForm((prev) => {
                              const nextPermissions = isSelected
                                ? prev.permissions.filter((perm) => perm !== action)
                                : [...prev.permissions, action]
                              return { ...prev, permissions: nextPermissions }
                            })
                          }
                        >
                          <span>{label}</span>
                          <span className="text-[10px]">
                            {isSelected ? "✓" : ""}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
              {isLoading ? (
                <div className="px-6 py-6">
                  <SkeletonTable rows={6} columns={5} />
                </div>
              ) : errorMessage ? (
                <div className="px-6 py-10 text-center text-[12px] text-rose-600">
                  {errorMessage}
                </div>
              ) : filteredSections.length === 0 ? (
                <div className="px-6 py-10 text-center text-[12px] text-[#6B7280]">
                  No permissions found for the current filters.
                </div>
              ) : (
                <table className={`${smallText} w-full text-[#111827]`}>
                  <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        PERMISSION / ACTION
                      </th>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`py-3 px-4 text-center ${column.textClass}`}
                        >
                          {column.label}
                          <br />
                          <span className="text-[10px] text-[#9CA3AF]">
                            {column.subLabel}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSections.map((section) => (
                      <React.Fragment key={section.section}>
                        <tr className="bg-[#F9FAFB] text-[#9CA3AF]">
                          <td
                            className="py-3 px-4 text-[11px] font-medium uppercase tracking-wide"
                            colSpan={columns.length + 1}
                          >
                            {section.section}
                          </td>
                        </tr>
                        {section.items.map((item) => (
                          <tr key={item.action} className="border-t border-[#EEF1F6]">
                            <td className="py-3 px-4">
                              <div className={`${bigText} text-[#111827]`}>
                                {item.label || formatActionLabel(item.action)}
                              </div>
                              <div className={`${smallText} text-[#9CA3AF]`}>
                                {item.desc}
                              </div>
                            </td>
                            {columns.map((column) => {
                              const isGranted =
                                matrixState[column.key]?.has(item.action) ?? false
                              const isLocked = column.key === "SUPER_ADMIN"
                              return (
                                <td
                                  key={column.key}
                                  className="py-3 px-4 text-center"
                                >
                                  <div
                                    className={`mx-auto h-4 w-4 rounded border ${
                                      isGranted
                                        ? "bg-[#3B5BDB] border-[#3B5BDB]"
                                        : "bg-white border-[#D1D5DB]"
                                    } flex items-center justify-center ${
                                      isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                                    }`}
                                    onClick={() => {
                                      if (isLocked) return
                                      togglePermission(column.key, item.action)
                                    }}
                                  >
                                    {isGranted ? (
                                      <Check className="h-3 w-3 text-white" />
                                    ) : null}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[11px] text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-white" />
                  {showLockedNote
                    ? "Super Admin permissions are locked for security reasons."
                    : "Permissions are managed at the role level."}
                </div>
                <div>
                  {matrixUpdatedLabel
                    ? `Last updated on ${matrixUpdatedLabel}`
                    : "Last updated timestamp unavailable"}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}



