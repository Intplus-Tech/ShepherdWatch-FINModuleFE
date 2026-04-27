"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { 
  Search, Bell, LayoutDashboard, Wallet, BarChart3, Building2,
  ShieldCheck, HelpCircle, Menu, X, User, Settings, Save, MapPin, ChevronRight
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ActiveSessionsManager } from "@/components/settings/ActiveSessionsManager";

export default function SettingsPage() {
  const queryClient = useQueryClient();
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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { data: selectedSession, isLoading: sessionDetailsLoading, error: sessionDetailsErrorObj } = useQuery({
    queryKey: ['session', selectedSessionId],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/sessions/${selectedSessionId}`);
      return res.data?.data;
    },
    enabled: !!selectedSessionId
  });
  const sessionDetailsError = sessionDetailsErrorObj ? (sessionDetailsErrorObj as Error).message : null;
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





  const fullName = fullNameInput || (profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Loading...")
  const roleName = profile?.roleName || "Lead Pastor"
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
            
            <button onClick={handleSaveProfile} disabled={profileSaving} className="h-[36px] sm:h-[40px] px-5 sm:px-6 shrink-0 bg-[#2563EB] hover:bg-blue-700 text-white rounded-[8px] text-[13px] sm:text-[14px] font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              <Save className="h-4.5 w-4.5" />
              {profileSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
          {profileError ? <p className="mb-4 text-[12.5px] font-semibold text-rose-600">{profileError}</p> : null}
          {profileSuccess ? <p className="mb-4 text-[12.5px] font-semibold text-emerald-600">{profileSuccess}</p> : null}

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
                    onChange={(event) => setFullNameInput(event.target.value)}
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
                    onChange={(event) => setPhoneInput(event.target.value)}
                    className="h-[42px] sm:h-[48px] w-full rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-[13px] sm:text-[14px] font-semibold text-[#111827] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] transition-all" 
                  />
                </div>

              </div>
              
            </div>
          )}

          {/* Active Sessions */}
            <ActiveSessionsManager />

</div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}


