# COR API — Análisis Completo

> **COR** es una plataforma de gestión de proyectos para consultorías/agencias (projectcor.com).
> Documentación oficial: https://developers.projectcor.com/

---

## 1. Descripción General

COR expone **4 superficies de API** distintas:

| Superficie | Base URL | Propósito |
|---|---|---|
| **REST API v1** | `https://api.projectcor.com/v1/` | API principal CRUD |
| **Integrations API** | `https://integrations.projectcor.com/` | Sincronización masiva desde sistemas externos |
| **MCP Server** | `https://mcp.projectcor.com/mcp` | Interacción con IA (Model Context Protocol) |
| **Resource Allocation** | `https://api.projectcor.com/v1/` | Asignación de recursos/capacidad |

**Autenticación:** OAuth 2.0 con JWTs (3 flujos: client_credentials, authorization_code, user_credentials).

---

## 2. REST API v1 (`api.projectcor.com/v1`)

### 2.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/oauth/token?grant_type=client_credentials` | JWT por Client Credentials |
| `POST` | `/oauth/token?grant_type=authorization_code` | JWT por Authorization Code |
| `POST` | `/oauth/token?grant_type=password` | JWT por credenciales de usuario |
| `POST` | `/oauth/token?grant_type=refresh_token` | Refresh Token |
| `GET` | `/auth/me` | Obtener usuario autenticado |

### 2.2 Brands (Marcas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/brands` | Listar marcas (paginado) |
| `GET` | `/brands/{id}` | Obtener marca por ID |
| `POST` | `/brands` | Crear marca |
| `PUT` | `/brands/{id}` | Actualizar marca |
| `DELETE` | `/brands/{id}` | Eliminar marca |

### 2.3 Clients (Clientes)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/clients` | Listar clientes |
| `GET` | `/clients/{id}` | Obtener cliente por ID |
| `GET` | `/clients/search?name=` | Buscar clientes por nombre |
| `POST` | `/clients` | Crear cliente |
| `PUT` | `/clients/{id}` | Actualizar cliente |

### 2.4 Contracts (Contratos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/contracts` | Listar contratos |
| `POST` | `/contracts` | Crear contrato |
| `PUT` | `/contracts/{id}` | Actualizar contrato |
| `DELETE` | `/contracts/{id}` | Eliminar contrato |
| | `/contracts/{id}/users` | Usuarios del contrato |
| | `/contracts/{id}/positions` | Posiciones del contrato |

### 2.5 Fees (Honorarios/Tarifas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/fees` | Listar honorarios |
| `GET` | `/clients/{id}/fees` | Honorarios de un cliente |
| `GET` | `/fees/historical` | Histórico de honorarios |
| `POST` | `/clients/{id}/fees` | Crear honorario |
| `PUT` | `/clients/{id}/fees/{fee_id}` | Actualizar honorario |

### 2.6 Hours (Horas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/hours` | Listar horas |
| `GET` | `/hours/date?date=` | Horas por fecha |
| `POST` | `/hours` | Registrar horas |
| `POST` | `/hours/status` | Cambiar estado de horas |
| `POST` | `/hours/bill` | Cambiar estado de facturación |
| `POST` | `/hours/weigh/status` | Actualizar estado de weigh hours |
| `POST` | `/hours/accept-suggested` | Aceptar horas sugeridas |

### 2.7 Labels (Etiquetas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/labels` | Obtener categorías y etiquetas |

### 2.8 Products (Productos/Servicios)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/products` | Listar productos |
| `GET` | `/products/{id}` | Obtener producto por ID |
| `POST` | `/products` | Crear producto |
| `PUT` | `/products/{id}` | Actualizar producto |
| `DELETE` | `/products/{id}` | Eliminar producto |

### 2.9 Project Templates

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/projects/templates` | Obtener plantillas de proyectos |

### 2.10 Projects (Proyectos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/projects` | Listar proyectos |
| `GET` | `/projects/{id}` | Obtener proyecto por ID |
| `GET` | `/projects/search?name=` | Buscar proyectos por nombre |
| `POST` | `/projects` | Crear proyecto |
| `PUT` | `/projects/{id}` | Actualizar proyecto |
| `DELETE` | `/projects/{id}` | Eliminar proyecto |
| | `/projects/{id}/profitability` | Rentabilidad y estimación de tiempo |
| | `/projects/{id}/messages` | Mensajes del proyecto |
| | `/projects/{id}/cost` | Costos del proyecto |
| | `/projects/{id}/attachments` | Archivos adjuntos |
| | `/projects/{id}/collaborators` | Colaboradores |
| | `/projects/{id}/labels` | Etiquetas |
| | `/projects/{id}/ratecard` | Tarifario |
| | `/projects/{id}/estimates` | Estimaciones |

### 2.11 Ratecards (Tarifarios)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/ratecards` | Listar tarifarios |
| `POST` | `/ratecards` | Crear tarifario |
| `PUT` | `/ratecards/{id}` | Actualizar tarifario |
| `DELETE` | `/ratecards/{id}` | Eliminar tarifario |

### 2.12 Tasks (Tareas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/tasks` | Listar tareas |
| `GET` | `/tasks/{id}` | Obtener tarea por ID |
| `POST` | `/tasks` | Crear tarea |
| `PUT` | `/tasks/{id}` | Actualizar tarea |
| `DELETE` | `/tasks/{id}` | Eliminar tarea |
| | `/tasks/{id}/messages` | Mensajes de la tarea |
| | `/tasks/{id}/attachments` | Archivos adjuntos |
| | `/tasks/{id}/members` | Miembros |
| | `/tasks/{id}/collaborators` | Colaboradores |

### 2.13 Teams (Equipos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/teams` | Listar equipos |
| `GET` | `/teams/{id}` | Obtener equipo por ID |
| `POST` | `/teams` | Crear equipo |
| `PUT` | `/teams/{id}` | Actualizar equipo |
| `DELETE` | `/teams/{id}` | Eliminar equipo |
| | `/teams/{id}/users` | Usuarios del equipo |

### 2.14 Transactions (Transacciones)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/transactions` | Listar transacciones |
| `GET` | `/transactions/total` | Obtener total |
| `POST` | `/transactions` | Crear transacción |
| `PUT` | `/transactions/{id}` | Actualizar transacción |
| `DELETE` | `/transactions/{id}` | Eliminar transacción |
| | `/transactions/{id}/items` | Items de la transacción |

### 2.15 User Leaves (Vacaciones/Ausencias)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/user-leaves` | Listar ausencias |
| `POST` | `/user-leaves` | Crear ausencia |
| `PUT` | `/user-leaves/{id}` | Actualizar ausencia |
| `DELETE` | `/user-leaves/{id}` | Eliminar ausencia |
| | `/leave-types` | Tipos de ausencia |

### 2.16 Users (Usuarios)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/users` | Listar usuarios |
| `GET` | `/users/search?name=` | Buscar usuarios por nombre |
| `POST` | `/users` | Crear usuario |
| `PUT` | `/users/{id}` | Actualizar usuario |
| `PUT` | `/users/{id}/labels` | Asignar/desasignar etiqueta |
| `DELETE` | `/users/{id}` | Eliminar usuario |

### 2.17 User Positions (Cargos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/user-positions` | Obtener posiciones activas |
| `GET` | `/user-positions/segments` | Etiquetas de segmento |
| `POST` | `/user-positions` | Crear posición |
| `PUT` | `/user-positions/{id}` | Actualizar posición |

### 2.18 Working Time (Jornada Laboral)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/working-time/users` | Obtener jornada de usuarios |
| `POST` | `/working-time` | Crear o actualizar jornada |

---

## 3. Integrations API (`integrations.projectcor.com`)

API diseñada para sincronización masiva desde sistemas externos (ERP, RRHH, etc.).

| Categoría | Métodos |
|-----------|---------|
| **Brands** | `POST`, `PUT`, `DELETE` |
| **Clients** | `POST`, `PUT`, `DELETE` |
| **Contracts** | `POST`, `PUT`, `DELETE`, `PUT` attach/detach users |
| **Currency Exchanges** | `POST` |
| **Products** | `POST`, `PUT`, `DELETE` |
| **Positions** | `POST`, `PUT`, `DELETE`, `POST` assign seniority |
| **Position Categories** | `POST`, `PUT`, `DELETE` |
| **Seniority** | `POST`, `PUT`, `DELETE` |
| **Projects** | `POST`, `PUT`, `DELETE` |
| **Teams** | `POST`, `PUT`, `DELETE`, `PUT` attach/detach users |
| **Users** | `POST`, `PUT`, `DELETE`, assign position, attach/detach workspaces |
| **User Leaves** | `POST` create/update leave type & leave, `PUT`, `DELETE` |
| **Working Time** | `POST`, `DELETE` |
| **Workspaces** | `POST`, `PUT` |

Autenticación vía OAuth2 (authorization_code). SDK de ejemplo: `adonis-cor-sdk` (Node.js/AdonisJS).

---

## 4. MCP Server (`mcp.projectcor.com/mcp`)

### 4.1 Descripción

Servidor MCP (Model Context Protocol) que permite a asistentes de IA (Claude, Cursor, Windsurf, etc.) interactuar con COR en lenguaje natural.

- **Endpoint:** `https://mcp.projectcor.com/mcp`
- **Transporte:** Streamable HTTP
- **Autenticación:** OAuth 2.0 (authorization code flow)

### 4.2 Capacidades (Tools)

| Categoría | Qué permite hacer |
|-----------|-------------------|
| **Project Management** | Crear, actualizar y consultar proyectos |
| **Task Management** | Crear, actualizar y consultar tareas con detalle completo |
| **Communication** | Publicar mensajes y @mencionar compañeros en hilos de tareas |
| **Time Tracking** | Registrar horas trabajadas propias y del equipo |
| **Team** | Consultar miembros del equipo, clientes y estados de proyecto |
| **Attachments** | Asignar etiquetas, colaboradores y archivos adjuntos a tareas |
| **Reference** | Obtener enlaces directos a proyectos, tareas o clientes |

### 4.3 Valores de Referencia

**Estados de tarea:** `nueva`, `en_proceso`, `estancada`, `finalizada`
**Prioridad de tarea:** `0` (Low), `1` (Medium), `2` (High), `3` (Urgent)
**Estado de proyecto:** `in_process`, `finished`, `suspended`
**Salud de proyecto:** `1` (On track), `2` (At risk), `3` (Delayed), `4` (Critical)

### 4.4 Setup

Configuración para clients MCP compatibles:

```json
{
  "mcpServers": {
    "cor": {
      "url": "https://mcp.projectcor.com/mcp"
    }
  }
}
```

Para clients que no soportan MCP remoto nativamente, usar `mcp-remote` como bridge.

Soporta: Claude.ai, Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Zed.

---

## 5. Resource Allocation API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/allocations` | Guardar asignación |
| `PUT` | `/allocations/{id}` | Actualizar asignación |
| `DELETE` | `/allocations/{id}` | Eliminar asignación |
| `GET` | `/allocations/project/{id}` | Obtener asignaciones por proyecto |

---

## 6. Resumen de Capacidades

| Dimensión | REST API | Integrations API | MCP Server |
|-----------|----------|------------------|------------|
| **Lectura** | ✅ Completa (GET) | ❌ Solo escritura | ✅ Consultas en lenguaje natural |
| **Escritura** | ✅ CRUD completo | ✅ Creación masiva | ✅ Creación vía lenguaje natural |
| **Autenticación** | Bearer JWT | OAuth2 code | OAuth2 code |
| **Rate Limits** | ✅ Documentados | ❓ No especificado | ❓ No especificado |
| **Paginación** | ✅ page/perPage | N/A | N/A |
| **Uso principal** | Integración técnica | Sincronización sistemas externos | Interacción con IA |
