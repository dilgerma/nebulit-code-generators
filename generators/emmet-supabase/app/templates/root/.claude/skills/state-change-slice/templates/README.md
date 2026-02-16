# State-Change Slice Templates

This folder contains real working examples from the codebase to use as templates.

## Simple Example: AddTable

**Files:**
- `sample.ts.sample` - Command handler
- `sample-test.ts.sample` - Tests
- `routes.ts.sample` - API endpoint

**Use this when:**
- No business logic validation needed
- Simple event emission
- Empty state `{}`
- Direct command-to-event mapping

**Key features:**
- Destructuring pattern for command data
- Direct metadata access (no optional chaining)
- Simple decide function with no validation

## Complex Example with Validation: AddLocation

**Files:**
- `AddLocation/AddLocationCommand.ts.sample` - Command handler
- `AddLocation/AddLocation.test.ts.sample` - Tests with validation scenarios
- `AddLocation/routes.ts.sample` - API endpoint with error handling

**Use this when:**
- Business logic validation required
- State tracking needed (e.g., tracking unique IDs)
- Error conditions must be tested
- Custom error handling in API

**Key features:**
- State management with Set for uniqueness checking
- Evolve function that updates state
- Validation in decide function with error throwing
- Multiple test scenarios (success and error cases)
- Custom HTTP status codes (409 for conflict)
- Specific error message handling in routes

## Other Files

- `sample-input.json` - Example JSON input structure for event modeling
