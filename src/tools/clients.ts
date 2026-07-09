import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Client, PaginatedResponse } from "../types.js";

export function registerClientTools(server: McpServer): void {
  server.tool(
    "cor_list_clients",
    "List clients in COR. " +
      "Returns all clients with their contact info. Optionally search by name.",
    {
      search: z.string().optional().describe("Search by client name"),
      page: z.number().int().min(1).optional().describe("Page number"),
      perPage: z.number().int().min(1).max(200).optional().describe("Results per page"),
    },
    async ({ search, page, perPage }) => {
      try {
        let path: string;
        if (search) {
          path = `/clients/search${buildQuery({ name: search, page, perPage })}`;
        } else {
          path = `/clients${buildQuery({ page, perPage })}`;
        }
        const result = await corFetch<PaginatedResponse<Client>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_client",
    "Get COR client details by ID.",
    {
      id: z.number().int().describe("Client ID"),
    },
    async ({ id }) => {
      try {
        const result = await corFetch<Client>(`/clients/${id}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_create_client",
    "Create a COR client.",
    { data: z.record(z.unknown()).describe("Client data") },
    async ({ data }) => {
      try {
        const result = await corFetch<Client>("/clients", { method: "POST", body: JSON.stringify(data) });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_update_client",
    "Update a COR client.",
    { id: z.number().int(), data: z.record(z.unknown()) },
    async ({ id, data }) => {
      try {
        const result = await corFetch<Client>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_delete_client",
    "Delete a COR client.",
    { id: z.number().int() },
    async ({ id }) => {
      try {
        await corFetch(`/clients/${id}`, { method: "DELETE" });
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, id }, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_client_fees",
    "Get client fees.",
    { clientId: z.number().int() },
    async ({ clientId }) => {
      try {
        const result = await corFetch(`/clients/${clientId}/fees`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
