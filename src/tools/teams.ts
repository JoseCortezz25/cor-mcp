import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Team, PaginatedResponse } from "../types.js";

export function registerTeamTools(server: McpServer): void {
  server.tool(
    "cor_list_teams",
    "Lista los equipos en COR. / List teams in COR. " +
      "Returns all teams. Useful for finding the teamId needed when creating or filtering projects.",
    {
      page: z.number().int().min(1).optional().describe("Número de página / Page number"),
      perPage: z.number().int().min(1).max(100).optional().describe("Resultados por página / Results per page"),
    },
    async ({ page, perPage }) => {
      try {
        const path = `/teams${buildQuery({ page, perPage })}`;
        const result = await corFetch<PaginatedResponse<Team>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_team",
    "Obtiene los detalles de un equipo de COR por su ID. / Get COR team details by ID. " +
      "Includes team name and associated metadata.",
    {
      id: z.number().int().describe("ID del equipo / Team ID"),
    },
    async ({ id }) => {
      try {
        const result = await corFetch<Team>(`/teams/${id}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );
}
