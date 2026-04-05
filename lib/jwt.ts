import jwt, { JwtPayload } from "jsonwebtoken";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  AUTH_ISSUER,
  AUTH_AUDIENCE,
  JWT_SECRET,
} from "./auth-config";

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

type TokenType = "access" | "refresh";
type TokenPayload = JWTPayload & { tokenType: TokenType };

const getSecret = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return JWT_SECRET;
};

export const signAccessToken = (payload: JWTPayload, jwtId: string) => {
  const tokenPayload: TokenPayload = { ...payload, tokenType: "access" };
  return jwt.sign(tokenPayload, getSecret(), {
    expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
    issuer: AUTH_ISSUER,
    audience: AUTH_AUDIENCE,
    subject: payload.id,
    jwtid: jwtId,
  });
};

export const signRefreshToken = (payload: JWTPayload, jwtId: string) => {
  const tokenPayload: TokenPayload = { ...payload, tokenType: "refresh" };
  return jwt.sign(tokenPayload, getSecret(), {
    expiresIn: REFRESH_TOKEN_MAX_AGE_SECONDS,
    issuer: AUTH_ISSUER,
    audience: AUTH_AUDIENCE,
    subject: payload.id,
    jwtid: jwtId,
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  if (!JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    }) as JwtPayload & TokenPayload;

    if (decoded.tokenType !== "access") return null;

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

export const verifyTokenWithMeta = (
  token: string
): { payload: JWTPayload; jwtId: string | null; tokenType: TokenType | null } | null => {
  if (!JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    }) as JwtPayload & TokenPayload;

    return {
      payload: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
      jwtId: decoded.jti ?? null,
      tokenType: decoded.tokenType ?? null,
    };
  } catch {
    return null;
  }
};
