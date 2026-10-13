# REST API Specification: Task Management API

Base URL: `http://localhost:8000`  
Interactive OpenAPI Documentation: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## 1. Endpoints Overview

| Method | Endpoint | Description | Success Status | Error Statuses |
|---|---|---|---|---|
| `GET` | `/` | Root API greeting and links | `200 OK` | - |
| `GET` | `/health` | Application health and status check | `200 OK` | - |
| `GET` | `/tasks` | List tasks with query filtering & pagination | `200 OK` | `422` |
| `POST` | `/tasks` | Create a new task | `201 Created` | `422` |
| `GET` | `/tasks/stats` | Retrieve aggregate summary metrics | `200 OK` | - |
| `GET` | `/tasks/{id}` | Retrieve individual task by ID | `200 OK` | `404, 422` |
| `PATCH` | `/tasks/{id}` | Update attributes of an existing task | `200 OK` | `404, 422` |
| `DELETE` | `/tasks/{id}` | Delete a task by ID | `204 No Content`| `404, 422` |
| `GET` | `/api/pipeline/status`| Query live CircleCI status via backend proxy | `200 OK` | - |

---

## 2. Detailed Endpoint Documentation

### POST `/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Setup CircleCI Pipeline",
  "description": "Configure config.yml with test report archiving",
  "status": "pending",
  "priority": "high"
}
```

*Validation Rules:*
- `title`: Required, 1 to 200 characters.
- `description`: Optional, max 2000 characters.
- `status`: Optional, one of `["pending", "in_progress", "completed"]`. Defaults to `"pending"`.
- `priority`: Optional, one of `["low", "medium", "high"]`. Defaults to `"medium"`.

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Setup CircleCI Pipeline",
  "description": "Configure config.yml with test report archiving",
  "status": "pending",
  "priority": "high",
  "created_at": "2026-10-13T16:15:00.123456Z",
  "updated_at": "2026-10-13T16:15:00.123456Z"
}
```

---

### GET `/tasks`
Retrieve tasks with optional filters.

**Query Parameters:**
- `status` (*string*, optional): Filter by status (`pending`, `in_progress`, `completed`).
- `priority` (*string*, optional): Filter by priority (`low`, `medium`, `high`).
- `search` (*string*, optional): Partial text search in `title` or `description`.
- `skip` (*integer*, optional, default: `0`): Pagination offset.
- `limit` (*integer*, optional, default: `100`, max: `500`): Pagination limit.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Setup CircleCI Pipeline",
    "description": "Configure config.yml with test report archiving",
    "status": "pending",
    "priority": "high",
    "created_at": "2026-10-13T16:15:00.123456Z",
    "updated_at": "2026-10-13T16:15:00.123456Z"
  }
]
```

---

### GET `/tasks/stats`
Retrieve task summary counts for dashboards.

**Response (200 OK):**
```json
{
  "total": 12,
  "completed": 5,
  "pending": 4,
  "in_progress": 3,
  "high_priority": 3
}
```

---

### GET `/tasks/{id}`
Retrieve a task by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Setup CircleCI Pipeline",
  "description": "Configure config.yml with test report archiving",
  "status": "pending",
  "priority": "high",
  "created_at": "2026-10-13T16:15:00.123456Z",
  "updated_at": "2026-10-13T16:15:00.123456Z"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Task with ID 999 not found"
}
```

---

### PATCH `/tasks/{id}`
Partially update an existing task.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Setup CircleCI Pipeline",
  "description": "Configure config.yml with test report archiving",
  "status": "completed",
  "priority": "high",
  "created_at": "2026-10-13T16:15:00.123456Z",
  "updated_at": "2026-10-13T16:20:00.654321Z"
}
```

---

### DELETE `/tasks/{id}`
Delete a task by ID.

**Response (204 No Content):**
Empty response body.

**Response (404 Not Found):**
```json
{
  "detail": "Task with ID 999 not found"
}
```

---

### GET `/health`
Check API service status and version.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "app": "DevOps Task Management API",
  "version": "1.0.0",
  "environment": "development"
}
```

---

### GET `/api/pipeline/status`
Secure server-side proxy for CircleCI API v2.

**Response (Unconfigured Environment):**
```json
{
  "configured": false,
  "message": "CircleCI integration not configured in backend environment. Set CIRCLECI_TOKEN and CIRCLECI_PROJECT_SLUG in your backend environment to query live CircleCI API status.",
  "project_slug": null,
  "last_pipeline": null,
  "workflows": null
}
```
