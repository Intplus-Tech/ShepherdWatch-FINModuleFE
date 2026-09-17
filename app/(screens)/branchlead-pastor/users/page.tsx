"use client"

import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import UserDirectory from "@/components/users/UserDirectory"
import { useBranchContext } from "@/components/hooks/useBranchContext"

/**
 * The pastor's user management, scoped to their branch. Same directory,
 * actions and modals as the Director's; moving users between branches is
 * left to the Director.
 */
export default function Page() {
  const { branchId } = useBranchContext()

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <BranchLeadPastorSidebar />

      <main className="flex-1 text-[#111827] min-w-0">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-[24px] leading-none font-bold text-[#111827]">Users</h1>
            <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Staff and access for your branch</p>
          </div>
          <UserDirectory
            basePath="/branchlead-pastor"
            branchId={branchId || undefined}
            inviteHref="/branchlead-pastor/invite-users"
            canChangeBranch={false}
          />
        </div>
      </main>
    </div>
  )
}
