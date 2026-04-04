# LifeManager
## Core modules to build (MVP scope)
- Tasks — to-do items with due dates, priorities, and categories. The core of a life admin tool.
- Finances — monthly budget tracker. Income vs. expenses, categorised. No bank API integration in MVP — manual entry only. 
- Documents — upload and tag important files (passport, insurance, contracts). Django's FileField + S3 or local media storage.
- Reminders — date-based reminders that trigger email notifications. 
Notes — freeform markdown notes. 

## Tasks API (Phase 4)
Base path: /api/v1/

### Authentication
- All endpoints require JWT access token in Authorization: Bearer <token>

### Task endpoints
- GET /tasks/
- POST /tasks/
- GET /tasks/{id}/
- PATCH /tasks/{id}/
- DELETE /tasks/{id}/

Supported list query params on GET /tasks/:
- status: TODO | IN_PROGRESS | DONE | ARCHIVED
- priority: LOW | MEDIUM | HIGH
- category: UUID
- due_date_from: ISO date or datetime (example: 2026-03-30)
- due_date_to: ISO date or datetime
- search: full-text search over title and description
- ordering: due_date | priority | created_at | updated_at (prefix with - for descending)

### Category endpoints
- GET /categories/
- POST /categories/
- DELETE /categories/{id}/

Category update endpoints are intentionally disabled in MVP.

### Ownership isolation
- Task and category querysets are strictly scoped to the authenticated user.
- Cross-user relations are rejected (for example, assigning another user's category as task category).

### Pagination
- Default page size: 20
- List responses use DRF page format: count, next, previous, results