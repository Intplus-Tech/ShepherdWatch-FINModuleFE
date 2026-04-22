"use client"
import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SidebarProfileWidget({ defaultRole = "User" }: { defaultRole?: string }) {
  const { user, loading } = useAuth();

  const fullName = user?.name || "Loading...";
  const roleName = user?.role || defaultRole;
  const initials = user?.name ? user.name.slice(0,2).toUpperCase() : "U";

  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0 flex items-center justify-center bg-[#1E293B] text-white text-[12px] font-[700]">
         {initials}
      </div>
      <div className="flex flex-col truncate">
        <span className="text-[13px] font-bold text-[#111827] truncate">{fullName}</span>
        <span className="text-[11px] font-medium text-[#6B7280] truncate">{roleName}</span>
      </div>
    </div>
  );
}


