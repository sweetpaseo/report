import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "whr_session";
export type SessionRole = "admin" | "client" | "staff";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET harus berisi minimal 32 karakter.");
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(role: SessionRole, extra?: { userId?: string; name?: string }) {
  return new SignJWT({ role, ...extra })
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
    return role === "admin" || role === "client" || role === "staff" ? (role as SessionRole) : null;
  } catch {
    return null;
  }
}

export async function getSessionPayload(token?: string): Promise<{ role: SessionRole; userId?: string; name?: string } | null> {
  if (!token) return null;
  try {
    const result = await jwtVerify(token, secret());
    const role = result.payload.role as SessionRole;
    if (role === "admin" || role === "client" || role === "staff") {
      return {
        role,
        userId: typeof result.payload.userId === "string" ? result.payload.userId : undefined,
        name: typeof result.payload.name === "string" ? result.payload.name : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}
