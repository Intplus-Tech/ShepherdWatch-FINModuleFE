"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDashboardPathForUser, getWorkspaceForUser } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";

/**
 * Landing place for an authenticated user whose role maps to no workspace.
 *
 * Previously `getDashboardPathForUser` fell through to the Director dashboard
 * for any unmatched role, so a new or misspelled backend role silently gained
 * the highest-privilege screen group. Unknown roles now stop here instead.
 *
 * This screen re-checks the session rather than trusting whoever sent the user
 * here. A redirect can be decided before the session has hydrated — the role is
 * empty for that instant, which maps to no workspace — and a valid user would
 * otherwise be stranded on a dead end that names the very role that does map.
 * Anyone whose role resolves to a workspace is bounced straight to it.
 */
export default function NoAccessPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const workspace = user ? getWorkspaceForUser({ role: user.role, email: user.email }) : null;
  // An authenticated user with no role yet is mid-hydration, not unauthorised.
  const resolving = loading || (Boolean(user) && !user?.role) || Boolean(workspace);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (workspace) {
      router.replace(getDashboardPathForUser({ role: user.role, email: user.email }));
    }
  }, [loading, user, workspace, router]);

  if (resolving) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6 py-16 bg-[#F8FAFC]">
        <p className="text-sm text-[#64748B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16 bg-[#F8FAFC]">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-2xl">
          !
        </div>
        <h1 className="text-xl font-semibold text-[#0F172A]">No workspace assigned</h1>
        <p className="text-sm text-[#64748B]">
          Your account is signed in, but the role it carries
          {user?.role ? ` (${user.role})` : ""} is not linked to any ShepherdWatch
          workspace. Ask your administrator to assign you a role.
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => {
              void logout().then(() => {
                if (typeof window !== "undefined") window.location.href = "/login";
              });
            }}
            variant="outline"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
