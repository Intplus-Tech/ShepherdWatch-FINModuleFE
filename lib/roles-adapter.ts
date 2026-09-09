import { API_V1 } from "@/lib/api"

/**
 * The backend has no `/roles` resource — roles live inside the permission
 * matrix (`GET/PUT /permissions/matrix`). These helpers present that matrix as
 * the role list and role detail the user-permission and user-audit screens
 * already expect, so one endpoint serves both shapes.
 */

export const PERMISSION_MATRIX_PATH = `${API_V1}/permissions/matrix`

export type MatrixEntry = {
  role: string
  permissions: { category: string; actions: string[] }[]
}

export type RoleRecord = {
  _id: string
  roleName: string
  roleDescription: string
  roleType: string
  permissions: string[]
  isSystem: boolean
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  director: "Director",
  regional_pastor: "Regional Pastor",
  branch_pastor: "Branch Pastor",
  accountant: "Branch Accountant",
  admin: "Branch Admin",
  hr: "HR",
  employee: "Employee",
  pastor: "Pastor",
}

function labelFor(role: string): string {
  if (ROLE_LABELS[role]) return ROLE_LABELS[role]
  return role
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function readMatrix(payload: unknown): MatrixEntry[] {
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {}
  const rows = asArray(root.data ?? root.matrix)
  return rows.map((entry) => {
    const row = (entry ?? {}) as Record<string, unknown>
    return {
      role: String(row.role ?? ""),
      permissions: asArray(row.permissions).map((permission) => {
        const item = (permission ?? {}) as Record<string, unknown>
        return {
          category: String(item.category ?? ""),
          actions: asArray(item.actions).map((action) => String(action)),
        }
      }),
    }
  })
}

/** Matrix entry → the flat "category:action" list the role screens edit. */
export function toRoleRecord(entry: MatrixEntry): RoleRecord {
  return {
    _id: entry.role,
    roleName: labelFor(entry.role),
    roleDescription: `Permissions granted to ${labelFor(entry.role)} across the platform.`,
    roleType: entry.role,
    permissions: entry.permissions.flatMap((permission) =>
      permission.actions.map((action) => `${permission.category}:${action}`)
    ),
    isSystem: true,
  }
}

/** The reverse: flat permission strings back into matrix categories. */
export function toMatrixPermissions(permissions: string[]): MatrixEntry["permissions"] {
  const grouped = new Map<string, Set<string>>()
  for (const entry of permissions) {
    const [category, action] = String(entry).split(":")
    if (!category || !action) continue
    const actions = grouped.get(category) ?? new Set<string>()
    actions.add(action)
    grouped.set(category, actions)
  }
  return Array.from(grouped.entries()).map(([category, actions]) => ({
    category,
    actions: Array.from(actions),
  }))
}

/** The distinct categories and actions present in the matrix. */
export function toPermissionCatalogue(matrix: MatrixEntry[]) {
  const categories = new Map<string, Set<string>>()
  for (const entry of matrix) {
    for (const permission of entry.permissions) {
      const actions = categories.get(permission.category) ?? new Set<string>()
      permission.actions.forEach((action) => actions.add(action))
      categories.set(permission.category, actions)
    }
  }
  return Array.from(categories.entries()).map(([category, actions]) => ({
    category,
    actions: Array.from(actions),
  }))
}
