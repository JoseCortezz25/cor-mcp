# cor-mcp

MCP (Model Context Protocol) server for the [COR](https://projectcor.com) project management platform.

Exposes COR's REST API as MCP tools so any compatible AI assistant (Claude Desktop, Claude Code, Cursor, Windsurf, etc.) can manage projects, tasks, hours, clients, teams, and users using natural language.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API token

Copy the example env file and add your token:

```bash
cp env.example .env
```

Edit `.env`:

```
COR_API_TOKEN=your_token_here
```

Get your token from COR: **Settings → Integrations → API**.

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
