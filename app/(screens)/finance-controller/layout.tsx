"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function FinanceControllerLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute workspace="finance-controller">{children}</ProtectedRoute>
}
