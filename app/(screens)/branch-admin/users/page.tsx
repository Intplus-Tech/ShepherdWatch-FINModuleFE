"use client"

import { useState } from "react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminHeader from "@/components/navigation/BranchAdminHeader"
import UserDirectory from "@/components/users/UserDirectory"
import { useBranchContext } from "@/components/hooks/useBranchContext"

/**
 * The branch admin's user management, scoped to their branch. Same directory,
 * actions and modals as the Director's; inviting and moving users between
 * branches stay with the Director and pastor.
 */
export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { branchId } = useBranchContext()

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/users"
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh] min-w-0">
        <BranchAdminHeader title="Users" onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 text-[#111827]">
          <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
            <UserDirectory basePath="/branch-admin" branchId={branchId || undefined} canChangeBranch={false} />
          </div>
        </main>
      </div>
    </div>
  )
}
