"use client"

import { useState, useEffect } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  Download,
  Filter,
  History,
  MapPin,
  MoreVertical,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Eye,
  KeyRound,
  UserX,
  GitBranch,
  UserCheck,
  Send,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const smallText = "text-[10.63px] leading-[14.17px] font-normal"
const bigText = "text-[12.4px] leading-[17.71px] font-semibold"
const sectionTitleText = "text-[17.71px] leading-[24.79px] font-bold"

export default function Page() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null)
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(false)
  
  const handleOpenProfile = async (id: string) => {
    setDropdownIndex(null)
    setSelectedUserId(id)
    setUserLoading(true)
    try {
      const res = await fetch(`/api/users/${id}`)
      const json = await res.json()
      if (res.ok) {
        setSelectedUser(json.data)
      } else {
        console.error("Failed to fetch user by id")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUserLoading(false)
    }
  }

  const handleCloseProfile = () => {
    setSelectedUserId(null)
    setSelectedUser(null)
  }

  const [editRoleUserId, setEditRoleUserId] = useState<string | null>(null)
  const [editRoleUser, setEditRoleUser] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [roleUpdateError, setRoleUpdateError] = useState<string | null>(null)

  const handleOpenEditRole = (user: any) => {
    setDropdownIndex(null)
    setEditRoleUserId(user.id)
    setEditRoleUser(user)
    setSelectedRole((user.roleName || user.role || "staff").toLowerCase())
    setRoleUpdateError(null)
  }

  const handleCloseEditRole = () => {
    setEditRoleUserId(null)
    setEditRoleUser(null)
    setSelectedRole("")
  }

  const handleUpdateRole = async () => {
    if (!editRoleUserId) return;
    setIsUpdatingRole(true);
    setRoleUpdateError(null);
    try {
      const res = await fetch(`/api/users/${editRoleUserId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole })
      });
      const data = await res.json();
      if (res.ok) {
        handleCloseEditRole();
        fetchUsers(searchTerm);
      } else {
        setRoleUpdateError(data.message || "Failed to update role");
      }
    } catch (error: any) {
      setRoleUpdateError(error.message || "An error occurred");
    } finally {
      setIsUpdatingRole(false);
    }
  }

  const [changeBranchUserId, setChangeBranchUserId] = useState<string | null>(null)
  const [changeBranchUser, setChangeBranchUser] = useState<any>(null)
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [isUpdatingBranch, setIsUpdatingBranch] = useState(false)
  const [branchUpdateError, setBranchUpdateError] = useState<string | null>(null)
  
  const [branches, setBranches] = useState<any[]>([])
  const [branchesLoading, setBranchesLoading] = useState(false)

  const fetchBranches = async () => {
    setBranchesLoading(true)
    try {
      const res = await fetch("/api/branches?page=1&limit=100", { credentials: "include" })
      const json = await res.json()
      if (res.ok) {
        const rows = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.data?.data)
            ? json.data.data
            : Array.isArray(json?.data?.items)
              ? json.data.items
              : []
        setBranches(rows)
      }
    } catch (e) {
      console.error("Failed to fetch branches", e)
    } finally {
      setBranchesLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  const handleOpenChangeBranch = (user: any) => {
    setDropdownIndex(null)
    setChangeBranchUserId(user.id)
    setChangeBranchUser(user)
    setSelectedBranchId(user.rawBranchId || "")
    setBranchUpdateError(null)
  }

  const handleCloseChangeBranch = () => {
    setChangeBranchUserId(null)
    setChangeBranchUser(null)
    setSelectedBranchId("")
  }

  const handleUpdateBranch = async () => {
    if (!changeBranchUserId || !selectedBranchId) return;
    setIsUpdatingBranch(true);
    setBranchUpdateError(null);
    try {
      const res = await fetch(`/api/users/${changeBranchUserId}/branch`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branchId: selectedBranchId })
      });
      const data = await res.json();
      if (res.ok) {
        handleCloseChangeBranch();
        fetchUsers(searchTerm);
      } else {
        setBranchUpdateError(data.message || "Failed to update branch assignment");
      }
    } catch (error: any) {
      setBranchUpdateError(error.message || "An error occurred");
    } finally {
      setIsUpdatingBranch(false);
    }
  }

  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null)

  const handleOpenResetPassword = (user: any) => {
    setDropdownIndex(null)
    setResetPasswordUserId(user.id)
    setResetPasswordUser(user)
    setResetPasswordError(null)
    setResetPasswordSuccess(null)
  }

  const handleCloseResetPassword = () => {
    setResetPasswordUserId(null)
    setResetPasswordUser(null)
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUserId) return;
    setIsResettingPassword(true);
    setResetPasswordError(null);
    setResetPasswordSuccess(null);
    try {
      const res = await fetch(`/api/users/${resetPasswordUserId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await res.json();
      if (res.ok) {
        setResetPasswordSuccess(data.message || "Password reset successful. Temporary password sent.");
        setTimeout(() => {
          handleCloseResetPassword();
        }, 2000);
      } else {
        setResetPasswordError(data.message || "Failed to reset password");
      }
    } catch (error: any) {
      setResetPasswordError(error.message || "An error occurred");
    } finally {
      setIsResettingPassword(false);
    }
  }

  const [deactivateUserId, setDeactivateUserId] = useState<string | null>(null)
  const [deactivateUser, setDeactivateUser] = useState<any>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)
  const [deactivateSuccess, setDeactivateSuccess] = useState<string | null>(null)

  const handleOpenDeactivate = (user: any) => {
    setDropdownIndex(null)
    setDeactivateUserId(user.id)
    setDeactivateUser(user)
    setDeactivateError(null)
    setDeactivateSuccess(null)
  }

  const handleCloseDeactivate = () => {
    setDeactivateUserId(null)
    setDeactivateUser(null)
  }

  const handleDeactivate = async () => {
    if (!deactivateUserId) return;
    setIsDeactivating(true);
    setDeactivateError(null);
    setDeactivateSuccess(null);
    try {
      const res = await fetch(`/api/users/${deactivateUserId}/deactivate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDeactivateSuccess(data.message || "User deactivated successfully.");
        fetchUsers(searchTerm);
        setTimeout(() => {
          handleCloseDeactivate();
        }, 2000);
      } else {
        setDeactivateError(data.message || "Failed to deactivate user");
      }
    } catch (error: any) {
      setDeactivateError(error.message || "An error occurred");
    } finally {
      setIsDeactivating(false);
    }
  }

  const [activateUserId, setActivateUserId] = useState<string | null>(null)
  const [activateUser, setActivateUser] = useState<any>(null)
  const [isActivating, setIsActivating] = useState(false)
  const [activateError, setActivateError] = useState<string | null>(null)
  const [activateSuccess, setActivateSuccess] = useState<string | null>(null)

  const handleOpenActivate = (user: any) => {
    setDropdownIndex(null)
    setActivateUserId(user.id)
    setActivateUser(user)
    setActivateError(null)
    setActivateSuccess(null)
  }

  const handleCloseActivate = () => {
    setActivateUserId(null)
    setActivateUser(null)
  }

  const handleActivate = async () => {
    if (!activateUserId) return;
    setIsActivating(true);
    setActivateError(null);
    setActivateSuccess(null);
    try {
      const res = await fetch(`/api/users/${activateUserId}/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActivateSuccess(data.message || "User activated successfully.");
        fetchUsers(searchTerm);
        setTimeout(() => {
          handleCloseActivate();
        }, 2000);
      } else {
        setActivateError(data.message || "Failed to activate user");
      }
    } catch (error: any) {
      setActivateError(error.message || "An error occurred");
    } finally {
      setIsActivating(false);
    }
  }

  const [resendInviteUserId, setResendInviteUserId] = useState<string | null>(null)
  const [resendInviteUser, setResendInviteUser] = useState<any>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendInviteError, setResendInviteError] = useState<string | null>(null)
  const [resendInviteSuccess, setResendInviteSuccess] = useState<string | null>(null)

  const handleOpenResendInvite = (user: any) => {
    setDropdownIndex(null)
    setResendInviteUserId(user.id)
    setResendInviteUser(user)
    setResendInviteError(null)
    setResendInviteSuccess(null)
  }

  const handleCloseResendInvite = () => {
    setResendInviteUserId(null)
    setResendInviteUser(null)
  }

  const handleResendInvite = async () => {
    if (!resendInviteUserId) return;
    setIsResending(true);
    setResendInviteError(null);
    setResendInviteSuccess(null);
    try {
      const res = await fetch(`/api/users/${resendInviteUserId}/resend-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        setResendInviteSuccess(data.message || "Invitation email resent.");
        setTimeout(() => {
          handleCloseResendInvite();
        }, 2000);
      } else {
        setResendInviteError(data.message || "Failed to resend invite");
      }
    } catch (error: any) {
      setResendInviteError(error.message || "An error occurred");
    } finally {
      setIsResending(false);
    }
  }

  const fetchUsers = async (search = "") => {
    setLoading(true)
    try {
      const url = new URL("/api/users", window.location.origin)
      if (search) url.searchParams.append("search", search)

      const res = await fetch(url.toString())
      const json = await res.json()
      
      if (res.ok && json.data) {
        const fetchedUsers = Array.isArray(json.data) ? json.data : []
        const mappedUsers = fetchedUsers.map((u: any) => {
          const firstName = u.firstName || ""
          const lastName = u.lastName || ""
          const name = `${firstName} ${lastName}`.trim() || "Unknown User"
          const statusStr = (u.status || "inactive").toLowerCase()
          const rawStatus = (u.status || "INACTIVE").toUpperCase()

          let roleTone = "bg-[#F3F4F6] text-[#6B7280]";
          let roleDot = "bg-[#6B7280]";
          
          if (u.role === "director" || u.roleName === "Director") {
            roleTone = "bg-[#EDE9FE] text-[#7C3AED]";
            roleDot = "bg-[#7C3AED]";
          } else if (u.role === "pastor" || u.roleName === "Senior Pastor") {
            roleTone = "bg-[#E0F2FE] text-[#0EA5E9]";
            roleDot = "bg-[#0EA5E9]";
          } else if (u.role === "accountant" || u.roleName === "Accountant") {
            roleTone = "bg-[#ECFDF3] text-[#16A34A]";
            roleDot = "bg-[#16A34A]";
          }

          let statusTone = "bg-rose-50 text-rose-600";
          if (statusStr === "active") statusTone = "bg-emerald-50 text-emerald-600";
          else if (statusStr === "invited" || statusStr === "pending") statusTone = "bg-amber-50 text-amber-600";

          return {
            id: u._id || u.id,
            name,
            email: u.email,
            role: u.roleName || u.role || "Staff",
            roleTone,
            roleDot,
            branch: u.branchId?.name || u.branch || u.address || "HQ",
            rawBranchId: u.branchId?._id || u.branchId?.id || (typeof u.branchId === "string" ? u.branchId : ""),
            lastActive: u.lastActive || "N/A",
            status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : "Unknown",
            rawStatus,
            statusTone,
            initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?",
            avatar: null,
          }
        })
        setUsers(mappedUsers)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(searchTerm)
  }, [searchTerm])

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const url = new URL("/api/users/export", window.location.origin)
      if (searchTerm) url.searchParams.append("search", searchTerm)

      const res = await fetch(url.toString())
      if (res.ok) {
        const blob = await res.blob()
        const contentType = res.headers.get("content-type")
        const ext = contentType?.includes("csv") ? "csv" : "json"
        
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = `users_export_${new Date().toISOString().split("T")[0]}.${ext}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        console.error("Failed to export users")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsExporting(false)
    }
  }

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
                <h2 className="text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]">
                  User &amp; Role Management
                </h2>
                <p className={`${smallText} text-[#6B7280] mt-1`}>
                  Manage system access, roles, and permissions across all global branches. Invite new
                  <br />
                  directors or configure granular access controls.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`${bigText} h-8 rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm hover:bg-gray-50`}
                  variant="outline"
                >
                  <Download className="h-4 w-4" /> {isExporting ? "Exporting..." : "Export Report"}
                </Button>
                <Button className={`${bigText} h-8 rounded-md bg-[#3B5BDB] text-white shadow hover:bg-blue-700`}>
                  <UserPlus className="h-4 w-4" /> Invite New User
                </Button>
              </div>
            </div>

            <div className={`mt-5 flex items-center gap-6 border-b border-[#EEF1F6] ${bigText}`}>
              <button className="flex items-center gap-2 border-b-2 border-[#3B5BDB] pb-2 text-[#3B5BDB]">
                <Users className="h-4 w-4" /> User Directory
              </button>
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <ShieldCheck className="h-4 w-4" /> Permissions Matrix
              </button>
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <History className="h-4 w-4" /> Audit Log
              </button>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]"
                >
                  <Filter className="h-4 w-4" /> Filter
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className={`${smallText} text-[#6B7280] flex items-center gap-2`}>
                <span>Showing 1-{users.length} of {users.length} users</span>
                <div className="flex items-center gap-1 rounded-[8px] border border-[#E5E7EB] bg-white px-1">
                  <button className="h-6 w-6 flex items-center justify-center text-[#6B7280]">&lt;</button>
                  <button className="h-6 w-6 flex items-center justify-center text-[#6B7280]">&gt;</button>
                </div>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
              <table className={`${smallText} w-full text-[#111827]`}>
                <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                  <tr>
                    <th className="py-3 px-4 text-left">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB]" />
                        USER
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left">ROLE</th>
                    <th className="py-3 px-4 text-left">BRANCH</th>
                    <th className="py-3 px-4 text-left">LAST ACTIVE</th>
                    <th className="py-3 px-4 text-left">STATUS</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-4 text-gray-500">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-gray-500">No users found</td></tr>
                  ) : users.map((user, index) => (
                    <tr key={user.email} className="border-t border-[#EEF1F6] relative">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded border border-[#D1D5DB]" />
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[10px] font-semibold text-[#3B5BDB]">
                              {user.initials}
                            </div>
                          )}
                          <div>
                            <div className={`${bigText} text-[#111827]`}>{user.name}</div>
                            <div className={`${smallText} text-[#9CA3AF]`}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${user.roleTone}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.roleDot}`} />
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
                        <span className={`rounded-full px-2 py-1 text-[10px] ${user.statusTone}`}>{user.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#9CA3AF] relative">
                        <MoreVertical 
                          className="ml-auto h-4 w-4 cursor-pointer hover:text-gray-700" 
                          onClick={() => setDropdownIndex(dropdownIndex === index ? null : index)} 
                        />
                        {dropdownIndex === index ? (
                          <div className="absolute right-4 top-10 w-[160px] rounded-[10px] border border-[#E5E7EB] bg-white p-1 shadow-lg z-10">
                            {(() => {
                              const dynamicItems: any[] = [
                                { label: "View Profile", icon: Eye },
                                { label: "Edit Permissions", icon: ShieldCheck },
                                { label: "Change Branch", icon: GitBranch },
                              ]
                              
                              if (user.rawStatus === "INVITED" || user.rawStatus === "PENDING" || user.status === "Invited" || user.status === "Pending") {
                                dynamicItems.push({ label: "Resend Invite", icon: Send, tone: "text-blue-600" })
                              } else {
                                dynamicItems.push({ label: "Reset Password", icon: KeyRound })
                              }

                              if (user.rawStatus === "DEACTIVATED" || user.status === "Deactivated") {
                                dynamicItems.push({ label: "Activate Account", icon: UserCheck, tone: "text-emerald-600" })
                              } else {
                                dynamicItems.push({ label: "Deactivate Account", icon: UserX, tone: "text-rose-600" })
                              }

                              return dynamicItems.map((item) => (
                                <button
                                  key={item.label}
                                  onClick={() => {
                                    if (item.label === "View Profile") handleOpenProfile(user.id)
                                    else if (item.label === "Edit Permissions") handleOpenEditRole(user)
                                    else if (item.label === "Change Branch") handleOpenChangeBranch(user)
                                    else if (item.label === "Reset Password") handleOpenResetPassword(user)
                                    else if (item.label === "Resend Invite") handleOpenResendInvite(user)
                                    else if (item.label === "Deactivate Account") handleOpenDeactivate(user)
                                    else if (item.label === "Activate Account") handleOpenActivate(user)
                                    else setDropdownIndex(null)
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left ${smallText} text-[#6B7280] hover:bg-[#F9FAFB] ${item.tone ?? ""}`}
                                >
                                  <item.icon className={`h-4 w-4 ${item.tone ?? "text-[#6B7280]"}`} />
                                  {item.label}
                                </button>
                              ))
                            })()}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-2 text-[11px] text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  Rows per page
                  <Button variant="outline" size="sm" className="h-7 rounded-md border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]">
                    10
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div>Last synced: Just now</div>
              </div>
            </div>

            <div className="mt-6">
              <div className={`${sectionTitleText} text-[#111827]`}>Role Permissions Overview</div>
              <div className="mt-2 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className={`${smallText} grid grid-cols-5 gap-4 text-[#6B7280]`}>
                  <div />
                  <div className="rounded-[8px] bg-[#F3F0FF] px-2 py-1 text-center text-[#6D28D9] font-medium">Director</div>
                  <div className="rounded-[8px] bg-[#EEF2FF] px-2 py-1 text-center text-[#3B5BDB] font-medium">Pastor</div>
                  <div className="rounded-[8px] bg-[#ECFDF3] px-2 py-1 text-center text-[#16A34A] font-medium">Accountant</div>
                  <div className="rounded-[8px] bg-[#F3F4F6] px-2 py-1 text-center text-[#6B7280] font-medium">Admin</div>
                </div>

                <div className={`${smallText} mt-4 grid grid-cols-5 gap-4`}>
                  <div>
                    <div className={`${bigText} text-[#111827]`}>Financial Controls</div>
                    <div className={`${smallText} text-[#9CA3AF]`}>Manage budgets and expenses</div>
                  </div>
                  {["Director", "Pastor", "Accountant", "Admin"].map((role) => (
                    <div key={`budget-${role}`} className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                        <span className="h-2 w-2 rounded-sm bg-white" />
                      </div>
                      <span className="text-[#6B7280]">Approve Budget</span>
                    </div>
                  ))}
                </div>

                <div className={`${smallText} mt-4 grid grid-cols-5 gap-4`}>
                  <div>
                    <div className={`${bigText} text-[#111827]`}>User Management</div>
                    <div className={`${smallText} text-[#9CA3AF]`}>Add/remove staff members</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                      <span className="h-2 w-2 rounded-sm bg-white" />
                    </div>
                    <span className="text-[#6B7280]">Edit COA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-white" />
                    <span className="text-[#9CA3AF]">Edit COA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                      <span className="h-2 w-2 rounded-sm bg-white" />
                    </div>
                    <span className="text-[#6B7280]">Edit COA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-white" />
                    <span className="text-[#9CA3AF]">Edit COA</span>
                  </div>
                </div>

                <div className={`${smallText} mt-4 grid grid-cols-5 gap-4`}>
                  <div />
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                      <span className="h-2 w-2 rounded-sm bg-white" />
                    </div>
                    <span className="text-[#6B7280]">Invite Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                      <span className="h-2 w-2 rounded-sm bg-white" />
                    </div>
                    <span className="text-[#6B7280]">Invite Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-white" />
                    <span className="text-[#9CA3AF]">Invite Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded border border-[#D1D5DB] bg-white" />
                    <span className="text-[#9CA3AF]">Invite Users</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button className={`flex items-center gap-1 ${smallText} text-[#3B5BDB]`}>
                    <span>Edit Full Matrix</span>
                    <span className="text-[12px]">→</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Dialog open={!!selectedUserId} onOpenChange={(open: boolean) => !open && handleCloseProfile()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4 font-sans">
            {userLoading ? (
              <div className="text-center text-sm text-[#6B7280] py-6">Loading user profile...</div>
            ) : selectedUser ? (
              <div className="space-y-6 text-[#111827]">
                <div className="flex items-center gap-4 border-b border-[#EEF1F6] pb-4">
                  <div className="h-14 w-14 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#3B5BDB] font-bold text-xl uppercase border border-[#D1D5DB]">
                    {selectedUser.firstName?.[0] || ""}{selectedUser.lastName?.[0] || ""}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-[13px] text-[#6B7280]">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> System Role</div>
                    <div className="text-[14px] font-medium capitalize text-[#374151]">
                      {selectedUser.roleName || selectedUser.role || "Staff"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Status</div>
                    <div className="inline-flex">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        (selectedUser.status === "active" || selectedUser.status === "ACTIVE")
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {selectedUser.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Phone Number</div>
                    <div className="text-[14px] font-medium text-[#374151]">{selectedUser.phoneNumber || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Branch Assignment</div>
                    <div className="text-[14px] font-medium text-[#374151] truncate" title={selectedUser.branch?.name || selectedUser.branchId?.name}>
                      {selectedUser.branch?.name || selectedUser.branchId?.name || selectedUser.address || "HQ Primary"}
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-[8px] border border-[#EEF1F6] mt-4">
                  <div className="text-[11px] font-semibold text-[#6B7280] mb-1">Internal Reference</div>
                  <div className="text-[13px] text-[#4B5563] break-all font-mono opacity-80">ID: {selectedUser._id || selectedUser.id}</div>
                  <div className="text-[11px] text-[#9CA3AF] mt-2">
                    {selectedUser.lastActive ? `Last online: ${selectedUser.lastActive}` : "Never logged in"} | 
                    Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-[#6B7280] py-6">Failed to load user.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRoleUserId} onOpenChange={(open: boolean) => !open && handleCloseEditRole()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>
          <div className="py-4 font-sans space-y-4">
            {roleUpdateError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                {roleUpdateError}
              </div>
            )}
            <div>
              <p className="text-[12px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Editing permissions for:</p>
              <div className="text-[16px] font-bold text-[#111827]">{editRoleUser?.name}</div>
              <div className="text-[13px] text-[#6B7280]">{editRoleUser?.email}</div>
            </div>
            
            <div className="mt-4">
              <label className="text-[12px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-3 block">Select New Role</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {[
                  { value: 'super_admin', label: 'Super Admin', desc: 'Full system access across all branches' },
                  { value: 'director', label: 'Director', desc: 'Regional oversight and management' },
                  { value: 'pastor', label: 'Pastor', desc: 'Branch-level leadership and management' },
                  { value: 'accountant', label: 'Accountant', desc: 'Financial records and transactions' },
                  { value: 'admin', label: 'Admin', desc: 'General administrative tasks within a branch' },
                  { value: 'staff', label: 'Staff', desc: 'Basic system access' },
                ].map(r => (
                  <label key={r.value} className={`flex items-start p-3 border rounded-[8px] cursor-pointer transition-colors ${selectedRole === r.value ? 'bg-[#EEF2FF] border-[#3B5BDB]' : 'bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>
                    <div className="flex items-center h-5">
                      <input 
                        type="radio" 
                        name="role" 
                        value={r.value}
                        checked={selectedRole === r.value}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-4 h-4 text-[#3B5BDB] border-[#D1D5DB] focus:ring-[#3B5BDB]" 
                      />
                    </div>
                    <div className="ml-3">
                      <span className="block text-[14px] font-semibold text-[#111827]">{r.label}</span>
                      <span className="block text-[12px] text-[#6B7280]">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-[#EEF1F6]">
              <Button variant="outline" size="sm" onClick={handleCloseEditRole} disabled={isUpdatingRole} className="h-9">Cancel</Button>
              <Button size="sm" onClick={handleUpdateRole} disabled={isUpdatingRole} className="h-9 bg-[#3B5BDB] hover:bg-blue-700 text-white">
                {isUpdatingRole ? "Saving..." : "Save Role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!changeBranchUserId} onOpenChange={(open: boolean) => !open && handleCloseChangeBranch()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Branch Assignment</DialogTitle>
          </DialogHeader>
          <div className="py-4 font-sans space-y-4">
            {branchUpdateError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                {branchUpdateError}
              </div>
            )}
            <div>
              <p className="text-[12px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Reassigning branch for:</p>
              <div className="text-[16px] font-bold text-[#111827]">{changeBranchUser?.name}</div>
              <div className="text-[13px] text-[#6B7280]">{changeBranchUser?.email}</div>
            </div>
            
            <div className="mt-4">
              <label className="text-[12px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-3 block">Select Target Branch</label>
              {branchesLoading ? (
                <div className="text-[13px] text-[#6B7280]">Loading available branches...</div>
              ) : branches.length === 0 ? (
                <div className="text-[13px] text-amber-600 bg-amber-50 p-3 rounded-md">No branches available in the system.</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {branches.map(branch => (
                    <label key={branch._id || branch.id} className={`flex items-start p-3 border rounded-[8px] cursor-pointer transition-colors ${selectedBranchId === (branch._id || branch.id) ? 'bg-[#EEF2FF] border-[#3B5BDB]' : 'bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>
                      <div className="flex items-center h-5">
                        <input 
                          type="radio" 
                          name="branch" 
                          value={branch._id || branch.id}
                          checked={selectedBranchId === (branch._id || branch.id)}
                          onChange={(e) => setSelectedBranchId(e.target.value)}
                          className="w-4 h-4 text-[#3B5BDB] border-[#D1D5DB] focus:ring-[#3B5BDB]" 
                        />
                      </div>
                      <div className="ml-3">
                        <span className="block text-[14px] font-semibold text-[#111827]">{branch.name}</span>
                        <span className="block text-[12px] text-[#6B7280]">{branch.address || branch.region || "No specific region/address attached"}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-[#EEF1F6]">
              <Button variant="outline" size="sm" onClick={handleCloseChangeBranch} disabled={isUpdatingBranch} className="h-9">Cancel</Button>
              <Button size="sm" onClick={handleUpdateBranch} disabled={isUpdatingBranch || !selectedBranchId} className="h-9 bg-[#3B5BDB] hover:bg-blue-700 text-white">
                {isUpdatingBranch ? "Saving..." : "Save Assignment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetPasswordUserId} onOpenChange={(open: boolean) => !open && handleCloseResetPassword()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
          </DialogHeader>
          <div className="py-4 font-sans space-y-4">
            {resetPasswordError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                {resetPasswordError}
              </div>
            )}
            {resetPasswordSuccess ? (
              <div className="p-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-1">Password Reset Generated</h3>
                <p className="text-[13px] text-[#6B7280]">{resetPasswordSuccess}</p>
                <div className="mt-4 pt-4 border-t border-[#EEF1F6]">
                  <Button size="sm" onClick={handleCloseResetPassword} className="h-9">Close</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-3 text-amber-700 text-[12.5px] leading-relaxed">
                  <span className="font-bold block mb-1">Confirm Identity Reset</span>
                  You are about to force a password reset for this user. They will be actively emailed a temporary password and forced to change it on their next login session. 
                </div>

                <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#EEF1F6] rounded-[8px]">
                  <p className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Target Account:</p>
                  <div className="text-[15px] font-bold text-[#111827]">{resetPasswordUser?.name}</div>
                  <div className="text-[13px] text-[#6B7280] font-mono">{resetPasswordUser?.email}</div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-[#EEF1F6]">
                  <Button variant="outline" size="sm" onClick={handleCloseResetPassword} disabled={isResettingPassword} className="h-9">Cancel</Button>
                  <Button size="sm" onClick={handleResetPassword} disabled={isResettingPassword} className="h-9 bg-rose-600 hover:bg-rose-700 text-white shadow-sm border-transparent">
                    {isResettingPassword ? "Generating..." : "Generate Temporary Password"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deactivateUserId} onOpenChange={(open: boolean) => !open && handleCloseDeactivate()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <UserX className="w-5 h-5" /> Deactivate User Account
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 font-sans space-y-4">
            {deactivateError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                {deactivateError}
              </div>
            )}
            {deactivateSuccess ? (
              <div className="p-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-1">Deactivation Complete</h3>
                <p className="text-[13px] text-[#6B7280]">{deactivateSuccess}</p>
                <div className="mt-4 pt-4 border-t border-[#EEF1F6]">
                  <Button size="sm" onClick={handleCloseDeactivate} className="h-9">Close</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-rose-50 border border-rose-200 rounded-[8px] p-3 text-rose-700 text-[12.5px] leading-relaxed">
                  <span className="font-bold block mb-1">Warning: Destructive Action</span>
                  You are about to immediately deactivate this user's account and revoke all their active sessions. They will no longer be able to log into the global platform.
                </div>

                <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#EEF1F6] rounded-[8px]">
                  <p className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Target Account:</p>
                  <div className="text-[15px] font-bold text-[#111827]">{deactivateUser?.name}</div>
                  <div className="text-[13px] text-[#6B7280] font-mono">{deactivateUser?.email}</div>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-[#F3F4F6] text-[#6B7280] text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6B7280]" />
                    {deactivateUser?.role} @ {deactivateUser?.branch}
                  </span>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-[#EEF1F6]">
                  <Button variant="outline" size="sm" onClick={handleCloseDeactivate} disabled={isDeactivating} className="h-9">Cancel</Button>
                  <Button size="sm" onClick={handleDeactivate} disabled={isDeactivating} className="h-9 bg-rose-600 hover:bg-rose-700 text-white shadow-sm border-transparent">
                    {isDeactivating ? "Deactivating..." : "Yes, Deactivate Account"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!activateUserId} onOpenChange={(open: boolean) => !open && handleCloseActivate()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-600 flex items-center gap-2">
              <UserCheck className="w-5 h-5" /> Reactivate User Account
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 font-sans space-y-4">
            {activateError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                {activateError}
              </div>
            )}
            {activateSuccess ? (
              <div className="p-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-1">Reactivation Complete</h3>
                <p className="text-[13px] text-[#6B7280]">{activateSuccess}</p>
                <div className="mt-4 pt-4 border-t border-[#EEF1F6]">
                  <Button size="sm" onClick={handleCloseActivate} className="h-9">Close</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-[8px] p-3 text-emerald-700 text-[12.5px] leading-relaxed">
                  <span className="font-bold block mb-1">Confirm Reactivation</span>
                  This user was previously deactivated. Activating them will restore their system permissions allowing them to log into the global platform once again.
                </div>

                <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#EEF1F6] rounded-[8px]">
                  <p className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Target Account:</p>
                  <div className="text-[15px] font-bold text-[#111827]">{activateUser?.name}</div>
                  <div className="text-[13px] text-[#6B7280] font-mono">{activateUser?.email}</div>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Currently {activateUser?.status}
                  </span>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-[#EEF1F6]">
                  <Button variant="outline" size="sm" onClick={handleCloseActivate} disabled={isActivating} className="h-9">Cancel</Button>
                  <Button size="sm" onClick={handleActivate} disabled={isActivating} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-transparent">
                    {isActivating ? "Activating..." : "Yes, Reactivate"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resendInviteUserId} onOpenChange={(open: boolean) => !open && handleCloseResendInvite()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-600 flex items-center gap-2">
              <Send className="w-5 h-5" /> Resend User Invitation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 font-sans space-y-4">
            {resendInviteError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                {resendInviteError}
              </div>
            )}
            {resendInviteSuccess ? (
              <div className="p-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-1">Invitation Resent</h3>
                <p className="text-[13px] text-[#6B7280]">{resendInviteSuccess}</p>
                <div className="mt-4 pt-4 border-t border-[#EEF1F6]">
                  <Button size="sm" onClick={handleCloseResendInvite} className="h-9">Close</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-3 text-blue-700 text-[12.5px] leading-relaxed">
                  <span className="font-bold block mb-1">Resend onboarding email</span>
                  This will generate a new set of temporary credentials and re-send the onboarding invitation to the target user. 
                </div>

                <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#EEF1F6] rounded-[8px]">
                  <p className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase mb-1">Target Account:</p>
                  <div className="text-[15px] font-bold text-[#111827]">{resendInviteUser?.name}</div>
                  <div className="text-[13px] text-[#6B7280] font-mono">{resendInviteUser?.email}</div>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Pending acceptance
                  </span>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-[#EEF1F6]">
                  <Button variant="outline" size="sm" onClick={handleCloseResendInvite} disabled={isResending} className="h-9">Cancel</Button>
                  <Button size="sm" onClick={handleResendInvite} disabled={isResending} className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-transparent">
                    {isResending ? "Resending..." : "Send Email"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
