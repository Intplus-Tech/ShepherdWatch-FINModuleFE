import { API_V1 } from "@/lib/api";
"use client"

import { useState } from "react"
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

const setPasswordSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email"),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit OTP code"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SetPasswordValues = z.infer<typeof setPasswordSchema>

export default function SetNewPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const initialEmail = searchParams.get("email")?.trim() ?? ""
  const initialCode = searchParams.get("code")?.trim() ?? ""

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      email: initialEmail,
      code: initialCode,
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: SetPasswordValues) => {
    setError(null)
    setInfo(null)
    try {
      const res = await fetch(`${API_V1}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          code: values.code,
          newPassword: values.newPassword,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to reset password")
      }

      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password")
    }
  }

  const handleResendCode = async () => {
    setError(null)
    setInfo(null)
    const email = getValues("email").trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address before requesting a new OTP.")
      return
    }

    try {
      const res = await fetch(`${API_V1}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "password_reset" }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Unable to resend OTP")
      }

      setInfo(data?.message || "A new OTP has been sent to your email.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP")
    }
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] px-6 py-10 flex items-center justify-center relative">
      <div className="relative w-full max-w-[1150px] lg:h-[796px] bg-white rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col lg:flex-row">
        <div className="absolute top-0 left-0 w-[520px] h-[520px] overflow-hidden pointer-events-none opacity-[0.06]">
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            sizes="(max-width: 1024px) 100vw, 520px"
            className="object-contain object-top -translate-x-24 -translate-y-24 scale-125 rotate-[-15deg]"
          />
        </div>

        <div className="relative z-10 flex-1 lg:w-[calc(100%-622px)] flex flex-col justify-center items-center px-10 sm:px-14 lg:px-20 py-12 lg:py-0">
          <div className="mb-8">
            <AuthHeader />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-[24px] font-semibold text-[#111827] mb-2">Reset Password</h1>
            <p className="text-[12px] text-[#98A2B3] max-w-[360px]">
              Enter your email, OTP code, and a strong new password to complete your password reset.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-[360px] max-w-full">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[12px] text-[#98A2B3]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="h-[38px] rounded-[4px] border-[#B8C6FF] focus-visible:ring-[#5871F5] px-3"
                {...register("email")}
              />
              {errors.email ? <p className="text-[10px] text-rose-600">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code" className="text-[12px] text-[#98A2B3]">
                  OTP Code
                </Label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[10px] font-medium text-[#3B5BDB] hover:underline"
                >
                  Resend OTP
                </button>
              </div>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-[38px] rounded-[4px] border-[#B8C6FF] focus-visible:ring-[#5871F5] px-3"
                {...register("code")}
              />
              {errors.code ? <p className="text-[10px] text-rose-600">{errors.code.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-[12px] text-[#98A2B3]">
                New Password
              </Label>
              <PasswordInput
                id="newPassword"
                className="h-[38px] rounded-[4px] border-[#B8C6FF] focus-visible:ring-[#5871F5] px-3"
                {...register("newPassword")}
              />
              {errors.newPassword ? (
                <p className="text-[10px] text-rose-600">{errors.newPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[12px] text-[#98A2B3]">
                Confirm Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                className="h-[38px] rounded-[4px] border-[#B8C6FF] focus-visible:ring-[#5871F5] px-3"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-[10px] text-rose-600">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            {error ? <p className="text-[11px] text-rose-600 text-center">{error}</p> : null}
            {info ? <p className="text-[11px] text-[#1D4ED8] text-center">{info}</p> : null}

            <div className="pt-2 flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[36px] w-[180px] bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[4px] text-[12px]"
              >
                {isSubmitting ? "Saving..." : "Save New Password"}
              </Button>
            </div>
          </form>
        </div>

        <div className="relative w-full h-[360px] lg:h-full lg:w-[622px] shrink-0">
          <Image
            src="/images/login%20page%20picture.jpg"
            alt="Reset abstract background"
            fill
            sizes="(max-width: 1024px) 100vw, 622px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}
