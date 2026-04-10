"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { 
  Search, Bell, LayoutDashboard, Wallet, BarChart3, Building2,
  ShieldCheck, HelpCircle, Menu, X, User, Settings, Save, MapPin, ChevronRight
} from "lucide-react"

export default function SettingsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [revokingSessions, setRevokingSessions] = useState(false)
  const [revokeMessage, setRevokeMessage] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [sessionDetailsLoading, setSessionDetailsLoading] = useState(false)
  const [sessionDetailsError, setSessionDetailsError] = useState<string | null>(null)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/users/profile")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProfile(data.data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setSessionsLoading(true)
    setSessionsError(null)
    fetch("/api/sessions?page=1&limit=20")
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(data?.message || "Unable to load sessions")
        }
        const items = data?.data?.data ?? []
        setSessions(items)
      })
      .catch((err) => {
        setSessionsError(err instanceof Error ? err.message : "Unable to load sessions")
      })
      .finally(() => setSessionsLoading(false))
  }, [])

  const handleRevokeAllSessions = async () => {
    setRevokeMessage(null)
    setRevokingSessions(true)
    try {
      const res = await fetch("/api/sessions/revoke-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to revoke sessions")
      }
      setRevokeMessage(data?.message || "All sessions revoked successfully.")
      setSessions((prev) => prev.map((session) => ({ ...session, isActive: false })))
    } catch (err: any) {
      setSessionsError(err.message || "Unable to revoke sessions")
    } finally {
      setRevokingSessions(false)
    }
  }

  const handleViewSession = async (sessionId: string) => {
    setSessionDetailsLoading(true)
    setSessionDetailsError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load session details")
      }
      setSelectedSession(data?.data ?? null)
    } catch (err: any) {
      setSessionDetailsError(err.message || "Unable to load session details")
    } finally {
      setSessionDetailsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId)
    setSessionsError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/revoke`, { method: "PATCH" })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to revoke session")
      }
      setSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, isActive: false } : session
        )
      )
      if (selectedSession?._id === sessionId) {
        setSelectedSession({ ...selectedSession, isActive: false })
      }
    } catch (err: any) {
      setSessionsError(err.message || "Unable to revoke session")
    } finally {
      setRevokingSessionId(null)
    }
  }

  const fullName = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Loading..."
  const roleName = profile?.roleName || "Lead Pastor"
  const email = profile?.email || ""
  const phone = profile?.phoneNumber || ""
  const initials = profile ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() : ""

  return (
    <div className="flex flex-col xl:flex-row min-h-screen overflow-hidden bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-3 pb-8">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={28} height={28} className="shrink-0" />
            <div>
              <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#9CA3AF] font-bold mt-1 tracking-wide uppercase">Lead Pastor View</div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Financial Management", icon: BarChart3, hasChevron: true },
              { label: "Assets", icon: Building2 },
              { label: "Budget", icon: Wallet },
              { label: "Compliance & Remittance", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors text-[#4B5563] hover:bg-gray-50`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                    {item.label}
                  </div>
                  {item.hasChevron && <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />}
                </div>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="space-y-1.5 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer transition-colors bg-[#EEF2FF] text-[#3B5BDB]">
                <Settings className="h-4.5 w-4.5 stroke-[2] text-[#3B5BDB]" />
                Settings
              </div>
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-[#4B5563]">
                <HelpCircle className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Help Center
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3.5 px-3.5 pb-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-[#EEF2FF] text-[#3B5BDB] shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center font-bold">
                {profile?.avatar ? (
                  <Image src={profile.avatar} alt="Profile avatar" fill className="object-cover" />
                ) : (
                  initials || <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#111827] truncate max-w-[120px]">{fullName}</div>
                <div className="text-[11px] text-[#9CA3AF] font-medium truncate max-w-[120px]">{roleName}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Wrapping Column */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
        {/* Top Header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[14px] font-semibold text-[#111827]">
              Dashboard
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-[320px] sm:max-w-none">
            <div className="relative flex-1 w-full sm:max-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input 
                type="search" 
                placeholder="Search..." 
                className="h-[36px] sm:h-[38px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] pl-9 pr-3 text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all"
              />
            </div>
            <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
              <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-4 pt-0 pb-6 sm:px-6 sm:pt-0 sm:pb-8 xl:px-8 xl:pt-0 xl:pb-10">
          
          {/* Header Title Row */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-5 mt-6">
            <div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-[#111827] tracking-tight">
                User Settings
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#6B7280] mt-1.5 font-medium">
                Manage personal details, alerts, and operational templates.
              </p>
            </div>
            
            <button className="h-[36px] sm:h-[40px] px-5 sm:px-6 shrink-0 bg-[#2563EB] hover:bg-blue-700 text-white rounded-[8px] text-[13px] sm:text-[14px] font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
              <Save className="h-4.5 w-4.5" />
              Save All Changes
            </button>
          </div>

          {/* Profile Card Module */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading profile data...</div>
          ) : (
            <div className="w-full bg-white rounded-[16px] border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-5 sm:p-6 lg:p-8">
              
              {/* Top Profile Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-[#EEF2FF] shrink-0 border border-gray-100 shadow-inner relative flex items-center justify-center text-[20px] font-bold text-[#3B5BDB]">
                    {profile?.avatar ? (
                      <Image src={profile.avatar} alt="Profile avatar" fill className="object-cover" />
                    ) : (
                      initials || <User className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111827]">{fullName}</h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 sm:mt-1.5">
                      <span className="text-[13px] font-medium text-[#6B7280]">{profile?.roleName || "Pastor"}</span>
                      {profile?.id && (
                        <>
                          <span className="text-[13px] text-[#D1D5DB]">|</span>
                          <span className="text-[13px] font-medium text-[#9CA3AF]">ID: #{profile.id.substring(0, 6)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] mt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#9CA3AF]" />
                      {profile?.address || "Branch Office"}
                    </div>
                  </div>
                </div>

                <button className="text-[13px] sm:text-[14px] font-semibold text-[#3B5BDB] hover:text-blue-800 transition-colors self-start sm:self-auto py-1">
                  Change Password
                </button>
              </div>

              {/* Separator Divider */}
              <div className="h-[1px] w-full bg-[#E5E7EB] mb-8"></div>

              {/* 2x2 Form Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
                
                {/* Box 1: Full Name */}
                <div className="space-y-2">
                  <label className="block text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    readOnly
                    className="h-[42px] sm:h-[48px] w-full rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-[13px] sm:text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] transition-all" 
                  />
                </div>

                {/* Box 2: Employee ID (Readonly) */}
                <div className="space-y-2">
                  <label className="block text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
                    Employee ID
                  </label>
                  <input 
                    type="text" 
                    value={profile?.id || ""} 
                    readOnly 
                    className="h-[42px] sm:h-[48px] w-full rounded-[10px] border border-[#E2E8F0] bg-[#F9FAFB] px-4 text-[13px] sm:text-[14px] font-semibold text-[#3B5BDB] focus:outline-none cursor-not-allowed" 
                  />
                </div>

                {/* Box 3: Work Email */}
                <div className="space-y-2">
                  <label className="block text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
                    Work Email
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    readOnly
                    className="h-[42px] sm:h-[48px] w-full rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-[13px] sm:text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] transition-all" 
                  />
                </div>

                {/* Box 4: Phone Number */}
                <div className="space-y-2">
                  <label className="block text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    value={phone}
                    readOnly
                    className="h-[42px] sm:h-[48px] w-full rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-[13px] sm:text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] transition-all" 
                  />
                </div>

              </div>
              
            </div>
          )}

          {/* Active Sessions */}
          <div className="mt-8 w-full bg-white rounded-[16px] border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="p-5 sm:p-6 lg:p-8 border-b border-[#EEF1F6] flex items-center justify-between gap-4">
              <h3 className="text-[#111827] text-[18px] sm:text-[20px] font-[800] tracking-tight">Active Sessions</h3>
              <p className="text-[#6B7280] text-[12.5px] sm:text-[13.5px] font-[500] mt-1">
                Devices currently logged into your account.
              </p>
              <button
                onClick={handleRevokeAllSessions}
                disabled={revokingSessions}
                className="h-[38px] px-4 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] font-[700] hover:bg-[#1D4ED8] transition-colors disabled:opacity-70 whitespace-nowrap"
              >
                {revokingSessions ? "Revoking..." : "Log out of all devices"}
              </button>
            </div>

            {sessionsLoading ? (
              <div className="p-6 sm:p-8 text-[#64748B] text-[14px]">Loading sessions...</div>
            ) : revokeMessage ? (
              <div className="p-6 sm:p-8 text-emerald-600 text-[13.5px] font-[600]">{revokeMessage}</div>
            ) : sessionsError ? (
              <div className="p-6 sm:p-8 text-rose-600 text-[13.5px] font-[600]">{sessionsError}</div>
            ) : sessions.length === 0 ? (
              <div className="p-6 sm:p-8 text-[#64748B] text-[14px]">No active sessions found.</div>
            ) : (
              <div className="p-6 sm:p-8 grid grid-cols-1 gap-4">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="border border-[#EEF1F6] rounded-[12px] p-4 sm:p-5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[#111827] text-[14px] font-[800]">
                        {session.device || "Unknown Device"}
                      </div>
                      <div className={`text-[12px] font-[700] ${session.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                        {session.isActive ? "Active" : "Expired"}
                      </div>
                    </div>
                    <div className="text-[#64748B] text-[13px] font-[500]">
                      {session.browser || "Unknown Browser"} • {session.os || "Unknown OS"}
                    </div>
                    <div className="text-[#64748B] text-[12.5px] font-[500]">
                      IP: {session.ipAddress || "Unknown"} • {session.location || "Unknown location"}
                    </div>
                    <div className="text-[#94A3B8] text-[12px] font-[500]">
                      Created: {session.createdAt ? new Date(session.createdAt).toLocaleString() : "N/A"} •
                      Expires: {session.expiresAt ? new Date(session.expiresAt).toLocaleString() : "N/A"}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewSession(session._id)}
                        className="text-[12px] font-[700] text-[#2563EB] hover:underline"
                      >
                        View details
                      </button>
                      <button
                        onClick={() => handleRevokeSession(session._id)}
                        disabled={revokingSessionId === session._id || !session.isActive}
                        className="text-[12px] font-[700] text-rose-600 hover:underline disabled:opacity-60"
                      >
                        {revokingSessionId === session._id ? "Revoking..." : "Revoke"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sessionDetailsLoading ? (
              <div className="px-6 sm:px-8 pb-6 text-[#64748B] text-[13px]">Loading session details...</div>
            ) : sessionDetailsError ? (
              <div className="px-6 sm:px-8 pb-6 text-rose-600 text-[13px] font-[600]">{sessionDetailsError}</div>
            ) : selectedSession ? (
              <div className="px-6 sm:px-8 pb-6 text-[13px] text-[#64748B]">
                Viewing: {selectedSession.device || "Unknown Device"} • {selectedSession.browser || "Unknown Browser"} • {selectedSession.os || "Unknown OS"} • {selectedSession.location || "Unknown location"}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
