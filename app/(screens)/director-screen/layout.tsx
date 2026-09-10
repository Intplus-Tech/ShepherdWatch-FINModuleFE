"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function DirectorScreenLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute workspace="director-screen">{children}</ProtectedRoute>
}
