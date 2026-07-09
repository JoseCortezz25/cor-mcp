import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerUrlTools(server: McpServer): void {
  server.tool(
    "cor_get_url",
    "Build a web URL for a COR resource.",
    {
      resourceType: z.enum(["task", "project"]).describe("Resource type"),
      resourceId: z.number().int().describe("Resource ID"),
    },
    async ({ resourceType, resourceId }) => {
      const baseUrl = (process.env.COR_WEB_URL ?? "https://app.projectcor.com").replace(/\/$/, "");
      const path = resourceType === "task" ? "tasks" : "projects";
      const result = { resourceType, resourceId, url: `${baseUrl}/${path}/${resourceId}` };
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
