import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Task, PaginatedResponse } from "../types.js";

const taskStatusEnum = z
  .enum(["nueva", "en_proceso", "estancada", "finalizada"])
  .describe("Status: nueva | en_proceso | estancada | finalizada");

const taskPriorityEnum = z
  .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
  .describe("Priority: 0=Low, 1=Medium, 2=High, 3=Urgent");

export function registerTaskTools(server: McpServer): void {
  server.tool(
    "cor_list_tasks",
    "List tasks in COR with optional pagination. " +
      "Can filter by project ID to see tasks within a specific project.",
    {
      page: z.number().int().min(1).optional().describe("Page number (default: 1)"),
      perPage: z.number().int().min(1).max(200).optional().describe("Results per page"),
      projectId: z.number().int().optional().describe("Filter by project ID"),
      assigneeId: z.number().int().optional().describe("Filter by assignee user ID"),
    },
    async ({ page, perPage, projectId, assigneeId }) => {
      try {
        const path = `/tasks${buildQuery({ page, perPage, projectId, assigneeId })}`;
        const result = await corFetch<PaginatedResponse<Task>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_search_tasks",
    "Search tasks with COR-supported filters.",
    {
      filters: z.record(z.unknown()).optional().describe("COR API filters"),
    },
    async ({ filters }) => {
      try {
        const result = await corFetch<PaginatedResponse<Task>>(`/tasks${buildQuery(filters ?? {})}`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_my_pending_tasks",
    "Get my pending tasks.",
    {},
    async () => {
      try {
        const result = await corFetch<PaginatedResponse<Task>>("/tasks?mine=true");
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_search_user_tasks",
    "Search tasks assigned to a specific user. " +
      "More efficient than loading all tasks. Uses COR's /tasks/search endpoint.",
    {
      userId: z.number().int().describe("User ID"),
      status: z.string().optional().describe("Filtrar por estado"),
      perPage: z.number().int().min(1).max(100).optional().describe("Results per page"),
      page: z.number().int().min(1).optional().describe("Page number"),
    },
    async ({ userId, status, perPage, page }) => {
      try {
        const path = `/tasks/search${buildQuery({ userId, status, perPage, page })}`;
        const result = await corFetch<PaginatedResponse<Task>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err: unknown) {
        return { isError: true, content: [{ type: "text", text: String(err instanceof Error ? err.message : err) }] };
      }
    }
  );

  server.tool(
    "cor_get_task",
    "Get full details of a COR task by ID. " +
      "Includes status, priority, assignees, hours, and more.",
    {
      id: z.number().int().describe("Task ID"),
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
    "Create a new task in COR within a project. " +
      "Requires a name and projectId. Optionally set status, priority, assignee, and due date.",
    {
      name: z.string().min(1).describe("Task name"),
      projectId: z.number().int().describe("Project ID"),
      description: z.string().optional().describe("Task description"),
      status: taskStatusEnum.optional(),
      priority: taskPriorityEnum.optional(),
      assigneeId: z.number().int().optional().describe("Assignee user ID"),
      dueDate: z.string().optional().describe("Due date (YYYY-MM-DD)"),
      estimatedHours: z.number().optional().describe("Estimated hours"),
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
    "Update an existing COR task. " +
      "Only provide the fields you want to change. Useful for changing status, priority, assignee, etc.",
    {
      id: z.number().int().describe("Task ID"),
      name: z.string().min(1).optional().describe("New name"),
      description: z.string().optional().describe("New description"),
      status: taskStatusEnum.optional(),
      priority: taskPriorityEnum.optional(),
      assigneeId: z.number().int().optional().describe("Assignee user ID"),
      dueDate: z.string().optional().describe("Due date (YYYY-MM-DD)"),
      estimatedHours: z.number().optional().describe("Estimated hours"),
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

  server.tool(
    "cor_delete_task",
    "Delete a task by ID.",
    {
      id: z.number().int().describe("Task ID"),
    },
    async ({ id }) => {
      try {
        await corFetch(`/tasks/${id}`, { method: "DELETE" });
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, id }, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_task_collaborators",
    "List task collaborators.",
    { taskId: z.number().int().describe("Task ID") },
    async ({ taskId }) => {
      try {
        const result = await corFetch(`/tasks/${taskId}/collaborators`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_sync_task_collaborators",
    "Replace all task collaborators.",
    {
      taskId: z.number().int().describe("Task ID"),
      userIds: z.array(z.number().int()).describe("Full user ID list"),
    },
    async ({ taskId, userIds }) => {
      try {
        const result = await corFetch(`/tasks/${taskId}/collaborators`, {
          method: "PUT",
          body: JSON.stringify({ userIds }),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_add_task_label",
    "Add a label to a task.",
    {
      taskId: z.number().int().describe("Task ID"),
      labelId: z.number().int().describe("Label ID"),
    },
    async ({ taskId, labelId }) => {
      try {
        const result = await corFetch(`/tasks/${taskId}/labels`, {
          method: "POST",
          body: JSON.stringify({ labelId }),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_remove_task_label",
    "Remove a label from a task.",
    {
      taskId: z.number().int().describe("Task ID"),
      labelId: z.number().int().describe("Label ID"),
    },
    async ({ taskId, labelId }) => {
      try {
        await corFetch(`/tasks/${taskId}/labels/${labelId}`, { method: "DELETE" });
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, taskId, labelId }, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_task_labels",
    "List labels assigned to a task.",
    { taskId: z.number().int().describe("Task ID") },
    async ({ taskId }) => {
      try {
        const result = await corFetch(`/tasks/${taskId}/labels`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
