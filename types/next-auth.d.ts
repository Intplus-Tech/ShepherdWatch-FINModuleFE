import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      tenantId?: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }

  interface User {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
    firstName?: string;
    lastName?: string;
    name?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    role?: string;
    tenantId?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}

// `next-auth/jwt` re-exports the `JWT` interface from `@auth/core/jwt`.
// Augmenting the original module is required for callback parameters typed by
// `@auth/core` directly.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    role?: string;
    tenantId?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}

// Same situation for User: `next-auth` callbacks reference `@auth/core/types#User`.
declare module "@auth/core/types" {
  interface User {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
    firstName?: string;
    lastName?: string;
    name?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      tenantId?: string;
      firstName?: string;
      lastName?: string;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }
}
