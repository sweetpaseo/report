import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(token);
  if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ role });
}
