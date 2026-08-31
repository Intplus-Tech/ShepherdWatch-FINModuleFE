"use client"

import { API_V1 } from "@/lib/api";

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import AuthHeader from "../auth/AuthHeader"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"

const verifySchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    code: z.string().min(6, "Enter the 6-digit OTP").max(6, "Enter the 6-digit OTP"),
    // Invited users set their first password here. Optional for users who already have one.
    newPassword: z
      .string()
      .optional()
      .refine((value) => !value || value.length >= 8, {
        message: "Password must be at least 8 characters",
      })
      .refine((value) => !value || /[a-z]/.test(value), {
        message: "Password must include a lowercase letter",
      })
      .refine((value) => !value || /[A-Z]/.test(value), {
        message: "Password must include an uppercase letter",
      })
      .refine((value) => !value || /[0-9]/.test(value), {
        message: "Password must include a number",
      }),
    confirmPassword: z.string().optional(),
  })
  .refine((values) => !values.newPassword || values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type VerifyValues = z.infer<typeof verifySchema>

export default function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase() ?? ""
  const codeFromQuery = (
    searchParams.get("code") ??
    searchParams.get("otp") ??
    searchParams.get("token") ??
    ""
  )
    .trim()
    .replace(/\s+/g, "")
    .slice(0, 6)
  const { resendOtp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [autoVerifying, setAutoVerifying] = useState<boolean>(
    Boolean(emailFromQuery && /^\d{6}$/.test(codeFromQuery))
  )
  const autoSubmittedRef = useRef(false)

  const {
    register,
    handleSubmit,
    getValues,
    setFocus,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: emailFromQuery,
      code: /^\d{6}$/.test(codeFromQuery) ? codeFromQuery : "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: VerifyValues) => {
    setError(null)
    setSuccessMessage(null)
    setResendMessage(null)
    try {
      const res = await fetch(`${API_V1}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          code: values.code.trim(),
          ...(values.newPassword ? { newPassword: values.newPassword } : {}),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data.message || "Verification failed"
        if (/password/i.test(message)) {
          setFocus("newPassword")
          setFormError("newPassword", { type: "server", message })
        }
        throw new Error(message)
      }

      setSuccessMessage(data?.message || "Email verified successfully.")
      
      // Verification does not return a session, so continue to login with the email pre-filled.
      router.replace(`/login?email=${encodeURIComponent(values.email.trim().toLowerCase())}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setAutoVerifying(false)
    }
  }

  useEffect(() => {
    if (autoSubmittedRef.current) return
    if (!emailFromQuery || !/^\d{6}$/.test(codeFromQuery)) return
    autoSubmittedRef.current = true
    void handleSubmit(onSubmit)()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromQuery, codeFromQuery])

  const handleResendOtp = async () => {
    setError(null)
    setResendMessage(null)
    const email = getValues("email")
    if (!email) {
      setError("Please enter your email to resend OTP.")
      return
    }
    try {
      await resendOtp({ email, purpose: "email_verification" })
      setResendMessage("OTP resent to your email.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP.")
    }
  }

  return (
    <div className="w-full min-h-screen bg-white overflow-y-auto">
      <div className="relative w-full min-h-screen grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="absolute top-[-30px] left-[-40px] w-[400px] h-[400px] md:w-[680px] md:h-[680px] overflow-hidden pointer-events-none opacity-[0.08] z-0">
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain object-top -translate-x-10 -translate-y-10 md:-translate-x-20 md:-translate-y-20 scale-[1.35] rotate-[-15deg]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 py-10 md:px-8 md:py-12 min-h-[100dvh] md:min-h-0">
          <div className="flex w-full max-w-[436px] flex-col gap-6 items-center text-center">
            <div>
              <AuthHeader />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Verify Email</h1>
              <p className="text-[14px] text-[#98A2B3]">
                {autoVerifying
                  ? "Verifying your email from the link..."
                  : "Enter the 6-digit OTP sent to your email."}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-[#98A2B3] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-[11px] text-rose-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-[13px] text-[#98A2B3] font-medium">OTP Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("code")}
                />
                {errors.code ? (
                  <p className="text-[11px] text-rose-600">{errors.code.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[13px] text-[#98A2B3] font-medium">
                  Password
                </Label>
                <PasswordInput
                  id="newPassword"
                  autoComplete="new-password"
                  placeholder="Set your account password"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("newPassword")}
                />
                {errors.newPassword ? (
                  <p className="text-[11px] text-rose-600">{errors.newPassword.message}</p>
                ) : (
                  <p className="text-[11px] text-[#98A2B3]">
                    Required if you were invited. Min 8 characters with an uppercase, lowercase and a number.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[13px] text-[#98A2B3] font-medium">
                  Confirm Password
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                  <p className="text-[11px] text-rose-600">{errors.confirmPassword.message}</p>
                ) : null}
              </div>

              {successMessage ? (
                <p className="text-[12px] text-emerald-600 text-center">{successMessage}</p>
              ) : null}
              {resendMessage ? (
                <p className="text-[12px] text-emerald-600 text-center">{resendMessage}</p>
              ) : null}
              {error ? <p className="text-[12px] text-rose-600 text-center">{error}</p> : null}

              <div className="pt-2 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting || autoVerifying}
                  className="h-[44px] px-12 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  {isSubmitting || autoVerifying ? "Verifying..." : "Verify Email"}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[12px] text-[#4F63FF] font-medium hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative w-full h-full p-4 lg:p-6 hidden md:block">
          <div className="relative w-full h-full rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-sm">
            <Image
              src="/images/login%20page%20picture.jpg"
              alt="Verification background"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-between p-12">
              <div className="text-white">
                <h2 className="text-[48px] leading-[1.15] font-normal tracking-tight">
                  Secure your<br />
                  <span className="font-bold">ShepherdWatch</span>
                </h2>
                <p className="text-[15px] text-white/90 mt-2 font-medium">Global Harvest Church</p>
              </div>

              <div className="text-white/90 pb-4 text-[15px] font-medium">
                Verify once, access everywhere.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


