"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Wallet,
  Wrench,
  X,
  LogOut,
  Menu,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

export default function SettingsPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { updateProfile, user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      let res = await fetch("/api/v1/auth/me", { credentials: "include" })
      if (res.status === 401) {
        const refreshRes = await fetch("/api/v1/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        })
        if (refreshRes.ok) {
          res = await fetch("/api/v1/auth/me", { credentials: "include" })
        }
      }
      const data = await res.json().catch(() => null)
      if (res.ok) {
        const me = data?.data
        setProfile(me ?? null)
        if (me) {
          setFullName(`${me.firstName ?? ""} ${me.lastName ?? ""}`.trim())
          setPhone(String(me.phone ?? me.phoneNumber ?? ""))
        }
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const displayName = useMemo(() => {
    if (fullName.trim()) return fullName.trim()
    return user?.name || user?.email || "User"
  }, [fullName, user])

  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const employeeId = String(profile?.id ?? profile?._id ?? "").slice(0, 4) || "----"
  const workEmail = profile?.email ?? user?.email ?? ""
  const branchLabel = profile?.address ?? "Victoria Island Branch, Lagos"
  const initials = `${String(profile?.firstName ?? "")[0] ?? ""}${String(profile?.lastName ?? "")[0] ?? ""}`.toUpperCase() || "U"

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const parts = fullName.trim().split(/\s+/).filter(Boolean)
      await updateProfile({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        phone: phone.trim() || undefined,
      })
      setMessage("Profile updated successfully.")
    } catch (e: any) {
      setError(e?.message || "Unable to update profile")
    } finally {
      setSaving(false)
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/branchlead-pastor/dashboard", icon: LayoutDashboard },
    { label: "Financial Management", href: "/branchlead-pastor/financial-management", icon: FileText },
    { label: "Assets", href: "/branchlead-pastor/assets", icon: Wrench },
    { label: "Budget", href: "/branchlead-pastor/budget", icon: Wallet },
    { label: "Compliance & Remittance", href: "/branchlead-pastor/compliance-remittance", icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#EEF1F6] bg-[#FAFBFF] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:flex shrink-0`}>
        <div className="flex flex-col gap-1 px-6 pt-6 lg:pt-8 pb-4 relative">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={160} height={36} className="object-contain" />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 p-1 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-medium text-[#3B5BDB] ml-9 -mt-1 uppercase">
            {user?.role ? String(user.role).replace(/_/g, ' ') : "Lead Pastor's View"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 mt-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#3B5BDB] text-white shadow-sm"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#EEF1F6] p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Link href="/branchlead-pastor/settings" className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors bg-[#3B5BDB] text-white shadow-sm">
                <Settings className="h-[18px] w-[18px]" />
                Settings
              </Link>
              <div className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors text-[#6B7280] hover:bg-white hover:text-[#111827] cursor-pointer">
                <HelpCircle className="h-[18px] w-[18px]" />
                Help Center
              </div>
            </div>

            <div className="flex items-center gap-3 cursor-pointer mt-2">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0 bg-[#C7B299] flex items-center justify-center text-[#1F2937] font-bold">
                {initials}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-bold text-[#111827] truncate">
                  {displayName}
                </span>
                <span className="text-[11px] font-medium text-[#6B7280] capitalize truncate">
                  {roleLabel}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {}} // Dummy logout for now or we can import LogOut if needed
              className="flex items-center gap-3 rounded-[8px] py-2.5 px-3 -mx-3 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-[calc(100%+24px)] text-left"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

        <main className="flex-1 min-w-0 bg-[#F8FAFC] min-h-screen">
          {/* Mobile Header Top Bar */}
          <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#EEF1F6] sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900 p-1"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Image src="/images/logo.svg" alt="ShepherdWatch" width={130} height={28} className="object-contain" />
            </div>
            <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-[#C7B299] flex items-center justify-center font-bold text-[#1F2937] text-[10px]">
               {initials}
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden lg:flex h-[52px] bg-white border-b border-[#E4E9F0] px-6 sm:px-8 items-center justify-between">
            <h1 className="text-[13px] font-[800] text-[#111827]">Dashboard</h1>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  className="h-8 w-[240px] rounded-[6px] bg-[#F1F5F9] pl-9 pr-3 text-[12px] text-[#334155] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:ring-1 focus:ring-[#2583F6]"
                  placeholder="Search requisitions..."
                />
              </div>
              <Bell className="h-4 w-4 text-[#94A3B8]" />
            </div>
          </header>

          <div className="p-6 sm:p-8 lg:px-12 lg:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-[32px] font-[800] text-[#111827] tracking-tight">User Settings</h2>
                <p className="text-[15px] text-[#64748B] mt-1.5 font-medium">Manage personal details, alerts, and operational templates.</p>
              </div>
              <button
                onClick={onSave}
                disabled={saving || loading}
                className="h-[44px] px-6 mt-4 sm:mt-0 rounded-[8px] bg-[#3B5BDB] hover:bg-blue-700 text-white text-[14px] font-[600] inline-flex items-center gap-2 disabled:opacity-70 transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save All Changes"}
              </button>
            </div>

            {message ? <p className="mb-4 text-[13px] font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-md">{message}</p> : null}
            {error ? <p className="mb-4 text-[13px] font-semibold text-rose-600 bg-rose-50 p-3 rounded-md">{error}</p> : null}

            <section className="bg-white rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8 border border-[#E2E8F0]">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-10 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-5">
                  <div className="h-[90px] w-[90px] rounded-full overflow-hidden bg-[#C7B299] shrink-0 shadow-sm border-2 border-white flex items-center justify-center text-[#1F2937] font-bold text-[28px]">
                    {initials}
                  </div>
                  <div>
                    <div className="text-[26px] font-[800] text-[#111827] leading-none mb-2">{displayName}</div>
                    <div className="text-[14px] font-medium text-[#4A7EB7]">Branch Accountant | ID: #{employeeId}</div>
                    <div className="text-[13px] font-medium text-[#64748B] inline-flex items-center gap-1 mt-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {branchLabel}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/branchlead-pastor/settings-modal")}
                  className="text-[14px] font-[600] text-[#3B5BDB] hover:text-blue-700 transition-colors mt-6 md:mt-0 self-start md:self-center"
                >
                  Change Password
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-10">
                <div>
                  <label className="block text-[13px] font-[700] text-[#1E293B] mb-2">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-[48px] w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[14px] font-medium text-[#1E293B] focus:bg-white focus:border-[#2583F6] focus:ring-1 focus:ring-[#2583F6] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-[700] text-[#1E293B] mb-2">Employee ID</label>
                  <input
                    value={employeeId}
                    readOnly
                    className="h-[48px] w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[14px] font-medium text-[#64748B] outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-[700] text-[#1E293B] mb-2">Work Email</label>
                  <input
                    value={workEmail}
                    readOnly
                    className="h-[48px] w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[14px] font-medium text-[#1E293B] outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-[700] text-[#1E293B] mb-2">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-[48px] w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[14px] font-medium text-[#1E293B] focus:bg-white focus:border-[#2583F6] focus:ring-1 focus:ring-[#2583F6] outline-none transition-colors"
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
