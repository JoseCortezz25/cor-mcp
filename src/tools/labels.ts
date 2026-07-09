import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildQuery, corFetch } from "../client.js";

export function registerLabelTools(server: McpServer): void {
  server.tool(
    "cor_get_labels",
    "List available COR labels, optionally filtered by entity type.",
    {
      entityType: z.enum(["project", "task", "user"]).optional().describe("Entity type"),
    },
    async ({ entityType }) => {
      try {
        const result = await corFetch(`/labels${buildQuery({ entity: entityType })}`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_list_available_labels",
    "Alias for cor_get_labels.",
    {
      entityType: z.enum(["project", "task", "user"]).optional().describe("Entity type"),
    },
    async ({ entityType }) => {
      try {
        const result = await corFetch(`/labels${buildQuery({ entity: entityType })}`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
