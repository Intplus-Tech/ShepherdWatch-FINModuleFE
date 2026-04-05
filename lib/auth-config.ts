export const ACCESS_TOKEN_COOKIE = "token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const BACKEND_TOKEN_COOKIE = "backend_token";
export const BACKEND_REFRESH_TOKEN_COOKIE = "backend_refresh_token";
export const CSRF_COOKIE_NAME = "csrf_token";

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const AUTH_ISSUER = process.env.AUTH_ISSUER ?? "shepherdwatch-finmodule";
export const AUTH_AUDIENCE = process.env.AUTH_AUDIENCE ?? "shepherdwatch-web";
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "";

export const JWT_SECRET = process.env.JWT_SECRET;
