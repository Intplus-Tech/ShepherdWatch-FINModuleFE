"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { userDirectoryUsers } from "@/app/(screens)/director-screen/users/page"
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
} from "lucide-react"

const smallText = "text-[10.63px] leading-[14.17px] font-normal"
const bigText = "text-[12.4px] leading-[17.71px] font-semibold"
const sectionTitleText = "text-[17.71px] leading-[24.79px] font-bold"

const menuItems = [
  { label: "View Profile", icon: Eye },
  { label: "Edit Permissions", icon: ShieldCheck },
  { label: "Change Branch", icon: GitBranch },
  { label: "Reset Password", icon: KeyRound },
  { label: "Deactivate Account", icon: UserX, tone: "text-rose-600" },
]

export default function Page() {
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
                  className={`${bigText} h-8 rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] shadow-sm hover:bg-gray-50`}
                  variant="outline"
                >
                  <Download className="h-4 w-4" /> Export Report
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
                <span>Showing 1-8 of 245 users</span>
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
                  {userDirectoryUsers.map((user, index) => (
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
                        <MoreVertical className="ml-auto h-4 w-4" />
                        {index === 2 ? (
                          <div className="absolute right-0 top-10 w-[160px] rounded-[10px] border border-[#E5E7EB] bg-white p-1 shadow-lg">
                            {menuItems.map((item) => (
                              <button
                                key={item.label}
                                className={`flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left ${smallText} text-[#6B7280] hover:bg-[#F9FAFB] ${item.tone ?? ""}`}
                              >
                                <item.icon className={`h-4 w-4 ${item.tone ?? "text-[#6B7280]"}`} />
                                {item.label}
                              </button>
                            ))}
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
    </div>
  )
}
