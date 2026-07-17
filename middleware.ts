import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PUBLIC_EXACT = new Set(["/login", "/api/auth/login", "/manifest.webmanifest"]);
const PUBLIC_PREFIXES = ["/report/", "/api/public/", "/report-data/"];
const CLIENT_BLOCKED = new Set(["/api/upload", "/api/websites"]);
const ADMIN_MUTATIONS = new Set([
  "/api/upload",
  "/api/websites",
  "/api/clients",
  "/api/periods",
]);

// Double-submit style CSRF: require a custom header on admin mutations. Browsers
// cannot set arbitrary headers on cross-site requests without a preflight, which
// our API does not allow, so this blocks cross-site forged mutations.
function failsCsrfCheck(request: NextRequest): boolean {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return false;
  }
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return true;
  return !request.headers.get("x-requested-with");
}

// Next.js injects a default `Content-Security-Policy: upgrade-insecure-requests`
// at the framework layer, which overrides config headers. Setting our CSP here
// (after that default is attached) and deleting first guarantees it wins.
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'";

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.delete("content-security-policy");
  response.headers.set("content-security-policy", CSP);
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PUBLIC_EXACT.has(path) || PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return withSecurityHeaders(NextResponse.next());
  }

  const role = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!role) {
    if (path.startsWith("/api/")) {
      return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Client role may view and export reports, but cannot import or manage websites.
  if (role === "client" && request.method !== "GET" && CLIENT_BLOCKED.has(path)) {
    return withSecurityHeaders(
      NextResponse.json({ error: "Akses ditolak. Peran client hanya dapat melihat laporan." }, { status: 403 })
    );
  }

  // Admin state-changing requests require a same-origin origin and the
  // x-requested-with header to mitigate cross-site request forgery.
  if (role === "admin" && ADMIN_MUTATIONS.has(path) && failsCsrfCheck(request)) {
    return withSecurityHeaders(NextResponse.json({ error: "Permintaan ditolak (CSRF)." }, { status: 403 }));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
