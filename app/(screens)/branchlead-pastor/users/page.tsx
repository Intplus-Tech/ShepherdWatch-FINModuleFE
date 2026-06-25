"use client"

import { API_V1 } from "@/lib/api"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUsers, useToggleUserStatus } from "@/components/hooks/useUsers"
import { SkeletonTable } from "@/components/ui/skeleton"
import {
  Ban,
  Bell,
  ChevronDown,
  CircleCheck,
  Filter,
  KeyRound,
  MapPin,
  MoreVertical,
  Search,
  User as UserIcon,
  UserPlus,
} from "lucide-react"

const smallText = "text-[12.4px] leading-[17.71px] font-normal"

export default function Page() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data, isLoading: loading } = useUsers({ page, limit, search: debouncedSearch })
  const { mutate: toggleStatus } = useToggleUserStatus()

  const fetchedUsers = Array.isArray(data?.data) ? data.data : []
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, pages: 1 }

  const users = fetchedUsers.map((u: any) => {
    const firstName = u.firstName || ""
    const lastName = u.lastName || ""
    const name = `${firstName} ${lastName}`.trim() || "Unknown User"
    const rawStatus = (u.status || "INACTIVE").toUpperCase()
    return {
      id: u.id || u._id,
      name,
      email: u.email,
      role: u.roleName || u.role || "Staff",
      branch: u.branchId?.name || u.branch || u.address || "HQ",
      lastActive: u.lastActive || "N/A",
      rawStatus,
      statusTone: rawStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
      initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?",
    }
  })

  const handleToggleStatus = (user: any) => {
    const newStatus = user.rawStatus === "ACTIVE" ? "deactivated" : "active"
    toggleStatus({ userId: user.id, status: newStatus })
  }

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const handleResetPassword = async (user: any) => {
    setOpenMenuId(null)
    if (!user.email) return
    try {
      const res = await fetch(`${API_V1}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: user.email }),
      })
      setResetMessage(
        res.ok
          ? `Password reset link sent to ${user.email}.`
          : "Unable to send reset link. Please try again."
      )
    } catch {
      setResetMessage("Unable to send reset link. Please try again.")
    } finally {
      setTimeout(() => setResetMessage(null), 4000)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <BranchLeadPastorSidebar />

      <main className="flex-1 text-[#111827] min-w-0">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 md:px-8 lg:px-10">
          <div className="text-[17px] font-extrabold text-[#111827] tracking-tight">Dashboard</div>
          <button className="relative text-[#6B7280] hover:text-[#111827] transition-colors">
            <Bell className="h-5 w-5" strokeWidth={2.5} />
            <span className="absolute -top-0.5 right-0 flex h-2 w-2 rounded-full bg-rose-500 border border-white" />
          </button>
        </header>

        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <section className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]">
                  User &amp; Role Management
                </h2>
                <p className={`${smallText} text-[#6B7280] mt-1`}>
                  Manage branch team members and their access. Invite new users to your branch.
                </p>
              </div>
              <Button
                onClick={() => router.push("/branchlead-pastor/invite-users")}
                className="h-8 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" /> Invite New User
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input
                    className="h-9 w-[260px] rounded-md border-[#E5E7EB] bg-white pl-9 text-[12px] text-[#6B7280]"
                    placeholder="Search users by name, email, or branch"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
                  <Filter className="h-4 w-4" /> Filter
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className={`${smallText} text-[#6B7280] flex items-center gap-2`}>
                <span>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total || 0)} of {pagination.total || 0} users</span>
                <div className="flex items-center gap-1 rounded-[8px] border border-[#E5E7EB] bg-white px-1">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-6 w-6 flex items-center justify-center text-[#6B7280] disabled:opacity-50">&lt;</button>
                  <button disabled={page >= (pagination.pages || 1)} onClick={() => setPage((p) => p + 1)} className="h-6 w-6 flex items-center justify-center text-[#6B7280] disabled:opacity-50">&gt;</button>
                </div>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
              <table className={`${smallText} w-full text-[#111827]`}>
                <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                  <tr>
                    <th className="py-3 px-4 text-left">USER</th>
                    <th className="py-3 px-4 text-left">ROLE</th>
                    <th className="py-3 px-4 text-left">BRANCH</th>
                    <th className="py-3 px-4 text-left">LAST ACTIVE</th>
                    <th className="py-3 px-4 text-left">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-4 px-4">
                        <SkeletonTable rows={5} columns={6} />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[#9CA3AF]">No users found.</td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user.email} className="border-t border-[#EEF1F6]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[10px] font-semibold text-[#3B5BDB]">
                              {user.initials}
                            </div>
                            <div>
                              <div className={`${smallText} font-semibold text-[#111827]`}>{user.name}</div>
                              <div className={`${smallText} text-[#9CA3AF]`}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-[#F3F4F6] text-[#6B7280]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6B7280]" />
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6B7280]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#9CA3AF]" />
                            {user.branch}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6B7280]">{user.lastActive}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-2 py-1 text-[10px] ${user.statusTone}`}>
                            {user.rawStatus === "ACTIVE" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {user.id && (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                aria-label="Row actions"
                                onClick={() => setOpenMenuId((cur) => (cur === user.id ? null : user.id))}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openMenuId === user.id && (
                                <>
                                  <button
                                    type="button"
                                    aria-label="Close menu"
                                    className="fixed inset-0 z-30 cursor-default"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 z-40 mt-1 w-52 overflow-hidden rounded-[10px] border border-[#EEF1F6] bg-white py-1 text-left shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                                    <button
                                      type="button"
                                      onClick={() => setOpenMenuId(null)}
                                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                                    >
                                      <UserIcon className="h-4 w-4 text-[#6B7280]" />
                                      View Profile
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleResetPassword(user)}
                                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                                    >
                                      <KeyRound className="h-4 w-4 text-[#6B7280]" />
                                      Reset Password
                                    </button>
                                    <div className="my-1 border-t border-[#EEF1F6]" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null)
                                        handleToggleStatus(user)
                                      }}
                                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium hover:bg-[#F9FAFB] ${
                                        user.rawStatus === "ACTIVE" ? "text-rose-600" : "text-emerald-600"
                                      }`}
                                    >
                                      {user.rawStatus === "ACTIVE" ? <Ban className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
                                      {user.rawStatus === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-2 text-[11px] text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  Rows per page
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
                    aria-label="Rows per page"
                    className="h-7 rounded-md border-[#E5E7EB] bg-white text-[10px] text-[#6B7280] px-2 outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div>Last synced: Just now</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {resetMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[10px] border border-[#EEF1F6] bg-white px-4 py-3 text-[12px] font-medium text-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          {resetMessage}
        </div>
      )}
    </div>
  )
}
