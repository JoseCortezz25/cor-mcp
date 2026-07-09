import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Project, PaginatedResponse } from "../types.js";

export function registerProjectTools(server: McpServer): void {
  server.tool(
    "cor_list_projects",
    "List COR projects with pagination. " +
      "Use this to browse all projects, optionally filter by name.",
    {
      page: z.number().int().min(1).optional().describe("Page number (default: 1)"),
      perPage: z.number().int().min(1).max(200).optional().describe("Results per page (default: 20, max: 200)"),
      search: z.string().optional().describe("Filter by project name"),
    },
    async ({ page, perPage, search }) => {
      try {
        let path: string;
        if (search) {
          path = `/projects/search${buildQuery({ name: search, page, perPage })}`;
        } else {
          path = `/projects${buildQuery({ page, perPage })}`;
        }
        const result = await corFetch<PaginatedResponse<Project>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_project",
    "Get a COR project by its ID. " +
      "Returns full project details including status, health, client, and team.",
    {
      id: z.number().int().describe("Project ID"),
    },
    async ({ id }) => {
      try {
        const result = await corFetch<Project>(`/projects/${id}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_create_project",
    "Create a new project in COR. " +
      "Requires a project name. Optionally assign a client and team.",
    {
      name: z.string().min(1).describe("Project name"),
      description: z.string().optional().describe("Description"),
      clientId: z.number().int().optional().describe("Client ID"),
      teamId: z.number().int().optional().describe("Team ID"),
      status: z
        .enum(["in_process", "finished", "suspended"])
        .optional()
        .describe("Status: in_process | finished | suspended"),
      health: z
        .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
        .optional()
        .describe("Health: 1=On track, 2=At risk, 3=Delayed, 4=Critical"),
    },
    async (input) => {
      try {
        const result = await corFetch<Project>("/projects", {
          method: "POST",
          body: JSON.stringify(input),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_update_project",
    "Update an existing COR project. " +
      "Only provide the fields you want to change.",
    {
      id: z.number().int().describe("Project ID"),
      name: z.string().min(1).optional().describe("New name"),
      description: z.string().optional().describe("New description"),
      clientId: z.number().int().optional().describe("Client ID"),
      teamId: z.number().int().optional().describe("Team ID"),
      status: z
        .enum(["in_process", "finished", "suspended"])
        .optional()
        .describe("Status: in_process | finished | suspended"),
      health: z
        .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
        .optional()
        .describe("Health: 1=On track, 2=At risk, 3=Delayed, 4=Critical"),
    },
    async ({ id, ...fields }) => {
      try {
        const result = await corFetch<Project>(`/projects/${id}`, {
          method: "PUT",
          body: JSON.stringify(fields),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_delete_project",
    "Delete a project by ID.",
    { id: z.number().int().describe("Project ID") },
    async ({ id }) => {
      try {
        await corFetch(`/projects/${id}`, { method: "DELETE" });
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, id }, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_project_collaborators",
    "List project collaborators.",
    { projectId: z.number().int().describe("Project ID") },
    async ({ projectId }) => {
      try {
        const result = await corFetch(`/projects/${projectId}/collaborators`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_add_project_collaborator",
    "Add a collaborator to a project.",
    {
      projectId: z.number().int().describe("Project ID"),
      userId: z.number().int().describe("User ID"),
    },
    async ({ projectId, userId }) => {
      try {
        const result = await corFetch(`/projects/${projectId}/collaborators`, {
          method: "POST",
          body: JSON.stringify({ userId }),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_remove_project_collaborator",
    "Remove a collaborator from a project.",
    {
      projectId: z.number().int().describe("Project ID"),
      userId: z.number().int().describe("User ID"),
    },
    async ({ projectId, userId }) => {
      try {
        await corFetch(`/projects/${projectId}/collaborators/${userId}`, { method: "DELETE" });
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, projectId, userId }, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool("cor_get_project_costs", "Get project costs/estimates.", { projectId: z.number().int() }, async ({ projectId }) => {
    try {
      const result = await corFetch(`/projects/${projectId}/costs`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
    }
  });

  server.tool("cor_add_project_cost", "Add project cost.", { projectId: z.number().int(), data: z.record(z.unknown()) }, async ({ projectId, data }) => {
    try {
      const result = await corFetch(`/projects/${projectId}/costs`, { method: "POST", body: JSON.stringify(data) });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
    }
  });

  server.tool("cor_get_project_labels", "Get project labels.", { projectId: z.number().int() }, async ({ projectId }) => {
    try {
      const result = await corFetch(`/projects/${projectId}/labels`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
    }
  });

  server.tool("cor_get_project_ratecard", "Get project ratecard.", { projectId: z.number().int() }, async ({ projectId }) => {
    try {
      const result = await corFetch(`/projects/${projectId}/ratecard`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
    }
  });

  server.tool("cor_get_project_templates", "List project templates.", { page: z.number().int().min(1).optional(), perPage: z.number().int().min(1).max(200).optional() }, async ({ page, perPage }) => {
    try {
      const result = await corFetch(`/projects/templates${buildQuery({ page, perPage })}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
    }
  });

  server.tool("cor_get_project_profitability", "Get project profitability.", { projectId: z.number().int() }, async ({ projectId }) => {
    try {
      const result = await corFetch(`/projects/${projectId}/profitability`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
    }
  });
}
