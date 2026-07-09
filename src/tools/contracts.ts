import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildQuery, corFetch } from "../client.js";

export function registerContractTools(server: McpServer): void {
  server.tool("cor_list_contracts", "List contracts.", { page: z.number().int().min(1).optional(), perPage: z.number().int().min(1).max(200).optional() }, async ({ page, perPage }) => {
    try {
      const result = await corFetch(`/contracts${buildQuery({ page, perPage })}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });

  server.tool("cor_get_contract", "Get contract.", { contractId: z.number().int() }, async ({ contractId }) => {
    try {
      const result = await corFetch(`/contracts/${contractId}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });

  server.tool("cor_create_contract", "Create contract.", { data: z.record(z.unknown()) }, async ({ data }) => {
    try {
      const result = await corFetch("/contracts", { method: "POST", body: JSON.stringify(data) });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });

  server.tool("cor_get_contract_positions", "Get contract positions.", { contractId: z.number().int() }, async ({ contractId }) => {
    try {
      const result = await corFetch(`/contracts/${contractId}/positions`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });

  server.tool("cor_create_contract_position", "Create contract position.", { contractId: z.number().int(), data: z.record(z.unknown()) }, async ({ contractId, data }) => {
    try {
      const result = await corFetch(`/contracts/${contractId}/positions`, { method: "POST", body: JSON.stringify(data) });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) { return { isError: true, content: [{ type: "text" as const, text: String(err) }] }; }
  });
}
