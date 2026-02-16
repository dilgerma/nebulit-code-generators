import {createAuthenticatedClient} from "./api";
import {Request, Response} from "express"

type RequireUserResult = {
    user: any;
    error: null;
} | {
    user: null;
    error: string;
};

/**
 * Extracts JWT token from Authorization header
 * Supports "Bearer <token>" format
 */
function extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    // Check for "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        return parts[1];
    }

    // If no Bearer prefix, assume the entire header is the token
    return authHeader;
}

/**
 * Verifies JWT token from Authorization header and returns user info
 * This is for backend API use - does not use cookies or redirects
 */
export async function requireUser(req: Request, resp: Response, sendUnauthorized: boolean = true): Promise<RequireUserResult> {
    const token = extractTokenFromHeader(req);

    if (!token) {
        if (sendUnauthorized) {
            resp.status(401).json({error: 'Missing authorization token'});
        }
        return {
            user: null,
            error: 'MISSING_TOKEN',
        };
    }

    const supabase = await createAuthenticatedClient(req);

    // Verify the JWT token
    const {
        data: {user},
        error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        if (sendUnauthorized) {
            resp.status(401).json({error: 'Invalid or expired token'});
        }
        return {
            user: null,
            error: error?.message || 'UNAUTHORIZED',
        };
    }

    return {
        user: user,
        error: null
    }
}
