


### What you are building
1. User management system with custom user model and JWT auth
2. Tasks module with:
- CRUD
- Categories/tags
- Filtering and sorting
- Recurring task fields
- Subtasks
3. Strict owner-only data isolation

### Phase 0: Baseline setup
Goal: secure and stable project foundation.

1. Inspect current scaffold in settings.py and urls.py.
2. Move secret key, debug flag, and allowed hosts to environment variables.
3. Ensure backend dependencies are explicitly tracked.
4. Lock API prefix convention as /api/v1/.
5. Decide app boundaries:
- users app
- tasks app

Checkpoint:
Django starts cleanly with env-based config.

### Phase 1: DRF + JWT infrastructure
Goal: API authentication and global permissions are in place.

1. Configure DRF in settings.
2. Configure JWT authentication classes.
3. Set authenticated access as the default permission for API views.
4. Add versioned API routes in urls.py for:
- auth
- users
- tasks
5. Standardize API error response shape.

Checkpoint:
Unauthenticated requests to protected endpoints fail consistently.

### Phase 2: User management system
Goal: identity layer is complete before tasks depend on it.

1. Create users app.
2. Implement custom user model (email as unique login identifier).
3. Set AUTH_USER_MODEL immediately.
4. Create and apply migrations.
5. Build endpoints:
- register
- login (access + refresh tokens)
- refresh
- profile me (read/update)
6. Add validation:
- email normalization
- duplicate account handling
- password strength
- safe auth error behavior
7. Add tests for auth lifecycle.

Checkpoint:
Register -> login -> refresh -> profile read/update works end-to-end.

### Phase 3: Tasks domain model
Goal: data model supports current MVP features cleanly.

1. Create tasks app.
2. Implement Task model:
- owner
- title, description
- status enum
- priority enum
- due_date
- completed_at
- recurrence metadata
- parent field for subtask relation
- timestamps
3. Implement Category model and task-category relation.
4. Enforce constraints:
- task owner must match parent task owner
- category owner must match task owner
5. Enforce task state transition rules.
6. Create and apply migrations.

Checkpoint:
Data constraints hold in admin/shell and no cross-user relations are possible.

### Phase 4: Tasks API endpoints
Goal: frontend-consumable task API.

1. Implement task endpoints:
- list/create
- retrieve/update/delete
2. Implement category endpoints:
- list/create/delete
3. Enforce owner scoping in all task/category querysets.
4. Add filtering for:
- status
- priority
- due date range
- category
- text search
5. Add sorting for:
- due_date
- priority
- created_at
- updated_at
6. Add pagination defaults.
7. Implement MVP recurrence validation.
8. Implement MVP subtask rules (recommend one-level depth first).

Checkpoint:
User A cannot access User B tasks by list or by id.

### Phase 5: Security hardening
Goal: safer behavior and better observability.

1. Add throttling for auth endpoints.
2. Add structured logging for auth and task write operations.
3. Handle invalid/expired/malformed token cases consistently.
4. Add tests for unauthorized and forbidden access paths.
5. Document deferred scope to prevent feature creep:
- sharing/collaboration
- social login
- deep subtask trees
- advanced recurrence engine

Checkpoint:
Security and permission tests pass.

### Phase 6: Testing strategy
Goal: confidence and regression protection.

1. Organize tests by layer:
- models
- serializers
- views/endpoints
- permissions
2. Must-have tests:
- auth lifecycle
- owner isolation across every task endpoint
- status transition correctness
- recurrence validation
- subtask ownership rules
- filtering/sorting/pagination correctness
3. Add migration safety checks to workflow.
4. Add one end-to-end API flow mirroring frontend behavior.

Checkpoint:
Core test suite passes with strong coverage on auth + ownership.

### Phase 7: Documentation and handoff
Goal: frontend team can integrate without guessing.

1. Update README.md with:
- setup instructions
- auth flow
- endpoint map
- filter/sort options
2. Add request/response examples.
3. Record architecture decisions and deferred items.

Checkpoint:
A teammate can run and consume your API using docs only.

## Execution order
1. Phase 0 -> Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5 and Phase 6 can overlap
6. Phase 7 finishes and polishes handoff

## Suggested 5-day pace
1. Day 1: Foundation + DRF/JWT setup
2. Day 2: User management
3. Day 3: Task and category models
4. Day 4: Task/category endpoints + filtering
5. Day 5: Security, tests, docs

## Definition of done
1. JWT auth works fully (register, login, refresh, profile)
2. Tasks API supports CRUD, categories, filters/sorts, recurring metadata, subtasks
3. Owner-only access is enforced and tested
4. README is integration-ready

I also saved this as your working plan in /memories/session/plan.md. If you want, next I can turn this into a literal implementation checklist with exact commands and expected outputs for each step.