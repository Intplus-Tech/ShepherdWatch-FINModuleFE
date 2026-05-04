function sanitizeBaseUrl(raw?: string | null): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  let base = value.replace(/\/+$/, "");
  base = base.replace(/\/api-docs(?:\/.*)?$/i, "");
  base = base.replace(/\/api\/v1$/i, "");
  return base || null;
}

/**
 * Resolve the backend origin (no trailing slash, no /api/v1, no /api-docs).
 * Prefers BACKEND_API_URL, falls back to deriving it from BACKEND_LOGIN_URL
 * for backward compatibility with older configs.
 */
export function getBackendBaseUrl(): string | null {
  const fromApi = sanitizeBaseUrl(process.env.BACKEND_API_URL);
  if (fromApi) return fromApi;

  const login = String(process.env.BACKEND_LOGIN_URL ?? "").trim();
  if (login) {
    const derived = login
      .replace(/\/+$/, "")
      .replace(/\/api\/v1\/auth\/login$/i, "")
      .replace(/\/auth\/login$/i, "")
      .replace(/\/login$/i, "");
    return sanitizeBaseUrl(derived);
  }

  return null;
}

/**
 * Build a fully-qualified backend URL by joining the resolved base with `path`.
 * `path` may include or omit a leading slash.
 */
export function getBackendUrl(path: string): string | null {
  const base = getBackendBaseUrl();
  if (!base) return null;
  const clean = String(path).replace(/^\/+/, "");
  return `${base}/${clean}`;
}

/**
 * Resolve the backend login endpoint. Honors an explicit BACKEND_LOGIN_URL
 * override, otherwise derives it from BACKEND_API_URL.
 */
export function getBackendLoginUrl(): string | null {
  const explicit = String(process.env.BACKEND_LOGIN_URL ?? "").trim().replace(/\/+$/, "");
  if (explicit) {
    if (explicit.includes("/api/v1/auth/login")) return explicit;
    if (explicit.includes("/auth/login")) return explicit.replace(/\/auth\/login$/, "/api/v1/auth/login");
    if (explicit.endsWith("/login")) return explicit.replace(/\/login$/, "/api/v1/auth/login");
  }
  return getBackendUrl("api/v1/auth/login");
}

/**
 * Resolve the backend register endpoint. Honors an explicit BACKEND_REGISTER_URL
 * override, otherwise derives it from BACKEND_API_URL.
 */
export function getBackendRegisterUrl(): string | null {
  const explicit = String(process.env.BACKEND_REGISTER_URL ?? "").trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  return getBackendUrl("api/v1/auth/register");
}

export function getAuthEndpoint(path: string): string | null {
  const cleanPath = String(path).replace(/^\/+/, "");
  if (!cleanPath) return null;

  if (cleanPath === "me" || cleanPath === "session") {
    return getBackendUrl("api/v1/users/profile");
  }

  return getBackendUrl(`api/v1/auth/${cleanPath}`);
}

