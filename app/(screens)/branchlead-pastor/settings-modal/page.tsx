"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SettingsPage from "../settings/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0F1115] font-sans" style={{ fontFamily: '"Inter", sans-serif' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 scale-[1.04] origin-top-left blur-[6px]">
          <SettingsPage />
        </div>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="absolute left-[226.9px] top-[53.14px] h-[694.319px] w-[827.204px] rounded-[14px] bg-white shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 sm:px-6 py-4">
            <div>
              <div className="text-[17px] font-semibold leading-[20px] text-[#111827]">Change Password</div>
              <div className="text-[10.67px] font-normal leading-[16px] text-[#9CA3AF]">Enter your new password credentials</div>
            </div>
            <button onClick={handleClose} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:bg-[#F9FAFB] transition-colors" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 px-4 sm:px-6 py-5 sm:py-6">
            <div className="space-y-2">
              <label className="text-[11.33px] font-semibold text-[#6B7280] leading-[15.33px]">Old Password</label>
              <Input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" className="h-[34px] w-full rounded-[8px] border border-[#E5E7EB] text-[12px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11.33px] font-semibold text-[#6B7280] leading-[15.33px]">New Password</label>
              <Input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" className="h-[34px] w-full rounded-[8px] border border-[#E5E7EB] text-[12px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[11.33px] font-semibold text-[#6B7280] leading-[15.33px]">Re Enter New Password</label>
              <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="h-[34px] w-full rounded-[8px] border border-[#E5E7EB] text-[12px]" />
            </div>
            <p className="text-[10px] text-[#64748B]">Use at least 8 characters with uppercase, lowercase, and a number.</p>
            {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
            {success ? <p className="text-[11px] font-semibold text-emerald-600">{success}</p> : null}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-[#EEF1F6] px-4 sm:px-6 py-4">
            <Button onClick={handleClose} disabled={loading} variant="outline" size="sm" className="h-9 w-full sm:w-auto rounded-[10px] border-[#E5E7EB] bg-white text-[11.33px] font-semibold text-[#6B7280]">
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword} disabled={loading} size="sm" className="h-9 w-full sm:w-auto rounded-[10px] bg-[#3B5BDB] text-[11.33px] font-semibold text-white">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
