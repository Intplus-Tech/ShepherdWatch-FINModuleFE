"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import AuthHeader from "../auth/AuthHeader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"

const loginSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  })

  const onSubmit = async (values: LoginValues) => {
    setError(null)
    const email = user?.email || localStorage.getItem("rememberedEmail") || "rev.victor@shepherdwatch.com"
    try {
      await login({ email, password: values.password, rememberMe: true })
      router.push("/director-screen/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="w-full h-screen bg-white overflow-y-auto md:overflow-hidden">
      <div className="relative w-full min-h-full grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* Background Watermark exactly matching User's preferred restored placement */}
        <div className="absolute top-[-30px] left-[-40px] w-[400px] h-[400px] md:w-[680px] md:h-[680px] overflow-hidden pointer-events-none opacity-[0.08] z-0">
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            className="object-contain object-top -translate-x-10 -translate-y-10 md:-translate-x-20 md:-translate-y-20 scale-[1.35] rotate-[-15deg]"
          />
        </div>

        {/* Form Container (Left Pane) - Corrected to occur first in the grid */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 md:p-8 min-h-[100dvh] md:min-h-0">
          <div className="flex w-full max-w-[436px] flex-col gap-6 md:gap-8 items-center text-center">
            <div>
              <AuthHeader />
            </div>

            <div className="h-[60px] w-[60px] md:h-[72px] md:w-[72px] rounded-full bg-white shadow-[0_6px_18px_rgba(59,91,219,0.18)] flex items-center justify-center overflow-hidden">
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
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Hi ! Rev. Victor</h1>
              <p className="text-[14px] text-[#98A2B3]">
                Enter your password to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full text-left">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] text-[#98A2B3] font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="h-[44px] rounded-[6px] border-[#4F63FF] focus-visible:ring-[#5871F5] px-3 w-full"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-[11px] text-rose-600">{errors.password.message}</p>
                ) : null}
              </div>

              {error ? <p className="text-[12px] text-rose-600 text-center">{error}</p> : null}

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[44px] px-16 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
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
