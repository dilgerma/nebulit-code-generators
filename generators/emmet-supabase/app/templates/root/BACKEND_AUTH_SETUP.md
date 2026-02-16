# Backend JWT Authentication Setup - Summary

## What Was Done

Your Express.js backend has been configured to use **JWT token authentication** instead of cookie-based sessions.

### Changes Made

#### 1. **Removed Cookie-Based Auth**

- Removed `cookie-parser` from server.ts
- Removed OAuth callback route (`/api/auth/confirm`)
- Removed old cookie-based Supabase client setup

#### 2. **Added JWT Token Verification**

- **`src/supabase/api.ts`**: Stateless Supabase client for JWT verification
- **`src/supabase/requireUser.ts`**: Extracts and verifies JWT from `Authorization` header
- **`src/supabase/authMiddleware.ts`**: Express middleware for protecting routes
- **`src/supabase/component.ts`**: Browser client for test login page

#### 3. **Updated API Endpoints**

- **`GET /api/user`**: Now requires `Authorization: Bearer <token>` header
- Returns user info: `userId`, `email`, `metadata`

#### 4. **Frontend Cleanup**

- **Removed**: `register.tsx`, `reset-password.tsx`
- **Updated**: `login.tsx` → Simple test page that displays JWT token
- Access at: http://localhost:3000/auth/login

---

## How to Use

### 1. Get a JWT Token

**Option A: Use Test Login Page**

1. Start server: `npm run dev`
2. Visit: http://localhost:3000/auth/login
3. Create account or login
4. Copy the JWT token displayed

**Option B: Get Token from Client**

```javascript
const { data } = await supabase.auth.signInWithPassword({ email, password })
const token = data.session.access_token
```

### 2. Make Authenticated Requests

**Using cURL:**

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/user
```

**Using JavaScript fetch:**

```javascript
fetch('/api/user', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(res => res.json())
    .then(data => console.log(data))
```

### 3. Protect Your Routes

**Method 1: Using authMiddleware**

```typescript
import {authMiddleware} from './src/supabase/authMiddleware'

app.get('/api/protected', authMiddleware, (req, res) => {
    const user = (req as any).user
    res.json({user})
})
```

**Method 2: Using requireUser function**

```typescript
import {requireUser} from './src/supabase/requireUser'

app.get('/api/protected', async (req, res) => {
    const result = await requireUser(req, res, false)

    if (result.error) {
        return res.status(401).json({error: result.error})
    }

    const user = result.user
    res.json({user})
})
```

---

## File Structure

```
src/supabase/
├── api.ts              # Supabase client creation
├── requireUser.ts      # JWT verification function
├── authMiddleware.ts   # Express middleware
├── component.ts        # Browser client (for test page)
├── supabaseClient.ts   # Environment constants
└── README.md           # Complete documentation

src/pages/auth/
└── login.tsx           # Test login page with JWT display
```

---

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## API Responses

### Success (200)

```json
{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "metadata": {
        "name": "John Doe"
    }
}
```

### Unauthorized (401)

```json
{
    "error": "Missing authorization token"
}
```

or

```json
{
    "error": "Invalid or expired token"
}
```

---

## Security Notes

✅ JWT tokens are verified with Supabase on every request
✅ No session storage on backend (stateless)
✅ Tokens expire automatically
⚠️ Always use HTTPS in production
⚠️ Keep environment variables secure

---

## Next Steps

1. Add your Supabase anon key to `.env.local`
2. Use `authMiddleware` or `requireUser` in your slice routes
3. Remove test login page in production if not needed
4. Consider adding role-based authorization if needed

For complete documentation, see: `src/supabase/README.md`
