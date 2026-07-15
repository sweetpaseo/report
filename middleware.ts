import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PUBLIC_EXACT = new Set(["/login", "/api/auth/login", "/manifest.webmanifest"]);
const PUBLIC_PREFIXES = ["/report/", "/api/public/", "/report-data/"];
const CLIENT_BLOCKED = new Set(["/api/upload", "/api/websites"]);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PUBLIC_EXACT.has(path) || PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  const role = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!role) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Client role may view and export reports, but cannot import or manage websites.
  if (role === "client" && request.method !== "GET" && CLIENT_BLOCKED.has(path)) {
    return NextResponse.json({ error: "Akses ditolak. Peran client hanya dapat melihat laporan." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
