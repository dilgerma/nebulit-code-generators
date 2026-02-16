# Swagger UI & OpenAPI Documentation

## Overview

This project includes Swagger UI for interactive API documentation and OpenAPI specification generation.

## Quick Start

1. Start the development server:

```bash
npm run dev
```

2. Open Swagger UI in your browser:

```
http://localhost:3000/api-docs
```

3. View the OpenAPI JSON specification:

```
http://localhost:3000/swagger.json
```

## Documentation

The API documentation is automatically generated from JSDoc comments in your route files using `swagger-jsdoc`.

### Adding Documentation to Routes

Add JSDoc comments above your route handlers with OpenAPI/Swagger syntax:

```typescript
/**
 * @swagger
 * /api/query/shifts-collection:
 *   get:
 *     summary: Get shifts collection
 *     description: Retrieve all shifts or a specific shift by ID
 *     tags:
 *       - Shifts
 *     parameters:
 *       - in: query
 *         name: _id
 *         schema:
 *           type: string
 *         description: Optional shift ID to fetch a specific shift
 *     responses:
 *       200:
 *         description: Successfully retrieved shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get('/api/query/shifts-collection', async (req, res) => {
    // route implementation
});
```

### Common Swagger Components

#### Authentication (Bearer Token)

```typescript
/**
 * @swagger
 * /api/protected-route:
 *   get:
 *     summary: Protected endpoint
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/api/protected-route', (req, res) => {
    // implementation
});
```

#### POST Request with Body

```typescript
/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Create a new shift
 *     tags:
 *       - Shifts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Shift created successfully
 *       400:
 *         description: Bad request
 */
router.post('/api/shifts', (req, res) => {
    // implementation
});
```

#### Path Parameters

```typescript
/**
 * @swagger
 * /api/shifts/{id}:
 *   get:
 *     summary: Get a specific shift
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift found
 *       404:
 *         description: Shift not found
 */
router.get('/api/shifts/:id', (req, res) => {
    // implementation
});
```

## File Locations

- **Swagger Configuration**: `src/swagger.ts`
- **Server Integration**: `server.ts` (lines 81-97)
- **Route Documentation**: Add to any route file in `src/slices/*/routes.ts`

## Configuration

The Swagger configuration is in `src/swagger.ts`:

```typescript
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Context API',
            version: '1.0.0',
            description: 'Event-driven API...',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/slices/**/routes.ts'], // Auto-discovers routes
};
```

## Testing Your API

1. **In Swagger UI**: Click "Try it out" button to test endpoints
2. **With cURL**:

```bash
curl http://localhost:3000/api/query/shifts-collection
```

3. **With Postman**: Import the OpenAPI spec from `/swagger.json`

## OpenAPI Spec Export

Download the full OpenAPI specification:

```bash
curl http://localhost:3000/swagger.json > openapi.json
```

Use it with:

- [Swagger Editor](https://editor.swagger.io/)
- [OpenAPI Tools](https://openapi.tools/)
- [Postman](https://www.postman.com/)
- [ReDoc](https://redoc.ly/)

## Resources

- [Swagger/OpenAPI Documentation](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
