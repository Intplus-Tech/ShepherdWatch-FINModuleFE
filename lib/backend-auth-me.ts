import { API_V1 } from "@/lib/api";
import { getAuthEndpoint } from "@/lib/backend-auth-url";

const ME_REQUEST_TIMEOUT_MS = 8000;

export function getBackendMeUrls(): string[] {
  const urls: string[] = [];

  const endpointCandidates = [getAuthEndpoint("me"), getAuthEndpoint("profile")].filter(
    (value): value is string => Boolean(value)
  );

  for (const url of endpointCandidates) {
    urls.push(url);

    // Some deployments expose /users/profile while others expose /auth/*.
    if (url.includes(`${API_V1}/users/profile`)) {
      urls.push(url.replace(`${API_V1}/users/profile`, `${API_V1}/auth/me`));
      urls.push(url.replace(`${API_V1}/users/profile`, `${API_V1}/auth/profile`));
    }
  }

  const fallbackBase = process.env.BACKEND_API_URL?.trim();
  if (fallbackBase) {
    const normalized = fallbackBase.replace(/\/+$/, "").replace(/\/api-docs(?:\/.*)?$/i, "");
    if (normalized) {
      if (normalized.endsWith(`${API_V1}`)) {
        urls.push(`${normalized}/auth/me`);
        urls.push(`${normalized}/auth/profile`);
        urls.push(`${normalized}/users/profile`);
      } else {
        urls.push(`${normalized}${API_V1}/auth/me`);
        urls.push(`${normalized}${API_V1}/auth/profile`);
        urls.push(`${normalized}${API_V1}/users/profile`);
      }
    }
  }

  console.debug(`[backend-auth-me] Resolved ${urls.length} /me endpoints:`, urls);
  return Array.from(new Set(urls));
}

export async function fetchBackendMe(accessToken: string): Promise<Response | null> {
  const urls = getBackendMeUrls();
  if (urls.length === 0) return null;

  let fallbackResponse: Response | null = null;

  for (const url of urls) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ME_REQUEST_TIMEOUT_MS);

    try {
      const candidate = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
        signal: controller.signal,
      });

      console.debug(`[backend-auth-me] ${url} -> ${candidate.status}`);

      if ([404, 405].includes(candidate.status)) {
        continue;
      }

      if ([401, 403].includes(candidate.status)) {
        fallbackResponse = candidate;
        continue;
      }

      return candidate;
    } catch (err) {
      console.error(`[backend-auth-me] ${url} failed:`, err);
      continue;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return fallbackResponse;
}
