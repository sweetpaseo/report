import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "whr_session";
export type SessionRole = "admin" | "client";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET harus berisi minimal 32 karakter.");
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(role: SessionRole) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token?: string): Promise<SessionRole | null> {
  if (!token) return null;
  try {
    const result = await jwtVerify(token, secret());
    const role = result.payload.role;
    return role === "admin" || role === "client" ? (role as SessionRole) : null;
  } catch {
    return null;
  }
}
