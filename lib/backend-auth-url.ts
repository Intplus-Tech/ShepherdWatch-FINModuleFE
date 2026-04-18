function sanitizeBaseUrl(raw?: string | null): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  let base = value.replace(/\/+$/, "");
  base = base.replace(/\/api-docs(?:\/.*)?$/i, "");
  base = base.replace(/\/api\/v1$/i, "");
  return base || null;
}

export function getAuthEndpoint(path: string): string | null {
  const cleanPath = String(path).replace(/^\/+/, "");
  if (!cleanPath) return null;

  const loginUrl = String(process.env.BACKEND_LOGIN_URL ?? "").trim();
  if (loginUrl) {
    if (loginUrl.includes("/api/v1/auth/login")) {
      return loginUrl.replace("/api/v1/auth/login", `/api/v1/auth/${cleanPath}`);
    }
    if (loginUrl.includes("/auth/login")) {
      return loginUrl.replace("/auth/login", `/auth/${cleanPath}`);
    }
    if (loginUrl.endsWith("/login")) {
      return loginUrl.replace(/\/login$/, `/${cleanPath}`);
    }
  }

  const base = sanitizeBaseUrl(process.env.BACKEND_API_URL);
  if (!base) return null;
  return `${base}/api/v1/auth/${cleanPath}`;
}

