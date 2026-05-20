import { z } from "zod";

const NEON_API_KEY = process.env.NEON_API_KEY;
const PROJECT_ID = "crimson-resonance-amtmsyq3"; // Extracted from Fortress scan

async function createBranch(branchName: string) {
  if (!NEON_API_KEY) {
    console.error("❌ NEON_API_KEY is not set in your environment.");
    process.exit(1);
  }

  console.log(`🔍 Creating Neon branch: ${branchName}...`);

  const response = await fetch(`https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${NEON_API_KEY}`
    },
    body: JSON.stringify({
      branch: {
        name: branchName,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Failed to create branch:", error);
    process.exit(1);
  }

  const data = await response.json();
  const branchId = data.branch.id;
  const connectionString = data.connection_uris[0].connection_uri;

  console.log(`✅ Branch created successfully!`);
  console.log(`🆔 Branch ID: ${branchId}`);
  console.log(`🔗 Connection String: ${connectionString}`);
  console.log(`\n> [ACTION]: Update your Cloudflare Pages DATABASE_URL with this new string.`);
}

const args = process.argv.slice(2);
const name = args[0] || `shadow-deploy-${new Date().toISOString().split('T')[0]}`;

createBranch(name);
