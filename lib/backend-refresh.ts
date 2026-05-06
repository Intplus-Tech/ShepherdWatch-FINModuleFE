import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ACCESS_TOKEN_MAX_AGE_SECONDS, BACKEND_REFRESH_TOKEN_COOKIE, BACKEND_TOKEN_COOKIE, REFRESH_TOKEN_MAX_AGE_SECONDS } from './auth-config';
import { getAuthEndpoint } from './backend-auth-url';

export type TokenPair = {
  accessToken: string;
  refreshToken?: string;
};

function pickToken(source: unknown, keys: string[]): string {
  if (!source || typeof source !== 'object') return '';
  const sourceRecord = source as Record<string, unknown>;
  for (const key of keys) {
    const value = sourceRecord[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return '';
}

async function getNextAuthTokenPair(req: NextRequest): Promise<TokenPair | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = await getToken({
    req,
    ...(secret ? { secret } : {}),
  }).catch(() => null);

  const accessToken = pickToken(token, ['accessToken', 'access_token', 'token']);
  if (!accessToken) return null;

  const refreshToken = pickToken(token, ['refreshToken', 'refresh_token']);
  return {
    accessToken,
    ...(refreshToken ? { refreshToken } : {}),
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const refreshUrl = getAuthEndpoint('refresh-token');
  if (!refreshUrl) return null;

  const refreshRes = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!refreshRes.ok) return null;

  const payload = await refreshRes.json().catch(() => null);
  const payloadRecord = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const data = payloadRecord?.data && typeof payloadRecord.data === 'object' ? (payloadRecord.data as Record<string, unknown>) : null;
  const tokens = data?.tokens && typeof data.tokens === 'object' ? (data.tokens as Record<string, unknown>) : null;

  const accessToken = pickToken(tokens, ['accessToken', 'access_token', 'token']) ||
    pickToken(data, ['accessToken', 'access_token', 'token']) ||
    pickToken(payloadRecord, ['accessToken', 'access_token', 'token']);

  if (!accessToken) return null;

  const nextRefreshToken = pickToken(tokens, ['refreshToken', 'refresh_token']) ||
    pickToken(data, ['refreshToken', 'refresh_token']) ||
    pickToken(payloadRecord, ['refreshToken', 'refresh_token']);

  return {
    accessToken,
    ...(nextRefreshToken ? { refreshToken: nextRefreshToken } : {}),
  };
}

export function applyAuthCookies(response: NextResponse, tokens: TokenPair | null) {
  if (!tokens) return;

  response.cookies.set({
    name: BACKEND_TOKEN_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  if (tokens.refreshToken) {
    response.cookies.set({
      name: BACKEND_REFRESH_TOKEN_COOKIE,
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  }
}

export async function executeWithRefreshRetry(
  req: NextRequest,
  executeRequest: (token: string) => Promise<Response>
): Promise<{ res: Response; refreshedTokens: TokenPair | null }> {
  let token = req.cookies.get(BACKEND_TOKEN_COOKIE)?.value ?? '';
  let refreshToken = req.cookies.get(BACKEND_REFRESH_TOKEN_COOKIE)?.value ?? '';
  let refreshedTokens: TokenPair | null = null;

  if (!token || !refreshToken) {
    const nextAuthTokens = await getNextAuthTokenPair(req);
    if (!token) {
      token = nextAuthTokens?.accessToken ?? '';
    }
    if (!refreshToken) {
      refreshToken = nextAuthTokens?.refreshToken ?? '';
    }
    if (nextAuthTokens?.accessToken) {
      refreshedTokens = nextAuthTokens;
    }
  }

  if (!token) {
    if (refreshToken) {
      refreshedTokens = await refreshAccessToken(refreshToken);
      token = refreshedTokens?.accessToken ?? '';
    }
  }

  if (!token) {
    return {
      res: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
      refreshedTokens,
    };
  }

  let res = await executeRequest(token);
  if (![401, 403].includes(res.status)) {
    return { res, refreshedTokens };
  }

  if (!refreshToken) {
    return { res, refreshedTokens };
  }

  const retriedTokens = await refreshAccessToken(refreshToken);
  if (!retriedTokens?.accessToken) {
    return { res, refreshedTokens };
  }

  refreshedTokens = retriedTokens;
  res = await executeRequest(retriedTokens.accessToken);

  return { res, refreshedTokens };
}
