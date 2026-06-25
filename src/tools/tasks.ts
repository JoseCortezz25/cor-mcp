import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Task, PaginatedResponse } from "../types.js";

const taskStatusEnum = z
  .enum(["nueva", "en_proceso", "estancada", "finalizada"])
  .describe("Estado: nueva | en_proceso | estancada | finalizada");

const taskPriorityEnum = z
  .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
  .describe("Prioridad: 0=Low, 1=Medium, 2=High, 3=Urgent");

export function registerTaskTools(server: McpServer): void {
  server.tool(
    "cor_list_tasks",
    "Lista las tareas en COR con paginación opcional. / List tasks in COR with optional pagination. " +
      "Can filter by project ID to see tasks within a specific project.",
    {
      page: z.number().int().min(1).optional().describe("Número de página / Page number (default: 1)"),
      perPage: z.number().int().min(1).max(100).optional().describe("Resultados por página / Results per page"),
      projectId: z.number().int().optional().describe("Filtrar por proyecto / Filter by project ID"),
    },
    async ({ page, perPage, projectId }) => {
      try {
        const path = `/tasks${buildQuery({ page, perPage, projectId })}`;
        const result = await corFetch<PaginatedResponse<Task>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_task",
    "Obtiene el detalle completo de una tarea de COR por su ID. / Get full details of a COR task by ID. " +
      "Includes status, priority, assignees, hours, and more.",
    {
      id: z.number().int().describe("ID de la tarea / Task ID"),
    },
    async ({ id }) => {
      try {
        const result = await corFetch<Task>(`/tasks/${id}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_create_task",
    "Crea una nueva tarea en COR dentro de un proyecto. / Create a new task in COR within a project. " +
      "Requires a name and projectId. Optionally set status, priority, assignee, and due date.",
    {
      name: z.string().min(1).describe("Nombre de la tarea / Task name"),
      projectId: z.number().int().describe("ID del proyecto al que pertenece / Project ID"),
      description: z.string().optional().describe("Descripción de la tarea / Task description"),
      status: taskStatusEnum.optional(),
      priority: taskPriorityEnum.optional(),
      assigneeId: z.number().int().optional().describe("ID del usuario asignado / Assignee user ID"),
      dueDate: z.string().optional().describe("Fecha límite (YYYY-MM-DD) / Due date"),
      estimatedHours: z.number().optional().describe("Horas estimadas / Estimated hours"),
    },
    async (input) => {
      try {
        const result = await corFetch<Task>("/tasks", {
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
    "cor_update_task",
    "Actualiza una tarea existente en COR. / Update an existing COR task. " +
      "Only provide the fields you want to change. Useful for changing status, priority, assignee, etc.",
    {
      id: z.number().int().describe("ID de la tarea / Task ID"),
      name: z.string().min(1).optional().describe("Nuevo nombre / New name"),
      description: z.string().optional().describe("Nueva descripción / New description"),
      status: taskStatusEnum.optional(),
      priority: taskPriorityEnum.optional(),
      assigneeId: z.number().int().optional().describe("ID del usuario asignado / Assignee user ID"),
      dueDate: z.string().optional().describe("Fecha límite (YYYY-MM-DD) / Due date"),
      estimatedHours: z.number().optional().describe("Horas estimadas / Estimated hours"),
    },
    async ({ id, ...fields }) => {
      try {
        const result = await corFetch<Task>(`/tasks/${id}`, {
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
