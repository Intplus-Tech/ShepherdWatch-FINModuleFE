"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import SettingsConfigSidebar from "@/components/navigation/SettingsConfigSidebar"
import { ActiveSessionsManager } from "@/components/settings/ActiveSessionsManager"
import { ScrollText } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-65 rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-65 text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <SettingsConfigSidebar active="audit" />

            <section className="space-y-6">
              <div>
                <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                  Audit Log
                </h2>
                <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                  Monitor session and device activity across the organization.
                </p>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <ScrollText className="h-4 w-4 text-[#3B5BDB]" />
                    Session &amp; Device Activity
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <ActiveSessionsManager />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
