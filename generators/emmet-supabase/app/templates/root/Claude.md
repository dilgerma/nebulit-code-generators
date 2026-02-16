# Project Configuration

Read Events in src/events to understand the global structure.

## Framework & Styling

- **CSS Framework**: Use Bulma CSS exclusively for all styling
- **Assumption**: Bulma CSS is already available and imported in the project
- **Styling Guidelines**:
    - Use Bulma's utility classes and components
    - Follow Bulma's naming conventions and class structure
    - Leverage Bulma's responsive design features
    - Prefer Bulma components over custom CSS

## File Structure Constraints

- **Strict Path Limitation**: if not instructed otherwise, only check `src/slices/{slicename}/*.ts`
- **Slice Organization**: Each feature/domain should be organized as a separate slice

## Code Standards

- **Language**: TypeScript only
- **Module System**: Use ES modules (import/export)
- **Type Safety**: Ensure all code is properly typed

## Development Guidelines

1. Each slice should be self-contained and focused on a specific domain
2. Use Bulma's grid system, components, and utilities for all UI-related code
3. Maintain clear separation of concerns within each slice
4. Follow TypeScript best practices for type definitions and interfaces

Only check src/slices/{slice}/*.ts, do not check subfolders, if not explicitely tasked to build the UI.
If not tasked explicitely to change routes, ignore routes*.ts

Ignore case for files and slices in prompts. "CartItems" slice is the same as "cartitemsrun t"

Do not change files with tests unless explicitely instructed: *.test.ts

After you are done, automatically run the tests for the slice that was edited.

## Example Slice Structure

```
src/slices/
├── {slice-name}/
│   ├── CommandHandler.ts
│   ├── ui/
│   └── routes.ts
```

## Bulma Integration Notes

- Utilize Bulma's component library: navbar, cards, buttons, forms, modals, etc.
- Apply Bulma's spacing utilities: `m-*`, `p-*`, `has-text-*`, `has-background-*`
- Use Bulma's flexbox utilities for layouts
- Implement responsive design with Bulma's breakpoint classes
- Leverage Bulma's color palette and typography classes