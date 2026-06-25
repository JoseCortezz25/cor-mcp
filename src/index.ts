import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerHoursTools } from "./tools/hours.js";
import { registerClientTools } from "./tools/clients.js";
import { registerTeamTools } from "./tools/teams.js";
import { registerUserTools } from "./tools/users.js";
import { getTokenViaClientCredentials, corLogin } from "./client.js";

const server = new McpServer({
  name: "cor-mcp",
  version: "1.0.0",
});

registerAuthTools(server);
registerProjectTools(server);
registerTaskTools(server);
registerHoursTools(server);
registerClientTools(server);
registerTeamTools(server);
registerUserTools(server);

// Auto-authenticate if env vars are present (priority: client_credentials > email/password)
const apiKey = process.env.COR_API_KEY;
const clientSecret = process.env.COR_CLIENT_SECRET;
const email = process.env.COR_EMAIL;
const password = process.env.COR_PASSWORD;

async function autoAuth(): Promise<void> {
  if (apiKey && clientSecret) {
    await getTokenViaClientCredentials(apiKey, clientSecret);
    console.error("COR: Authenticated via client_credentials.");
  } else if (email && password) {
    await corLogin(email, password);
    console.error("COR: Authenticated via email/password.");
  }
}

try {
  await autoAuth();
} catch (err) {
  console.error("COR: Auto-auth skipped or failed:", err instanceof Error ? err.message : err);
}

const transport = new StdioServerTransport();
await server.connect(transport);
