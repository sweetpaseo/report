import { getTebarMe, getTebarProfiles, getTebarAccounts, createTebarConnectLink } from "../lib/tebar";

async function main() {
  console.log("Testing Tebar API integration...");

  try {
    const me = await getTebarMe();
    console.log("✓ Connected as:", me.user.name, `(${me.user.email})`);

    const profiles = await getTebarProfiles();
    console.log("✓ Profiles found:", profiles.data.length);
    for (const p of profiles.data) {
      console.log(`  - ${p.name} (ID: ${p.id}, Default: ${p.is_default})`);
    }

    const accounts = await getTebarAccounts();
    console.log("✓ Connected accounts:", accounts.data.length);

    const link = await createTebarConnectLink();
    console.log("✓ Successfully generated client connect link:");
    console.log(`  URL: ${link.url}`);
    console.log(`  Expires at: ${link.expires_at}`);

    console.log("\nAll Tebar API tests PASSED successfully!");
  } catch (error) {
    console.error("✗ Tebar API Test failed:", error);
    process.exit(1);
  }
}

main();
