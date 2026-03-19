"use client"

import React from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  Filter,
  History,
  ShieldCheck,
  Users,
  Check,
} from "lucide-react"

const permissions = [
  {
    section: "Financial Controls",
    items: [
      {
        name: "Approve Budgets",
        desc: "Authorize annual branch budget proposals",
        checks: [true, true, false, false],
      },
      {
        name: "Edit Chart of Accounts (COA)",
        desc: "Modify ledger account structures",
        checks: [true, false, true, false],
      },
      {
        name: "Approve Over-Budget Expenses",
        desc: "Override soft limits on expense categories",
        checks: [true, true, false, false],
      },
    ],
  },
  {
    section: "User Management",
    items: [
      {
        name: "Invite New Users",
        desc: "Send invitations to new staff",
        checks: [true, true, false, true],
      },
      {
        name: "Revoke Access",
        desc: "Disable user accounts",
        checks: [true, false, false, false],
      },
    ],
  },
  {
    section: "Branch Settings",
    items: [
      {
        name: "Configure Branch Info",
        desc: "Edit location details and contacts",
        checks: [true, true, false, true],
      },
    ],
  },
  {
    section: "Reports",
    items: [
      {
        name: "View Sensitive Reports",
        desc: "Access salary and donation details",
        checks: [true, true, true, false],
      },
      {
        name: "Export Data",
        desc: "Download CSV/PDF reports",
        checks: [true, true, true, true],
      },
    ],
  },
]

const smallText = "text-[10.63px] leading-[14.17px] font-normal"
const bigText = "text-[12.4px] leading-[17.71px] font-medium"

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
                <h2 className="text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]">User &amp; Role Management</h2>
                <p className={`${smallText} text-[#6B7280] mt-1`}>
                  Manage system access, roles, and permissions across all global branches. Invite new
                  <br />
                  directors or configure granular access controls.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="h-8 rounded-md border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50" variant="outline">
                  Reset to Defaults
                </Button>
                <Button className="h-8 rounded-md bg-[#3B5BDB] text-[11px] font-medium text-white shadow hover:bg-blue-700">
                  Save Matrix
                </Button>
              </div>
            </div>

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

            <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
              <table className={`${smallText} w-full text-[#111827]`}>
                <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                  <tr>
                    <th className="py-3 px-4 text-left">PERMISSION / ACTION</th>
                    <th className="py-3 px-4 text-center text-[#7C3AED]">Super Admin<br /><span className="text-[10px] text-[#9CA3AF]">Full Access</span></th>
                    <th className="py-3 px-4 text-center text-[#2563EB]">Pastor<br /><span className="text-[10px] text-[#9CA3AF]">Overseer</span></th>
                    <th className="py-3 px-4 text-center text-[#16A34A]">Accountant<br /><span className="text-[10px] text-[#9CA3AF]">Financial Ops</span></th>
                    <th className="py-3 px-4 text-center text-[#6B7280]">Admin Officer<br /><span className="text-[10px] text-[#9CA3AF]">Administrative</span></th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((section) => (
                    <React.Fragment key={section.section}>
                      <tr className="bg-[#F9FAFB] text-[#9CA3AF]">
                        <td className="py-3 px-4 text-[11px] font-medium uppercase tracking-wide" colSpan={5}>
                          {section.section}
                        </td>
                      </tr>
                      {section.items.map((item) => (
                        <tr key={item.name} className="border-t border-[#EEF1F6]">
                          <td className="py-3 px-4">
                            <div className={`${bigText} text-[#111827]`}>{item.name}</div>
                            <div className={`${smallText} text-[#9CA3AF]`}>{item.desc}</div>
                          </td>
                          {item.checks.map((val, idx) => (
                            <td key={idx} className="py-3 px-4 text-center">
                              <div className={`mx-auto h-4 w-4 rounded border ${val ? "bg-[#3B5BDB] border-[#3B5BDB]" : "bg-white border-[#D1D5DB]"} flex items-center justify-center`}>
                                {val ? <Check className="h-3 w-3 text-white" /> : null}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[11px] text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-[#D1D5DB] bg-white" />
                  Super Admin permissions are locked for security reasons.
                </div>
                <div>Last saved: 2 hours ago by Sarah Jenkins</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}



