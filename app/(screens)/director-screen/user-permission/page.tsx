"use client"

import React, { useEffect, useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  name: string
  desc: string
  section: string
  roles: Set<string>
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

export default function Page() {
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [payload, setPayload] = useState<unknown>(null)
  const [matrixTimestamp, setMatrixTimestamp] = useState<string | null>(null)
  const [matrixState, setMatrixState] = useState<Record<string, Record<string, Set<string>>>>({})
  const [roleKeyMap, setRoleKeyMap] = useState<Record<string, string>>({})
  const [matrixSaving, setMatrixSaving] = useState(false)
  const [matrixSaveError, setMatrixSaveError] = useState<string | null>(null)
  const [matrixSaveMessage, setMatrixSaveMessage] = useState<string | null>(null)
  const [matrixResetting, setMatrixResetting] = useState(false)
  const [rolesPayload, setRolesPayload] = useState<unknown>(null)
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [roleDetail, setRoleDetail] = useState<any>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [isEditingRole, setIsEditingRole] = useState(false)
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
          fetch("/api/permissions/matrix", {
            method: "GET",
            credentials: "include",
          }),
          fetch("/api/core/roles", {
            method: "GET",
            credentials: "include",
          }),
        ])

        const permissionsData = await permissionsResponse.json().catch(() => null)
        const rolesData = await rolesResponse.json().catch(() => null)

        if (!permissionsResponse.ok) {
          throw new Error(
            permissionsData?.message ??
              "Unable to load permissions. Please try again."
          )
        }

        if (isMounted) {
          setPayload(permissionsData)
          setMatrixTimestamp(permissionsData?.timestamp ?? null)
          if (rolesResponse.ok) {
            setRolesPayload(rolesData)
          }
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

  const matrixPayload = useMemo(() => {
    const data = (payload as any)?.data ?? payload
    if (!Array.isArray(data)) {
      return payload
    }
    const normalized = data.map((role: any) => ({
      role: role?.role ?? role?.roleType ?? role?.name,
      permissions: Array.isArray(role?.permissions)
        ? role.permissions.flatMap((perm: any) => {
            const category = perm?.category ?? "General"
            const actions = Array.isArray(perm?.actions) ? perm.actions : []
            return actions.map((action: string) => ({
              name: String(action),
              description: `${String(category)} permission`,
              category,
            }))
          })
        : [],
    }))
    return { data: normalized }
  }, [payload])

  const flattenedPermissions = useMemo(
    () => flattenRolePermissions(matrixPayload),
    [matrixPayload]
  )

  const permissionOptions = useMemo(() => {
    const names = flattenedPermissions.map((perm) => perm.name).filter(Boolean)
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
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
      const itemKey = `${section}::${perm.name}`

      if (!itemMap.has(itemKey)) {
        itemMap.set(itemKey, {
          name: perm.name,
          desc: perm.description,
          section,
          roles: new Set(),
        })
        if (!sectionOrder.includes(section)) {
          sectionOrder.push(section)
        }
      }

      if (roleKey) {
        itemMap.get(itemKey)?.roles.add(roleKey)
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
  }, [flattenedPermissions])

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
            formatActionLabel(item.name).toLowerCase().includes(term) ||
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
    const data = (payload as any)?.data ?? payload
    if (!Array.isArray(data)) return

    const nextMatrix: Record<string, Record<string, Set<string>>> = {}
    const nextRoleMap: Record<string, string> = {}

    data.forEach((role: any) => {
      const roleValue = role?.role ?? role?.roleType ?? role?.name
      const roleKey = normalizeRoleKey(roleValue)
      if (!roleKey) return
      nextRoleMap[roleKey] = String(roleValue)
      if (!nextMatrix[roleKey]) {
        nextMatrix[roleKey] = {}
      }
      const permissions = Array.isArray(role?.permissions) ? role.permissions : []
      permissions.forEach((perm: any) => {
        const category = String(perm?.category ?? "General")
        const actions = Array.isArray(perm?.actions) ? perm.actions : []
        if (!nextMatrix[roleKey][category]) {
          nextMatrix[roleKey][category] = new Set<string>()
        }
        actions.forEach((action: string) =>
          nextMatrix[roleKey][category].add(String(action))
        )
      })
    })

    setRoleKeyMap(nextRoleMap)
    setMatrixState(nextMatrix)
  }, [payload])

  const togglePermission = (roleKey: string, category: string, action: string) => {
    if (roleKey === "SUPER_ADMIN") return
    setMatrixState((prev) => {
      const next = { ...prev }
      const rolePermissions = { ...(next[roleKey] ?? {}) }
      const actionSet = new Set(rolePermissions[category] ?? [])
      if (actionSet.has(action)) {
        actionSet.delete(action)
      } else {
        actionSet.add(action)
      }
      rolePermissions[category] = actionSet
      next[roleKey] = rolePermissions
      return next
    })
  }

  const isMatrixDirty = useMemo(() => {
    const data = (payload as any)?.data ?? payload
    if (!Array.isArray(data)) return false
    const current = new Map<string, Map<string, Set<string>>>()
    data.forEach((role: any) => {
      const roleKey = normalizeRoleKey(role?.role ?? role?.roleType ?? role?.name)
      if (!roleKey) return
      if (!current.has(roleKey)) current.set(roleKey, new Map())
      const permissions = Array.isArray(role?.permissions) ? role.permissions : []
      permissions.forEach((perm: any) => {
        const category = String(perm?.category ?? "General")
        const actions = Array.isArray(perm?.actions) ? perm.actions : []
        if (!current.get(roleKey)?.has(category)) {
          current.get(roleKey)?.set(category, new Set())
        }
        actions.forEach((action: string) =>
          current.get(roleKey)?.get(category)?.add(String(action))
        )
      })
    })

    const roleKeys = new Set<string>([
      ...Object.keys(matrixState),
      ...Array.from(current.keys()),
    ])

    for (const roleKey of roleKeys) {
      const currentCats = current.get(roleKey) ?? new Map()
      const nextCats = matrixState[roleKey] ?? {}
      const categories = new Set<string>([
        ...Array.from(currentCats.keys()),
        ...Object.keys(nextCats),
      ])
      for (const category of categories) {
        const currentActions = currentCats.get(category) ?? new Set()
        const nextActions = nextCats[category] ?? new Set()
        if (currentActions.size !== nextActions.size) return true
        for (const action of currentActions) {
          if (!nextActions.has(action)) return true
        }
      }
    }
    return false
  }, [matrixState, payload])

  const handleSaveMatrix = async () => {
    setMatrixSaveError(null)
    setMatrixSaveMessage(null)
    setMatrixSaving(true)
    try {
      const matrix = Object.entries(matrixState).map(([roleKey, categories]) => ({
        role: roleKeyMap[roleKey] ?? roleKey.toLowerCase(),
        permissions: Object.entries(categories).map(([category, actions]) => ({
          category,
          actions: Array.from(actions),
        })),
      }))
      const res = await fetch("/api/permissions/matrix", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  const handleResetMatrix = async () => {
    const confirmed = window.confirm(
      "Reset the permission matrix to system defaults? This will overwrite current customizations."
    )
    if (!confirmed) return
    setMatrixSaveError(null)
    setMatrixSaveMessage(null)
    setMatrixResetting(true)
    try {
      const res = await fetch("/api/permissions/matrix/reset", {
        method: "POST",
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
        const response = await fetch(`/api/core/roles/${selectedRoleId}`, {
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
      permissions: Array.isArray(roleDetail?.permissions)
        ? roleDetail.permissions
        : Array.isArray(roleDetail?.permissionList)
          ? roleDetail.permissionList
          : [],
    })
  }, [roleDetail])

  const isRoleDirty = useMemo(() => {
    if (!roleDetail) return false
    const currentPermissions = Array.isArray(roleDetail?.permissions)
      ? roleDetail.permissions
      : Array.isArray(roleDetail?.permissionList)
        ? roleDetail.permissionList
        : []
    return (
      roleForm.roleName !==
        (roleDetail?.roleName ??
          roleDetail?.name ??
          roleDetail?.roleType ??
          "") ||
      roleForm.roleDescription !==
        (roleDetail?.roleDescription ?? roleDetail?.description ?? "") ||
      roleForm.roleType !== (roleDetail?.roleType ?? roleDetail?.type ?? "") ||
      roleForm.tenantId !== (roleDetail?.tenantId ?? "") ||
      roleForm.permissions.length !== currentPermissions.length ||
      roleForm.permissions.some(
        (perm) => !currentPermissions.includes(perm)
      )
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
                  onClick={handleResetMatrix}
                  disabled={matrixResetting}
                >
                  {matrixResetting ? "Resetting..." : "Reset to Defaults"}
                </Button>
                <Button
                  className="h-8 rounded-md bg-[#3B5BDB] text-[11px] font-medium text-white shadow hover:bg-blue-700"
                  onClick={handleSaveMatrix}
                  disabled={matrixSaving || !isMatrixDirty}
                >
                  {matrixSaving ? "Saving..." : "Save Matrix"}
                </Button>
              </div>
            </div>
            {matrixSaveError ? (
              <div className="mt-3 text-[11px] text-rose-600">{matrixSaveError}</div>
            ) : null}
            {matrixSaveMessage ? (
              <div className="mt-3 text-[11px] text-emerald-600">{matrixSaveMessage}</div>
            ) : null}

            <div className="mt-5 flex items-center gap-6 border-b border-[#EEF1F6] text-[11px]">
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <Users className="h-4 w-4" /> User Directory
              </button>
              <button className="flex items-center gap-2 border-b-2 border-[#3B5BDB] pb-2 text-[#3B5BDB] font-medium">
                <ShieldCheck className="h-4 w-4" /> Permissions Matrix
              </button>
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <History className="h-4 w-4" /> Audit Log
              </button>
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
                        const optimisticRole = {
                          ...roleDetail,
                          roleName: roleForm.roleName,
                          roleDescription: roleForm.roleDescription,
                          roleType: roleForm.roleType,
                          tenantId: roleForm.tenantId,
                          permissions: roleForm.permissions,
                        }
                        setRoleDetail(optimisticRole)

                        try {
                          const response = await fetch(
                            `/api/core/roles/${selectedRoleId}`,
                            {
                              method: "PUT",
                              credentials: "include",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                roleName: roleForm.roleName,
                                roleDescription: roleForm.roleDescription,
                                roleType: roleForm.roleType,
                                tenantId: roleForm.tenantId || undefined,
                                permissions: roleForm.permissions,
                              }),
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      ROLE NAME
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.roleName}
                      onChange={(event) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          roleName: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      ROLE TYPE
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.roleType}
                      onChange={(event) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          roleType: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      ROLE DESCRIPTION
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.roleDescription}
                      onChange={(event) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          roleDescription: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-[10px] font-semibold text-[#9CA3AF]">
                      TENANT ID (OPTIONAL)
                    </div>
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#111827]"
                      value={roleForm.tenantId}
                      onChange={(event) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          tenantId: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[10px] font-semibold text-[#9CA3AF]">
                    PERMISSIONS
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {permissionOptions.map((permission) => {
                      const isSelected = roleForm.permissions.includes(permission)
                      return (
                        <button
                          key={permission}
                          type="button"
                          className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-[11px] transition ${
                            isSelected
                              ? "border-[#3B5BDB] bg-[#EEF2FF] text-[#1D4ED8]"
                              : "border-[#E5E7EB] bg-white text-[#6B7280]"
                          }`}
                          onClick={() =>
                            setRoleForm((prev) => {
                              const nextPermissions = isSelected
                                ? prev.permissions.filter((perm) => perm !== permission)
                                : [...prev.permissions, permission]
                              return { ...prev, permissions: nextPermissions }
                            })
                          }
                        >
                          <span>{permission}</span>
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
                <div className="px-6 py-10 text-center text-[12px] text-[#6B7280]">
                  Loading permissions matrix...
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
                          <tr key={item.name} className="border-t border-[#EEF1F6]">
                            <td className="py-3 px-4">
                              <div className={`${bigText} text-[#111827]`}>
                                {formatActionLabel(item.name)}
                              </div>
                              <div className={`${smallText} text-[#9CA3AF]`}>
                                {item.desc}
                              </div>
                            </td>
                            {columns.map((column) => {
                              const isGranted =
                                matrixState[column.key]?.[item.section]?.has(item.name) ?? false
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
                                      togglePermission(column.key, item.section, item.name)
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



