import { Router, Request, Response } from 'express';
import { <%-command%>Command, handle<%-command%> } from './<%-command%>Command';
import {requireUser} from "../../supabase/requireUser";
import {on, WebApiSetup} from "@event-driven-io/emmett-expressjs";
import {assertNotEmptyString} from "@event-driven-io/emmett";
import {assertNotEmpty} from "../../components/util/assertions";


type <%-command%>Request = Request<
    Partial<{ <%-paramVars%> }>,
    unknown,
    Partial<{ <%-payloadVars%> }>
>;

export const api =
    (
        // external dependencies
    ): WebApiSetup =>
        (router: Router): void => {
            router.post('/api/<%-path%>/:id', async (req: <%-command%>Request, res: Response) => {
                const principal = await requireUser(req, res, false);
                if (principal.error) {
                    return res.status(401).json(principal); // Adjust status code as needed
                }

                try {
                    const command:<%-command%>Command = {
                        data: {
                            <%-assignments%>
                            //amount: req.body.amount,
                        },
                        type: "<%-command%>"
                    }
                    await handle<%-command%>(assertNotEmpty(req.params.id), command);
                    return res.status(200).json({ ok: true });
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ ok: false, error: 'Server error' });
                }
            });
        };

