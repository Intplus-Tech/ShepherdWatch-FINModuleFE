"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Check,
  ChevronDown,
  Download,
  Filter,
  History,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react"

const users = [
  {
    name: "Sarah Jenkins",
    email: "sarah.j@shepherdwatch.com",
    role: "Director",
    roleTone: "bg-[#EDE9FE] text-[#7C3AED]",
    branch: "London HQ",
    lastActive: "2 mins ago",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    initials: "SJ",
  },
  {
    name: "Michael Johnson",
    email: "m.johnson@shepherdwatch.com",
    role: "Senior Pastor",
    roleTone: "bg-[#E0F2FE] text-[#0EA5E9]",
    branch: "New York Branch",
    lastActive: "1 day ago",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    initials: "MJ",
  },
  {
    name: "David Chen",
    email: "d.chen@shepherdwatch.com",
    role: "Accountant",
    roleTone: "bg-[#ECFDF3] text-[#16A34A]",
    branch: "Singapore Branch",
    lastActive: "3 days ago",
    status: "Invited",
    statusTone: "bg-amber-50 text-amber-600",
    initials: "DC",
  },
  {
    name: "Eliza Ross",
    email: "e.ross@shepherdwatch.com",
    role: "Admin Officer",
    roleTone: "bg-[#F3F4F6] text-[#6B7280]",
    branch: "Liberty HQ",
    lastActive: "4 hours ago",
    status: "Active",
    statusTone: "bg-emerald-50 text-emerald-600",
    initials: "ER",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/users" className="border-0 border-r border-[#EEF1F6]" />

          <main className="relative flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <div className="pointer-events-none select-none">
              <ScreenHeader
                title="Financial Overview"
                subtitle="Global financial health monitoring"
                rightSlot={
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      All Branches
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      This Month
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white p-0.5 text-[9px] text-[#6B7280]">
                      <button className="rounded-[8px] bg-[#E9EEFF] px-2 py-1 text-[#3B5BDB]">NGN</button>
                      <button className="rounded-[8px] px-2 py-1 text-[#6B7280]">USD</button>
                      <button className="rounded-[8px] px-2 py-1 text-[#6B7280]">EUR</button>
                    </div>
                    <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[10px] text-white">
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                  </div>
                }
              />

              <section className="mt-6 rounded-[14px] bg-white border border-[#EEF1F6] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#111827]">User &amp; Role Management</h2>
                    <p className="text-[10px] text-[#9CA3AF]">
                      Manage system access, user permissions across all global branches. Invite new directors or configure granular access controls.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export Report
                    </Button>
                    <Button size="sm" className="h-8 rounded-[10px] bg-[#3B5BDB] text-[10px] text-white">
                      <UserPlus className="h-3.5 w-3.5" />
                      Invite New User
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 border-b border-[#EEF1F6] text-[10px]">
                  <button className="flex items-center gap-2 border-b-2 border-[#3B5BDB] pb-2 text-[#3B5BDB] font-medium">
                    <Users className="h-3.5 w-3.5" />
                    User Directory
                  </button>
                  <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Permissions Matrix
                  </button>
                  <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                    <History className="h-3.5 w-3.5" />
                    Audit Log
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                      <Input
                        className="h-8 w-[220px] rounded-[10px] border-[#E5E7EB] bg-white pl-8 text-[10px] text-[#6B7280]"
                        placeholder="Search users by name, email, or branch"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-[#6B7280]">
                    <span>Showing 1-8 of 245 users</span>
                    <div className="flex items-center gap-1 rounded-[8px] border border-[#E5E7EB] bg-white px-1">
                      <button className="h-6 w-6 flex items-center justify-center text-[#6B7280]">&lt;</button>
                      <button className="h-6 w-6 flex items-center justify-center text-[#6B7280]">&gt;</button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
                  <table className="w-full text-[10px]">
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
                      {users.map((user) => (
                        <tr key={user.email} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 rounded border border-[#D1D5DB]" />
                              <div className="h-7 w-7 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[9px] font-semibold text-[#3B5BDB]">
                                {user.initials}
                              </div>
                              <div>
                                <div className="text-[10px] font-semibold text-[#111827]">{user.name}</div>
                                <div className="text-[9px] text-[#9CA3AF]">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`rounded-full px-2 py-1 text-[9px] ${user.roleTone}`}>{user.role}</span>
                          </td>
                          <td className="py-3 px-4 text-[#6B7280]">{user.branch}</td>
                          <td className="py-3 px-4 text-[#6B7280]">{user.lastActive}</td>
                          <td className="py-3 px-4">
                            <span className={`rounded-full px-2 py-1 text-[9px] ${user.statusTone}`}>{user.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right text-[#9CA3AF]">...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-2 text-[9px] text-[#9CA3AF]">
                    <div className="flex items-center gap-2">
                      Rows per page
                      <Button variant="outline" size="sm" className="h-6 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                        10
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>Last synced: Just now</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-[11px] font-semibold text-[#111827]">Role Permissions Overview</div>
                  <div className="mt-2 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                    <div className="grid grid-cols-5 gap-4 text-[9px] text-[#6B7280]">
                      <div />
                      <div className="rounded-[8px] bg-[#F3F0FF] px-2 py-1 text-center text-[#6D28D9] font-medium">Director</div>
                      <div className="rounded-[8px] bg-[#EEF2FF] px-2 py-1 text-center text-[#3B5BDB] font-medium">Pastor</div>
                      <div className="rounded-[8px] bg-[#ECFDF3] px-2 py-1 text-center text-[#16A34A] font-medium">Accountant</div>
                      <div className="rounded-[8px] bg-[#F3F4F6] px-2 py-1 text-center text-[#6B7280] font-medium">Admin</div>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-4 text-[9px]">
                      <div>
                        <div className="text-[10px] font-semibold text-[#111827]">Financial Controls</div>
                        <div className="text-[9px] text-[#9CA3AF]">Manage budgets and expenses</div>
                      </div>
                      {["Director", "Pastor", "Accountant", "Admin"].map((role) => (
                        <div key={`budget-${role}`} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                            <Check className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-[#6B7280]">Approve Budget</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-4 text-[9px]">
                      <div>
                        <div className="text-[10px] font-semibold text-[#111827]">User Management</div>
                        <div className="text-[9px] text-[#9CA3AF]">Add/remove staff members</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-[#6B7280]">Edit COA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-white" />
                        <span className="text-[#9CA3AF]">Edit COA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-[#6B7280]">Edit COA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-white" />
                        <span className="text-[#9CA3AF]">Edit COA</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-4 text-[9px]">
                      <div />
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-[#6B7280]">Invite Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-[#3B5BDB] flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-[#6B7280]">Invite Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-white" />
                        <span className="text-[#9CA3AF]">Invite Users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-white" />
                        <span className="text-[#9CA3AF]">Invite Users</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button className="text-[9px] text-[#3B5BDB]">Edit Full Matrix ?</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[#0F172A]/40" />

            <aside className="absolute right-0 top-0 h-full w-[300px] border-l border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
              <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                <div className="text-[11px] font-semibold text-[#111827]">Invite New User</div>
                <button className="h-6 w-6 rounded-full border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 px-4 py-4 text-[9px] text-[#6B7280]">
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Full Name</div>
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="e.g., John Doe" />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Email Address</div>
                  <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="e.g., john@shepherdwatch.com" />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Primary Role</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    Select a role...
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Branch Assignment</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    London HQ
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <div className="text-[8px] text-[#9CA3AF]">User will access data only from assigned branches.</div>
                </div>
              </div>

              <div className="mt-auto border-t border-[#EEF1F6] px-4 py-4 text-[9px] text-[#6B7280]">
                <div className="flex items-center justify-between">
                  <div>Send invitation Email immediately</div>
                  <div className="h-4 w-8 rounded-full bg-[#3B5BDB] px-0.5 flex items-center">
                    <div className="h-3 w-3 rounded-full bg-white translate-x-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    Send Invite
                  </Button>
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  )
}
