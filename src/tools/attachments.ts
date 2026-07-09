import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, corUpload } from "../client.js";

export function registerAttachmentTools(server: McpServer): void {
  server.tool(
    "cor_list_task_attachments",
    "List attachments for a task.",
    {
      taskId: z.number().int().describe("Task ID"),
    },
    async ({ taskId }) => {
      try {
        const result = await corFetch(`/tasks/${taskId}/attachments`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_add_task_attachment",
    "Attach a local file to a task.",
    {
      taskId: z.number().int().describe("Task ID"),
      filePath: z.string().min(1).describe("Local absolute or relative file path"),
    },
    async ({ taskId, filePath }) => {
      try {
        const bytes = await readFile(filePath);
        const formData = new FormData();
        formData.set("file", new Blob([bytes]), basename(filePath));
        const result = await corUpload(`/tasks/${taskId}/attachments`, formData);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
