import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildQuery, corFetch } from "../client.js";

export function registerProductTools(server: McpServer): void {
  server.tool("cor_list_products", "List products.", { page: z.number().int().min(1).optional(), perPage: z.number().int().min(1).max(200).optional() }, async ({ page, perPage }) => {
    try { const result = await corFetch(`/products${buildQuery({ page, perPage })}`); return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
  server.tool("cor_create_product", "Create product.", { data: z.record(z.unknown()) }, async ({ data }) => {
    try { const result = await corFetch("/products", { method: "POST", body: JSON.stringify(data) }); return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }; }
    catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
}
