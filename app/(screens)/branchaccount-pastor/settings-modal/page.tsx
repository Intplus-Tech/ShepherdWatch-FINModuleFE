"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SettingsPage from "../settings/page"
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
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {/* Background Settings Page */}
      <div className="pointer-events-none select-none">
        <SettingsPage />
      </div>

      {/* Blur Overlay */}
      <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6" style={{ fontFamily: '"Inter", sans-serif' }}>
        <div className="w-full max-w-[500px] rounded-t-[20px] sm:rounded-[16px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#EEF1F6] px-5 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col gap-1 pr-4">
              <h2 
                className="text-[#111827]"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  fontSize: "13.33px",
                  lineHeight: "18.67px",
                  letterSpacing: "0%",
                  verticalAlign: "middle"
                }}
              >
                Change Password
              </h2>
              <p className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">Enter your password details.</p>
            </div>
            <button onClick={handleClose} className="h-8 w-8 rounded-full border border-[#EEF1F6] bg-white flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors shrink-0">
              <X className="h-[14px] w-[14px]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Form Body */}
          <div className="flex flex-col gap-4 sm:gap-5 px-5 sm:px-6 py-5 sm:py-6 pb-2 sm:pb-2">

            <div className="flex flex-col gap-[4px] items-start w-full">
              <label className="text-[12px] font-[800] text-[#4B5563] px-0.5 w-full sm:w-[405.33px]">Old Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full sm:w-[405.33px] bg-white border-[#E5E7EB] px-3 text-[13px] text-[#111827] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                style={{
                  height: "28px",
                  borderRadius: "5.33px",
                  borderWidth: "0.67px",
                  borderStyle: "solid"
                }}
              />
            </div>

            <div className="flex flex-col gap-[4px] items-start w-full">
              <label className="text-[12px] font-[800] text-[#4B5563] px-0.5 w-full sm:w-[405.33px]">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full sm:w-[405.33px] bg-white border-[#E5E7EB] px-3 text-[13px] text-[#111827] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                style={{
                  height: "28px",
                  borderRadius: "5.33px",
                  borderWidth: "0.67px",
                  borderStyle: "solid"
                }}
              />
            </div>

            <div className="flex flex-col gap-[4px] items-start w-full">
              <label className="text-[12px] font-[800] text-[#4B5563] px-0.5 w-full sm:w-[405.33px]">Re-Enter New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full sm:w-[405.33px] bg-white border-[#E5E7EB] px-3 text-[13px] text-[#111827] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                style={{
                  height: "28px",
                  borderRadius: "5.33px",
                  borderWidth: "0.67px",
                  borderStyle: "solid"
                }}
              />
            </div>
            <p className="text-[11px] text-[#64748B]">Use at least 8 characters with uppercase, lowercase, and a number.</p>
            {error ? <p className="text-[12px] font-semibold text-rose-600">{error}</p> : null}
            {success ? <p className="text-[12px] font-semibold text-emerald-600">{success}</p> : null}

          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-5 sm:px-6 py-5 sm:py-6 mt-2 sm:mt-0">
            <button onClick={handleClose} disabled={loading} className="w-full sm:w-auto h-[42px] px-5 rounded-[8px] bg-white border border-[#E5E7EB] text-[13px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70">
              Cancel
            </button>
            <button onClick={handleUpdatePassword} disabled={loading} className="w-full sm:w-auto h-[42px] px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-[13px] font-bold text-white transition-colors shadow-sm disabled:opacity-70">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
