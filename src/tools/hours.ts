import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Hour, PaginatedResponse } from "../types.js";

export function registerHoursTools(server: McpServer): void {
  server.tool(
    "cor_list_hours",
    "Lista las horas registradas en COR. / List logged hours in COR. " +
      "Can filter by a specific date. Returns time entries with task, project, and user info.",
    {
      date: z
        .string()
        .optional()
        .describe("Fecha exacta (YYYY-MM-DD) para filtrar horas / Filter by specific date"),
      page: z.number().int().min(1).optional().describe("Número de página / Page number"),
      perPage: z.number().int().min(1).max(100).optional().describe("Resultados por página / Results per page"),
    },
    async ({ date, page, perPage }) => {
      try {
        let path: string;
        if (date) {
          path = `/hours/date${buildQuery({ date, page, perPage })}`;
        } else {
          path = `/hours${buildQuery({ page, perPage })}`;
        }
        const result = await corFetch<PaginatedResponse<Hour>>(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_log_hours",
    "Registra horas trabajadas en COR para una tarea. / Log worked hours in COR for a task. " +
      "Requires taskId, hours, and date. Optionally add a description.",
    {
      taskId: z.number().int().describe("ID de la tarea / Task ID"),
      hours: z.number().positive().describe("Cantidad de horas trabajadas / Hours worked (e.g. 1.5)"),
      date: z.string().describe("Fecha del registro (YYYY-MM-DD) / Date of the log entry"),
      description: z.string().optional().describe("Descripción o notas / Description or notes"),
    },
    async (input) => {
      try {
        const result = await corFetch<Hour>("/hours", {
          method: "POST",
          body: JSON.stringify(input),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );
}
