import { getDb } from "../lib/db";
import { syncGoogleDataForWebsite } from "../lib/sync-google-data";

async function run() {
  const db = getDb();
  const websites = db.prepare("SELECT id, name, domain, gsc_site_url, ga_property_id FROM websites").all() as any[];
  console.log(`Found ${websites.length} website(s) in DB.`);

  const now = new Date();
  const months: Array<{ start: string; end: string; label: string }> = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-01`;

    const isCurrentMonth = i === 0;
    let endDate: string;
    if (isCurrentMonth) {
      endDate = now.toISOString().slice(0, 10);
    } else {
      const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
      endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    }

    months.push({ start: startDate, end: endDate, label: `${year}-${month}` });
  }

  console.log(`Periods to sync: ${months.map((m) => m.label).join(", ")}`);

  for (const site of websites) {
    console.log(`\n========================================`);
    console.log(`Syncing website: ${site.name} (${site.domain})`);
    console.log(`GSC Site URL: ${site.gsc_site_url || "Not set"}`);
    console.log(`GA4 Property ID: ${site.ga_property_id || "Not set"}`);
    console.log(`========================================`);

    if (!site.gsc_site_url && !site.ga_property_id) {
      console.log(`Skipping ${site.name}: No Google API credentials configured.`);
      continue;
    }

    for (const m of months) {
      console.log(`--> Syncing period ${m.label} (${m.start} to ${m.end})...`);
      try {
        const res = await syncGoogleDataForWebsite({
          websiteId: site.id,
          startDate: m.start,
          endDate: m.end,
        });
        if (res.success) {
          console.log(`    ✅ Success (GSC: ${res.gscSynced ? "Yes" : "No"}, GA4: ${res.gaSynced ? "Yes" : "No"})`);
        } else {
          console.log(`    ⚠️ Warning/Error: ${res.error}`);
        }
      } catch (err: any) {
        console.error(`    ❌ Error syncing ${m.label}:`, err.message);
      }
    }
  }

  console.log("\nSync process completed!");
}

run().catch(console.error);
