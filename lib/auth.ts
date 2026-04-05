import { NextApiRequest, NextApiResponse } from "next";
import { signAccessToken, verifyToken, JWTPayload } from "./jwt";
import { setCookie, deleteCookie } from "cookies-next";
import { randomUUID } from "crypto";

const SESSION_COOKIE_NAME = "token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const login = (req: NextApiRequest, res: NextApiResponse, user: JWTPayload) => {
  const token = signAccessToken(user, randomUUID());
  setCookie(SESSION_COOKIE_NAME, token, {
    req,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const logout = (req: NextApiRequest, res: NextApiResponse) => {
  deleteCookie(SESSION_COOKIE_NAME, { req, res, path: "/" });
};

export const getUserFromRequest = (req: NextApiRequest): JWTPayload | null => {
  const token = req.cookies[SESSION_COOKIE_NAME] as string | undefined;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload;
};
