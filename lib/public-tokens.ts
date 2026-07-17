import { getDb } from "@/lib/db";

export type TokenStatus = { valid: boolean; id?: string; name?: string };

// Validate a website public_token, rejecting expired or revoked links.
export function resolveWebsiteToken(token: string): TokenStatus {
  const row = getDb()
    .prepare("SELECT id, name, public_token_expires_at, public_token_revoked FROM websites WHERE public_token = ?")
    .get(token) as
    | { id: string; name: string; public_token_expires_at: string | null; public_token_revoked: number }
    | undefined;
  if (!row || row.public_token_revoked === 1) return { valid: false };
  if (row.public_token_expires_at && new Date(row.public_token_expires_at).getTime() < Date.now()) {
    return { valid: false };
  }
  return { valid: true, id: row.id, name: row.name };
}

// Validate a client public_token, rejecting expired or revoked links.
export function resolveClientToken(token: string): TokenStatus {
  const row = getDb()
    .prepare("SELECT id, name, public_token_expires_at, public_token_revoked FROM clients WHERE public_token = ?")
    .get(token) as
    | { id: string; name: string; public_token_expires_at: string | null; public_token_revoked: number }
    | undefined;
  if (!row || row.public_token_revoked === 1) return { valid: false };
  if (row.public_token_expires_at && new Date(row.public_token_expires_at).getTime() < Date.now()) {
    return { valid: false };
  }
  return { valid: true, id: row.id, name: row.name };
}
