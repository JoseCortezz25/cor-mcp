import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch } from "../client.js";

export function registerAllocationTools(server: McpServer): void {
  server.tool("cor_get_allocations_by_project", "Get project allocations.", { projectId: z.number().int() }, async ({ projectId }) => {
    try { const result = await corFetch(`/allocation/getAllocations/${projectId}`); return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
  server.tool("cor_save_allocation", "Create/update allocation.", { data: z.record(z.unknown()) }, async ({ data }) => {
    try { const result = await corFetch("/allocation/save", { method: "POST", body: JSON.stringify(data) }); return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
  server.tool("cor_delete_allocation", "Delete allocation.", { allocationId: z.number().int() }, async ({ allocationId }) => {
    try { await corFetch(`/allocation/${allocationId}`, { method: "DELETE" }); return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, allocationId }, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
}
