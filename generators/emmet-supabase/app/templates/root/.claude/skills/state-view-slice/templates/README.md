# State-View Slice Templates

This folder contains real working examples from the codebase to use as templates for read model projections.

## Simple Example: Locations

**Files:**
- `Locations/LocationsProjection.ts.sample` - Single-event projection
- `Locations/Locations.test.ts.sample` - Projection test
- `Locations/routes.ts.sample` - Query API endpoint
- `V8__locations.sql` - Database migration

**Use this when:**
- Single event type creates/updates the read model
- Simple insert with upsert (merge on conflict)
- Basic read model with a few fields
- No complex transformations needed

**Key features:**
- `canHandle: ["LocationAdded"]` - handles one event type
- Insert with `.onConflict().merge()` for upsert behavior
- Simple field mapping from event to database
- Query by ID or list all

## Complex Example: Tables

**Files:**
- `Tables/TablesProjection.ts.sample` - Multi-event projection
- `Tables/Tables.test.ts.sample` - Test with multiple events
- `Tables/routes.ts.sample` - Query API endpoint
- `V2__tables.sql` - Database migration

**Use this when:**
- Multiple event types update the same read model
- Different operations (insert, update, delete)
- Need to handle event sequences
- More complex state management

**Key features:**
- `canHandle: ['TableAdded', 'TableUpdated']` - handles multiple events
- Different SQL operations per event type:
  - `TableAdded` - insert with upsert
  - `TableUpdated` - direct update by ID
- Test uses `given([...]).when([...]).then(...)` pattern for event sequences
- Shows how to verify multiple records and updates

## Migration Files

**V8__locations.sql** - Simple table with TEXT fields
**V2__tables.sql** - Table with mixed types (TEXT, INTEGER)

All tables need the restaurant_id

### Migration Naming:
- Format: `V{N}__{tablename}.sql`
- Sequential numbers (V1, V2, V3, etc.)
- Double underscore before table name
- Lowercase table name

### Migration Patterns:
```sql
-- Always use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS "public"."table_name"
(
    -- Primary key matching the onConflict field
    id_field TEXT PRIMARY KEY,

    -- Use appropriate SQL types
    text_field TEXT,
    number_field INTEGER,
    bool_field BOOLEAN,
    date_field TIMESTAMP
);
```

## Query Endpoint Patterns

Both examples show the standard query endpoint pattern:
- GET `/api/query/{name}-collection`
- Optional `?_id=xxx` parameter for single record
- Returns array or single object
- Requires authentication via `requireUser`
- Uses `readmodel` helper for database queries
- Handles bigint serialization

## Testing Patterns

### Setup:
- Use Testcontainers for PostgreSQL
- Run Flyway migrations before tests
- Create Knex instance for assertions

### Assertion Pattern:
```typescript
const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString}) => {
    const queryDb = knex({ client: 'pg', connection: connectionString });
    try {
        const result = await queryDb('table_name').select('*');
        // assertions
    } finally {
        await queryDb.destroy();
    }
};
```

### Event Flow:
- `given([...])` - initial events to set up state
- `when([...])` - events to process during test
- `then(assertReadModel)` - verify final state
