"use client";

import { API_V1 } from "@/lib/api";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  User,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ActiveSessionsManager } from "@/components/settings/ActiveSessionsManager";
import { ModalShell } from "@/components/ui/modal-shell";
import { PasswordInput } from "@/components/ui/password-input";

// Using Inter font unconditionally matching Figma
const inter = Inter({ subsets: ["latin"] });

export default function UserSettingsPage() {
  const queryClient = useQueryClient();
  const { updateProfile, logout, changePassword } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const handleChangePassword = async () => {
    setPwError(null);
    setPwSuccess(null);
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError("Please fill in all fields.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwNew)) {
      setPwError("Password must be 8+ chars with uppercase, lowercase, and a number.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwCurrent, newPassword: pwNew });
      setPwSuccess("Password changed successfully.");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      setTimeout(() => setPasswordOpen(false), 1200);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [fullNameInput, setFullNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [revokeMessage, setRevokeMessage] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { data: selectedSession, isLoading: sessionDetailsLoading, error: sessionDetailsErrorObj } = useQuery({
    queryKey: ['session', selectedSessionId],
    queryFn: async () => {
      const res = await axios.get(`${API_V1}/sessions/${selectedSessionId}`);
      return res.data?.data;
    },
    enabled: !!selectedSessionId
  });
  const sessionDetailsError = sessionDetailsErrorObj ? (sessionDetailsErrorObj as Error).message : null;
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    purpose: "",
    subject: "",
    body: "",
    branchId: "",
    isActive: true,
  });
  const [templateSubmitting, setTemplateSubmitting] = useState(false);
  const [templateMessage, setTemplateMessage] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateFilters, setTemplateFilters] = useState({
    purpose: "",
    branchId: "",
    isActive: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [templateEdit, setTemplateEdit] = useState({
    name: "",
    purpose: "",
    subject: "",
    body: "",
    branchId: "",
    isActive: true,
  });
  const [templateUpdating, setTemplateUpdating] = useState(false);
  const [templateEditError, setTemplateEditError] = useState<string | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [purposeForm, setPurposeForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });
  const [purposeSubmitting, setPurposeSubmitting] = useState(false);
  const [purposeMessage, setPurposeMessage] = useState<string | null>(null);
  const [purposeError, setPurposeError] = useState<string | null>(null);
  const [purposes, setPurposes] = useState<any[]>([]);
  const [purposesLoading, setPurposesLoading] = useState(true);
  const [purposesError, setPurposesError] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<any | null>(null);
  const [purposeDetailsLoading, setPurposeDetailsLoading] = useState(false);
  const [purposeDetailsError, setPurposeDetailsError] = useState<string | null>(null);
  const [purposeEdit, setPurposeEdit] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });
  const [updatingPurpose, setUpdatingPurpose] = useState(false);
  const [deletingPurposeId, setDeletingPurposeId] = useState<string | null>(null);
  const [headerFooterForm, setHeaderFooterForm] = useState({
    type: "header",
    content: "",
    isActive: true,
  });
  const [headerFooterSubmitting, setHeaderFooterSubmitting] = useState(false);
  const [headerFooterMessage, setHeaderFooterMessage] = useState<string | null>(null);
  const [headerFooterError, setHeaderFooterError] = useState<string | null>(null);
  const [headerFooters, setHeaderFooters] = useState<any[]>([]);
  const [headerFootersLoading, setHeaderFootersLoading] = useState(true);
  const [headerFootersError, setHeaderFootersError] = useState<string | null>(null);
  const [activeHeader, setActiveHeader] = useState<any | null>(null);
  const [activeFooter, setActiveFooter] = useState<any | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
      router.replace("/login");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      let res = await fetch(`${API_V1}/auth/me`, { credentials: "include" });
      if (res.status === 401) {
        const refreshRes = await fetch(`${API_V1}/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });
        if (refreshRes.ok) {
          res = await fetch(`${API_V1}/auth/me`, { credentials: "include" });
        }
      }

      const data = await res.json().catch(() => null);
      if (res.ok && data?.data) {
        setProfile(data.data);
        const nextFullName = `${data.data.firstName || ""} ${data.data.lastName || ""}`.trim();
        setFullNameInput(nextFullName);
        setPhoneInput(String(data.data.phone ?? data.data.phoneNumber ?? ""));
      }
      setLoading(false);
    };

    loadProfile().catch(console.error);
  }, []);





  const handleTemplateChange = (field: string, value: string | boolean) => {
    setTemplateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTemplate = async () => {
    setTemplateSubmitting(true);
    setTemplateMessage(null);
    setTemplateError(null);
    try {
      const payload: any = {
        name: templateForm.name,
        purpose: templateForm.purpose,
        subject: templateForm.subject,
        body: templateForm.body,
        isActive: templateForm.isActive,
      };
      if (templateForm.branchId) {
        payload.branchId = templateForm.branchId;
      }
      const res = await fetch(`${API_V1}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to create template");
      }
      setTemplateMessage(data.message || "Template created successfully.");
      setTemplateForm({
        name: "",
        purpose: "",
        subject: "",
        body: "",
        branchId: "",
        isActive: true,
      });
    } catch (err: any) {
      setTemplateError(err.message || "Unable to create template");
    } finally {
      setTemplateSubmitting(false);
    }
  };

  const handleCreatePurpose = async () => {
    setPurposeSubmitting(true);
    setPurposeMessage(null);
    setPurposeError(null);
    try {
      const payload: any = {
        name: purposeForm.name,
        slug: purposeForm.slug,
        description: purposeForm.description,
        isActive: purposeForm.isActive,
      };
      const res = await fetch(`${API_V1}/templates/purposes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to create purpose");
      }
      setPurposeMessage(data.message || "Purpose created successfully.");
      setPurposeForm({
        name: "",
        slug: "",
        description: "",
        isActive: true,
      });
    } catch (err: any) {
      setPurposeError(err.message || "Unable to create purpose");
    } finally {
      setPurposeSubmitting(false);
    }
  };

  const fetchPurposes = async () => {
    setPurposesLoading(true);
    setPurposesError(null);
    try {
      const res = await fetch(`${API_V1}/templates/purposes?page=1&limit=20`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load purposes");
      }
      setPurposes(data?.data ?? []);
    } catch (err: any) {
      setPurposesError(err.message || "Unable to load purposes");
    } finally {
      setPurposesLoading(false);
    }
  };

  const handleViewPurpose = async (id: string) => {
    setPurposeDetailsLoading(true);
    setPurposeDetailsError(null);
    try {
      const res = await fetch(`${API_V1}/templates/purposes/${id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load purpose");
      }
      const purpose = data?.data ?? null;
      setSelectedPurpose(purpose);
      setPurposeEdit({
        name: purpose?.name ?? "",
        slug: purpose?.slug ?? "",
        description: purpose?.description ?? "",
        isActive: purpose?.isActive ?? true,
      });
    } catch (err: any) {
      setPurposeDetailsError(err.message || "Unable to load purpose");
    } finally {
      setPurposeDetailsLoading(false);
    }
  };

  const handleUpdatePurpose = async () => {
    if (!selectedPurpose?._id) return;
    setUpdatingPurpose(true);
    setPurposeDetailsError(null);
    try {
      const res = await fetch(`${API_V1}/templates/purposes/${selectedPurpose._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purposeEdit),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to update purpose");
      }
      setSelectedPurpose({ ...selectedPurpose, ...purposeEdit });
      setPurposes((prev) =>
        prev.map((p) => (p._id === selectedPurpose._id ? { ...p, ...purposeEdit } : p))
      );
    } catch (err: any) {
      setPurposeDetailsError(err.message || "Unable to update purpose");
    } finally {
      setUpdatingPurpose(false);
    }
  };

  const handleDeletePurpose = async (id: string) => {
    setDeletingPurposeId(id);
    setPurposeDetailsError(null);
    try {
      const res = await fetch(`${API_V1}/templates/purposes/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to delete purpose");
      }
      setPurposes((prev) => prev.filter((p) => p._id !== id));
      if (selectedPurpose?._id === id) {
        setSelectedPurpose(null);
      }
    } catch (err: any) {
      setPurposeDetailsError(err.message || "Unable to delete purpose");
    } finally {
      setDeletingPurposeId(null);
    }
  };

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "20");
    if (templateFilters.purpose) params.set("purpose", templateFilters.purpose);
    if (templateFilters.branchId) params.set("branchId", templateFilters.branchId);
    if (templateFilters.isActive) params.set("isActive", templateFilters.isActive);
    try {
      const res = await fetch(`${API_V1}/templates?${params.toString()}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load templates");
      }
      setTemplates(data?.data?.data ?? []);
    } catch (err: any) {
      setTemplatesError(err.message || "Unable to load templates");
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleEditTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    setTemplateEdit({
      name: tpl?.name ?? "",
      purpose: tpl?.purpose ?? "",
      subject: tpl?.subject ?? "",
      body: tpl?.body ?? "",
      branchId: tpl?.branchId ?? "",
      isActive: tpl?.isActive ?? true,
    });
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate?._id) return;
    setTemplateUpdating(true);
    setTemplateEditError(null);
    try {
      const res = await fetch(`${API_V1}/templates/${selectedTemplate._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateEdit.name,
          purpose: templateEdit.purpose,
          subject: templateEdit.subject,
          body: templateEdit.body,
          branchId: templateEdit.branchId || null,
          isActive: templateEdit.isActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to update template");
      }
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl._id === selectedTemplate._id ? { ...tpl, ...templateEdit } : tpl
        )
      );
    } catch (err: any) {
      setTemplateEditError(err.message || "Unable to update template");
    } finally {
      setTemplateUpdating(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    setDeletingTemplateId(id);
    setTemplateEditError(null);
    try {
      const res = await fetch(`${API_V1}/templates/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to delete template");
      }
      setTemplates((prev) => prev.filter((tpl) => tpl._id !== id));
      if (selectedTemplate?._id === id) {
        setSelectedTemplate(null);
      }
    } catch (err: any) {
      setTemplateEditError(err.message || "Unable to delete template");
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const handleHeaderFooterSubmit = async () => {
    setHeaderFooterSubmitting(true);
    setHeaderFooterMessage(null);
    setHeaderFooterError(null);
    try {
      const res = await fetch(`${API_V1}/templates/header-footer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: headerFooterForm.type,
          content: headerFooterForm.content,
          isActive: headerFooterForm.isActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to save header/footer");
      }
      setHeaderFooterMessage(data.message || "Header/footer saved successfully.");
      setHeaderFooterForm((prev) => ({ ...prev, content: "" }));
    } catch (err: any) {
      setHeaderFooterError(err.message || "Unable to save header/footer");
    } finally {
      setHeaderFooterSubmitting(false);
    }
  };

  const fetchHeaderFooters = async () => {
    setHeaderFootersLoading(true);
    setHeaderFootersError(null);
    try {
      const res = await fetch(`${API_V1}/templates/header-footer`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load header/footer");
      }
      setHeaderFooters(data?.data ?? []);
    } catch (err: any) {
      setHeaderFootersError(err.message || "Unable to load header/footer");
    } finally {
      setHeaderFootersLoading(false);
    }
  };

  const fetchActiveHeaderFooter = async (type: "header" | "footer") => {
    try {
      const res = await fetch(`${API_V1}/templates/header-footer/${type}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Unable to load ${type}`);
      }
      if (type === "header") setActiveHeader(data?.data ?? null);
      if (type === "footer") setActiveFooter(data?.data ?? null);
    } catch (err: any) {
      setHeaderFootersError(err.message || "Unable to load header/footer");
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchHeaderFooters();
    fetchActiveHeaderFooter("header");
    fetchActiveHeaderFooter("footer");
    fetchPurposes();
  }, []);

  const fullName = fullNameInput || (profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Loading...");
  const roleName = profile?.roleName || "Admin";
  const email = profile?.email || "";
  const phone = phoneInput || String(profile?.phone ?? profile?.phoneNumber ?? "");
  const initials = profile ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() : "";

  const handleSaveProfile = async () => {
    if (!profile) return;
    setProfileError(null);
    setProfileSuccess(null);

    const normalizedFullName = fullNameInput.trim().replace(/\s+/g, " ");
    const normalizedPhone = phoneInput.trim();
    const originalFirstName = String(profile.firstName ?? "").trim();
    const originalLastName = String(profile.lastName ?? "").trim();
    const originalPhone = String(profile.phone ?? profile.phoneNumber ?? "").trim();

    const payload: { firstName?: string; lastName?: string; phone?: string } = {};
    if (normalizedFullName) {
      const nameParts = normalizedFullName.split(" ").filter(Boolean);
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ");
      if (firstName.length < 2) {
        setProfileError("First name must be at least 2 characters.");
        return;
      }
      if (lastName && lastName.length < 2) {
        setProfileError("Last name must be at least 2 characters.");
        return;
      }
      if (firstName !== originalFirstName) payload.firstName = firstName;
      if (lastName && lastName !== originalLastName) payload.lastName = lastName;
    }
    if (normalizedPhone && normalizedPhone !== originalPhone) {
      payload.phone = normalizedPhone;
    }

    if (Object.keys(payload).length === 0) {
      setProfileError("No profile changes to save.");
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(payload);
      setProfile((prev: unknown) => ({
        ...(prev ?? {}),
        ...(payload.firstName ? { firstName: payload.firstName } : {}),
        ...(payload.lastName ? { lastName: payload.lastName } : {}),
        ...(payload.phone ? { phone: payload.phone, phoneNumber: payload.phone } : {}),
      }));
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Unable to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

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
          <Link href="/branch-admin/dashboard" className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <LayoutDashboard className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Dashboard</span>
          </Link>
          
          <Link href="/branch-admin/requisitions" className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <FileText className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Requisitions</span>
          </Link>
          
          <Link href="/branch-admin/logistics-repair" className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <Truck className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Logistics & Repairs</span>
          </Link>
          
          <Link href="/branch-admin/asset" className="w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] transition-colors group">
            <Briefcase className="w-[18px] h-[18px] stroke-[2.2px] group-hover:text-[#475569]" />
            <span className="text-[14px] font-[600]">Assets</span>
          </Link>

          {/* System Section Label */}
          <div className="mt-8 mb-2 px-4">
            <span className="text-[#94A3B8] text-[10px] font-[800] uppercase tracking-widest">SYSTEM</span>
          </div>
          
          {/* Active Settings Link */}
          <Link href="/branch-admin/settings" className={`w-full flex items-center gap-3.5 px-4 h-[44px] rounded-[10px] transition-colors ${pathname === "/branch-admin/settings" ? "bg-[#EEF2FF] text-[#2563EB]" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]"}`}>
            <SettingsIcon className="w-[18px] h-[18px] stroke-[2.5px]" />
            <span className="text-[14px] font-[800]">Settings</span>
          </Link>
        </div>

        {/* Profile Footer */}
        <div className="mt-auto border-t border-[#EEF1F6] p-4 bg-[#FAFAFA]">
          <button
            onClick={handleLogout}
            className="mb-3 flex items-center gap-2 rounded-[8px] py-2 px-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <div className="flex items-center gap-3">
            <div className="w-[36px] h-[36px] rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              <div className="w-full h-full bg-[#1E293B] flex items-center justify-center text-white text-[12px] font-[700]">{initials || "U"}</div>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[#111827] text-[13.5px] font-[800] truncate">{fullName}</span>
              <span className="text-[#64748B] text-[11.5px] font-[500] truncate">{roleName}</span>
            </div>
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
            <button onClick={handleSaveProfile} disabled={profileSaving} className="h-[46px] px-6 rounded-[8px] bg-[#2563EB] flex items-center justify-center gap-2.5 text-white text-[14.5px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm shrink-0 whitespace-nowrap disabled:opacity-70">
              <Save className="w-[18px] h-[18px] stroke-[2.5px]" />
              {profileSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
          {profileError ? <p className="mb-4 text-[12.5px] font-semibold text-rose-600">{profileError}</p> : null}
          {profileSuccess ? <p className="mb-4 text-[12.5px] font-semibold text-emerald-600">{profileSuccess}</p> : null}

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
                <button
                  onClick={() => setPasswordOpen(true)}
                  className="text-[#2563EB] text-[14px] font-[800] hover:underline self-start sm:self-auto cursor-pointer"
                >
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
                    onChange={(event) => setFullNameInput(event.target.value)}
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
                    onChange={(event) => setPhoneInput(event.target.value)}
                    className="h-[52px] w-full px-4 rounded-[10px] border border-[#CBD5E1] bg-white text-[#111827] text-[15px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

              </div>

            </div>
          )}

          {/* Active Sessions */}
            <ActiveSessionsManager />

          

          {/* Email Templates */}
          <div className="mt-8 bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.02)] rounded-[16px] flex flex-col relative w-full overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#EEF1F6] bg-white flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] tracking-tight leading-none">Email Templates</h3>
                <p className="text-[#64748B] text-[13.5px] font-[500]">
                  Create global or branch-specific email templates.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Template Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => handleTemplateChange("name", e.target.value)}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Purpose</label>
                <input
                  type="text"
                  value={templateForm.purpose}
                  onChange={(e) => handleTemplateChange("purpose", e.target.value)}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[12px] font-[800] text-[#111827]">Subject</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => handleTemplateChange("subject", e.target.value)}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[12px] font-[800] text-[#111827]">Body</label>
                <textarea
                  value={templateForm.body}
                  onChange={(e) => handleTemplateChange("body", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Branch ID (optional)</label>
                <input
                  type="text"
                  value={templateForm.branchId}
                  onChange={(e) => handleTemplateChange("branchId", e.target.value)}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Active</label>
                <select
                  value={templateForm.isActive ? "true" : "false"}
                  onChange={(e) => handleTemplateChange("isActive", e.target.value === "true")}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-6 flex flex-col gap-2">
              {templateMessage ? (
                <p className="text-emerald-600 text-[12.5px] font-[700]">{templateMessage}</p>
              ) : null}
              {templateError ? (
                <p className="text-rose-600 text-[12.5px] font-[700]">{templateError}</p>
              ) : null}
              <button
                onClick={handleCreateTemplate}
                disabled={templateSubmitting}
                className="h-[42px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[13px] font-[800] hover:bg-[#1D4ED8] transition-colors disabled:opacity-70"
              >
                {templateSubmitting ? "Creating..." : "Create Template"}
              </button>
            </div>

            <div className="px-6 sm:px-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Filter by purpose"
                  value={templateFilters.purpose}
                  onChange={(e) => setTemplateFilters((prev) => ({ ...prev, purpose: e.target.value }))}
                  className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                />
                <input
                  type="text"
                  placeholder="Filter by branchId"
                  value={templateFilters.branchId}
                  onChange={(e) => setTemplateFilters((prev) => ({ ...prev, branchId: e.target.value }))}
                  className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                />
                <select
                  value={templateFilters.isActive}
                  onChange={(e) => setTemplateFilters((prev) => ({ ...prev, isActive: e.target.value }))}
                  className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <button
                onClick={fetchTemplates}
                className="h-[36px] px-4 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] font-[700] hover:bg-[#2f4cc2]"
              >
                Apply Filters
              </button>
            </div>

            <div className="px-6 sm:px-8 pb-6">
              {templatesLoading ? (
                <div className="text-[13px] text-[#64748B]">Loading templates...</div>
              ) : templatesError ? (
                <div className="text-[13px] text-rose-600 font-[600]">{templatesError}</div>
              ) : templates.length === 0 ? (
                <div className="text-[13px] text-[#64748B]">No templates found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {templates.map((tpl) => (
                    <div key={tpl._id} className="border border-[#EEF1F6] rounded-[10px] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[14px] font-[800] text-[#111827]">{tpl.name}</div>
                        <div className={`text-[12px] font-[700] ${tpl.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                          {tpl.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="text-[12.5px] text-[#6B7280]">Purpose: {tpl.purpose}</div>
                      <div className="text-[12.5px] text-[#6B7280]">Subject: {tpl.subject}</div>
                      <div className="text-[12px] text-[#9CA3AF]">Branch: {tpl.branchId || "Global"}</div>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => handleEditTemplate(tpl)}
                          className="text-[12px] font-[700] text-[#2563EB] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tpl._id)}
                          disabled={deletingTemplateId === tpl._id}
                          className="text-[12px] font-[700] text-rose-600 hover:underline disabled:opacity-60"
                        >
                          {deletingTemplateId === tpl._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTemplate ? (
              <div className="px-6 sm:px-8 pb-6">
                <div className="text-[13px] font-[800] text-[#111827] mb-2">Edit Template</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={templateEdit.name}
                    onChange={(e) => setTemplateEdit((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={templateEdit.purpose}
                    onChange={(e) => setTemplateEdit((prev) => ({ ...prev, purpose: e.target.value }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Purpose"
                  />
                  <input
                    type="text"
                    value={templateEdit.subject}
                    onChange={(e) => setTemplateEdit((prev) => ({ ...prev, subject: e.target.value }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Subject"
                  />
                  <input
                    type="text"
                    value={templateEdit.branchId}
                    onChange={(e) => setTemplateEdit((prev) => ({ ...prev, branchId: e.target.value }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Branch ID (optional)"
                  />
                  <textarea
                    value={templateEdit.body}
                    onChange={(e) => setTemplateEdit((prev) => ({ ...prev, body: e.target.value }))}
                    rows={3}
                    className="md:col-span-2 px-3 py-2 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Body"
                  />
                  <select
                    value={templateEdit.isActive ? "true" : "false"}
                    onChange={(e) => setTemplateEdit((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                {templateEditError ? (
                  <div className="text-[12px] text-rose-600 font-[700] mt-2">{templateEditError}</div>
                ) : null}
                <button
                  onClick={handleUpdateTemplate}
                  disabled={templateUpdating}
                  className="mt-3 h-[38px] px-4 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] font-[700] hover:bg-[#1D4ED8] disabled:opacity-70"
                >
                  {templateUpdating ? "Updating..." : "Update Template"}
                </button>
              </div>
            ) : null}
          </div>

          {/* Email Header/Footer */}
          <div className="mt-8 bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.02)] rounded-[16px] flex flex-col relative w-full overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#EEF1F6] bg-white flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] tracking-tight leading-none">Email Header/Footer</h3>
                <p className="text-[#64748B] text-[13.5px] font-[500]">
                  Set global header or footer HTML for outgoing emails.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Type</label>
                <select
                  value={headerFooterForm.type}
                  onChange={(e) => setHeaderFooterForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none"
                >
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Active</label>
                <select
                  value={headerFooterForm.isActive ? "true" : "false"}
                  onChange={(e) => setHeaderFooterForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[12px] font-[800] text-[#111827]">Content (HTML)</label>
                <textarea
                  value={headerFooterForm.content}
                  onChange={(e) => setHeaderFooterForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none"
                />
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-6 flex flex-col gap-2">
              {headerFooterMessage ? (
                <p className="text-emerald-600 text-[12.5px] font-[700]">{headerFooterMessage}</p>
              ) : null}
              {headerFooterError ? (
                <p className="text-rose-600 text-[12.5px] font-[700]">{headerFooterError}</p>
              ) : null}
              <button
                onClick={handleHeaderFooterSubmit}
                disabled={headerFooterSubmitting}
                className="h-[42px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[13px] font-[800] hover:bg-[#1D4ED8] transition-colors disabled:opacity-70"
              >
                {headerFooterSubmitting ? "Saving..." : "Save Header/Footer"}
              </button>
            </div>

            <div className="px-6 sm:px-8 pb-6">
              {headerFootersLoading ? (
                <div className="text-[13px] text-[#64748B]">Loading headers/footers...</div>
              ) : headerFootersError ? (
                <div className="text-[13px] text-rose-600 font-[600]">{headerFootersError}</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {headerFooters.map((hf) => (
                    <div key={hf._id} className="border border-[#EEF1F6] rounded-[10px] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] font-[800] text-[#111827] capitalize">{hf.type}</div>
                        <div className={`text-[12px] font-[700] ${hf.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                          {hf.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="text-[12px] text-[#6B7280] truncate">{hf.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 sm:px-8 pb-6">
              <div className="text-[12px] font-[800] text-[#111827] mb-2">Active Header/Footer</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-[#EEF1F6] rounded-[10px] p-4">
                  <div className="text-[12px] font-[700] text-[#6B7280] mb-1">Header</div>
                  <div className="text-[12px] text-[#111827] truncate">{activeHeader?.content || "None"}</div>
                </div>
                <div className="border border-[#EEF1F6] rounded-[10px] p-4">
                  <div className="text-[12px] font-[700] text-[#6B7280] mb-1">Footer</div>
                  <div className="text-[12px] text-[#111827] truncate">{activeFooter?.content || "None"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Purposes */}
          <div className="mt-8 bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.02)] rounded-[16px] flex flex-col relative w-full overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#EEF1F6] bg-white flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] tracking-tight leading-none">Template Purposes</h3>
                <p className="text-[#64748B] text-[13.5px] font-[500]">
                  Create and manage template purpose slugs.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Name</label>
                <input
                  type="text"
                  value={purposeForm.name}
                  onChange={(e) => setPurposeForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Slug (lowercase)</label>
                <input
                  type="text"
                  value={purposeForm.slug}
                  onChange={(e) => setPurposeForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[12px] font-[800] text-[#111827]">Description</label>
                <textarea
                  value={purposeForm.description}
                  onChange={(e) => setPurposeForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-[800] text-[#111827]">Active</label>
                <select
                  value={purposeForm.isActive ? "true" : "false"}
                  onChange={(e) => setPurposeForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                  className="h-[46px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-6 flex flex-col gap-2">
              {purposeMessage ? (
                <p className="text-emerald-600 text-[12.5px] font-[700]">{purposeMessage}</p>
              ) : null}
              {purposeError ? (
                <p className="text-rose-600 text-[12.5px] font-[700]">{purposeError}</p>
              ) : null}
              <button
                onClick={handleCreatePurpose}
                disabled={purposeSubmitting}
                className="h-[42px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[13px] font-[800] hover:bg-[#1D4ED8] transition-colors disabled:opacity-70"
              >
                {purposeSubmitting ? "Creating..." : "Create Purpose"}
              </button>
            </div>

            <div className="px-6 sm:px-8 pb-6">
              {purposesLoading ? (
                <div className="text-[13px] text-[#64748B]">Loading purposes...</div>
              ) : purposesError ? (
                <div className="text-[13px] text-rose-600 font-[600]">{purposesError}</div>
              ) : purposes.length === 0 ? (
                <div className="text-[13px] text-[#64748B]">No purposes found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {purposes.map((p) => (
                    <div key={p._id} className="border border-[#EEF1F6] rounded-[10px] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] font-[800] text-[#111827]">{p.name}</div>
                        <div className={`text-[12px] font-[700] ${p.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="text-[12px] text-[#6B7280]">Slug: {p.slug}</div>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => handleViewPurpose(p._id)}
                          className="text-[12px] font-[700] text-[#2563EB] hover:underline"
                        >
                          View / Edit
                        </button>
                        <button
                          onClick={() => handleDeletePurpose(p._id)}
                          disabled={deletingPurposeId === p._id}
                          className="text-[12px] font-[700] text-rose-600 hover:underline disabled:opacity-60"
                        >
                          {deletingPurposeId === p._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {purposeDetailsLoading ? (
              <div className="px-6 sm:px-8 pb-6 text-[#64748B] text-[13px]">Loading purpose details...</div>
            ) : purposeDetailsError ? (
              <div className="px-6 sm:px-8 pb-6 text-rose-600 text-[13px] font-[600]">{purposeDetailsError}</div>
            ) : selectedPurpose ? (
              <div className="px-6 sm:px-8 pb-6">
                <div className="text-[13px] font-[800] text-[#111827] mb-3">Edit Purpose</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={purposeEdit.name}
                    onChange={(e) => setPurposeEdit((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={purposeEdit.slug}
                    onChange={(e) => setPurposeEdit((prev) => ({ ...prev, slug: e.target.value }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Slug"
                  />
                  <textarea
                    value={purposeEdit.description}
                    onChange={(e) => setPurposeEdit((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="md:col-span-2 px-3 py-2 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                    placeholder="Description"
                  />
                  <select
                    value={purposeEdit.isActive ? "true" : "false"}
                    onChange={(e) => setPurposeEdit((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                    className="h-[42px] px-3 rounded-[8px] border border-[#E2E8F0] bg-white text-[13px] font-[500]"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={handleUpdatePurpose}
                  disabled={updatingPurpose}
                  className="mt-3 h-[38px] px-4 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] font-[700] hover:bg-[#1D4ED8] disabled:opacity-70"
                >
                  {updatingPurpose ? "Updating..." : "Update Purpose"}
                </button>
              </div>
            ) : null}
          </div>
          
        </div>
      </main>

      <ModalShell open={passwordOpen} onClose={() => setPasswordOpen(false)} className="max-w-md">
        <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-4">
          <div>
            <h2 className="text-[17px] font-[800] text-[#111827]">Change Password</h2>
            <p className="text-[12px] text-[#6B7280]">Enter your new password credentials</p>
          </div>
          <button
            type="button"
            onClick={() => setPasswordOpen(false)}
            aria-label="Close"
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-[700] text-[#374151]">Old Password</label>
            <PasswordInput
              value={pwCurrent}
              onChange={(e) => setPwCurrent(e.target.value)}
              initiallyVisible={false}
              autoComplete="off"
              className="h-[42px] rounded-[8px] border-[#E2E8F0] bg-[#F8FAFC] text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-[700] text-[#374151]">New Password</label>
            <PasswordInput
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              autoComplete="new-password"
              className="h-[42px] rounded-[8px] border-[#E2E8F0] bg-[#F8FAFC] text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-[700] text-[#374151]">Re Enter New Password</label>
            <PasswordInput
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              autoComplete="new-password"
              className="h-[42px] rounded-[8px] border-[#E2E8F0] bg-[#F8FAFC] text-[13px]"
            />
          </div>
          {pwError ? <p className="text-[11px] font-semibold text-rose-600">{pwError}</p> : null}
          {pwSuccess ? <p className="text-[11px] font-semibold text-emerald-600">{pwSuccess}</p> : null}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
          <button
            type="button"
            onClick={() => setPasswordOpen(false)}
            disabled={pwSaving}
            className="text-[13px] font-[700] text-[#4B5563] hover:text-[#111827] disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={pwSaving}
            className="rounded-[8px] bg-[#2563EB] px-5 py-2 text-[13px] font-[700] text-white hover:bg-[#1D4ED8] disabled:opacity-70"
          >
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </ModalShell>
    </div>
  );
}


