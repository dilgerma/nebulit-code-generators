import {NextFunction, Request, Response} from 'express';
import {requireUser} from './requireUser';

/**
 * Express middleware to protect routes with JWT authentication
 * Verifies the JWT token from Authorization header and attaches user to request
 *
 * Usage:
 * ```typescript
 * import {authMiddleware} from './src/supabase/authMiddleware';
 *
 * app.get('/api/protected', authMiddleware, (req, res) => {
 *     const user = req.user; // TypeScript: use custom type definition
 *     res.json({ message: 'Protected data', user });
 * });
 * ```
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await requireUser(req, res, false);

        if (result.error) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: result.error
            });
        }

        // Attach user to request for downstream handlers
        (req as any).user = result.user;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Authentication failed'
        });
    }
}

/**
 * TypeScript declaration to extend Express Request type
 * Add this to your types file or use it directly:
 *
 * declare global {
 *     namespace Express {
 *         interface Request {
 *             user?: any; // Or use your User type
 *         }
 *     }
 * }
 */
