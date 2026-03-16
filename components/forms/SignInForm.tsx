"use client"

import { useEffect, useState } from "react"
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

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignInForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setValue("email", rememberedEmail)
      setValue("rememberMe", true)
    }
  }, [setValue])

  const onSubmit = async (values: SignInValues) => {
    setError(null)
    try {
      await login(values)
      router.push("/director-screen/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="w-full h-screen bg-white overflow-y-auto md:overflow-hidden">
      <div className="relative w-full min-h-full grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="absolute top-[-30px] left-[-40px] w-[400px] h-[400px] md:w-[680px] md:h-[680px] overflow-hidden pointer-events-none opacity-[0.08] z-0">
          <Image
            src="/images/icon-shepherdwatch.svg"
            alt="Background decoration"
            fill
            className="object-contain object-top -translate-x-10 -translate-y-10 md:-translate-x-20 md:-translate-y-20 scale-[1.35] rotate-[-15deg]"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 md:p-8 min-h-[100dvh] md:min-h-0">
          <div className="flex w-full max-w-[436px] flex-col gap-6 md:gap-8 items-center text-center">
            <div>
              <AuthHeader />
            </div>

            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#111827] mb-2">Sign In</h1>
              <p className="text-[14px] text-[#98A2B3]">Sign in to stay connected.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full text-left">
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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#BFC7FF] text-[#3B5BDB] focus:ring-[#5871F5]"
                    {...register("rememberMe")}
                  />
                  <span className="text-[13px] text-[#98A2B3]">Remember me?</span>
                </label>

                <a href="/forgot-password" className="text-[13px] text-[#4F63FF] font-medium hover:underline">
                  Forgot Password
                </a>
              </div>

              {error ? <p className="text-[12px] text-rose-600 text-center">{error}</p> : null}

              <div className="pt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[44px] px-12 bg-[#3B5BDB] hover:bg-[#2f4cc2] text-white rounded-[6px] text-[15px] shadow-[0_4px_12px_rgba(59,91,219,0.2)] font-medium"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative w-full h-full p-4 lg:p-6 hidden md:block">
          <div className="relative w-full h-full rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-sm">
            <Image
              src="/images/login%20page%20picture.jpg"
              alt="Login abstract background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-between p-12">
              <div className="text-white">
                <h2 className="text-[48px] leading-[1.15] font-normal tracking-tight">
                  Welcome to<br />
                  <span className="font-bold">ShepherdWatch</span>
                </h2>
                <p className="text-[15px] text-white/90 mt-2 font-medium">Global Harvest Church</p>
              </div>

              <div className="text-white/90 pb-4 text-[15px] font-medium">
                All church workflow unified.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
