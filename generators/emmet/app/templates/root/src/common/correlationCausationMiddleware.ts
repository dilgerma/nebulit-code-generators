const crypto = require('crypto');
import {Request, Response, NextFunction} from 'express';

export const correlationCausationMiddleware = () => {
    const correlationHeader = 'x-correlation-id';
    const causationHeader = 'x-causation-id';

    return (req: Request, res: Response, next: NextFunction) => {
        // Get causation ID or generate new one
        let causationId = req.get(causationHeader);
        if (!causationId) {
            causationId = crypto.randomUUID();
        }

        // Get correlation ID or use causation ID as fallback
        let correlationId = req.get(correlationHeader);
        if (!correlationId) {
            correlationId = causationId;
        }

        // Set response headers
        if (correlationId) {
            res.set(correlationHeader, correlationId);
        }
        if (causationId) {
            res.set(causationHeader, causationId);
        }

        next();
    };
};