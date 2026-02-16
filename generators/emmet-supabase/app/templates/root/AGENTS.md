# Agent Learnings

## Core Principles

### Source of Truth
- **slice.json is ALWAYS the source of truth** for all field definitions, event structures, and specifications
- Pre-existing code marked as "Done" may not match slice.json - always verify against specification
- The aggregate field in slice.json determines domain entity naming (Location → locationId, Restaurant → restaurantId)
- When an event is used by multiple slices, fixing it requires updating ALL slices that use it
- Field names must be consistent across: events, commands, migrations, projections, routes, tests, API docs

### `idAttribute` and Stream ID
- If a field on a **command** and/or **event** has `"idAttribute": true`, that field is the **streamId** for the aggregate stream
- This applies to commands and events independently; if both mark the same field, they share the same streamId
- If the slice definition explicitly specifies a different stream identifier, that takes precedence over `idAttribute`

### Pre-Implementation Checks
- **Always check if slice already exists** before implementing a "Planned" slice - verify `src/slices/{SliceName}/`
- **Run tests first**: existing implementations may only need test data fixes
- **Search for event usage**: `grep -r "EventName" src/slices/` before modifying events
- Pre-existing implementations only need status updates if tests pass and match specification

### Slice Status
- Valid statuses: "Done", "Planned", "Assigned", "Created", "Blocked", "Informational"
- **"Assigned" = "Planned"** - treat as equivalent when picking next slice
- **Created**: specification exists, not yet ready for implementation
- **Blocked**: depends on other work; resolve dependencies first
- **Informational**: reference only, no implementation needed
- Always update status to "Done" after completing implementation and passing tests

## Event Management

- Event type names MUST use PascalCase (RestaurantRegistered, not Restaurantregistered)
- All new events MUST be added to ContextEvents union type in `src/events/ContextEvents.ts`
- Auto-generated code may have incorrect casing or wrong field types - always verify against slice.json
- DateTime type in slice.json → TypeScript `Date` type (not string)
- Event metadata fields should be optional (correlation_id?, causation_id?, etc.)
- Event metadata MUST include restaurantId and userId for multi-tenancy and authorization
- Event types follow `Event<'EventName', {...fields}, {...metadata}>` pattern
- When implementing dependent slices, reuse events from previous work - verify they exist in ContextEvents
- Events from unimplemented slices can be created based on their slice.json specifications
- **Always verify events exist** in `src/events/` and `ContextEvents.ts` before creating them - they may be pre-generated

### Event Structure Changes - Critical
When modifying an existing event structure:
1. Find all consumers: `grep -r "EventName" src/slices/`
2. Update ALL occurrences: command handlers, projections, tests, routes, API docs
3. Run `npm run build` BEFORE tests - TypeScript shows ALL files with type mismatches
4. Use the verification checklist:
   - [ ] Event definition updated in `src/events/`
   - [ ] Command handler decide() updated; routes updated
   - [ ] Own slice tests updated
   - [ ] ALL consuming slice tests updated
   - [ ] ui-prompt.md created/updated
   - [ ] Build passes; all tests pass

## Architecture

### Auto-Discovery
- Routes: `src/slices/**/routes.ts` (exports `api` function returning `WebApiSetup`)
- Processors: `src/slices/**/processor.ts` (exports `processor = { start: () => {...} }`)
- No manual registration needed - loaded automatically at server startup

### Projections Registration
All new projections must be registered in `src/common/loadPostgresEventstore.ts` in the inline projections array.

### PostgreSQL Critical Imports
```typescript
import { postgreSQLRawSQLProjection } from '@event-driven-io/emmett-postgresql';
import { sql } from '@event-driven-io/dumbo';  // NOT from emmett-postgresql!
import { ContextEvents } from '../../events/ContextEvents';  // NOT EventType!
```
- `sql()` MUST come from `@event-driven-io/dumbo`
- Use `ContextEvents` type, NOT `EventType`
- Always use `.withSchema('public')` in PostgreSQL queries

### Type Coercion
- Pongo stores numeric-looking strings (e.g., "1") as bigints (e.g., 1n)
- Use `String(value)` when comparing IDs in test assertions
- Phone numbers and similar numeric strings may need explicit `String()` conversion

## Implementation Patterns

> For full implementation templates and step-by-step guides, use the skills:
> - **STATE_CHANGE**: `/state-change-slice`
> - **STATE_VIEW**: `/state-view-slice`
> - **AUTOMATION**: `/automation-slice`

### STATE_CHANGE Slice (see `/state-change-slice` skill)
Key rules:
- Always use proper `initialState` function (not empty object `{}`) in `DeciderSpecification.for()`
- Do NOT add explicit type arguments to `DeciderSpecification.for()` - let TypeScript infer (avoids TS2558)
- Simple commands (no validation): empty state, evolve returns state unchanged
- Switch statements in evolve: always use explicit `break` to prevent fallthrough bugs

### STATE_VIEW Slice (see `/state-view-slice` skill)
Key rules:
- pongoSingleStreamProjection uses `event.metadata.streamName` as document ID
- Always verify ALL events from slice.json spec are in the `canHandle` array - auto-generated code may be incomplete
- Pre-generated projections may handle only some events; check canHandle covers all required events

### AUTOMATION Slice (see `/automation-slice` skill)
Key rules:
- Processor fetches from work queue read models using `startProcessor` helper OR direct Supabase `createServiceClient()`
- Use `.limit(1)` or `_limit: "1"` to process one item at a time
- Check if work is already done before processing
- **AUTOMATION = STATE_CHANGE + processor.ts**: processors array non-empty = automation slice
- Work queue lifecycle: add on trigger event, delete on completion event (two separate handlers in projection)
- Always update the work queue projection when the completion event is introduced
- Processor uses Supabase snake_case column names (e.g., `reservation_id` not `reservationId`)
- Use `createServiceClient()` for automation processors (bypasses RLS)

## Database & Migrations

### Migration Rules
- **NEVER modify existing migrations** - you cannot know if they are already applied
- **Always add new migrations** when adding/changing/removing columns
- Migration version: check existing files, use next sequential number
  ```bash
  ls -1 supabase/migrations/ | grep "^V" | sort -V | tail -5
  ```
- PostgreSQL does NOT have "string" type - use TEXT, VARCHAR, or CHAR
- UUID fields require valid UUID format in test data: `'123e4567-e89b-12d3-a456-426614174000'`
- UUID test data must use only valid hex characters (0-9, a-f) - invalid chars like 'g' will cause `invalid input syntax for type uuid` errors at runtime
- `ALTER TABLE ADD COLUMN IF NOT EXISTS` is safe for additive schema changes (new migration, never modify existing)

### Query Endpoints - Authentication Pattern
All projection query endpoints must:
1. Require JWT authentication via `requireUser(req, res, true)`
2. Filter results by the authenticated user's ID (`user_id` parameter)
3. Use the anon key Supabase client for queries

### Projection Patterns

**Boolean/Toggle State (e.g., online reservation active/inactive):**
- Add a flag column (e.g., `is_online_active BOOLEAN NOT NULL DEFAULT FALSE`) to the table
- On entity registration: insert with flag = false
- On activate event: update flag = true using upsert `.onConflict().merge()`
- On deactivate event: update flag = false using upsert `.onConflict().merge()`
- Query API: filter with `findAll({is_online_active: true})`
- Use aggregate ID as PRIMARY KEY for single-status-per-entity tracking
- Extract restaurantId from `event.metadata`, not `event.data`

**Add/Remove Projections:**
- Insert with `.onConflict(key).merge()` for idempotent upserts
- Delete with `.where(condition).del()`
- Use composite primary keys for multi-tenant scenarios: `(table_name, restaurant_id)`
- Conditional insert: filter in evolve function `if (!data.reservable) return [];`

**Work Queue Projections:**
- Add items on work-appears event (with initial status fields)
- Update fields as work progresses using `.where().update()`
- Optional: remove on completion with `.where().del()`

**JSONB Array Operations:**
- Add to array: `WHEN col @> '"id"'::jsonb THEN col ELSE col || '"id"'::jsonb`
- Remove from array: `col - 'id'`
- Initialize: `JSONB DEFAULT '[]'::jsonb`
- Use raw SQL for complex JSONB operations rather than Knex query builder

**Array-to-String for Display:**
- Convert arrays to comma-separated strings in projection, not in the UI
- `Array.isArray(data.field) ? data.field.join(', ') : data.field || ''`
- Store as TEXT column, not array type

### Date Handling
- slice.json DateTime → TypeScript `Date` type in events
- Routes: `date: new Date(assertNotEmpty(req.body.date))`
- Test data: use actual Date objects: `new Date('2026-03-15T10:00:00Z')`
- PostgreSQL date assertion: `new Date(result[0].date).toISOString() === date.toISOString()`

## Error Handling
- HTTP 409 for conflict/duplicate errors
- HTTP 500 for server errors
- Provide user-friendly error messages for business rule violations (e.g., "already.active")

## Activate/Deactivate Pair Pattern

Complementary commands sharing the same events:
- Both commands track same boolean state but validate opposite conditions:
  - Activate: `if (state.active) throw "already.active"`
  - Deactivate: `if (!state.active) throw "not.active"`
- Shared evolve function handles BOTH activation and deactivation events
- Events created for STATE_VIEW projection can be reused by STATE_CHANGE commands
- Implementation order: events → STATE_VIEW projection → Activate command → Deactivate command
- Test coverage: both directions, including state transitions (given/when/then)

## Common Gotchas
- Auto-generated files may have invalid TypeScript syntax ("Slice:" prefix in type names) - delete and recreate
- Migration files may get auto-numbered incorrectly (V99) - renumber to follow sequence
- Chaining `.given()` directly on `DeciderSpecification.for()` causes "is not a function" error
- macOS filesystem is case-insensitive but TypeScript imports are case-sensitive - use exact folder names
- Projection `canHandle` array may be incomplete in auto-generated code - verify against slice.json
- Switch fallthrough bugs: always use explicit `break` in evolve function switch cases
- Tests for state-dependent commands must include given events to set up proper initial state
- **PostgreSQLProjectionSpec type**: use specific event union type (e.g., `ReservationRequested | ReservationConfirmed`) NOT `ContextEvents` when projection handles only a subset of events - avoids TS2322 type mismatch
- **Slice.json empty specifications**: when `specifications: []`, create meaningful tests that cover the read model's event dependencies and data flow
- **Dependency-only events**: if an event is listed as a dependency in slice.json but contributes no fields to the read model, include it in `canHandle` as a no-op (return `[]`) for completeness
- **Spec assertions may target a different read model**: slice.json `then` assertions can reference a read model other than the slice's own projection - read specs carefully to identify which read model each assertion targets
- **Knex chaining bug**: `.insert({...}).del()` does NOT insert - it deletes. Always use `.insert().onConflict().merge()` for upserts in work-queue projections
- **Timezone in buildReservationTimeRange**: stores timestamps as UTC after converting from Europe/Berlin local time. Test assertions: `14:00` Berlin CET (UTC+1) = `13:00` UTC. Account for DST (CEST = UTC+2 in summer)
- **Status drift**: slice status in index.json may lag behind actual implementation. Always check if implementation exists before starting new work on a "Planned" slice
- **Pre-existing test failures** (e.g., timezone-related) do not block implementation of a new slice - note them and move on
- **Paired commands on same aggregate** (e.g., ShowUp/NoShow, Activate/Deactivate) share the same stream; both use the aggregate's ID as streamId
- **Pre-generated routes use wrong streamId**: routes for `reservation` aggregate may pass `restaurantId` instead of `reservationId` to the CommandHandler - always verify the stream ID matches the aggregate
- **Error testing with DeciderSpecification**: to test error cases, use `assert.throws(() => given([...]).when(cmd).then([]))` - the spec does not wrap errors itself

## UI Documentation (ui-prompt.md)

Each STATE_CHANGE slice should include `ui-prompt.md` with:
1. Endpoint URL + HTTP method
2. Payload example with realistic JSON data
3. Required headers (correlation_id, Authorization, etc.)
4. Response format (success/error)
5. Field descriptions + example API client code and curl commands

For STATE_VIEW query slices: include both query endpoint documentation and database table definition.

