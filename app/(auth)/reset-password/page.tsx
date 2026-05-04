import React, { Suspense } from "react"
import SetNewPasswordForm from "@/components/forms/SetNewPasswordForm"

export const dynamic = "force-dynamic"

export default function page() {
  return (
    <div>
      <Suspense fallback={null}>
        <SetNewPasswordForm />
      </Suspense>
    </div>
  )
}
