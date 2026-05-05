"use client"

import { API_V1 } from "@/lib/api";

import React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  ChevronDown,
  Download,
  Eye,
  History,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"
import {
  flattenRolePermissions,
  formatRoleLabel,
  flattenRoles,
  normalizeRoleKey,
} from "@/lib/role-permissions"

type AuditLogRow = {
  id: string
  rawId: string
  time: string
  user: string
  role: string
  action: string
  actionTone: string
  impactLabel: string
  impactValue: string
  impactAfterLabel: string
  impactAfterValue: string
  justification: string
}

export default function Page() {
  const [searchText, setSearchText] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [permissionOptions, setPermissionOptions] = useState<string[]>([])
  const [roleOptions, setRoleOptions] = useState<string[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([])
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditError, setAuditError] = useState<string | null>(null)
  const [auditExporting, setAuditExporting] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null)
  const [auditDetailLoading, setAuditDetailLoading] = useState(false)
  const [auditDetailError, setAuditDetailError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPermissions = async () => {
      try {
        const [permissionsResponse, rolesResponse] = await Promise.all([
          fetch(`${API_V1}/roles/permissions`, {
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

        if (!permissionsResponse.ok && !rolesResponse.ok) {
          return
        }

        const flattenedPermissions = permissionsResponse.ok
          ? flattenRolePermissions(permissionsData)
          : []
        const flattenedRoles = rolesResponse.ok ? flattenRoles(rolesData) : []

        if (!isMounted) return

        const apiPermissions = flattenedPermissions
          .map((perm) => perm.name)
          .filter(Boolean)
        const apiRoles = [
          ...flattenedPermissions
            .map((perm) => normalizeRoleKey(perm.roleType))
            .filter(Boolean)
            .map((role) => formatRoleLabel(role as string)),
          ...flattenedRoles.map((role) => role.name),
        ]

        const uniquePermissions = Array.from(
          new Set([...auditLogs.map((log) => log.action), ...apiPermissions])
        )
        const uniqueRoles = Array.from(
          new Set([...auditLogs.map((log) => log.role), ...apiRoles])
        )

        setPermissionOptions(uniquePermissions)
        setRoleOptions(uniqueRoles)
      } catch {
        // Silent fail: audit log can render without permissions metadata.
      }
    }

    loadPermissions()

    return () => {
      isMounted = false
    }
  }, [auditLogs])

  useEffect(() => {
    let isMounted = true

    const loadAudits = async () => {
      setAuditLoading(true)
      setAuditError(null)

      try {
        const params = new URLSearchParams({ page: "1", limit: "20" })
        const response = await fetch(`${API_V1}/audit-logs?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ?? "Unable to load audit trails. Please try again."
          )
        }

        const rawItems = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.audits)
              ? data.audits
              : Array.isArray(data)
                ? data
                : []

        const mapped: AuditLogRow[] = rawItems.map((item: any, index: number) => {
          const action =
            item?.action ??
            item?.event ??
            item?.activity ??
            item?.actionType ??
            ""
          const roleLabel =
            item?.role ??
            item?.roleName ??
            item?.userRole ??
            item?.actorRole ??
            ""
          const performedByFullName =
            item?.performedBy?.firstName && item?.performedBy?.lastName
              ? `${item?.performedBy?.firstName} ${item?.performedBy?.lastName}`
              : null
          const userLabel =
            item?.userName ??
            item?.actor ??
            performedByFullName ??
            item?.performedBy ??
            item?.user ??
            ""
          const timestamp =
            item?.timestamp ??
            item?.createdAt ??
            item?.time ??
            item?.date ??
            ""
          const justification =
            item?.reason ??
            item?.justification ??
            item?.details ??
            item?.message ??
            ""

          const impactValue =
            item?.impactValue ??
            item?.before ??
            item?.previousValue ??
            item?.oldValue ??
            ""
          const impactAfterValue =
            item?.impactAfterValue ??
            item?.after ??
            item?.newValue ??
            item?.updatedValue ??
            ""

          const actionTone =
            item?.status === "FAILED"
              ? "bg-rose-50 text-rose-600"
              : item?.status === "PENDING"
                ? "bg-amber-50 text-amber-600"
                : "bg-slate-50 text-slate-600"

          return {
            id: String(item?.id ?? item?.auditId ?? item?._id ?? `row-${index}`),
            rawId: String(item?._id ?? item?.id ?? item?.auditId ?? ""),
            time: timestamp
              ? new Date(timestamp).toLocaleString()
              : "",
            user: String(userLabel),
            role: String(roleLabel),
            action: String(action),
            actionTone,
            impactLabel: impactValue ? "Before" : "",
            impactValue: impactValue ? String(impactValue) : "",
            impactAfterLabel: impactAfterValue ? "After" : "",
            impactAfterValue: impactAfterValue ? String(impactAfterValue) : "",
            justification: String(justification),
          }
        })

        if (isMounted) {
          setAuditLogs(mapped)
        }
      } catch (error) {
        if (isMounted) {
          setAuditError(
            error instanceof Error ? error.message : "Unable to load audit trails."
          )
        }
      } finally {
        if (isMounted) {
          setAuditLoading(false)
        }
      }
    }

    loadAudits()

    return () => {
      isMounted = false
    }
  }, [])

  const handleViewAuditLog = async (auditId: string) => {
    if (!auditId) return
    setAuditDetailLoading(true)
    setAuditDetailError(null)
    try {
      const response = await fetch(`${API_V1}/audit-logs/${encodeURIComponent(auditId)}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to load audit log details.")
      }
      setSelectedAudit(data?.data ?? data)
    } catch (error) {
      setAuditDetailError(error instanceof Error ? error.message : "Unable to load audit log details.")
    } finally {
      setAuditDetailLoading(false)
    }
  }

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch = searchText
        ? log.justification.toLowerCase().includes(searchText.toLowerCase()) ||
          log.action.toLowerCase().includes(searchText.toLowerCase()) ||
          log.user.toLowerCase().includes(searchText.toLowerCase())
        : true

      const matchesAction = actionFilter ? log.action === actionFilter : true
      const matchesRole = roleFilter ? log.role === roleFilter : true

      return matchesSearch && matchesAction && matchesRole
    })
  }, [searchText, actionFilter, roleFilter, auditLogs])

  const handleExportAuditLogs = async () => {
    setAuditError(null)
    setAuditExporting(true)

    try {
      const params = new URLSearchParams()
      if (actionFilter) params.set("action", actionFilter)
      if (/^[a-f\d]{24}$/i.test(roleFilter)) {
        params.set("userId", roleFilter)
      }
      if (searchText) params.set("search", searchText)

      const response = await fetch(`${API_V1}/audit-logs/export?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to export audit logs.")
      }

      const rows = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `audit-logs-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : "Unable to export audit logs.")
    } finally {
      setAuditExporting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/user-audit"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <section className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]">User &amp; Role Management</h2>
                <p className="text-[12.4px] leading-[17.71px] font-normal text-[#6B7280] mt-1">
                  Manage system access, roles, and permissions across all global branches. Invite new
                  <br />
                  directors or configure granular access controls.
                </p>
              </div>
              <Button onClick={handleExportAuditLogs} disabled={auditExporting} className="h-8 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700 disabled:opacity-70">
                <Download className="h-4 w-4" /> {auditExporting ? "Exporting..." : "Export Log"}
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-6 border-b border-[#EEF1F6] text-[12px]">
              <Link
                href="/director-screen/users"
                className="flex items-center gap-2 pb-2 text-[#6B7280] hover:text-[#3B5BDB] transition-colors"
              >
                <Users className="h-4 w-4" /> User Directory
              </Link>
              <Link
                href="/director-screen/user-permission"
                className="flex items-center gap-2 pb-2 text-[#6B7280] hover:text-[#3B5BDB] transition-colors"
              >
                <ShieldCheck className="h-4 w-4" /> Permissions Matrix
              </Link>
              <Link
                href="/director-screen/user-audit"
                className="flex items-center gap-2 border-b-2 border-[#3B5BDB] pb-2 text-[#3B5BDB] font-medium"
              >
                <History className="h-4 w-4" /> Audit Log
              </Link>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">SEARCH</div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    <Input
                      className="h-9 rounded-md border-[#E5E7EB] bg-[#F9FAFB] pl-9 text-[12px] text-[#6B7280]"
                      placeholder="Search justification..."
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">ACTION TYPE</div>
                  <div className="relative">
                    <select
                      className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 pr-8 text-[12px] text-[#6B7280] outline-none transition-all focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 appearance-none"
                      value={actionFilter}
                      onChange={(event) => setActionFilter(event.target.value)}
                    >
                      <option value="">All Actions</option>
                      {permissionOptions.map((permission) => (
                        <option key={permission} value={permission}>
                          {permission}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">USER / ROLE</div>
                  <div className="relative">
                    <select
                      className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 pr-8 text-[12px] text-[#6B7280] outline-none transition-all focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 appearance-none"
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                    >
                      <option value="">All Users</option>
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">DATE RANGE</div>
                  <Button variant="outline" size="sm" className="h-9 w-full justify-between rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
                    <Calendar className="h-4 w-4" /> All Dates
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
              <table className="w-full text-[12px]">
                <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                  <tr>
                    <th className="py-3 px-4 text-left">TIMESTAMP</th>
                    <th className="py-3 px-4 text-left">USER</th>
                    <th className="py-3 px-4 text-left">ACTION TYPE</th>
                    <th className="py-3 px-4 text-left">IMPACT (DIFF)</th>
                    <th className="py-3 px-4 text-left">JUSTIFICATION</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td
                        className="py-6 px-4 text-center text-[12px] text-[#9CA3AF]"
                        colSpan={6}
                      >
                        {auditLoading
                          ? "Loading audit trails..."
                          : auditError
                            ? auditError
                            : "No audit trails available."}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t border-[#EEF1F6] align-top">
                      <td className="py-4 px-4 text-[#6B7280]">{log.time || "—"}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#EEF2FF]" />
                          <div>
                            <div className="text-[12px] font-semibold text-[#111827]">{log.user || "—"}</div>
                            <div className="text-[11px] text-[#9CA3AF]">{log.role || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`rounded-full px-2 py-1 text-[10px] ${log.actionTone}`}>{log.action || "—"}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-[10px] text-[#9CA3AF]">{log.impactLabel}</div>
                        <div className="text-[12px] text-rose-600">{log.impactValue}</div>
                        {log.impactAfterLabel ? (
                          <div className="mt-1 space-y-1">
                            <div className="text-[10px] text-[#9CA3AF]">{log.impactAfterLabel}</div>
                            <div className="text-[12px] text-emerald-600">{log.impactAfterValue}</div>
                          </div>
                        ) : null}
                      </td>
                      <td className="py-4 px-4 text-[#6B7280]">{log.justification ? `“${log.justification}”` : "—"}</td>
                      <td className="py-4 px-4 text-right text-[#9CA3AF]">
                        <button
                          type="button"
                          onClick={() => void handleViewAuditLog(log.rawId)}
                          disabled={!log.rawId}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#EEF2FF]"
                          aria-label="View audit detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[11px] text-[#9CA3AF]">
                <div>
                  {auditLoading
                    ? "Loading audit trails..."
                    : auditError
                      ? auditError
                      : `Showing ${filteredLogs.length} entries`}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-md border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]">Previous</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-md border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]">Next</Button>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4 text-[12px]">
              {auditDetailLoading ? (
                <div className="text-[#64748B]">Loading audit detail...</div>
              ) : auditDetailError ? (
                <div className="text-rose-600 font-semibold">{auditDetailError}</div>
              ) : selectedAudit ? (
                <div className="space-y-2">
                  <div className="font-semibold text-[#111827]">Audit Detail</div>
                  <div className="text-[#6B7280]">
                    Resource: {selectedAudit?.targetResource ?? "N/A"}{" "}
                    {selectedAudit?.targetResourceId ? `• ${selectedAudit.targetResourceId}` : ""}
                  </div>
                  <div className="text-[#6B7280]">
                    User: {selectedAudit?.performedBy?.firstName ?? ""} {selectedAudit?.performedBy?.lastName ?? ""}
                  </div>
                  <pre className="max-h-56 overflow-auto rounded-md bg-[#F8FAFC] p-3 text-[11px] text-[#334155]">
{JSON.stringify(
  {
    before: selectedAudit?.before ?? selectedAudit?.oldValue ?? null,
    after: selectedAudit?.after ?? selectedAudit?.newValue ?? null,
    justification: selectedAudit?.justification ?? selectedAudit?.reason ?? null,
  },
  null,
  2
)}
                  </pre>
                </div>
              ) : (
                <div className="text-[#64748B]">Select a log entry to view full details.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
