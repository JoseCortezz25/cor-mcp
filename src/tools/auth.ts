import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corLogin } from "../client.js";

export function registerAuthTools(server: McpServer): void {
  server.tool(
    "cor_login",
    "Authenticate with COR using email and password. " +
      "Call this first if COR_API_TOKEN is not configured. " +
      "Stores the access token in memory for the current session.",
    {
      email: z.string().email().describe("COR account email"),
      password: z.string().min(1).describe("COR account password"),
    },
    async ({ email, password }) => {
      try {
        const result = await corLogin(email, password);
        return {
          content: [
            {
              type: "text",
              text: `Login successful. Access token stored for this session.\n` +
                `Token type: ${result.token_type ?? "Bearer"}\n` +
                (result.expires_in ? `Expires in: ${result.expires_in}s\n` : "") +
                (result.refresh_token ? `Refresh token received.\n` : ""),
            },
          ],
        };
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: String(err) }] };
      }
    }
  );
}
