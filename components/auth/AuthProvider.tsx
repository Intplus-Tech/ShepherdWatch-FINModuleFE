"use client";

import { API_V1 } from "@/lib/api";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  tenant?: {
    id?: string;
    name?: string;
  };
  branchId?: string;
  branch?: {
    id?: string;
    name?: string;
  };
  avatar?: string;
  phone?: string;
  phoneNumber?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (payload: { email: string; password: string; rememberMe?: boolean }) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resendOtp: (payload: { email: string; purpose: "email_verification" | "password_reset" }) => Promise<void>;
  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  const text = await response.text().catch(() => "");
  return text ? { message: text } : null;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    const data =
      source.data && typeof source.data === "object" ? (source.data as Record<string, unknown>) : null;
    const firstValidationError = Array.isArray(source.errors) ? source.errors[0] : null;
    const validationMessage =
      firstValidationError && typeof firstValidationError === "object"
        ? (firstValidationError as Record<string, unknown>).message
        : null;

    const messageLike =
      source.message ?? source.error ?? source.detail ?? data?.message ?? validationMessage;

    if (typeof messageLike === "string" && messageLike.trim()) return messageLike;
    if (Array.isArray(messageLike)) {
      const combined = messageLike.filter((e) => typeof e === "string").join(", ").trim();
      if (combined) return combined;
    }

    const nestedData =
      source.data && typeof source.data === "object" ? (source.data as Record<string, unknown>) : null;
    const nestedMessage = nestedData?.message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) return nestedMessage;
    if (Array.isArray(nestedMessage)) {
      const combined = nestedMessage.filter((e) => typeof e === "string").join(", ").trim();
      if (combined) return combined;
    }
  }
  return fallback;
}

function sessionToAuthUser(session: Session | null | undefined): AuthUser | null {
  if (!session?.user) return null;
  const u = session.user;
  if (!u.id && !u.email) return null;
  const firstName = u.firstName;
  const lastName = u.lastName;
  const composedName =
    u.name ?? (firstName && lastName ? `${firstName} ${lastName}` : firstName ?? undefined);
  return {
    id: String(u.id ?? u.email ?? ""),
    email: String(u.email ?? ""),
    role: String(u.role ?? ""),
    name: composedName ?? undefined,
    firstName,
    lastName,
    tenantId: u.tenantId,
    tenant: u.tenantId ? { id: u.tenantId } : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();

  const user = useMemo(() => sessionToAuthUser(session), [session]);
  const loading = status === "loading";

  const login = useCallback(
    async (payload: { email: string; password: string; rememberMe?: boolean }) => {
      const result = await signIn("credentials", {
        email: payload.email.trim(),
        password: String(payload.password),
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error(result?.error ?? "Unable to login");
      }

      // Force the client session to refresh so callers see the freshly authorized user.
      const refreshed = await update();
      return sessionToAuthUser(refreshed);
    },
    [update]
  );

  const logout = useCallback(async () => {
    // Best-effort backend logout to clear server-side state / cookies.
    await fetch(`${API_V1}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => null);
    await signOut({ redirect: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const refreshed = await update();
    if (!sessionToAuthUser(refreshed)) {
      throw new Error("Unable to refresh user context");
    }
  }, [update]);

  const changePassword = useCallback(
    async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await fetch(`${API_V1}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await parseResponseBody(res);
        throw new Error(getErrorMessage(data, "Failed to change password"));
      }
    },
    []
  );

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch(`${API_V1}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await parseResponseBody(res);
      throw new Error(getErrorMessage(data, "Unable to send reset email"));
    }
  }, []);

  const resendOtp = useCallback(
    async (payload: { email: string; purpose: "email_verification" | "password_reset" }) => {
      const res = await fetch(`${API_V1}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await parseResponseBody(res);
        throw new Error(getErrorMessage(data, "Unable to resend OTP"));
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (payload: { firstName?: string; lastName?: string; phone?: string; avatar?: string }) => {
      const res = await fetch(`${API_V1}/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await parseResponseBody(res);
        throw new Error(getErrorMessage(data, "Unable to update profile"));
      }
      await update();
    },
    [update]
  );

  const value: AuthContextValue = {
    user,
    loading,
    refreshUser,
    login,
    logout,
    changePassword,
    forgotPassword,
    resendOtp,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
