"use client";

import React from "react";
import { Inter } from "next/font/google";
import { X } from "lucide-react";
import UserSettingsPage from "../user-settings/page";

const inter = Inter({ subsets: ["latin"] });

export default function UpdatePasswordModalPage() {
  return (
    <div className={`relative min-h-[100dvh] w-full ${inter.className} antialiased`}>
      {/* Blurred Background Page - Inherits the User settings background */}
      <div className="fixed inset-0 z-0 h-full w-full overflow-hidden blur-[4px] opacity-50 pointer-events-none select-none scale-[1.02] transform origin-center transition-transform">
        <UserSettingsPage />
      </div>

      {/* Modal Overlay Context */}
      <div className="fixed inset-0 z-40 bg-[#111827]/40 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Modal Container */}
        <div 
          className="bg-white w-full max-w-[500px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto overflow-hidden" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header Block */}
          <div className="px-6 sm:px-8 py-5 flex items-start justify-between">
            <div className="flex flex-col gap-1.5 pt-1">
              <h2 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] leading-tight tracking-tight">Change Password</h2>
              <p className="text-[#64748B] text-[13px] font-[500]">
                Enter your new password credentials.
              </p>
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-4 w-4 stroke-[2.5px]" />
            </button>
          </div>

          <div className="px-6 sm:px-8 pt-2 pb-8 flex flex-col gap-5 w-full">
            
            {/* Old Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[#111827] text-[12px] font-[800]">Old Password</label>
              <input 
                type="password" 
                className="h-[48px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20 transition-all" 
              />
            </div>

            {/* New Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[#111827] text-[12px] font-[800]">New Password</label>
              <input 
                type="password" 
                className="h-[48px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20 transition-all" 
              />
            </div>

            {/* Confirm New Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[#111827] text-[12px] font-[800]">Re-Enter New Password</label>
              <input 
                type="password" 
                className="h-[48px] w-full px-4 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20 transition-all" 
              />
            </div>

          </div>

          {/* Footer Navigation Bar */}
          <div className="px-6 sm:px-8 py-5 bg-white flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-[16px] sm:rounded-b-[20px]">
            <button className="h-[42px] px-5 bg-transparent text-[#475569] text-[13.5px] font-[700] hover:text-[#111827] hover:bg-gray-50 rounded-[8px] transition-colors w-full sm:w-auto">
              Cancel
            </button>
            <button className="h-[42px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[13.5px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm w-full sm:w-auto">
              Update Password
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
