import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerHoursTools } from "./tools/hours.js";
import { registerClientTools } from "./tools/clients.js";
import { registerTeamTools } from "./tools/teams.js";
import { registerUserTools } from "./tools/users.js";
import { getTokenViaClientCredentials } from "./client.js";

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

// Auto-authenticate via client_credentials if env vars are present
const apiKey = process.env.COR_API_KEY;
const clientSecret = process.env.COR_CLIENT_SECRET;
if (apiKey && clientSecret) {
  try {
    await getTokenViaClientCredentials(apiKey, clientSecret);
    console.error("COR: Authenticated via client_credentials.");
  } catch (err) {
    console.error("COR: client_credentials auth failed:", err);
  }
}

const transport = new StdioServerTransport();
await server.connect(transport);
