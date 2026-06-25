/**
 * Comprehensive end-to-end test for all 17 COR MCP tools.
 *
 * Run with:  npx tsx test-all-tools.ts
 *
 * What it does:
 *  1. Direct-API filter diagnosis (pm / collaborator params)
 *  2. Spawns the MCP server once and exercises all 17 tools sequentially
 *  3. Prints a clean ✅ / ❌ report
 *  4. Cleans up test data (project, task, hours) via direct REST calls
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = path.join(__dirname, "dist", "index.js");
const BASE_URL = "https://api.projectcor.com/v1";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TestResult {
  tool: string;
  status: "✅" | "❌";
  details: string;
}

interface CleanupItem {
  label: string;
  path: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECT-API HELPERS (filter diagnosis + cleanup)
// ─────────────────────────────────────────────────────────────────────────────

let directToken = "";

async function apiLogin(email: string, password: string): Promise<string> {
  const body = new URLSearchParams({ email, password });
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const raw = (await res.json()) as { token?: { access_token: string }; access_token?: string };
  const token = raw.token?.access_token ?? raw.access_token;
  if (!token) throw new Error("No access_token in login response");
  return token;
}

async function apiGet(urlPath: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    headers: { Authorization: `Bearer ${directToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function apiDelete(urlPath: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${directToken}`, Accept: "application/json" },
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`DELETE ${res.status}: ${body.slice(0, 200)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER DIAGNOSIS
// ─────────────────────────────────────────────────────────────────────────────

async function runFilterDiagnosis(userId: number): Promise<void> {
  console.log("\n" + "═".repeat(65));
  console.log("  FILTER DIAGNOSIS — /tasks query params");
  console.log("═".repeat(65));

  const variants: Array<{ label: string; query: string }> = [
    { label: "no filter",           query: "perPage=5" },
    { label: `pm=${userId}`,        query: `pm=${userId}&perPage=5` },
    { label: `collaborator=${userId}`, query: `collaborator=${userId}&perPage=5` },
    { label: `assignee=${userId}`,  query: `assignee=${userId}&perPage=5` },
    { label: `user_id=${userId}`,   query: `user_id=${userId}&perPage=5` },
    { label: `userId=${userId}`,    query: `userId=${userId}&perPage=5` },
  ];

  for (const v of variants) {
    try {
      const data = (await apiGet(`/tasks?${v.query}`)) as {
        data?: unknown[];
        total?: number;
        meta?: { total?: number };
        items?: unknown[];
      };
      const items = data?.data ?? data?.items ?? (Array.isArray(data) ? data : []);
      const count = Array.isArray(items) ? items.length : "?";
      const total = data?.total ?? data?.meta?.total ?? "unknown";
      console.log(`  ${v.label.padEnd(28)} → ${count} results returned  (total: ${total})`);
    } catch (err) {
      console.log(`  ${v.label.padEnd(28)} → ERROR: ${String(err).slice(0, 80)}`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP CLIENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type ToolResult = Awaited<ReturnType<Client["callTool"]>>;

function extractText(result: ToolResult): string {
  return result.content
    .filter((c): c is { type: "text"; text: string } => c.type === "text" && "text" in c)
    .map((c) => c.text)
    .join("\n");
}

function parseJson(result: ToolResult): unknown {
  const text = extractText(result);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const EMAIL = "alfonsochavarro@omc.com";
  const PASSWORD = "Estaesmicuentaempre30*";
  const timestamp = Date.now();
  const today = new Date().toISOString().split("T")[0]!;

  const results: TestResult[] = [];
  const cleanup: CleanupItem[] = [];

  // ── 0. Direct login for diagnostics ────────────────────────────────────────
  console.log("═".repeat(65));
  console.log("  COR MCP — Comprehensive Tool Test Suite");
  console.log("═".repeat(65));
  console.log("\n[0/3] Direct API login for filter diagnosis...");

  try {
    directToken = await apiLogin(EMAIL, PASSWORD);
    console.log("  ✓ Direct login OK");
  } catch (err) {
    console.error("  ✗ Direct login failed:", err);
    process.exit(1);
  }

  // Resolve Alfonso's user ID from /users/me or fall back to known value
  let myUserId = 46840;
  try {
    const me = (await apiGet("/users/me")) as { id?: number; data?: { id?: number } };
    myUserId = me?.id ?? me?.data?.id ?? 46840;
    console.log(`  ✓ Logged-in user ID: ${myUserId}`);
  } catch {
    console.log(`  ⚠  Could not fetch /users/me — using known ID ${myUserId}`);
  }

  await runFilterDiagnosis(myUserId);

  // ── 1. Build the server ────────────────────────────────────────────────────
  console.log("[1/3] Building dist/...");
  try {
    execSync("npm run build", { cwd: __dirname, stdio: "pipe" });
    console.log("  ✓ Build OK\n");
  } catch (err) {
    console.error("  ✗ Build failed:", err);
    process.exit(1);
  }

  // ── 2. Spawn MCP server and run all 17 tools ───────────────────────────────
  console.log("[2/3] Running MCP tool tests...");
  console.log("─".repeat(65));

  const transport = new StdioClientTransport({
    command: "node",
    args: [SERVER_PATH],
    cwd: __dirname,
  });

  const mcpClient = new Client(
    { name: "cor-mcp-test", version: "1.0.0" },
    { capabilities: {} }
  );

  await mcpClient.connect(transport);

  // Helper: call a tool, record result, return parsed JSON
  async function callTool(
    toolName: string,
    args: Record<string, unknown>,
    label?: string,
    onSuccess?: (data: unknown) => string
  ): Promise<unknown> {
    const displayName = label ?? toolName;
    try {
      const raw = await mcpClient.callTool({ name: toolName, arguments: args });
      const isError = (raw as { isError?: boolean }).isError === true;
      const data = parseJson(raw);

      if (isError) {
        const msg = typeof data === "string" ? data : JSON.stringify(data);
        results.push({ tool: displayName, status: "❌", details: msg.slice(0, 120) });
        console.log(`  ❌ ${displayName}`);
        console.log(`     ${msg.slice(0, 100)}`);
        return null;
      }

      const detail = onSuccess ? onSuccess(data) : "OK";
      results.push({ tool: displayName, status: "✅", details: detail });
      console.log(`  ✅ ${displayName} — ${detail}`);
      return data;
    } catch (err) {
      const msg = String(err).slice(0, 120);
      results.push({ tool: displayName, status: "❌", details: msg });
      console.log(`  ❌ ${displayName}`);
      console.log(`     ${msg}`);
      return null;
    }
  }

  // IDs discovered during testing — used by later steps
  let firstProjectId: number | null = null;
  let testProjectId: number | null = null;
  let firstTaskId: number | null = null;
  let testTaskId: number | null = null;
  let loggedHoursId: number | null = null;
  let firstClientId: number | null = null;
  let firstTeamId: number | null = null;

  // ── Tool 1: cor_login ──────────────────────────────────────────────────────
  await callTool("cor_login", { email: EMAIL, password: PASSWORD }, undefined, (d) => {
    const data = d as { access_token?: string };
    const tok = data?.access_token;
    return tok ? `token …${tok.slice(-8)}` : "response OK (token not in return value)";
  });

  // ── Tool 2: cor_list_projects ──────────────────────────────────────────────
  await callTool("cor_list_projects", { perPage: 5 }, undefined, (d) => {
    const items = extractItems(d);
    firstProjectId = items[0]?.id ?? null;
    return `${items.length} projects — first id=${firstProjectId}`;
  });

  // ── Tool 3: cor_get_project ────────────────────────────────────────────────
  if (firstProjectId) {
    await callTool("cor_get_project", { id: firstProjectId }, undefined, (d) => {
      const p = unwrap(d) as { id?: number; name?: string };
      return `id=${p?.id}, name="${p?.name}"`;
    });
  } else {
    skip("cor_get_project", "no project ID from list step", results);
  }

  // ── Tool 4: cor_create_project ─────────────────────────────────────────────
  const projectName = `MCP_TEST_${timestamp}`;
  await callTool(
    "cor_create_project",
    { name: projectName, description: "Auto-created by MCP test suite" },
    undefined,
    (d) => {
      const p = unwrap(d) as { id?: number; name?: string };
      testProjectId = p?.id ?? null;
      if (testProjectId) cleanup.push({ label: `project ${testProjectId}`, path: `/projects/${testProjectId}` });
      return `id=${testProjectId}, name="${p?.name}"`;
    }
  );

  // ── Tool 5: cor_update_project ─────────────────────────────────────────────
  if (testProjectId) {
    await callTool(
      "cor_update_project",
      { id: testProjectId, description: `Updated by MCP test at ${today}` },
      undefined,
      (d) => {
        const p = unwrap(d) as { id?: number };
        return `updated id=${p?.id ?? testProjectId}`;
      }
    );
  } else {
    skip("cor_update_project", "test project creation failed", results);
  }

  // ── Tool 6: cor_list_tasks ─────────────────────────────────────────────────
  await callTool("cor_list_tasks", { perPage: 5 }, undefined, (d) => {
    const items = extractItems(d);
    firstTaskId = items[0]?.id ?? null;
    return `${items.length} tasks — first id=${firstTaskId}`;
  });

  // ── Tool 7: cor_get_task ───────────────────────────────────────────────────
  if (firstTaskId) {
    await callTool("cor_get_task", { id: firstTaskId }, undefined, (d) => {
      const t = unwrap(d) as { id?: number; name?: string; status?: string };
      return `id=${t?.id}, status="${t?.status}", name="${String(t?.name).slice(0, 30)}"`;
    });
  } else {
    skip("cor_get_task", "no task ID from list step", results);
  }

  // ── Tool 8: cor_create_task ────────────────────────────────────────────────
  if (testProjectId) {
    await callTool(
      "cor_create_task",
      {
        name: `MCP_TEST_TASK_${timestamp}`,
        projectId: testProjectId,
        description: "Auto-created by MCP test suite",
        status: "nueva",
        priority: 1,
      },
      undefined,
      (d) => {
        const t = unwrap(d) as { id?: number; name?: string };
        testTaskId = t?.id ?? null;
        if (testTaskId) cleanup.push({ label: `task ${testTaskId}`, path: `/tasks/${testTaskId}` });
        return `id=${testTaskId}, name="${t?.name}"`;
      }
    );
  } else {
    skip("cor_create_task", "test project creation failed", results);
  }

  // ── Tool 9: cor_update_task ────────────────────────────────────────────────
  if (testTaskId) {
    await callTool(
      "cor_update_task",
      { id: testTaskId, status: "en_proceso", description: `Updated at ${new Date().toISOString()}` },
      undefined,
      (d) => {
        const t = unwrap(d) as { id?: number; status?: string };
        return `updated id=${t?.id ?? testTaskId}, status="${t?.status}"`;
      }
    );
  } else {
    skip("cor_update_task", "test task creation failed", results);
  }

  // ── Tool 10: cor_list_hours ────────────────────────────────────────────────
  await callTool("cor_list_hours", { perPage: 5 }, undefined, (d) => {
    const items = extractItems(d);
    return `${items.length} hour entries`;
  });

  // ── Tool 11: cor_log_hours ─────────────────────────────────────────────────
  if (testTaskId) {
    await callTool(
      "cor_log_hours",
      { taskId: testTaskId, hours: 0.5, date: today, description: "MCP test suite entry" },
      undefined,
      (d) => {
        const h = unwrap(d) as { id?: number; hours?: number };
        loggedHoursId = h?.id ?? null;
        if (loggedHoursId) cleanup.push({ label: `hours ${loggedHoursId}`, path: `/hours/${loggedHoursId}` });
        return `id=${loggedHoursId}, hours=${h?.hours}`;
      }
    );
  } else {
    skip("cor_log_hours", "test task creation failed", results);
  }

  // ── Tool 12: cor_list_clients ──────────────────────────────────────────────
  await callTool("cor_list_clients", { perPage: 5 }, undefined, (d) => {
    const items = extractItems(d);
    firstClientId = items[0]?.id ?? null;
    return `${items.length} clients — first id=${firstClientId}`;
  });

  // ── Tool 13: cor_get_client ────────────────────────────────────────────────
  if (firstClientId) {
    await callTool("cor_get_client", { id: firstClientId }, undefined, (d) => {
      const c = unwrap(d) as { id?: number; name?: string };
      return `id=${c?.id}, name="${c?.name}"`;
    });
  } else {
    skip("cor_get_client", "no client ID from list step", results);
  }

  // ── Tool 14: cor_list_teams ────────────────────────────────────────────────
  await callTool("cor_list_teams", {}, undefined, (d) => {
    const items = extractItems(d);
    firstTeamId = items[0]?.id ?? null;
    return `${items.length} teams — first id=${firstTeamId}`;
  });

  // ── Tool 15: cor_get_team ──────────────────────────────────────────────────
  if (firstTeamId) {
    await callTool("cor_get_team", { id: firstTeamId }, undefined, (d) => {
      const t = unwrap(d) as { id?: number; name?: string };
      return `id=${t?.id}, name="${t?.name}"`;
    });
  } else {
    skip("cor_get_team", "no team ID from list step", results);
  }

  // ── Tool 16: cor_list_users ────────────────────────────────────────────────
  await callTool("cor_list_users", { perPage: 5 }, undefined, (d) => {
    const items = extractItems(d);
    return `${items.length} users returned`;
  });

  // ── Tool 17: cor_get_user ──────────────────────────────────────────────────
  await callTool("cor_get_user", { id: myUserId }, undefined, (d) => {
    const u = unwrap(d) as { id?: number; name?: string; email?: string };
    return `id=${u?.id}, name="${u?.name ?? u?.email}"`;
  });

  await mcpClient.close();

  // ── 3. Final report ────────────────────────────────────────────────────────
  console.log("\n[3/3] Report\n" + "═".repeat(65));
  const passed = results.filter((r) => r.status === "✅").length;
  const failed = results.filter((r) => r.status === "❌").length;

  for (const r of results) {
    const namePad = r.tool.padEnd(34);
    console.log(`  ${r.status} ${namePad} ${r.details}`);
  }

  console.log("─".repeat(65));
  console.log(`  Total: ${results.length}  |  Passed: ${passed}  |  Failed: ${failed}`);

  // ── 4. Cleanup ─────────────────────────────────────────────────────────────
  if (cleanup.length > 0) {
    console.log("\n" + "═".repeat(65));
    console.log("  CLEANUP — deleting test data");
    console.log("─".repeat(65));

    // Delete in reverse order: hours → task → project
    for (const item of [...cleanup].reverse()) {
      try {
        await apiDelete(item.path);
        console.log(`  ✓ Deleted ${item.label}`);
      } catch (err) {
        console.log(`  ✗ Could not delete ${item.label}: ${String(err).slice(0, 80)}`);
      }
    }
  }

  console.log("\n" + "═".repeat(65));
  console.log("  Done.");
  console.log("═".repeat(65) + "\n");

  process.exit(failed > 0 ? 1 : 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────

function extractItems(data: unknown): Array<{ id?: number }> {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  const candidates = d["data"] ?? d["items"] ?? data;
  return Array.isArray(candidates) ? (candidates as Array<{ id?: number }>) : [];
}

function unwrap(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const d = data as Record<string, unknown>;
  return d["data"] ?? data;
}

function skip(tool: string, reason: string, results: TestResult[]): void {
  results.push({ tool, status: "❌", details: `Skipped: ${reason}` });
  console.log(`  ❌ ${tool} — Skipped: ${reason}`);
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
