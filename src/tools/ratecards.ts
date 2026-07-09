import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildQuery, corFetch } from "../client.js";

export function registerRatecardTools(server: McpServer): void {
  server.tool("cor_list_ratecards", "List ratecards.", { page: z.number().int().min(1).optional(), perPage: z.number().int().min(1).max(200).optional() }, async ({ page, perPage }) => {
    try { const result = await corFetch(`/ratecards${buildQuery({ page, perPage })}`); return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
  server.tool("cor_get_ratecard", "Get ratecard.", { ratecardId: z.number().int() }, async ({ ratecardId }) => {
    try { const result = await corFetch(`/ratecards/${ratecardId}`); return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
  server.tool("cor_create_ratecard", "Create ratecard.", { data: z.record(z.unknown()) }, async ({ data }) => {
    try { const result = await corFetch("/ratecards", { method: "POST", body: JSON.stringify(data) }); return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
}
