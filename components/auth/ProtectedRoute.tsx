"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDashboardPathForUser } from "@/lib/auth-redirect";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles?: string[];
};

function normalizeRole(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const userRole = normalizeRole(user.role);
    return requiredRoles.some((r) => normalizeRole(r) === userRole);
  }, [user, requiredRoles]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }
    if (!isAuthorized) {
      const target = getDashboardPathForUser({ role: user.role, email: user.email });
      if (target !== pathname) router.replace(target);
    }
  }, [loading, user, isAuthorized, pathname, router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;
  if (!isAuthorized) return null;

  return <>{children}</>;
}



