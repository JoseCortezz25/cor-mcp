# cor-mcp

MCP (Model Context Protocol) server for the [COR](https://projectcor.com) project management platform.

Exposes COR's REST API as MCP tools so any compatible AI assistant (Claude Desktop, Claude Code, Cursor, Windsurf, etc.) can manage projects, tasks, hours, clients, teams, users, comments, labels, attachments, ratecards, contracts, products, and allocations using natural language.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure authentication

Copy the example env file:

```bash
cp env.example .env
```

**Option A — Client credentials (recommended for CI/automation):**

Edit `.env` and add your API key and client secret:

```
COR_API_KEY=your_api_key_here
COR_CLIENT_SECRET=your_client_secret_here
```

Get these from COR: **Settings → Integrations → API**. The server will automatically obtain a Bearer token on startup using the OAuth2 `client_credentials` flow and refresh it when it expires.

**Option B — Interactive login:**

Leave `COR_API_KEY` / `COR_CLIENT_SECRET` unset. After connecting the MCP server, call `cor_login` with your email and password:

```
cor_login(email: "you@company.com", password: "...")
```

The access token is stored in memory for the current session. You'll need to call `cor_login` again each time the server restarts.

### 3. Build

```bash
npm run build
```

### 4. Configure your MCP client

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cor": {
      "command": "node",
      "args": ["/absolute/path/to/cor-mcp/dist/index.js"]
    }
  }
}
```

#### Claude Code

```bash
claude mcp add cor -- node /absolute/path/to/cor-mcp/dist/index.js
```

#### Cursor / Windsurf / VS Code (Cline)

Add to your MCP config:

```json
{
  "mcpServers": {
    "cor": {
      "command": "node",
      "args": ["/absolute/path/to/cor-mcp/dist/index.js"]
    }
  }
}
```

---

## Available Tools

This server exposes every `cor_*` tool name currently present in the Python COR MCP reference, plus a few TypeScript-specific convenience tools.

### Coverage Summary

| Area | Tools |
|------|-------|
| Authentication | 1 |
| Projects | 14 |
| Tasks | 14 |
| Messages | 4 |
| Attachments | 2 |
| Hours | 8 |
| Labels | 2 |
| URLs | 1 |
| Clients | 6 |
| Teams | 5 |
| Users | 4 |
| Contracts | 5 |
| Ratecards | 3 |
| Allocations | 3 |
| Products | 2 |

### Authentication
| Tool | Description |
|------|-------------|
| `cor_login` | Authenticate with email + password (stores token for the session) |

### Projects
| Tool | Description |
|------|-------------|
| `cor_list_projects` | List projects (paginated, optional name search) |
| `cor_get_project` | Get project details by ID |
| `cor_create_project` | Create a new project |
| `cor_update_project` | Update an existing project |
| `cor_delete_project` | Delete a project by ID |
| `cor_get_project_collaborators` | List project collaborators |
| `cor_add_project_collaborator` | Add a collaborator to a project |
| `cor_remove_project_collaborator` | Remove a collaborator from a project |
| `cor_get_project_costs` | Get project costs or estimates |
| `cor_add_project_cost` | Add a project cost entry |
| `cor_get_project_labels` | Get labels assigned to a project |
| `cor_get_project_ratecard` | Get the ratecard assigned to a project |
| `cor_get_project_templates` | List available project templates |
| `cor_get_project_profitability` | Get project profitability data |

### Tasks
| Tool | Description |
|------|-------------|
| `cor_list_tasks` | List tasks (paginated, optional project filter) |
| `cor_search_tasks` | Search tasks with COR-supported filters |
| `cor_get_my_pending_tasks` | Get pending tasks for the authenticated user |
| `cor_search_user_tasks` | Search tasks assigned to a specific user |
| `cor_get_task` | Get task details by ID |
| `cor_create_task` | Create a task within a project |
| `cor_update_task` | Update an existing task |
| `cor_delete_task` | Delete a task by ID |
| `cor_get_task_collaborators` | List task collaborators |
| `cor_sync_task_collaborators` | Replace the full task collaborator list |
| `cor_add_task_label` | Add a label to a task |
| `cor_remove_task_label` | Remove a label from a task |
| `cor_get_task_labels` | Get labels assigned to a task |

### Messages
| Tool | Description |
|------|-------------|
| `cor_get_task_messages` | Get task comments/messages |
| `cor_post_task_message` | Post a comment/message to a task |
| `cor_get_project_messages` | Get project comments/messages |
| `cor_post_project_message` | Post a comment/message to a project |

### Attachments
| Tool | Description |
|------|-------------|
| `cor_list_task_attachments` | List attachments for a task |
| `cor_add_task_attachment` | Upload a local file as a task attachment |

### Hours
| Tool | Description |
|------|-------------|
| `cor_list_hours` | List logged hours (optional date filter) |
| `cor_log_hours` | Log worked hours to a task |
| `cor_log_time` | Alias for logging worked time to a task |
| `cor_get_time_logs` | Alias for listing time logs |
| `cor_search_time_entries` | Search time entries with free-form COR filters |
| `cor_get_hours_by_date` | Get time entries by COR date timestamp endpoint |
| `cor_change_hours_status` | Change a time entry status |
| `cor_accept_suggested_hours` | Accept suggested hours for a date |

### Labels
| Tool | Description |
|------|-------------|
| `cor_get_labels` | List available labels, optionally by entity type |
| `cor_list_available_labels` | Alias for listing labels |

### URLs
| Tool | Description |
|------|-------------|
| `cor_get_url` | Build a browser URL for a task or project |

### Clients
| Tool | Description |
|------|-------------|
| `cor_list_clients` | List clients (optional name search) |
| `cor_get_client` | Get client details by ID |
| `cor_create_client` | Create a client |
| `cor_update_client` | Update a client |
| `cor_delete_client` | Delete a client |
| `cor_get_client_fees` | Get client fees |

### Teams
| Tool | Description |
|------|-------------|
| `cor_list_teams` | List all teams |
| `cor_get_team` | Get team details by ID |
| `cor_create_team` | Create a team |
| `cor_add_team_users` | Add users to a team |
| `cor_remove_team_users` | Remove users from a team |

### Users
| Tool | Description |
|------|-------------|
| `cor_get_my_profile` | Get the authenticated user profile |
| `cor_list_users` | List users (optional name search) |
| `cor_get_user` | Get user profile by ID |
| `cor_get_working_time` | Get working time data for users |

### Contracts
| Tool | Description |
|------|-------------|
| `cor_list_contracts` | List contracts |
| `cor_get_contract` | Get contract details by ID |
| `cor_create_contract` | Create a contract |
| `cor_get_contract_positions` | Get positions for a contract |
| `cor_create_contract_position` | Create a position in a contract |

### Ratecards
| Tool | Description |
|------|-------------|
| `cor_list_ratecards` | List ratecards |
| `cor_get_ratecard` | Get ratecard details by ID |
| `cor_create_ratecard` | Create a ratecard |

### Allocations
| Tool | Description |
|------|-------------|
| `cor_get_allocations_by_project` | Get allocations for a project |
| `cor_save_allocation` | Create or update an allocation |
| `cor_delete_allocation` | Delete an allocation |

### Products
| Tool | Description |
|------|-------------|
| `cor_list_products` | List products |
| `cor_create_product` | Create a product |

---

## Live API Notes

The server mirrors the Python COR MCP reference by tool name. During live read-only validation with client credentials, core endpoints worked for profile, users, projects, tasks, labels, hours, task messages, task attachments, and project messages.

Some COR endpoints currently return API-side errors for the tested account even though the tools are available for parity:

| Tool area | Observed response |
|-----------|-------------------|
| Working time | COR returned `500 EH001` |
| Contracts list | COR returned `500 CTR001` |
| Project costs | COR returned `404 E_ROUTE_NOT_FOUND` |
| Project profitability | COR returned `404 E_ROUTE_NOT_FOUND` |
| Project allocations | COR returned `404 E_ROUTE_NOT_FOUND` |

---

## Reference Values

**Task status:** `nueva` · `en_proceso` · `estancada` · `finalizada`

**Task priority:** `0` = Low · `1` = Medium · `2` = High · `3` = Urgent

**Project status:** `in_process` · `finished` · `suspended`

**Project health:** `1` = On track · `2` = At risk · `3` = Delayed · `4` = Critical

---

## Development

Run without building (uses `tsx`):

```bash
npm run dev
```
