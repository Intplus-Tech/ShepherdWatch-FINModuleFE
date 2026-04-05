"use client"

import React from "react"
import { useEffect, useMemo, useState } from "react"
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

const logs: AuditLogRow[] = []

type AuditLogRow = {
  id: string
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
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>(logs)
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditError, setAuditError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPermissions = async () => {
      try {
        const [permissionsResponse, rolesResponse] = await Promise.all([
          fetch("/api/core/roles/permissions", {
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
        const params = new URLSearchParams({ page: "1", size: "20" })
        const response = await fetch(`/api/core/financial/audit-logs?${params.toString()}`, {
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
            "Audit Event"
          const roleLabel =
            item?.role ??
            item?.roleName ??
            item?.userRole ??
            item?.actorRole ??
            "User"
          const userLabel =
            item?.userName ??
            item?.actor ??
            item?.performedBy ??
            item?.user ??
            "System"
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
            "No justification provided."

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
                : "bg-blue-50 text-blue-600"

          return {
            id: String(item?.id ?? item?.auditId ?? `audit-${index}`),
            time: timestamp
              ? new Date(timestamp).toLocaleString()
              : "—",
            user: userLabel,
            role: roleLabel,
            action,
            actionTone,
            impactLabel: impactValue ? "Before" : "",
            impactValue: impactValue ? String(impactValue) : "—",
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
                <p className="text-[12.4px] leading-[17.71px] font-normal text-[#6B7280] mt-1">
                  Manage system access, roles, and permissions across all global branches. Invite new
                  <br />
                  directors or configure granular access controls.
                </p>
              </div>
              <Button className="h-8 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700">
                <Download className="h-4 w-4" /> Export Log
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-6 border-b border-[#EEF1F6] text-[12px]">
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <Users className="h-4 w-4" /> User Directory
              </button>
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <ShieldCheck className="h-4 w-4" /> Permissions Matrix
              </button>
              <button className="flex items-center gap-2 border-b-2 border-[#3B5BDB] pb-2 text-[#3B5BDB] font-medium">
                <History className="h-4 w-4" /> Audit Log
              </button>
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
                    <Calendar className="h-4 w-4" /> Apr 1 - Apr 30, 2024
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
                      <td className="py-4 px-4 text-[#6B7280]">{log.time}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#EEF2FF]" />
                          <div>
                            <div className="text-[12px] font-semibold text-[#111827]">{log.user}</div>
                            <div className="text-[11px] text-[#9CA3AF]">{log.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`rounded-full px-2 py-1 text-[10px] ${log.actionTone}`}>{log.action}</span>
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
                      <td className="py-4 px-4 text-[#6B7280]">“{log.justification}”</td>
                      <td className="py-4 px-4 text-right text-[#9CA3AF]">
                        <Eye className="h-4 w-4" />
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
          </section>
        </div>
      </main>
    </div>
  )
}
