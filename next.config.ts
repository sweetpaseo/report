import type { NextConfig } from "next";
import { execSync } from "child_process";
import fs from "fs";

let commitHash = "dev";
try {
  commitHash = execSync("git rev-parse --short HEAD", { stdio: "pipe" }).toString().trim();
} catch (e) {}
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'",
  },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
  },
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
