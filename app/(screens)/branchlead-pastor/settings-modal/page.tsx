"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SettingsPage from "../settings/page"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { X } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

export default function Page() {
  const router = useRouter()
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    router.back()
  }

  const handleUpdatePassword = async () => {
    setError(null)
    setSuccess(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      setError("New password must be at least 8 characters and include uppercase, lowercase, and a number.")
      return
    }

    setLoading(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setSuccess("Password changed successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => handleClose(), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
      {/* Background Settings Page and overlay */}
      <div className="absolute inset-0 z-[-1] blur-[4px] pointer-events-none scale-[1.02]">
        <SettingsPage />
      </div>

      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-0" onClick={handleClose} />

      <div className="relative z-10 w-[448px] h-[315px] rounded-[16px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col p-6 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-[17px] font-[800] text-[#111827] tracking-tight">Change Password</h2>
            <p className="text-[12px] font-medium text-[#6B7280]">Enter your new password credentials</p>
          </div>
          <button onClick={handleClose} className="h-7 w-7 rounded-full flex items-center justify-center text-[#9CA3AF] hover:bg-gray-100 transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-[14px] flex-1 mt-[14px]">
          <div className="space-y-1">
            <label className="text-[11px] font-[700] text-[#374151]">Old Password</label>
            <PasswordInput
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="h-[36px] w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[13px] font-medium text-[#111827] focus:bg-white focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] transition-colors outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-[700] text-[#374151]">New Password</label>
            <PasswordInput
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-[36px] w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[13px] font-medium text-[#111827] focus:bg-white focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] transition-colors outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-[700] text-[#374151]">Re Enter New Password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-[36px] w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[13px] font-medium text-[#111827] focus:bg-white focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] transition-colors outline-none"
            />
          </div>
          {error ? <p className="text-[11px] font-semibold text-rose-600 -mt-1">{error}</p> : null}
          {success ? <p className="text-[11px] font-semibold text-emerald-600 -mt-1">{success}</p> : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2 text-[12px] font-[700] text-[#4B5563] hover:bg-gray-50 rounded-[8px] transition-colors disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="px-6 py-2 rounded-[8px] bg-blue-600 hover:bg-blue-700 text-[12px] font-[700] text-white transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>

      </div>
    </div>
  )
}
