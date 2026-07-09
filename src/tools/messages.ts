import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch } from "../client.js";

export function registerMessageTools(server: McpServer): void {
  server.tool(
    "cor_get_task_messages",
    "Get messages/comments for a task.",
    {
      taskId: z.number().int().describe("Task ID"),
    },
    async ({ taskId }) => {
      try {
        const result = await corFetch(`/tasks/${taskId}/messages`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_post_task_message",
    "Post a message/comment on a task.",
    {
      taskId: z.number().int().describe("Task ID"),
      message: z.string().min(1).describe("Message text or basic HTML"),
    },
    async ({ taskId, message }) => {
      try {
        const result = await corFetch(`/tasks/${taskId}/messages`, {
          method: "POST",
          body: JSON.stringify({ message }),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_project_messages",
    "Get messages/comments for a project.",
    {
      projectId: z.number().int().describe("Project ID"),
    },
    async ({ projectId }) => {
      try {
        const result = await corFetch(`/projects/${projectId}/messages`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_post_project_message",
    "Post a message/comment on a project.",
    {
      projectId: z.number().int().describe("Project ID"),
      message: z.string().min(1).describe("Message text or basic HTML"),
    },
    async ({ projectId, message }) => {
      try {
        const result = await corFetch(`/projects/${projectId}/messages`, {
          method: "POST",
          body: JSON.stringify({ message }),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
