import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Client, PaginatedResponse } from "../types.js";

export function registerClientTools(server: McpServer): void {
  server.tool(
    "cor_list_clients",
    "Lista los clientes en COR. / List clients in COR. " +
      "Returns all clients with their contact info. Optionally search by name.",
    {
      search: z.string().optional().describe("Buscar por nombre / Search by client name"),
      page: z.number().int().min(1).optional().describe("Número de página / Page number"),
      perPage: z.number().int().min(1).max(100).optional().describe("Resultados por página / Results per page"),
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
    "Obtiene los detalles de un cliente de COR por su ID. / Get COR client details by ID.",
    {
      id: z.number().int().describe("ID del cliente / Client ID"),
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
}
