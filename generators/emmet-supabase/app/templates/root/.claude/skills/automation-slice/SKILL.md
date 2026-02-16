---
name: automation-slice
description: builds an automation slice from an event model
---

### Critical understanding

Make sure to read the Agents.md file before building anything.

If the processors-Array is not empty, it´s an automation slice.

Important - an automation slice is "just" a state-change slice with an additional automation that triggers the command.
So also read the skill for 'state-change-slice'

## Critical Requirements

### Restaurant ID Requirement
- **CRITICAL**: ALL events MUST have `restaurantId` in their metadata (camelCase)
- **NEVER** use `locationId` or `location_id` - these are outdated and forbidden
- **CRITICAL**: ALL database tables (including TODO lists) MUST have a `restaurant_id` column (snake_case)
- This ensures proper multi-tenancy and data isolation

## Overview

Automations are processes that happen in the background, based on a TODO List.
TODO Lists are always tables (read models) and each row in the table is a TODO Item.

The automation is only responsible to:
1. Fetch items from the TODO List (read model)
2. Fire the command for each item
3. Repeat on a schedule using CRON

## Architecture Pattern

```
┌─────────────────┐
│  TODO List      │  (Read Model - Inbound Dependency)
│  "items to do"  │  Example: "clerks_to_invite", "items_to_fetch"
└────────┬────────┘
         │
         │ reads
         │
┌────────▼────────┐
│   processor.ts  │  (CRON scheduled automation)
│                 │  - Fetches TODO items
│                 │  - Fires commands
└────────┬────────┘
         │
         │ invokes
         │
┌────────▼────────┐
│ CommandHandler  │  (State-change logic)
│   Command.ts    │  - decide() function
│   routes.ts     │  - evolve() function
└─────────────────┘
```

## Implementation Structure

An automation slice consists of:
1. **processor.ts** - CRON automation that fetches TODO items and fires commands
2. **[Command]Command.ts** - Command handler with decide/evolve logic
3. **routes.ts** - HTTP API endpoint for manual command invocation

## Processor Configuration

Two patterns exist in the codebase:

### Pattern 1: Using startProcessor helper (Recommended)

```typescript
import {ProcessorConfig, ProcessorTodoItem, startProcessor} from "../../process/process";
import {handleYourCommand} from "./YourCommandCommand";

export type ItemToProcess = {
    itemId: string,
    // other fields from read model
}

const config: ProcessorConfig = {
    schedule: "*/5 * * * * *", // Every 5 seconds (cron format)
    endpoint: "your-todo-list-collection", // Read model endpoint
    query: {
        "status": "OPEN",    // Filter criteria
        "_limit": "1"         // Process one at a time
    }
}

const handler = async (item: ItemToProcess & ProcessorTodoItem) => {
    console.log(`Processing item: ${item.itemId}`)

    try {
        await handleYourCommand(`aggregate-${item.itemId}`, {
            type: "YourCommand",
            data: {
                itemId: item.itemId,
                // map other fields
            },
            metadata: {}
        })

        console.log(`Successfully processed item: ${item.itemId}`)
    } catch (error) {
        console.error(`Error processing item ${item.itemId}:`, error)
    }
}

export const processor = {
    start: () => {
        console.log("[YourProcessor] Starting processor...")
        startProcessor<ItemToProcess>(config, handler)
    }
}
```

### Pattern 2: Direct Supabase query (Legacy)

```typescript
import {ProcessorConfig} from "../../process/process";
import {YourCommand, handleYourCommand} from "./YourCommandCommand";
import cron from "node-cron";
import {createServiceClient} from "../../supabase/api";

const config: ProcessorConfig = {
    schedule: '*/30 * * * * *',  // Every 30 seconds
    endpoint: "your_todo_table",  // Supabase table name
}

export const processor = {
    start: () => {
        cron.schedule(config.schedule, async () => {
            console.log("Running process")
            let client = createServiceClient()
            let result = await client.from(config.endpoint).select("*")

            if (result.count == 0) {
                console.log(`Nothing to do for ${config.endpoint}`)
                return;
            }

            for (const item of result.data ?? []) {
                const command: YourCommand = {
                    type: "YourCommand",
                    data: {
                        itemId: item.itemId!
                    },
                    metadata: {}
                }

                const id = item.itemId
                if (!id) {
                    throw `Cannot process Command ${command.type}. No Id available.`
                }
                await handleYourCommand(id, command)
            }
        })
    }
}
```

## CRON Schedule Format

```
┌───────────── second (0-59)
│ ┌─────────── minute (0-59)
│ │ ┌───────── hour (0-23)
│ │ │ ┌─────── day of month (1-31)
│ │ │ │ ┌───── month (1-12)
│ │ │ │ │ ┌─── day of week (0-7)
│ │ │ │ │ │
* * * * * *
```

Common schedules:
- `*/5 * * * * *` - Every 5 seconds
- `*/30 * * * * *` - Every 30 seconds
- `0 */1 * * * *` - Every minute
- `0 0 * * * *` - Every hour

## Real Examples from Codebase

### Example 1: ConfirmInvitation (Clerk management)

**TODO List Read Model**: `clerks_to_invite` table
**Automation**: `src/slices/ConfirmInvitation/processor.ts`
**Command**: `ConfirmInvitationCommand`
**Event Emitted**: `ClerkInvitationConfirmed`

```typescript
// processor.ts
const config: ProcessorConfig = {
    schedule: '*/30 * * * * *',
    endpoint: "clerks_to_invite",
}

// Fetches clerks from TODO list and confirms their invitations
for (const clerk of result.data ?? []) {
    const command: ConfirmInvitationCommand = {
        type: "ConfirmInvitation",
        data: {
            clerkId: clerk.clerkId!
        },
        metadata: {}
    }
    await handleConfirmInvitation(clerk.clerkId, command)
}
```

in each slice folder, generate a file .slice.json
```
{
    "id" : "<slice id>",
    "slice": "<slice title>",
    "context": "<contextx>",
    "link": "https://miro.com/app/board/<board-id>=/?moveToWidget=<slice id>"
}
```

## Key Points

1. **TODO List Naming**: Use format `<things>_to_<action>` (e.g., `clerks_to_invite`, `items_to_fetch`)
2. **Read Model Endpoint**: TODO list is accessed via `/api/query/<name>-collection` endpoint
3. **Processor Types**: Define TypeScript types for TODO items matching read model structure
4. **Error Handling**: Always wrap command execution in try-catch, log errors but continue processing
5. **Schedule Wisely**: Balance responsiveness vs system load (30 seconds is common for production)
6. **Status Management**: TODO list typically has a `status` field ("OPEN", "PROCESSING", "DONE")
7. **Limit Processing**: Use `_limit: "1"` to process one item at a time, preventing concurrent issues
8. **Stream Naming**: Use aggregate-based stream names (e.g., `catalogue-${itemId}`)

## Implementation Steps

1. **Read the input JSON** from templates/sample-input.json
2. **Create processor.ts** following one of the patterns above
3. **Implement state-change slice** using the 'state-change-slice' skill
    - Creates `[Command]Command.ts` with decide/evolve functions
    - Creates `routes.ts` for HTTP API endpoint
4. **Register processor** in main application startup
5. **Ensure TODO List exists** as a read model (separate slice handles this)

## Sample Input Structure

Sample input: read 'templates/sample-input.json'

The input defines:
- **processors[]**: Array of automation definitions
    - title: Automation name
    - dependencies: Inbound (TODO list) and Outbound (Command) connections
- **commands[]**: Commands triggered by the automation
- **events[]**: Events emitted by the commands


