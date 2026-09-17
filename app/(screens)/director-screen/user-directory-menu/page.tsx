"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import UserDirectory from "@/components/users/UserDirectory"

/** Organisation-wide user management: every branch, every action. */
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
          <UserDirectory
            basePath="/director-screen"
            inviteHref="/director-screen/invite-users"
            matrixHref="/director-screen/user-permission"
            auditHref="/director-screen/user-audit"
            canChangeBranch
          />
        </div>
      </main>
    </div>
  )
}
