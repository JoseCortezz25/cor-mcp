import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Project, PaginatedResponse } from "../types.js";

export function registerProjectTools(server: McpServer): void {
  server.tool(
    "cor_list_projects",
    "Lista los proyectos de COR con paginación. / List COR projects with pagination. " +
      "Use this to browse all projects, optionally filter by name.",
    {
      page: z.number().int().min(1).optional().describe("Número de página / Page number (default: 1)"),
      perPage: z.number().int().min(1).max(100).optional().describe("Resultados por página / Results per page (default: 20, max: 100)"),
      search: z.string().optional().describe("Filtrar por nombre / Filter by project name"),
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
    "Obtiene un proyecto de COR por su ID. / Get a COR project by its ID. " +
      "Returns full project details including status, health, client, and team.",
    {
      id: z.number().int().describe("ID del proyecto / Project ID"),
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
    "Crea un nuevo proyecto en COR. / Create a new project in COR. " +
      "Requires a project name. Optionally assign a client and team.",
    {
      name: z.string().min(1).describe("Nombre del proyecto / Project name"),
      description: z.string().optional().describe("Descripción / Description"),
      clientId: z.number().int().optional().describe("ID del cliente / Client ID"),
      teamId: z.number().int().optional().describe("ID del equipo / Team ID"),
      status: z
        .enum(["in_process", "finished", "suspended"])
        .optional()
        .describe("Estado: in_process | finished | suspended"),
      health: z
        .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
        .optional()
        .describe("Salud: 1=On track, 2=At risk, 3=Delayed, 4=Critical"),
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
    "Actualiza un proyecto existente en COR. / Update an existing COR project. " +
      "Only provide the fields you want to change.",
    {
      id: z.number().int().describe("ID del proyecto / Project ID"),
      name: z.string().min(1).optional().describe("Nuevo nombre / New name"),
      description: z.string().optional().describe("Nueva descripción / New description"),
      clientId: z.number().int().optional().describe("ID del cliente / Client ID"),
      teamId: z.number().int().optional().describe("ID del equipo / Team ID"),
      status: z
        .enum(["in_process", "finished", "suspended"])
        .optional()
        .describe("Estado: in_process | finished | suspended"),
      health: z
        .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
        .optional()
        .describe("Salud: 1=On track, 2=At risk, 3=Delayed, 4=Critical"),
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
}
