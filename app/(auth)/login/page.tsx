import React from "react"
import LoginForm from "@/components/forms/LoginForm"

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const emailParam = resolvedSearchParams.email
  const initialEmail = Array.isArray(emailParam)
    ? (emailParam[0] ?? "").trim().toLowerCase()
    : String(emailParam ?? "").trim().toLowerCase()

  return (
    <LoginForm initialEmail={initialEmail} />
  )
}
