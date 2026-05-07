import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  BACKEND_REFRESH_TOKEN_COOKIE,
  BACKEND_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";
import { refreshAccessToken } from "@/lib/backend-refresh";
import { getBackendLoginUrl } from "@/lib/backend-auth-url";
import {
  BackendUnavailableError,
  InvalidCredentialsError,
  mapLoginErrorToAuthError,
} from "@/lib/auth-errors";

const ACCESS_TOKEN_TTL_MS = ACCESS_TOKEN_MAX_AGE_SECONDS * 1000;

function pickToken(source: unknown, keys: string[]): string {
  if (!source || typeof source !== "object") return "";
  const rec = source as Record<string, unknown>;
  for (const key of keys) {
    const val = rec[key];
    if (typeof val === "string" && val.trim()) return val;
  }
  return "";
}

function pickString(source: unknown, keys: string[]): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const rec = source as Record<string, unknown>;
  for (const key of keys) {
    const val = rec[key];
    if (typeof val === "string" && val.trim()) return val;
  }
  return undefined;
}

/**
 * Mirror NextAuth JWT tokens into legacy backend cookies so existing API proxies
 * that read `BACKEND_TOKEN_COOKIE` keep working without changes.
 */
async function syncBackendCookies(accessToken: string, refreshToken?: string) {
  try {
    const store = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    store.set({
      name: BACKEND_TOKEN_COOKIE,
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
    if (refreshToken) {
      store.set({
        name: BACKEND_REFRESH_TOKEN_COOKIE,
        value: refreshToken,
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }
  } catch {
    // cookies() throws outside a request scope; safe to ignore.
  }
}

async function clearBackendCookies() {
  try {
    const store = await cookies();
    store.delete(BACKEND_TOKEN_COOKIE);
    store.delete(BACKEND_REFRESH_TOKEN_COOKIE);
  } catch {
    // Outside request scope.
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const backendUrl = getBackendLoginUrl();
        if (!backendUrl) {
          console.error("[auth] BACKEND_API_URL not configured");
          throw new BackendUnavailableError();
        }

        let res: Response;
        try {
          res = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, password }),
            cache: "no-store",
          });
        } catch (err) {
          console.error("[auth] backend login fetch failed", err);
          throw new BackendUnavailableError();
        }

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          throw mapLoginErrorToAuthError(res.status, errorBody);
        }

        const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        if (!payload) throw new InvalidCredentialsError();

        const data =
          payload.data && typeof payload.data === "object"
            ? (payload.data as Record<string, unknown>)
            : payload;
        const tokens =
          data.tokens && typeof data.tokens === "object"
            ? (data.tokens as Record<string, unknown>)
            : null;
        const userSrc =
          (data.user && typeof data.user === "object" ? (data.user as Record<string, unknown>) : null) ??
          data;

        const accessToken =
          pickToken(tokens, ["accessToken", "access_token", "token"]) ||
          pickToken(data, ["accessToken", "access_token", "token"]) ||
          pickToken(payload, ["accessToken", "access_token", "token"]);
        if (!accessToken) throw new InvalidCredentialsError();

        const refreshToken =
          pickToken(tokens, ["refreshToken", "refresh_token"]) ||
          pickToken(data, ["refreshToken", "refresh_token"]) ||
          pickToken(payload, ["refreshToken", "refresh_token"]) ||
          undefined;

        const id =
          pickString(userSrc, ["id", "userId", "_id", "uuid"]) ??
          pickString(data, ["id", "userId", "_id", "uuid"]) ??
          email;
        const role =
          pickString(userSrc, ["role", "roleType", "userRole"]) ??
          pickString(data, ["role", "roleType", "userRole"]) ??
          "";
        const firstName = pickString(userSrc, ["firstName"]);
        const lastName = pickString(userSrc, ["lastName"]);
        const tenantId = pickString(userSrc, ["tenantId"]) ?? pickString(data, ["tenantId"]);
        const fullName =
          pickString(userSrc, ["fullName", "name"]) ??
          (firstName && lastName ? `${firstName} ${lastName}` : firstName);

        // Mirror tokens into legacy backend cookies so existing /api/v1/* proxies keep working.
        await syncBackendCookies(accessToken, refreshToken);

        return {
          id,
          email,
          role,
          tenantId,
          firstName,
          lastName,
          name: fullName ?? null,
          accessToken,
          refreshToken,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // First sign in: copy fields from authorize() into the JWT.
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires ?? Date.now() + ACCESS_TOKEN_TTL_MS;
        delete token.error;
        return token;
      }

      // Session update() — re-sync cookies (no-op for now).
      if (trigger === "update") {
        return token;
      }

      // Access token still valid — nothing to do.
      if (
        token.accessToken &&
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires - 30_000
      ) {
        return token;
      }

      // Need to refresh.
      const refreshToken = typeof token.refreshToken === "string" ? token.refreshToken : "";
      if (!refreshToken) {
        token.error = "RefreshAccessTokenError";
        return token;
      }

      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed?.accessToken) {
        token.error = "RefreshAccessTokenError";
        return token;
      }

      token.accessToken = refreshed.accessToken;
      if (refreshed.refreshToken) token.refreshToken = refreshed.refreshToken;
      token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
      delete token.error;

      // Keep legacy cookies in sync.
      await syncBackendCookies(refreshed.accessToken, refreshed.refreshToken ?? refreshToken);

      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }
      session.accessToken = token.accessToken;
      session.user = {
        ...session.user,
        id: token.id ?? "",
        email: token.email ?? session.user?.email ?? "",
        role: token.role ?? "",
        tenantId: token.tenantId,
        firstName: token.firstName,
        lastName: token.lastName,
        name:
          session.user?.name ??
          (token.firstName && token.lastName
            ? `${token.firstName} ${token.lastName}`
            : token.firstName ?? null),
      };
      return session;
    },
  },
  events: {
    async signOut() {
      await clearBackendCookies();
    },
  },
});
