import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { User, PaginatedResponse } from "../types.js";

export function registerUserTools(server: McpServer): void {
  server.tool(
    "cor_list_users",
    "Lista los usuarios en COR. / List users in COR. " +
      "Returns team members. Optionally search by name. Useful for finding userId when assigning tasks.",
    {
      search: z.string().optional().describe("Buscar por nombre / Search by user name"),
      page: z.number().int().min(1).optional().describe("Número de página / Page number"),
      perPage: z.number().int().min(1).max(100).optional().describe("Resultados por página / Results per page"),
    },
    async ({ search, page, perPage }) => {
      try {
        let path: string;
        if (search) {
          path = `/users/search${buildQuery({ name: search, page, perPage })}`;
        } else {
          path = `/users${buildQuery({ page, perPage })}`;
        }
        const result = await corFetch<PaginatedResponse<User>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_user",
    "Obtiene el perfil de un usuario de COR por su ID. / Get a COR user profile by ID.",
    {
      id: z.number().int().describe("ID del usuario / User ID"),
    },
    async ({ id }) => {
      try {
        const result = await corFetch<User>(`/users/${id}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );
}
