# Project Configuration

## Framework & Styling
- **CSS Framework**: Use Bulma CSS exclusively for all styling
- **Assumption**: Bulma CSS is already available and imported in the project
- **Styling Guidelines**:
    - Use Bulma's utility classes and components
    - Follow Bulma's naming conventions and class structure
    - Leverage Bulma's responsive design features
    - Prefer Bulma components over custom CSS

## File Structure Constraints
- **Strict Path Limitation**: All TypeScript files must be created within `src/slices/{slicename}/*.ts`
- **Slice Organization**: Each feature/domain should be organized as a separate slice
- **File Types**: Only `.ts` files are allowed within slice directories
- **No Nested Directories**: Keep flat structure within each slice folder

## Code Standards
- **Language**: TypeScript only
- **Module System**: Use ES modules (import/export)
- **Type Safety**: Ensure all code is properly typed
- **File Naming**: Use kebab-case for file names (e.g., `user-service.ts`, `payment-handler.ts`)

## Slice Naming Convention
- Use descriptive, domain-focused slice names
- Examples: `user-management`, `payment-processing`, `event-modeling`, `workshop-booking`
- Keep slice names lowercase with hyphens

## Development Guidelines
1. Each slice should be self-contained and focused on a specific domain
2. Use Bulma's grid system, components, and utilities for all UI-related code
3. Maintain clear separation of concerns within each slice
4. Follow TypeScript best practices for type definitions and interfaces

## Example Slice Structure
```
src/slices/
├── user-management/
│   ├── user-service.ts
│   ├── user-types.ts
│   └── user-handlers.ts
├── workshop-booking/
│   ├── booking-service.ts
│   ├── booking-types.ts
│   └── booking-handlers.ts
└── event-modeling/
    ├── model-service.ts
    ├── model-types.ts
    └── model-handlers.ts
```

## Bulma Integration Notes
- Utilize Bulma's component library: navbar, cards, buttons, forms, modals, etc.
- Apply Bulma's spacing utilities: `m-*`, `p-*`, `has-text-*`, `has-background-*`
- Use Bulma's flexbox utilities for layouts
- Implement responsive design with Bulma's breakpoint classes
- Leverage Bulma's color palette and typography classes