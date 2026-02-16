# Supabase JWT Authentication for Backend API

This backend API uses Supabase JWT tokens for authentication. Clients must include a valid JWT token in the
`Authorization` header.

## Quick Start

1. **Set up environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Start the server**: `npm run dev`

3. **Get a test JWT token**:
    - Visit http://localhost:3000/auth/login
    - Create an account or login
    - Copy the JWT token displayed
    - Use it in your API requests

## Test Login Page

A simple test login page is available at `/auth/login` that:

- Allows you to create accounts or login
- Displays the JWT token after authentication
- Provides a "Test API Call" button
- Shows a cURL example for testing

This page is for testing purposes only.

## How It Works

1. **Client obtains JWT token** from Supabase (via your frontend app)
2. **Client sends requests** with `Authorization: Bearer <jwt-token>` header
3. **Backend verifies JWT** using Supabase and extracts user info
4. **Protected routes** return user data or 401 Unauthorized

## Usage Examples

### Option 1: Using `requireUser` function

```typescript
import {requireUser} from './src/supabase/requireUser';
import {Request, Response} from 'express';

app.get('/api/protected', async (req: Request, res: Response) => {
    const result = await requireUser(req, res, false);

    if (result.error) {
        return res.status(401).json({error: result.error});
    }

    const user = result.user;
    res.json({
        message: 'Protected data',
        userId: user.id,
        email: user.email
    });
});
```

### Option 2: Using `authMiddleware`

```typescript
import {authMiddleware} from './src/supabase/authMiddleware';

app.get('/api/protected', authMiddleware, (req, res) => {
    // User is available on req.user after middleware
    const user = (req as any).user;

    res.json({
        message: 'Protected data',
        user: user
    });
});
```

### Testing with curl

```bash
# Get JWT token from your Supabase client first
TOKEN="your-jwt-token-here"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user

# Expected response:
# {
#   "userId": "...",
#   "email": "user@example.com",
#   "metadata": { ... }
# }
```

### Testing with JavaScript fetch

```javascript
const token = supabase.auth.session()?.access_token;

fetch('http://localhost:3000/api/user', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(res => res.json())
    .then(data => console.log(data));
```

## API Endpoints

### `GET /api/user`

Returns current authenticated user information.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Success Response (200):**

```json
{
    "userId": "uuid",
    "email": "user@example.com",
    "metadata": { ... }
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

## Files

- **`api.ts`**: Supabase client creation
- **`requireUser.ts`**: JWT verification function
- **`authMiddleware.ts`**: Express middleware for protecting routes
- **`README.md`**: This documentation

## Architecture

```
Client Request
    |
    v
Authorization: Bearer <JWT>
    |
    v
Express Route
    |
    v
requireUser() / authMiddleware
    |
    v
Supabase JWT Verification
    |
    +---> Valid: Continue with user data
    |
    +---> Invalid: Return 401 Unauthorized
```

## Security Notes

- JWT tokens are verified with Supabase on every request
- No session storage on the backend (stateless)
- Tokens expire based on Supabase configuration
- Always use HTTPS in production
- Store the anon key securely (use environment variables)
