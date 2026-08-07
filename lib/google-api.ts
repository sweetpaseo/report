import { importPKCS8, SignJWT } from "jose";
import { getDb } from "./db";

export interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
}

export interface WebsiteGoogleConfig {
  gsc_site_url?: string;
  ga_property_id?: string;
}

/**
 * Get stored Service Account credentials.
 * Order of lookup:
 * 1. `system_settings` table (key: `google_service_account_json`)
 * 2. Environment variable `GOOGLE_SERVICE_ACCOUNT_JSON`
 */
export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  try {
    const db = getDb();
    const row = db.prepare("SELECT value FROM system_settings WHERE key = ?").get("google_service_account_json") as { value: string } | undefined;
    if (row && row.value) {
      return JSON.parse(row.value) as ServiceAccountCredentials;
    }
  } catch (e) {
    // Ignore error
  }

  const envJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (envJson) {
    try {
      return JSON.parse(envJson) as ServiceAccountCredentials;
    } catch (e) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON from env:", e);
    }
  }

  return null;
}

/**
 * Save Service Account credentials into system_settings.
 */
export function saveServiceAccountCredentials(creds: ServiceAccountCredentials): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO system_settings (key, value, updated_at)
    VALUES ('google_service_account_json', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(JSON.stringify(creds), now);
}

/**
 * Obtain Google OAuth2 Access Token using RS256 JWT Signed Assertion (Google Service Account).
 */
export async function getAccessToken(creds: ServiceAccountCredentials, scopes: string[]): Promise<string> {
  const privateKeyPem = creds.private_key;
  if (!privateKeyPem || !creds.client_email) {
    throw new Error("Invalid Service Account credentials: missing client_email or private_key");
  }

  const privateKey = await importPKCS8(privateKeyPem, "RS256");
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour token

  const jwt = await new SignJWT({
    scope: scopes.join(" "),
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(creds.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Auth failed (${res.status}): ${errorText}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// Scope constant for GSC and GA4
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

// Interface for GSC Search Analytics API Response
export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscResponse {
  rows?: GscRow[];
  responseAggregationType?: string;
}

/**
 * Fetch Search Analytics from Google Search Console API.
 */
export async function fetchGscData(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[] = ["date"],
  searchType: string = "web"
): Promise<GscResponse> {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      type: searchType,
      rowLimit: 5000,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GSC API Query failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as GscResponse;
}

// Interface for GA4 Data API Response
export interface Ga4DimensionHeader {
  name: string;
}
export interface Ga4MetricHeader {
  name: string;
  type: string;
}
export interface Ga4Row {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}
export interface Ga4RunReportResponse {
  dimensionHeaders?: Ga4DimensionHeader[];
  metricHeaders?: Ga4MetricHeader[];
  rows?: Ga4Row[];
  rowCount?: number;
}

/**
 * Run Report on GA4 Data API.
 */
export async function fetchGa4Data(
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  metrics: string[]
): Promise<Ga4RunReportResponse> {
  // Clean property ID format: 'properties/123456' -> '123456'
  const cleanId = propertyId.replace(/^properties\//, "");
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: dimensions.map((d) => ({ name: d })),
      metrics: metrics.map((m) => ({ name: m })),
      limit: 10000,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GA4 API Report failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as Ga4RunReportResponse;
}
