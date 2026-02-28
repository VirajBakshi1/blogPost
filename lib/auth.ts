import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET as string;
const COOKIE_NAME = "auth_token";

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable in .env.local"
  );
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Signs a JWT and returns the token string.
 * Expires in 7 days.
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies and decodes a JWT. Returns null if invalid/expired.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Reads the auth cookie and returns the decoded payload,
 * or null if no valid token is found.
 */
export async function getSessionFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Cookie configuration — HTTP-only, Secure in production, SameSite=strict.
 */
export function getAuthCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  };
}
