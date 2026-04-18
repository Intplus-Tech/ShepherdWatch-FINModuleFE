"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof loginSchema>

function getDashboardByRole(role?: string): string {
  const normalized = String(role ?? "").trim().toLowerCase()
  
  if (normalized === "super_admin" || normalized === "director") {
    return "/director-screen/dashboard"
  }
  
  if (normalized === "pastor" || normalized === "regional_pastor" || normalized === "branch_pastor") {
    return "/branchlead-pastor/dashboard"
  }
  
  if (normalized === "accountant") {
    return "/branchaccount-pastor/dashboard"
  }
  
  if (normalized === "branch_admin" || normalized === "admin" || normalized === "hr" || normalized === "employee") {
    return "/branch-admin/dashboard"
  }
  
  return "/director-screen/dashboard"
}

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginValues) => {
    setError(null)
    try {
      const authUser = await login({
        email: values.email,
        password: values.password,
      })
      router.push(getDashboardByRole(authUser?.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="w-full h-screen bg-white overflow-y-auto md:overflow-hidden">
      <div className="relative w-full min-h-full grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* Background Watermark exactly matching User's preferred restored placement */}
        <div className="absolute -top-7.5 -left-10 w-100 h-100 md:w-170 md:h-170 overflow-hidden pointer-events-none opacity-[0.08] z-0">
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain object-top -translate-x-10 -translate-y-10 md:-translate-x-20 md:-translate-y-20 scale-[1.35] rotate-[-15deg]"
          />
        </div>

        {/* Form Container (Left Pane) - Corrected to occur first in the grid */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 md:p-8 min-h-dvh md:min-h-0">
          <div className="flex w-full max-w-109 flex-col gap-6 md:gap-8 items-center text-center">
            <div>
              <AuthHeader />
            </div>

            <div className="h-15 w-15 md:h-18 md:w-18 rounded-full bg-white shadow-[0_6px_18px_rgba(59,91,219,0.18)] flex items-center justify-center overflow-hidden">
              <Image
                src="/images/Beared%20Guy02-min%201.jpg"
                alt="User avatar"
                width={72}
                height={72}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Welcome Back</h1>
              <p className="text-[14px] text-[#98A2B3]">
                Sign in with your email and password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-[#98A2B3] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="h-11 rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-[11px] text-rose-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] text-[#98A2B3] font-medium">Password</Label>
                <PasswordInput
                  id="password"
                  className="h-11 rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-[11px] text-rose-600">{errors.password.message}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-end pt-1">
                <a href="/forgot-password" className="text-[13px] text-[#4F63FF] font-medium hover:underline">
                  Forgot Password
                </a>
              </div>

              {error ? <p className="text-[12px] text-rose-600 text-center">{error}</p> : null}

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-16 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Hero Image Container (Right Pane) */}
        <div className="relative w-full h-full p-4 lg:p-6 hidden md:block">
          <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-sm">
            <Image
              src="/images/login%20page%20picture.jpg"
              alt="Login abstract background"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {/* Intentionally removed the text overlay "Welcome to ShepherdWatch" from Login screen 
                as it is not present in the new Figma! */}
          </div>
        </div>

      </div>
    </div>
  )
}
