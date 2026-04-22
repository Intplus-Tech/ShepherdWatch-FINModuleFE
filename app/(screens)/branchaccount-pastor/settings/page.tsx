"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  Database,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Bell,
  MapPin,
  Save,
  User
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export default function Page() {
  const { updateProfile } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [fullNameInput, setFullNameInput] = useState("")
  const [phoneInput, setPhoneInput] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
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
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProfile(data.data)
          const nextFullName = `${data.data.firstName || ""} ${data.data.lastName || ""}`.trim()
          setFullNameInput(nextFullName)
          setPhoneInput(String(data.data.phone ?? data.data.phoneNumber ?? ""))
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
      const currentSession = sessions.find((session) =>
        Boolean(session?.isCurrent ?? session?.isCurrentSession ?? session?.current ?? session?.currentDevice)
      )
      const currentSessionId = String(currentSession?._id ?? currentSession?.id ?? "")
      const res = await fetch("/api/sessions/revoke-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentSessionId ? { currentSessionId } : {}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to revoke sessions")
      }
      setRevokeMessage(data?.message || "All sessions revoked successfully.")
      setSessions((prev) =>
        prev.map((session) => {
          const sessionId = String(session?._id ?? session?.id ?? "")
          return { ...session, isActive: currentSessionId ? sessionId === currentSessionId : false }
        })
      )
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

  const fullName = fullNameInput || (profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Loading...")
  const roleName = profile?.roleName || "Accountant"
  const email = profile?.email || ""
  const phone = phoneInput || String(profile?.phone ?? profile?.phoneNumber ?? "")
  const initials = profile ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() : ""

  const handleSaveProfile = async () => {
    if (!profile) return
    setProfileError(null)
    setProfileSuccess(null)

    const normalizedFullName = fullNameInput.trim().replace(/\s+/g, " ")
    const normalizedPhone = phoneInput.trim()
    const originalFirstName = String(profile.firstName ?? "").trim()
    const originalLastName = String(profile.lastName ?? "").trim()
    const originalPhone = String(profile.phone ?? profile.phoneNumber ?? "").trim()

    const payload: { firstName?: string; lastName?: string; phone?: string } = {}
    if (normalizedFullName) {
      const nameParts = normalizedFullName.split(" ").filter(Boolean)
      const firstName = nameParts[0] ?? ""
      const lastName = nameParts.slice(1).join(" ")
      if (firstName.length < 2) {
        setProfileError("First name must be at least 2 characters.")
        return
      }
      if (lastName && lastName.length < 2) {
        setProfileError("Last name must be at least 2 characters.")
        return
      }
      if (firstName !== originalFirstName) payload.firstName = firstName
      if (lastName && lastName !== originalLastName) payload.lastName = lastName
    }
    if (normalizedPhone && normalizedPhone !== originalPhone) {
      payload.phone = normalizedPhone
    }

    if (Object.keys(payload).length === 0) {
      setProfileError("No profile changes to save.")
      return
    }

    setProfileSaving(true)
    try {
      await updateProfile(payload)
      setProfile((prev: unknown) => ({
        ...(prev ?? {}),
        ...(payload.firstName ? { firstName: payload.firstName } : {}),
        ...(payload.lastName ? { lastName: payload.lastName } : {}),
        ...(payload.phone ? { phone: payload.phone, phoneNumber: payload.phone } : {}),
      }))
      setProfileSuccess("Profile updated successfully.")
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Unable to update profile.")
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className={`flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
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
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div>
              <div className="text-[15px] font-bold text-[#3B5BDB] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-1 tracking-wide">{roleName}&apos;s View</div>
            </div>
          </div>

          <nav className="space-y-1 flex-1 mt-2">
            {[
              { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
              { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
              { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database },
              { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
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
                </div>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="space-y-1 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer transition-colors bg-[#EEF2FF] text-[#3B5BDB]">
                <Settings className="h-4.5 w-4.5 stroke-[2] text-[#3B5BDB]" />
                Settings
              </div>
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <HelpCircle className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Help Center
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3.5 px-3.5 pb-2 cursor-pointer hover:opacity-80 transition-opacity">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[15px] font-bold text-[#111827] tracking-tight">
              Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-[320px] sm:max-w-none">
            <div className="relative flex-1 w-full sm:max-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search transactions..."
                className="h-[36px] sm:h-[38px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] pl-9 pr-3 text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all"
              />
            </div>
            <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
              <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Layout */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 lg:py-6">
          <div className="mx-auto w-full max-w-[1440px]">

            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-5">
              <div>
                <h1
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    fontSize: "36.49px",
                    lineHeight: "40.55px",
                    letterSpacing: "-0.91px",
                    verticalAlign: "middle",
                    width: "270.77px",
                    height: "40.55px"
                  }}
                >
                  User Settings
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#6B7280] font-medium tracking-tight">Manage personal details, alerts, and operational templates.</p>
              </div>

              <div className="flex items-center shrink-0">
                <button onClick={handleSaveProfile} disabled={profileSaving} className="w-full sm:w-auto flex items-center justify-center gap-2 h-[42px] px-6 rounded-[8px] bg-[#2563EB] text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] hover:bg-[#1D4ED8] transition-colors tracking-wide disabled:opacity-70">
                  <Save className="h-4 w-4" strokeWidth={2.5} />
                  {profileSaving ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            </header>
            {profileError ? <p className="mb-4 text-[12.5px] font-semibold text-rose-600">{profileError}</p> : null}
            {profileSuccess ? <p className="mb-4 text-[12.5px] font-semibold text-emerald-600">{profileSuccess}</p> : null}

            {/* Card Container */}
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading profile data...</div>
            ) : (
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-10 w-full mb-12">
                
                {/* Profile Top Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 lg:mb-10 pb-8 sm:pb-0 border-b sm:border-0 border-[#EEF1F6]">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                    {/* Avatar */}
                    <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-full overflow-hidden bg-[#EEF2FF] border-[3px] sm:border-[4px] border-white shadow-md relative shrink-0 flex items-center justify-center text-[28px] font-bold text-[#3B5BDB]">
                      {profile?.avatar ? (
                        <Image src={profile.avatar} alt="Profile avatar" fill className="object-cover" />
                      ) : (
                        initials || <User className="h-10 w-10" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex flex-col gap-1 sm:gap-1.5 pt-1">
                      <h2 className="text-[20px] lg:text-[22px] font-bold text-[#111827] tracking-tight">{fullName}</h2>
                      <div className="text-[13px] lg:text-[14px] font-medium text-[#6B7280] flex flex-col sm:flex-row sm:items-center">
                        <span>{roleName}</span> 
                        {profile?.id && (
                          <>
                            <span className="hidden sm:inline mx-2 text-gray-300">|</span>
                            <span className="mt-1 sm:mt-0">ID: <span className="font-bold text-[#4B5563]">{profile.id.substring(0,6)}</span></span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 sm:mt-0.5">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3B5BDB]" />
                        <span className="text-[12.5px] sm:text-[13px] font-medium text-[#3B5BDB]">{profile?.address || "Headquarters"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center md:justify-end mt-2 md:mt-0">
                    <button className="text-[13.5px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline underline-offset-4 transition-all tracking-tight whitespace-nowrap bg-blue-50 md:bg-transparent px-8 md:px-0 py-2.5 md:py-0 rounded-full md:rounded-none w-full sm:w-auto">
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                  
                  {/* Full Name */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[12px] font-[800] text-[#111827] px-1 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(event) => setFullNameInput(event.target.value)}
                      className="w-full rounded-[10px] bg-[#F9FAFB] border border-transparent h-[46px] px-4 text-[14px] font-medium text-[#111827] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all" 
                    />
                  </div>

                  {/* Employee ID */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[12px] font-[800] text-[#111827] px-1 uppercase tracking-wider">Employee ID</label>
                    <input 
                      type="text" 
                      value={profile?.id || ""}
                      readOnly
                      className="w-full rounded-[10px] bg-[#F9FAFB] border border-transparent h-[46px] px-4 text-[14px] font-medium text-[#111827] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all" 
                    />
                  </div>

                  {/* Work Email */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[12px] font-[800] text-[#111827] px-1 uppercase tracking-wider">Work Email</label>
                    <input 
                      type="email" 
                      value={email}
                      readOnly
                      className="w-full rounded-[10px] bg-[#F9FAFB] border border-transparent h-[46px] px-4 text-[14px] font-medium text-[#111827] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all" 
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[12px] font-[800] text-[#111827] px-1 uppercase tracking-wider">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(event) => setPhoneInput(event.target.value)}
                      className="w-full rounded-[10px] bg-[#F9FAFB] border border-transparent h-[46px] px-4 text-[14px] font-medium text-[#111827] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all" 
                    />
                  </div>

                </div>

              </div>
            )}

            {/* Active Sessions */}
            <div className="mt-6 sm:mt-8 rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-full">
              <div className="p-6 sm:p-8 md:p-10 border-b border-[#EEF1F6] flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] tracking-tight">Active Sessions</h3>
                  <p className="text-[#6B7280] text-[13px] sm:text-[14px] font-[500] mt-1">
                    Devices currently logged into your account.
                  </p>
                </div>
                <button
                  onClick={handleRevokeAllSessions}
                  disabled={revokingSessions}
                  className="h-[38px] px-4 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] font-[700] hover:bg-[#1D4ED8] transition-colors disabled:opacity-70 whitespace-nowrap"
                >
                  {revokingSessions ? "Revoking..." : "Log out of all devices"}
                </button>
              </div>

              {sessionsLoading ? (
                <div className="p-6 sm:p-8 md:p-10 text-[#64748B] text-[14px]">Loading sessions...</div>
              ) : revokeMessage ? (
                <div className="p-6 sm:p-8 md:p-10 text-emerald-600 text-[13.5px] font-[600]">{revokeMessage}</div>
              ) : sessionsError ? (
                <div className="p-6 sm:p-8 md:p-10 text-rose-600 text-[13.5px] font-[600]">{sessionsError}</div>
              ) : sessions.length === 0 ? (
                <div className="p-6 sm:p-8 md:p-10 text-[#64748B] text-[14px]">No active sessions found.</div>
              ) : (
                <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 gap-4">
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
                <div className="px-6 sm:px-8 md:px-10 pb-6 text-[#64748B] text-[13px]">Loading session details...</div>
              ) : sessionDetailsError ? (
                <div className="px-6 sm:px-8 md:px-10 pb-6 text-rose-600 text-[13px] font-[600]">{sessionDetailsError}</div>
              ) : selectedSession ? (
                <div className="px-6 sm:px-8 md:px-10 pb-6 text-[13px] text-[#64748B]">
                  Viewing: {selectedSession.device || "Unknown Device"} • {selectedSession.browser || "Unknown Browser"} • {selectedSession.os || "Unknown OS"} • {selectedSession.location || "Unknown location"}
                </div>
              ) : null}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}


