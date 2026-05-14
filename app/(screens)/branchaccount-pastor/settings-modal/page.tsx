"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SettingsPage from "../settings/page"
import { useAuth } from "@/components/auth/AuthProvider"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { changePasswordSchema } from "@/lib/validation/password"

export default function Page() {
  const router = useRouter()
  const { changePassword } = useAuth()
  const [open, setOpen] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  // Navigate back after dialog closes (allows Radix focus trap + exit animation to complete)
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => router.back(), 150)
      return () => clearTimeout(t)
    }
  }, [open, router])

  const handleUpdatePassword = async () => {
    setError(null)
    setSuccess(null)

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.")
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
      {/* Background Settings Page (non-interactive while modal is open) */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        <SettingsPage />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[500px] p-0 gap-0"
          style={{ fontFamily: '"Inter", sans-serif' }}
        >
          <DialogHeader className="border-b border-[#EEF1F6] px-5 sm:px-6 py-4 sm:py-5">
            <DialogTitle className="text-[#111827] text-[13.33px] font-bold leading-[18.67px]">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
              Enter your password details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 sm:gap-5 px-5 sm:px-6 py-5 sm:py-6">
            <div className="flex flex-col gap-[4px] items-start w-full">
              <label htmlFor="settings-modal-current" className="text-[12px] font-extrabold text-[#4B5563] px-0.5 w-full">
                Old Password
              </label>
              <PasswordInput
                id="settings-modal-current"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full bg-white border-[#E5E7EB] px-3 text-[13px] text-[#111827] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-9 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-[4px] items-start w-full">
              <label htmlFor="settings-modal-new" className="text-[12px] font-extrabold text-[#4B5563] px-0.5 w-full">
                New Password
              </label>
              <PasswordInput
                id="settings-modal-new"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full bg-white border-[#E5E7EB] px-3 text-[13px] text-[#111827] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-9 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-[4px] items-start w-full">
              <label htmlFor="settings-modal-confirm" className="text-[12px] font-extrabold text-[#4B5563] px-0.5 w-full">
                Re-Enter New Password
              </label>
              <PasswordInput
                id="settings-modal-confirm"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full bg-white border-[#E5E7EB] px-3 text-[13px] text-[#111827] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-9 rounded-md"
              />
            </div>

            <p className="text-[11px] text-[#64748B]">
              Use at least 8 characters with uppercase, lowercase, and a number.
            </p>
            {error ? <p className="text-[12px] font-semibold text-rose-600" role="alert">{error}</p> : null}
            {success ? <p className="text-[12px] font-semibold text-emerald-600" role="status">{success}</p> : null}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-5 sm:px-6 py-5 sm:py-6 border-t border-[#EEF1F6]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto h-[42px] px-5 rounded-[8px] bg-white border border-[#E5E7EB] text-[13px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={loading}
              className="w-full sm:w-auto h-[42px] px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-[13px] font-bold text-white transition-colors shadow-sm disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
