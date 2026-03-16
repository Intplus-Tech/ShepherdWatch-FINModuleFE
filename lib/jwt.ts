import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret";

export const createToken = (payload: JWTPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};
