const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const { importPKCS8, SignJWT } = require('jose');

const dbPath = path.join(__dirname, '..', 'data', 'website-health.db');
const db = new DatabaseSync(dbPath);

const credsRow = db.prepare("SELECT value FROM system_settings WHERE key = 'google_service_account_json'").get();
if (!credsRow) {
  console.error("ERROR: No Service Account credentials found in system_settings!");
  process.exit(1);
}

const creds = JSON.parse(credsRow.value);
console.log("Service Account Email:", creds.client_email);
console.log("Project ID:", creds.project_id);

async function runDiagnosis() {
  const privateKey = await importPKCS8(creds.private_key, 'RS256');
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly'
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(creds.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(privateKey);

  console.log("\n1. Requesting Google OAuth2 Access Token...");
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("Token error:", tokenData);
    return;
  }
  console.log("--> Token acquired successfully!");

  const websites = db.prepare("SELECT id, name, domain, gsc_site_url, ga_property_id FROM websites").all();
  for (const site of websites) {
    console.log(`\n========================================`);
    console.log(`Diagnosing: ${site.name} (${site.domain})`);
    console.log(`GSC Site URL: ${site.gsc_site_url}`);
    console.log(`GA4 Property ID: ${site.ga_property_id}`);
    console.log(`========================================`);

    // GSC Check
    if (site.gsc_site_url) {
      console.log(`\n[GSC] Testing query for: ${site.gsc_site_url} ...`);
      const gscUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.gsc_site_url)}/searchAnalytics/query`;
      const gscRes = await fetch(gscUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: '2026-08-01',
          endDate: '2026-08-28',
          dimensions: ['date']
        })
      });
      const gscBody = await gscRes.text();
      console.log(`[GSC] Response Status: ${gscRes.status} ${gscRes.statusText}`);
      console.log(`[GSC] Response Body: ${gscBody.slice(0, 300)}`);
    }

    // GA4 Check
    if (site.ga_property_id) {
      console.log(`\n[GA4] Testing query for property: ${site.ga_property_id} ...`);
      const gaUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${site.ga_property_id}:runReport`;
      const gaRes = await fetch(gaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '2026-08-01', endDate: '2026-08-28' }],
          metrics: [{ name: 'activeUsers' }]
        })
      });
      const gaBody = await gaRes.text();
      console.log(`[GA4] Response Status: ${gaRes.status} ${gaRes.statusText}`);
      console.log(`[GA4] Response Body: ${gaBody.slice(0, 300)}`);
    }
  }
}

runDiagnosis().catch(console.error);
