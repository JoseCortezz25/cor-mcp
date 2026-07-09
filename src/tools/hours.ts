import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corFetch, buildQuery } from "../client.js";
import type { Hour, PaginatedResponse } from "../types.js";

export function registerHoursTools(server: McpServer): void {
  server.tool(
    "cor_list_hours",
    "List logged hours in COR. " +
      "Can filter by a specific date. Returns time entries with task, project, and user info.",
    {
      date: z
        .string()
        .optional()
        .describe("Exact date filter (YYYY-MM-DD)"),
      page: z.number().int().min(1).optional().describe("Page number"),
      perPage: z.number().int().min(1).max(200).optional().describe("Results per page"),
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
    "Log worked hours in COR for a task. " +
      "Requires taskId, hours, and date. Optionally add a description.",
    {
      taskId: z.number().int().describe("Task ID"),
      hours: z.number().positive().describe("Hours worked (e.g. 1.5)"),
      date: z.string().describe("Log entry date (YYYY-MM-DD)"),
      description: z.string().optional().describe("Description or notes"),
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

  server.tool(
    "cor_log_time",
    "Alias for cor_log_hours. Logs worked time to a task.",
    {
      taskId: z.number().int().describe("Task ID"),
      hours: z.number().positive().describe("Hours worked"),
      date: z.string().describe("Log entry date (YYYY-MM-DD)"),
      description: z.string().optional().describe("Description or notes"),
    },
    async (input) => {
      try {
        const result = await corFetch<Hour>("/hours", {
          method: "POST",
          body: JSON.stringify(input),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_time_logs",
    "Alias for cor_list_hours. Gets time logs with optional filters.",
    {
      date: z.string().optional().describe("Exact date (YYYY-MM-DD)"),
      page: z.number().int().min(1).optional().describe("Page number"),
      perPage: z.number().int().min(1).max(200).optional().describe("Results per page"),
    },
    async ({ date, page, perPage }) => {
      try {
        const path = date
          ? `/hours/date${buildQuery({ date, page, perPage })}`
          : `/hours${buildQuery({ page, perPage })}`;
        const result = await corFetch<PaginatedResponse<Hour>>(path);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_search_time_entries",
    "Search time entries with optional COR-supported filters.",
    {
      filters: z.record(z.unknown()).optional().describe("COR API filters"),
    },
    async ({ filters }) => {
      try {
        const result = await corFetch<PaginatedResponse<Hour>>(`/hours${buildQuery(filters ?? {})}`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_get_hours_by_date",
    "Get time entries for a specific date using COR's date endpoint.",
    {
      datetimeUnix: z.number().int().describe("Unix timestamp for the date"),
    },
    async ({ datetimeUnix }) => {
      try {
        const result = await corFetch<PaginatedResponse<Hour>>(`/hours/date/${datetimeUnix}`);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_change_hours_status",
    "Change the status of a time entry.",
    {
      hoursId: z.number().int().describe("Time entry ID"),
      status: z.string().min(1).describe("New time entry status"),
    },
    async ({ hoursId, status }) => {
      try {
        const result = await corFetch<Hour>(`/hours/${hoursId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );

  server.tool(
    "cor_accept_suggested_hours",
    "Accept suggested hours for a date.",
    {
      datetimeUnix: z.number().int().describe("Unix timestamp for the date"),
    },
    async ({ datetimeUnix }) => {
      try {
        const result = await corFetch("/hours/accept-suggested", {
          method: "POST",
          body: JSON.stringify({ date: datetimeUnix }),
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { isError: true, content: [{ type: "text" as const, text: String(err) }] };
      }
    }
  );
}
