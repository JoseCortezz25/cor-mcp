import { corLogin, corFetch } from "./src/client.js";

async function run() {
  console.log("=== COR Login Flow Test ===\n");

  // Step 1: Login
  console.log("1. Logging in...");
  const tokenResp = await corLogin("alfonsochavarro@omc.com", "Estaesmicuentaempre30*");
  console.log(`   ✓ access_token: ${tokenResp.access_token.slice(0, 20)}...`);
  console.log(`   ✓ token_type:   ${tokenResp.token_type}`);
  console.log(`   ✓ expires_in:   ${tokenResp.expires_in}s`);
  console.log(`   ✓ refresh_token present: ${!!tokenResp.refresh_token}\n`);

  // Step 2: List projects
  console.log("2. Listing projects...");
  const projects = await corFetch<{ data?: unknown[]; [k: string]: unknown }>("/projects");
  const projectList = Array.isArray(projects) ? projects : (projects.data ?? []);
  console.log(`   ✓ Got ${(projectList as unknown[]).length} projects`);
  if ((projectList as unknown[]).length > 0) {
    const first = (projectList as Record<string, unknown>[])[0];
    console.log(`   First: ${first.name ?? first.id ?? JSON.stringify(first).slice(0, 80)}`);
  }
  console.log();

  // Step 3: List clients
  console.log("3. Listing clients...");
  const clients = await corFetch<{ data?: unknown[]; [k: string]: unknown }>("/clients");
  const clientList = Array.isArray(clients) ? clients : (clients.data ?? []);
  console.log(`   ✓ Got ${(clientList as unknown[]).length} clients`);
  if ((clientList as unknown[]).length > 0) {
    const first = (clientList as Record<string, unknown>[])[0];
    console.log(`   First: ${first.name ?? first.id ?? JSON.stringify(first).slice(0, 80)}`);
  }
  console.log();

  console.log("=== All steps passed ✓ ===");
}

run().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
