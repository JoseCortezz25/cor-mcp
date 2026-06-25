# cor-mcp

MCP (Model Context Protocol) server for the [COR](https://projectcor.com) project management platform.

Exposes COR's REST API as MCP tools so any compatible AI assistant (Claude Desktop, Claude Code, Cursor, Windsurf, etc.) can manage projects, tasks, hours, clients, teams, and users using natural language.

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

### Tasks
| Tool | Description |
|------|-------------|
| `cor_list_tasks` | List tasks (paginated, optional project filter) |
| `cor_get_task` | Get task details by ID |
| `cor_create_task` | Create a task within a project |
| `cor_update_task` | Update an existing task |

### Hours
| Tool | Description |
|------|-------------|
| `cor_list_hours` | List logged hours (optional date filter) |
| `cor_log_hours` | Log worked hours to a task |

### Clients
| Tool | Description |
|------|-------------|
| `cor_list_clients` | List clients (optional name search) |
| `cor_get_client` | Get client details by ID |

### Teams
| Tool | Description |
|------|-------------|
| `cor_list_teams` | List all teams |
| `cor_get_team` | Get team details by ID |

### Users
| Tool | Description |
|------|-------------|
| `cor_list_users` | List users (optional name search) |
| `cor_get_user` | Get user profile by ID |

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
