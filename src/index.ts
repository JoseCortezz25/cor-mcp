import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerHoursTools } from "./tools/hours.js";
import { registerClientTools } from "./tools/clients.js";
import { registerTeamTools } from "./tools/teams.js";
import { registerUserTools } from "./tools/users.js";

const server = new McpServer({
  name: "cor-mcp",
  version: "1.0.0",
});

registerProjectTools(server);
registerTaskTools(server);
registerHoursTools(server);
registerClientTools(server);
registerTeamTools(server);
registerUserTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
