---
name: state-view-slice
description: builds a state-view slice from an event model
---

## Overview

State View Slices are read model projections that build table-based views from events. They consume events and project them into queryable database tables using PostgreSQL.

If the processors-array in the slice json is not empty. Treat this as an AUTOMATION Slice. Load the skill for automation slice.

## Critical Requirements

### Restaurant ID Requirement
- **CRITICAL**: ALL database tables MUST have a `restaurant_id` column (snake_case)
- **CRITICAL**: ALL events MUST have `restaurantId` in their metadata (camelCase)
- **NEVER** use `locationId` or `location_id` - these are outdated and forbidden
- This ensures proper multi-tenancy and data isolation

## Implementation Steps

When creating a state-view slice, you MUST create the following files:

1. **src/slices/{SliceName}/{SliceName}Projection.ts** - Projection handler
2. **src/slices/{SliceName}/{SliceName}.test.ts** - Projection tests
3. **src/slices/{SliceName}/routes.ts** - Query API endpoint
4. **supabase/migrations/V{N}__{tablename}.sql** - Database migration file
5. **src/slices/{SliceName}/ui-prompt.md - prompt to build the UI

## Projection Structure

Every projection file follows this pattern:

### 1. Imports
```typescript
import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {EventType} from '../../events/EventType';
```

### 2. Read Model Types
Define TypeScript types for the read model:
```typescript
export type {Name}ReadModelItem = {
    field1?: type,
    field2?: type,
    // fields from projection
}

export type {Name}ReadModel = {
    data: {Name}ReadModelItem[],
}

export const tableName = 'table_name';
```

### 3. Knex Instance Helper
```typescript
export const getKnexInstance = (connectionString: string): Knex => {
    return knex({
        client: 'pg',
        connection: connectionString,
    });
};
```

### 4. Projection Definition
```typescript
export const {Name}Projection = postgreSQLRawSQLProjection<EventType>({
    canHandle: ["Event1", "Event2"],  // events this projection handles
    evolve: (event, context) => {
        const {type, data} = event;
        const db = getKnexInstance(context.connection.connectionString);

        switch (type) {
            case "Event1":
                return sql(db(tableName)
                    .withSchema('public')
                    .insert({
                        field1: data.field1,
                        field2: data.field2,
                    })
                    .onConflict('id_field')  // upsert on conflict
                    .merge({field1: data.field1, field2: data.field2})
                    .toQuery());

            case "Event2":
                return sql(db(tableName)
                    .withSchema('public')
                    .where('id_field', data.id)
                    .update({
                        field1: data.field1,
                    })
                    .toQuery());

            default:
                return [];
        }
    }
});
```

5. Every Projection must be registered in loadPostgresEventStore.ts
```
export const findEventstore = async () => {

    return getPostgreSQLEventStore(postgresUrl, {
        schema: {
            autoMigration: "CreateOrUpdate"
        },
        projections: projections.inline([
            <register projection here>
        ]),

    });

}
```

## Key Patterns

### Insert with Upsert (Merge on Conflict)
Use this pattern for events that create or update records:
```typescript
return sql(db(tableName)
    .withSchema('public')
    .insert({ /* fields */ })
    .onConflict('id_field')
    .merge({ /* fields to update */ })
    .toQuery());
```

### Update Pattern
Use this for events that only update existing records:
```typescript
return sql(db(tableName)
    .withSchema('public')
    .where('id_field', data.id)
    .update({ /* fields */ })
    .toQuery());
```

### Delete Pattern
Use this for events that remove records:
```typescript
return sql(db(tableName)
    .withSchema('public')
    .where('id_field', data.id)
    .delete()
    .toQuery());
```

## Testing

Every projection MUST have tests using PostgreSQLProjectionSpec with Testcontainers:

```typescript
import {before, after, describe, it} from "node:test";
import {PostgreSQLProjectionAssert, PostgreSQLProjectionSpec} from "@event-driven-io/emmett-postgresql";
import {{Name}Projection} from "./{Name}Projection";
import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {EventType} from "../../events/EventType"
import knex, {Knex} from 'knex';
import assert from 'assert';
import {runFlywayMigrations} from "../../common/testHelpers";

describe('{Name} Specification', () => {
    let postgres: StartedPostgreSqlContainer;
    let connectionString: string;
    let db: Knex;

    let given: PostgreSQLProjectionSpec<EventType>

    before(async () => {
        postgres = await new PostgreSqlContainer("postgres").start();
        connectionString = postgres.getConnectionUri();

        db = knex({
            client: 'pg',
            connection: connectionString,
        });

        await runFlywayMigrations(connectionString);

        given = PostgreSQLProjectionSpec.for({
            projection: {Name}Projection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    it('spec: {Name} - scenario', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({
                client: 'pg',
                connection: connStr,
            });

            try {
                const result = await queryDb('table_name')
                    .withSchema('public')
                    .select('*');

                assert.strictEqual(result.length, 1);
                // add more assertions
            } finally {
                await queryDb.destroy();
            }
        };

        await given([{
            type: 'EventName',
            data: { /* event data */ },
            metadata: {streamName: 'stream-id'}
        }])
            .when([])  // additional events to process
            .then(assertReadModel);
    });
});
```

## Query API Routes

Every read model exposes a GET endpoint to fetch data:

```typescript
import {Request, Response, Router} from 'express';
import {{Name}ReadModel, tableName} from "./{Name}Projection";
import {WebApiSetup} from "@event-driven-io/emmett-expressjs";
import createClient from "../../supabase/api";
import {readmodel} from "../../core/readmodel";
import {requireUser} from "../../supabase/requireUser";

export const api =
    (
        // external dependencies
    ): WebApiSetup =>
        (router: Router): void => {
            router.get('/api/query/{name}-collection', async (req: Request, res: Response) => {
                try {
                    const principal = await requireUser(req, res, true);
                    if (principal.error) {
                        return;
                    }

                    const userId = principal.user.id;
                    const id = req.query._id?.toString();

                    const supabase = createClient()

                    const query: any = {};
                    delete query._id;

                    const data: {Name}ReadModel | {Name}ReadModel[] | null =
                        id ? await readmodel(tableName, supabase).findById<{Name}ReadModel>("id_field", id) :
                    await readmodel(tableName, supabase).findAll<{Name}ReadModel>(query)

                    // Serialize, handling bigint properly
                    const sanitized = JSON.parse(
                        JSON.stringify(data || [], (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value
                        )
                    );

                    return res.status(200).json(sanitized);
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ok: false, error: 'Server error'});
                }
            });
        };
```

Make sure to annotate it with OpenAPI annotations in the comments, so it´s picked up by the open-api ui.

## Database Migrations

Each read model requires a migration file in `supabase/migrations/`:

**Naming Convention:** `V{N}__{tablename}.sql`
- `V{N}` - Version number (sequential: V1, V2, V3, etc.)
- `{tablename}` - Lowercase table name matching the projection's `tableName`

**Example:** `V8__locations.sql`

```sql
-- Create {tablename} table
CREATE TABLE IF NOT EXISTS "public"."{tablename}"
(
    id_field TEXT PRIMARY KEY,
    field1 TEXT,
    field2 INTEGER,
    field3 TEXT,
    restaurant_id uuid NOT NULL
);
```

### Migration Guidelines:
- Use `IF NOT EXISTS` for idempotency
- Define PRIMARY KEY on the ID field used in `onConflict()`
- **CRITICAL**: ALWAYS include `restaurant_id uuid NOT NULL` column (required for multi-tenancy)
- Use appropriate SQL types (TEXT, INTEGER, BOOLEAN, TIMESTAMP, etc.)
- Keep column names in snake_case (PostgreSQL convention)
- Place files in `supabase/migrations/` directory
- Migrations run automatically via Flyway in tests

## File Structure

```
src/slices/{SliceName}/
├── {SliceName}Projection.ts    # Projection logic
├── {SliceName}.test.ts          # Tests
└── routes.ts                    # Query endpoint

supabase/migrations/
└── V{N}__{tablename}.sql        # Database schema
```
## slice json
in each slice folder, generate a file .slice.json
```
{
    "id" : "<slice id>",
    "slice": "<slice title>",
    "context": "<contextx>",
    "link": "https://miro.com/app/board/<board-id>=/?moveToWidget=<slice id>"
}
```


## References

- See `templates/Locations/` for simple single-event projection example
- See `templates/Tables/` for multi-event projection with updates
- See `templates/V8__locations.sql` for migration example
- See `templates/V2__tables.sql` for migration example


## UI Prompt

to build the UI prompt, list the following facts:

```
to build the UI - use this table "<schema>.<table_name>"

Payload example:
<payload example as JSON>

this is the table definition:
<table definition as SQL DDL>
```