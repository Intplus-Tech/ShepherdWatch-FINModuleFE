export type FlatRolePermission = {
  id: string
  name: string
  description: string
  section: string
  roleType?: string
}

export type RoleItem = {
  id: string
  name: string
  roleType?: string
  description?: string
}

export function normalizeRoleKey(role?: string | null): string | null {
  if (!role) return null
  const cleaned = role
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return cleaned || null
}

export function formatRoleLabel(roleKey: string): string {
  return roleKey
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")
}

function buildFlatPermission(
  permission: any,
  roleType?: string
): FlatRolePermission {
  const name =
    permission?.name ??
    permission?.permissionName ??
    permission?.permission?.name ??
    permission?.code ??
    "Untitled Permission"

  const description =
    permission?.description ??
    permission?.permissionDescription ??
    permission?.permission?.description ??
    permission?.details ??
    ""

  const section =
    permission?.section ??
    permission?.category ??
    permission?.module ??
    permission?.group ??
    permission?.permission?.module ??
    "General"

  const id =
    permission?.id ??
    permission?.permissionId ??
    permission?.code ??
    permission?.name ??
    permission?.permission?.id ??
    `${name}-${roleType ?? "unknown"}`

  return {
    id: String(id),
    name: String(name),
    description: String(description),
    section: String(section),
    roleType,
  }
}

export function flattenRolePermissions(payload: any): FlatRolePermission[] {
  const data = payload?.data ?? payload
  const result: FlatRolePermission[] = []

  const addPermission = (perm: any, roleType?: string) => {
    if (!perm && !roleType) return
    result.push(buildFlatPermission(perm ?? {}, roleType))
  }

  const handleCollection = (items: any[]) => {
    items.forEach((item) => {
      if (Array.isArray(item?.permissions)) {
        const roleType =
          item?.roleType ?? item?.role ?? item?.name ?? item?.roleName
        item.permissions.forEach((permission: any) =>
          addPermission(permission, roleType)
        )
        return
      }

      if (Array.isArray(item?.items)) {
        const roleType =
          item?.roleType ?? item?.role ?? item?.name ?? item?.roleName
        item.items.forEach((permission: any) =>
          addPermission(permission, roleType)
        )
        return
      }

      addPermission(
        item,
        item?.roleType ?? item?.role ?? item?.roleName ?? item?.role?.name
      )
    })
  }

  if (Array.isArray(data)) {
    handleCollection(data)
    return result
  }

  if (Array.isArray(data?.permissions)) {
    handleCollection(data.permissions)
    return result
  }

  if (Array.isArray(data?.items)) {
    handleCollection(data.items)
    return result
  }

  if (Array.isArray(data?.roles)) {
    handleCollection(data.roles)
    return result
  }

  return result
}

export function flattenRoles(payload: any): RoleItem[] {
  const data = payload?.data ?? payload
  const roles = Array.isArray(data) ? data : data?.roles ?? data?.items ?? []

  if (!Array.isArray(roles)) {
    return []
  }

  return roles
    .map((role) => ({
      id: String(role?.id ?? role?.roleId ?? role?.uuid ?? role?.name ?? ""),
      name: String(role?.name ?? role?.roleName ?? role?.roleType ?? "Role"),
      roleType: role?.roleType ?? role?.type ?? role?.name,
      description: role?.description ?? role?.details ?? role?.roleDescription,
    }))
    .filter((role) => role.id || role.name)
}
