"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import AuthHeader from "../auth/AuthHeader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const setPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SetPasswordValues = z.infer<typeof setPasswordSchema>

export default function SetNewPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = async (values: SetPasswordValues) => {
    setError(null)
    try {
      const token = searchParams.get("token") || ""
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Unable to reset password")
      }

      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password")
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
            className="object-contain object-top -translate-x-24 -translate-y-24 scale-125 rotate-[-15deg]"
          />
        </div>

        <div className="relative z-10 flex-1 lg:w-[calc(100%-622px)] flex flex-col justify-center items-center px-10 sm:px-14 lg:px-20 py-12 lg:py-0">
          <div className="mb-8">
            <AuthHeader />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-[24px] font-semibold text-[#111827] mb-2">Create New Password</h1>
            <p className="text-[12px] text-[#98A2B3] max-w-[360px]">
              Set a new password for your account. Choose a strong password you will remember.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-[360px] max-w-full">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[12px] text-[#98A2B3]">New Password</Label>
              <Input
                id="password"
                type="password"
                className="h-[38px] rounded-[4px] border-[#B8C6FF] focus-visible:ring-[#5871F5] px-3"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-[10px] text-rose-600">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[12px] text-[#98A2B3]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="h-[38px] rounded-[4px] border-[#B8C6FF] focus-visible:ring-[#5871F5] px-3"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-[10px] text-rose-600">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            {error ? <p className="text-[11px] text-rose-600 text-center">{error}</p> : null}

            <div className="pt-2 flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[36px] w-[160px] bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[4px] text-[12px]"
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
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}
