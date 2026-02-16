import {Request, Response, Router} from 'express';
import {WebApiSetup} from "@event-driven-io/emmett-expressjs";
import {assertNotEmpty} from "../util/assertions";
import {replayProjection} from "./replay";


export const api =
    (
        // external dependencies
    ): WebApiSetup =>
        (router: Router): void => {

            router.post('/api/replay/:slice/:projection', async (req: Request, res: Response) => {
                const slice= assertNotEmpty(req.params.slice)
                const projection = assertNotEmpty(req.params.projection)
                replayProjection(slice, projection)
            });
        };

