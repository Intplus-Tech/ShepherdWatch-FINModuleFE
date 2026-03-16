"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function DirectorScreenLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
