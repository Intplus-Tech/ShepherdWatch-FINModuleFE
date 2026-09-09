"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

/**
 * Landing place for an authenticated user whose role maps to no workspace.
 *
 * Previously `getDashboardPathForUser` fell through to the Director dashboard
 * for any unmatched role, so a new or misspelled backend role silently gained
 * the highest-privilege screen group. Unknown roles now stop here instead.
 */
export default function NoAccessPage() {
  const { user, logout } = useAuth();

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
