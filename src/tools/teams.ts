import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Team, PaginatedResponse } from "../types.js";

export function registerTeamTools(server: McpServer): void {
  server.tool(
    "cor_list_teams",
    "List teams in COR. " +
      "Returns all teams. Useful for finding the teamId needed when creating or filtering projects.",
    {
      page: z.number().int().min(1).optional().describe("Page number"),
      perPage: z.number().int().min(1).max(200).optional().describe("Results per page"),
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
    "Get COR team details by ID. " +
      "Includes team name and associated metadata.",
    {
      id: z.number().int().describe("Team ID"),
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

  server.tool(
    "cor_create_team",
    "Create a COR team.",
    { data: z.record(z.unknown()) },
    async ({ data }) => {
      try {
        const result = await corFetch<Team>("/teams", { method: "POST", body: JSON.stringify(data) });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_add_team_users",
    "Add users to a team.",
    { teamId: z.number().int(), userIds: z.array(z.number().int()) },
    async ({ teamId, userIds }) => {
      try {
        const result = await corFetch(`/teams/${teamId}/users`, { method: "POST", body: JSON.stringify({ userIds }) });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_remove_team_users",
    "Remove users from a team.",
    { teamId: z.number().int(), userIds: z.array(z.number().int()) },
    async ({ teamId, userIds }) => {
      try {
        const result = await corFetch(`/teams/${teamId}/users`, { method: "DELETE", body: JSON.stringify({ userIds }) });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
