import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getSessionPayload } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await getSessionPayload(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ role: payload.role, userId: payload.userId, name: payload.name });
}
