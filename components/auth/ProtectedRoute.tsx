"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDashboardPathForUser, getWorkspaceForUser, type Workspace } from "@/lib/auth-redirect";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /**
   * Restrict the subtree to the single route group named here. Preferred over
   * `requiredRoles`: the role list lives in `lib/auth-redirect.ts` alongside the
   * post-login redirect, so a guard can never disagree with where login sent the
   * user, and it also honours the Finance Controller email convention.
   */
  workspace?: Workspace;
  /** Explicit role allow-list. Use only for a screen that does not map 1:1 to a workspace. */
  requiredRoles?: string[];
};

function normalizeRole(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

export default function ProtectedRoute({ children, workspace, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    if (workspace && getWorkspaceForUser({ role: user.role, email: user.email }) !== workspace) {
      return false;
    }
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const userRole = normalizeRole(user.role);
    return requiredRoles.some((r) => normalizeRole(r) === userRole);
  }, [user, workspace, requiredRoles]);

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
