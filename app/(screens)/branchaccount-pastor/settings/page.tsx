"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, KeyRound, Loader2, MapPin } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useToast } from "@/components/ui/toast"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { API_V1 } from "@/lib/api"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PasswordInput } from "@/components/ui/password-input"

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(160),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .refine((v) => !v || /^[+()\d\s-]{6,}$/.test(v), "Enter a valid phone number"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

const ROLE_LABELS: Record<string, string> = {
  accountant: "Branch Accountant",
  branch_accountant: "Branch Accountant",
}

function formatRole(role?: string | null) {
  if (!role) return "Branch Accountant"
  const key = String(role).trim().toLowerCase()
  if (ROLE_LABELS[key]) return ROLE_LABELS[key]
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
}

function getInitials(name: string) {
  if (!name.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}

export default function Page() {
  const { user, updateProfile, changePassword, loading: authLoading } = useAuth()
  const { pushToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError: setFormError,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "" },
  })

  const fullName = useMemo(() => {
    const fn = user?.firstName ?? ""
    const ln = user?.lastName ?? ""
    return `${fn} ${ln}`.trim() || user?.name || user?.email || "User"
  }, [user])

  useEffect(() => {
    if (user) {
      reset({
        fullName:
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.name || "",
        phone: user.phone ?? user.phoneNumber ?? "",
      })
    }
  }, [user, reset])

  const roleLabel = formatRole(user?.role)
  const employeeId = user?.id ?? "—"
  const branchName = user?.tenant?.name ?? user?.branch?.name

  const onSubmit = handleSubmit(async (values) => {
    const parts = values.fullName.trim().split(/\s+/)
    const firstName = parts[0] ?? ""
    const lastName = parts.slice(1).join(" ")
    try {
      await updateProfile({
        firstName,
        lastName,
        phone: values.phone?.trim() || undefined,
      })
      reset(values)
      pushToast("Profile updated", "success")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to update profile"
      setFormError("root", { message })
      pushToast(message, "error")
    }
  })

  const handleAvatarFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      pushToast("Image exceeds 5MB limit", "error")
      return
    }
    if (!file.type.startsWith("image/")) {
      pushToast("Only image files are allowed", "error")
      return
    }
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "avatars")
      const res = await fetch(`${API_V1}/file-uploads`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message ?? "Upload failed")
      const uploaded = body?.data ?? body
      const fileId: string | undefined = uploaded?.id ?? uploaded?._id ?? uploaded?.url
      if (!fileId) throw new Error("Upload response missing file ID")
      await updateProfile({ avatar: fileId })
      pushToast("Avatar updated", "success")
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Unable to upload avatar", "error")
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/settings" />
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="flex w-full flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">User Settings</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage personal details, alerts, and operational templates.
            </p>
          </div>
          <button
            type="submit"
            form="profile-form"
            disabled={!isDirty || isSubmitting || authLoading}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save All Changes"}
          </button>
        </header>

        <form
          id="profile-form"
          onSubmit={onSubmit}
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Profile row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                  aria-label="Change profile photo"
                >
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(fullName)
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {avatarUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload profile photo"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleAvatarFile(file)
                  }}
                />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#111827]">{fullName}</h2>
                <p className="mt-0.5 text-[13px] text-[#6B7280]">
                  {roleLabel} <span className="text-[#D1D5DB]">|</span> ID: #{employeeId}
                </p>
                {branchName && (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-[#9CA3AF]">
                    <MapPin className="h-3.5 w-3.5" />
                    {branchName}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] sm:self-center"
            >
              Change Password
            </button>
          </div>

          <div className="my-6 h-px w-full bg-[#EEF1F6]" />

          {/* Fields */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">Full Name</label>
              <input
                {...register("fullName")}
                className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Full name"
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">Employee ID</label>
              <input
                value={employeeId}
                readOnly
                aria-label="Employee ID"
                className="h-11 w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] px-3 text-sm text-[#9CA3AF]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">Work Email</label>
              <input
                value={user?.email ?? "—"}
                readOnly
                aria-label="Work Email"
                className="h-11 w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] px-3 text-sm text-[#6B7280]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">Phone Number</label>
              <input
                {...register("phone")}
                className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="+234 800 000 0000"
                autoComplete="tel"
                type="tel"
              />
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
            </div>
          </div>

          {errors.root?.message && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {errors.root.message}
            </p>
          )}
        </form>
        </div>
      </main>

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        changePassword={changePassword}
        pushToast={pushToast}
      />
    </div>
  )
}

function ChangePasswordDialog({
  open,
  onOpenChange,
  changePassword,
  pushToast,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  changePassword: (p: { currentPassword: string; newPassword: string }) => Promise<void>
  pushToast: (msg: string, type: "success" | "error" | "info") => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (!open) reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      pushToast("Password changed", "success")
      onOpenChange(false)
    } catch (e) {
      setError("root", { message: e instanceof Error ? e.message : "Unable to change password" })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Enter your new password credentials.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Old Password</label>
            <PasswordInput
              {...register("currentPassword")}
              placeholder="Old password"
              initiallyVisible={false}
              autoComplete="off"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">New Password</label>
            <PasswordInput
              {...register("newPassword")}
              placeholder="New password"
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Re Enter New Password</label>
            <PasswordInput
              {...register("confirmPassword")}
              placeholder="Re enter new password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          {errors.root?.message && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {errors.root.message}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
