import { NextApiRequest, NextApiResponse } from "next";
import { createToken, verifyToken, JWTPayload } from "./jwt";
import { sessionStore } from "./session";
import { setCookie, deleteCookie } from "cookies-next";

export const login = (req: NextApiRequest, res: NextApiResponse, userId: string, role: string) => {
  const token = createToken({ userId, role });
  sessionStore.createSession(userId, { role, expires: Date.now() + 1000 * 60 * 60 }); // 1h
  setCookie("token", token, { req, res, httpOnly: true, secure: process.env.NODE_ENV === "production" });
};

export const logout = (req: NextApiRequest, res: NextApiResponse, userId: string) => {
  deleteCookie("token", { req, res });
  sessionStore.deleteSession(userId);
};

export const getUserFromRequest = (req: NextApiRequest): JWTPayload | null => {
  const token = req.cookies.token as string | undefined;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const session = sessionStore.getSession(payload.userId);
  if (!session) return null;
  return { userId: session.userId, role: session.role };
};