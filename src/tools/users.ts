import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { User, PaginatedResponse } from "../types.js";

export function registerUserTools(server: McpServer): void {
  server.tool(
    "cor_get_my_profile",
    "Get authenticated user profile.",
    {},
    async () => {
      try {
        const result = await corFetch("/me");
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_list_users",
    "List users in COR. " +
      "Returns team members. Optionally search by name. Useful for finding userId when assigning tasks.",
    {
      search: z.string().optional().describe("Search by user name"),
      page: z.number().int().min(1).optional().describe("Page number"),
      perPage: z.number().int().min(1).max(200).optional().describe("Results per page"),
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
    "Get a COR user profile by ID.",
    {
      id: z.number().int().describe("User ID"),
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

  server.tool(
    "cor_get_working_time",
    "Get working time data.",
    {},
    async () => {
      try {
        const result = await corFetch("/working-time/users");
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
