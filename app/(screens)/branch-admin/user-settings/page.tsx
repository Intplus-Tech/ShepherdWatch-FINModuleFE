"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { 
  Bell, 
  Search, 
  Save, 
  MapPin, 
  LayoutDashboard, 
  FileText, 
  Truck, 
  Briefcase, 
  Settings as SettingsIcon,
  User
} from "lucide-react";

// Using Inter font unconditionally matching Figma
const inter = Inter({ subsets: ["latin"] });

export default function UserSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [revokeMessage, setRevokeMessage] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sessionDetailsLoading, setSessionDetailsLoading] = useState(false);
  const [sessionDetailsError, setSessionDetailsError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/profile")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProfile(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSessionsLoading(true);
    setSessionsError(null);
    fetch("/api/sessions?page=1&limit=20")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Unable to load sessions");
        }
        const items = data?.data?.data ?? [];
        setSessions(items);
      })
      .catch((err) => {
        setSessionsError(err instanceof Error ? err.message : "Unable to load sessions");
      })
      .finally(() => setSessionsLoading(false));
  }, []);

  const handleRevokeAllSessions = async () => {
    setRevokeMessage(null);
    setRevokingSessions(true);
    try {
      const res = await fetch("/api/sessions/revoke-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to revoke sessions");
      }
      setRevokeMessage(data.message || "All sessions revoked successfully.");
      setSessions((prev) => prev.map((session) => ({ ...session, isActive: false })));
    } catch (err: any) {
      setSessionsError(err.message || "Unable to revoke sessions");
    } finally {
      setRevokingSessions(false);
    }
  };

  const handleViewSession = async (sessionId: string) => {
    setSessionDetailsLoading(true);
    setSessionDetailsError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load session details");
      }
      setSelectedSession(data?.data ?? null);
    } catch (err: any) {
      setSessionDetailsError(err.message || "Unable to load session details");
    } finally {
      setSessionDetailsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    setSessionsError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/revoke`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Unable to revoke session");
      }
      setSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, isActive: false } : session
        )
      );
      if (selectedSession?._id === sessionId) {
        setSelectedSession({ ...selectedSession, isActive: false });
      }
    } catch (err: any) {
      setSessionsError(err.message || "Unable to revoke session");
    } finally {
      setRevokingSessionId(null);
    }
  };

  const fullName = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Loading...";
  const roleName = profile?.roleName || "Admin";
  const email = profile?.email || "";
  const phone = profile?.phoneNumber || "";
  const initials = profile ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() : "";

  return (
    <div className={`min-h-[100dvh] bg-[#F8FAFC] flex ${inter.className} antialiased selection:bg-blue-100 selection:text-blue-900`}>
      
      {/* Sidebar Navigation */}
      <aside className="w-[245px] sm:w-[260px] bg-white border-r border-[#EEF1F6] flex-shrink-0 flex flex-col hidden lg:flex h-screen sticky top-0 left-0">
        
        {/* Logo Section */}
        <div className="h-[80px] px-6 flex items-center gap-3">
          <div className="w-[26px] h-[26px] bg-[#EEF2FF] rounded-[8px] flex items-center justify-center shrink-0 border border-[#E0E7FF]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#111827] text-[15.5px] font-[800] leading-none tracking-tight">ShepherdWatch</h1>
            <span className="text-[#64748B] text-[10.5px] font-[600] mt-[3px]">Admin's View</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col px-4 mt-6 gap-1 w-full">
          {/* Main Links */}
          <button className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <LayoutDashboard className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Dashboard</span>
          </button>
          
          <button className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <FileText className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Requisitions</span>
          </button>
          
          <button className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <Truck className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Logistics & Repairs</span>
          </button>
          
          <button className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <Briefcase className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Assets</span>
          </button>

          {/* System Section Label */}
          <div className="mt-8 mb-2 px-4">
            <span className="text-[#94A3B8] text-[10px] font-[800] uppercase tracking-widest">SYSTEM</span>
          </div>
          
          {/* Active Settings Link */}
          <button className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] bg-[#EEF2FF] text-[#2563EB] transition-colors">
            <SettingsIcon className="w-[18px] h-[18px] stroke-[2.5px]" />
            <span className="text-[14px] font-[800]">Settings</span>
          </button>
        </div>

        {/* Profile Footer */}
        <div className="mt-auto border-t border-[#EEF1F6] p-4 flex items-center gap-3 bg-[#FAFAFA]">
          <div className="w-[36px] h-[36px] rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
            {/* Generic avatar placeholder */}
            <div className="w-full h-full bg-[#1E293B] flex items-center justify-center text-white text-[12px] font-[700]">{initials || "U"}</div>
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[#111827] text-[13.5px] font-[800] truncate">{fullName}</span>
            <span className="text-[#64748B] text-[11.5px] font-[500] truncate">{roleName}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto w-full">
        
        {/* Top Header */}
        <header className="h-[80px] bg-white lg:bg-[#F8FAFC] border-b border-[#EEF1F6] lg:border-none flex items-center justify-between px-6 sm:px-10 shrink-0 sticky top-0 z-10 w-full">
          {/* Desktop Breadcrumb/Title */}
          <h1 className="text-[#111827] text-[15.5px] font-[800] hidden lg:block tracking-tight">Dashboard</h1>
          
          {/* Mobile Title */}
          <h1 className="text-[#111827] text-[18px] font-[800] lg:hidden tracking-tight">User Settings</h1>

          {/* Right Utilities */}
          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#94A3B8] stroke-[2.5px]" />
              </div>
              <input 
                type="text" 
                placeholder="Search requisitions..." 
                className="w-full h-[40px] pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-[8px] text-[13.5px] font-[500] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all placeholder:text-[#94A3B8] shadow-sm"
              />
            </div>
            
            <button className="relative p-1.5 rounded-full hover:bg-white lg:hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-[#64748B] stroke-[2px]" />
              {/* Notification Dot */}
              <span className="absolute top-[5px] right-[6px] w-[7px] h-[7px] bg-[#EF4444] rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-6 sm:p-10 pt-4 sm:pt-6 flex flex-col w-full max-w-[1100px] mb-20">
          
          {/* Page Title & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[#111827] text-[28px] sm:text-[34px] font-[900] tracking-tight leading-none">User Settings</h2>
              <p className="text-[#64748B] text-[15px] sm:text-[16px] font-[500] tracking-wide max-w-[500px]">
                Manage personal details, alerts, and operational templates.
              </p>
            </div>
            <button className="h-[46px] px-6 rounded-[8px] bg-[#2563EB] flex items-center justify-center gap-2.5 text-white text-[14.5px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm shrink-0 whitespace-nowrap">
              <Save className="w-[18px] h-[18px] stroke-[2.5px]" />
              Save All Changes
            </button>
          </div>

          {/* Main Card Wrapper */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading profile data...</div>
          ) : (
            <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.02)] rounded-[16px] flex flex-col relative w-full overflow-hidden">
              
              {/* Top Profile Header Section */}
              <div className="p-6 sm:p-8 border-b border-[#EEF1F6] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                
                <div className="flex items-center gap-5 sm:gap-6">
                  {/* Large Avatar */}
                  <div className="w-[75px] sm:w-[85px] h-[75px] sm:h-[85px] rounded-full overflow-hidden flex items-center justify-center shrink-0 border-[3px] border-[#F1F5F9] shadow-sm">
                     {/* Generic placeholder image using colors from Figma */}
                     <div className="w-full h-full bg-[#1E293B] flex items-center justify-center text-white text-[28px] font-[700]">
                       {initials || <User className="h-10 w-10" />}
                     </div>
                  </div>

                  {/* Profile Details */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <h3 className="text-[#111827] text-[20px] sm:text-[22px] font-[900] tracking-tight leading-none">{fullName}</h3>
                    <p className="text-[#64748B] text-[14px] font-[500]">
                      {roleName} {profile?.id && <>| ID: <span className="font-[600]">#{profile.id.substring(0,6)}</span></>}
                    </p>
                    <div className="text-[#2563EB] text-[13.5px] font-[600] flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 stroke-[2.5px]" />
                      {profile?.address || "Headquarters"}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button className="text-[#2563EB] text-[14px] font-[800] hover:underline self-start sm:self-auto cursor-pointer">
                  Change Password
                </button>

              </div>

              {/* Bottom Form Fields */}
              <div className="p-6 sm:p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 pb-10">
                
                {/* Full Name */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-[#111827] text-[13.5px] font-[800]">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    readOnly
                    className="h-[52px] w-full px-4 rounded-[10px] border border-[#CBD5E1] bg-white text-[#111827] text-[15px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

                {/* Employee ID (Readonly) */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-[#111827] text-[13.5px] font-[800]">Employee ID</label>
                  <input 
                    type="text" 
                    value={profile?.id || ""}
                    readOnly
                    className="h-[52px] w-full px-4 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#3B82F6] text-[15px] font-[600] outline-none cursor-not-allowed" 
                  />
                </div>

                {/* Work Email */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-[#111827] text-[13.5px] font-[800]">Work Email</label>
                  <input 
                    type="email" 
                    value={email}
                    readOnly
                    className="h-[52px] w-full px-4 rounded-[10px] border border-[#CBD5E1] bg-white text-[#111827] text-[15px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-[#111827] text-[13.5px] font-[800]">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    readOnly
                    className="h-[52px] w-full px-4 rounded-[10px] border border-[#CBD5E1] bg-white text-[#111827] text-[15px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

              </div>

            </div>
          )}

          {/* Active Sessions */}
          <div className="mt-8 bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.02)] rounded-[16px] flex flex-col relative w-full overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#EEF1F6] bg-white flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] tracking-tight leading-none">Active Sessions</h3>
                <p className="text-[#64748B] text-[13.5px] font-[500]">
                  Devices currently logged into your account.
                </p>
              </div>
              <button
                onClick={handleRevokeAllSessions}
                disabled={revokingSessions}
                className="h-[38px] px-4 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] font-[700] hover:bg-[#1D4ED8] transition-colors disabled:opacity-70"
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
            
        </div>
      </main>
    </div>
  );
}
