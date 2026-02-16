---
name: state-change-slice
description: builds a state-change slice from an event model
---

## Overview

State Change Slices are slices that change the system by processing a command. Each slice implements the Command-Event pattern using event sourcing.

## Critical Requirements

### Restaurant ID Requirement
- **CRITICAL**: ALL events MUST have `restaurantId` in their metadata (camelCase)
- **NEVER** use `locationId` or `location_id` - these are outdated and forbidden
- **CRITICAL**: ALL database tables MUST have a `restaurant_id` column (snake_case)
- This ensures proper multi-tenancy and data isolation

## Implementation Steps

When creating a state-change slice, you MUST create the following files in `src/slices/{SliceName}/`:

1. **{SliceName}Command.ts** - Command handler implementation
2. **{SliceName}.test.ts** - Test specifications
3. **routes.ts** - API endpoint (unless explicitly told not to)
4. **src/slices/{SliceName}/ui-prompt.md - prompt to build the UI


## Command Handler Structure

Every Command handler file follows this pattern:

### 1. Imports
```typescript
import type {Command} from '@event-driven-io/emmett'
import {CommandHandler} from '@event-driven-io/emmett';
import {ContextEvents} from "../../events/ContextEvents";
import {findEventstore} from "../../common/loadPostgresEventstore";
```

### 2. Command Type Definition
Define the command with:
- Command name (matches slice name)
- Data fields from specification
- Standard metadata fields

```typescript
export type {CommandName}Command = Command<'{CommandName}', {
    // data fields from spec
},
    {
        correlation_id?: string,
        causation_id?: string,
        now?: Date,
        streamName?: string,
    }>;
```

### 3. State Type
Define state needed for business logic validation:
```typescript
export type {CommandName}State = {
    // fields needed for validation
    // often empty {} if no validation needed
}

export const {CommandName}InitialState = (): {CommandName}State => ({
    // initial state
});
```

### 4. Evolve Function
Updates state based on events (event sourcing projection):
```typescript
export const evolve = (
    state: {CommandName}State,
    event: ContextEvents,
): {CommandName}State => {
    const {type, data} = event;

    switch (type) {
        case "{EventName}":
            // update state based on event
            return { ...state, /* updates */ };
        default:
            return state;
    }
};
```

### 5. Decide Function
Business logic that validates command and returns events:
```typescript
export const decide = (
    command: {CommandName}Command,
    state: {CommandName}State,
): ContextEvents[] => {
    // validation logic
    // throw errors if validation fails

    return [{
        type: '{EventName}',
        data: {
            // event data fields
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
            // these 2 are mandatory
            restaurantId: command.metadata?.restaurantId,
            userId: command.metadata?.userId
        }
    }];
};
```

### 6. Command Handler & Export
```typescript
const {CommandName}CommandHandler = CommandHandler<{CommandName}State, ContextEvents>({
    evolve,
    initialState: {CommandName}InitialState
});

export const handle{CommandName} = async (id: string, command: {CommandName}Command) => {
    const eventStore = await findEventstore()
    const result = await {CommandName}CommandHandler(eventStore, id, (state: {CommandName}State) => decide(command, state))
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition
    }
}
```

## Key Patterns

### Metadata Handling
- **Optional chaining**: Use `command.metadata?.correlation_id` (some examples use this)
- **Direct access**: Use `command.metadata.correlation_id` (other examples use this)
- **CRITICAL**: ALWAYS use `restaurantId` (camelCase) - NEVER use `locationId` or `location_id` (outdated)
- restaurantId: command.metadata?.restaurantId,
- userId: command.metadata?.userId
- Be consistent within your implementation

### Destructuring
Two patterns observed:
1. Direct access: `command.data.fieldName`
2. Destructure: `const {field1, field2} = command.data;`

Both are acceptable - choose based on readability.

### State Validation
- Only include fields in state that are needed for validation
- Many simple commands have empty state `{}`
- Complex validations (like AddLocation) track sets or maps in state

## Testing

Every command MUST have tests using DeciderSpecification:

```typescript
import {DeciderSpecification} from '@event-driven-io/emmett';
import {{CommandName}Command, {CommandName}State, decide, evolve} from "./{CommandName}Command";
import {describe, it} from "node:test";

describe('{CommandName} Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: () => ({})
    });

    it('spec: {test description}', () => {
        const command: {CommandName}Command = {
            type: '{CommandName}',
            data: {
                // test data
            },
            metadata: {now: new Date()},
        }

        given([/* precondition events */])
            .when(command)
            .then([{
                type: '{EventName}',
                data: {
                    // expected event data
                },
                metadata: {}
            }])
    });
});
```

## Routes (API Endpoint)

Unless explicitly told not to, create a routes.ts file:

```typescript
import {Router, Request, Response} from 'express';
import {{CommandName}Command, handle{CommandName}} from './{CommandName}Command';
import {requireUser} from "../../supabase/requireUser";
import {WebApiSetup} from "@event-driven-io/emmett-expressjs";
import {assertNotEmpty} from "../../common/assertions";

export type {CommandName}RequestPayload = {
    // fields matching command data (all optional with ?)
}

export type {CommandName}Request = Request<
    Partial<{ id: string }>,
    unknown,
Partial<{CommandName}RequestPayload>
>;

export const api =
    (
        // external dependencies
    ): WebApiSetup =>
        (router: Router): void => {
            router.post('/api/{commandname}/:id', requireRestaurantAccess, async (req: {CommandName}Request, res: Response) => {
                const principal = await requireUser(req, res, false);
                if (principal.error) {
                    return res.status(401).json(principal);
                }

                const correlation_id = req.header("correlation_id") ?? req.params.id
                const causation_id = req.params.id
                const restaurantId = (req as any).restaurant_id
                const userId = (req as any).user_id

                try {
                    const command: {CommandName}Command = {
                        data: {
                            // map from req.body with assertNotEmpty
                        },
                        metadata: {
                            correlation_id: correlation_id,
                            causation_id: causation_id
                        },
                        type: "{CommandName}"
                    }

                    if (!req.params.id) throw "no id provided"

                    const result = await handle{CommandName}(assertNotEmpty(req.params.id), command);

                    res.set("correlation_id", correlation_id)
                    res.set("causation_id", causation_id)

                    return res.status(200).json({
                        ok: true,
                        next_expected_stream_version: result.nextExpectedStreamVersion?.toString(),
                        last_event_global_position: result.lastEventGlobalPosition?.toString()
                    });
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ok: false, error: 'Server error'});
                }
            });
        };
```

Make sure to annotate it with OpenAPI annotations in the comments, so it´s picked up by the open-api ui.


## Business Logic

In *Command.ts
Evolve-Function provides the state we can use to validate:

```
export const evolve = (
    state: PlanVacationState,
    event: ContextEvents,
): PlanVacationState => {
    const {type, data} = event;

    switch (type) {
        // case "..Event":
        case 'VacationPlanned':
            state.plannedVacations.push({id: event.data.vacation_id, from: event.data.from, to: event.data.to})
            return state;
        case 'VacationCancelled':
            state.plannedVacations = state.plannedVacations.filter(it => it.id !== event.data.vacation_id)
            return state;
        default:
            return state;
    }
};

```

The Decide-Function then makes the decision ( success or error )
```
export const decide = (
    command: PlanVacationCommand,
    state: PlanVacationState,
): ContextEvents[] => {

    state.plannedVacations.forEach(vacation => {
        if (
            command.data.from <= vacation.to &&
            command.data.to >= vacation.from
        ) {
            throw {error: "conflicting_vacations"}
        }
    })

    return [{
        type: "VacationPlanned",
        data: {
          ...
        },
        metadata: {
            ...
        }
    }]
};
```

## Error  Handling

In routes.ts, define an error mapper:
```
const errorMapping = (error:string): string => {

    switch(error) {
        case "conflicting_vacations" : return "Achtung, Betriebsurlaub überschneidet sich."
        default: return "Leider ist ein Fehler aufgetreten"
    }
}
```

use this directly in the route.

```
  router.post('/api/planvacation/:id', requireRestaurantAccess, async (req: PlanVacationRequest, res: Response) => {
                ...
                } catch (err:any) {
                    console.error(err);
                    return res.status(500).json({ok: false, error:  errorMapping(err.error)});
                }
            });
        };
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

- See `templates/AddLocation` for samples

## UI Prompt

```
to build the UI - use this endpont "endpoint URL"

Payload example:
<payload example as JSON>

make sure to put endpoints into the api.ts and follow the rules:
- provide all headers

```