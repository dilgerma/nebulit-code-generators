
import {Request, Response, Router} from 'express';
import {<%-readmodel%>ReadModel} from "./<%-readmodel%>Projection";
import {WebApiSetup} from "@event-driven-io/emmett-expressjs";
import {createServiceClient} from "../../supabase/api";
import {readmodel} from "../../core/readmodel";

export const api =
    (
        // external dependencies
    ): WebApiSetup =>
        (router: Router): void => {
            router.get('/api/query/<%-readModelLowerCase%>-collection', async (req: Request, res: Response) => {
                // requireUser in your original code seems to expect some kind of context,
                // adapt it to Express req if needed, or pass false as in your original code.
                try {

                   <%-query%>

                   // Serialize, handling bigint properly
                   const sanitized = JSON.parse(
                       JSON.stringify(data || [], (key, value) =>
                           typeof value === 'bigint' ? value.toString() : value
                       )
                   );

                    return res.status(200).json(sanitized);
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ ok: false, error: 'Server error' });
                }
            });

        };


