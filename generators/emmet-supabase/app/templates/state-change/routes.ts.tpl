import {Router, Request, Response} from 'express';
import {<%=commandName%>Command, handle<%=commandName%>} from './<%=commandName%>Command';
import {requireUser} from "../../supabase/requireUser";
import {WebApiSetup} from "@event-driven-io/emmett-expressjs";
import {assertNotEmpty} from "../../common/assertions";

export type <%=commandName%>RequestPayload = {
<% fields.forEach(function(field, index) { %>    <%=field.name%>?: <%=typeMapping(field.type, field.cardinality)%>;
<% }); %>}

export type <%=commandName%>Request = Request<
    Partial<{ id: string }>,
    unknown,
    Partial<<%=commandName%>RequestPayload>
>;

export const api =
    (
        // external dependencies
    ): WebApiSetup =>
        (router: Router): void => {
            router.post('/api/<%=sliceName%>/:id', async (req: <%=commandName%>Request, res: Response) => {
                /*const principal = await requireUser(req, res, false);
                if (principal.error) {
                    return res.status(401).json(principal);
                }*/

                try {
                    const command: <%=commandName%>Command = {
                        data: {
<% fields.forEach(function(field, index) { %>                            <%=field.name%>: assertNotEmpty(req.body.<%=field.name%>)<% if (index < fields.length - 1) { %>,<% } %>
<% }); %>                        },
                        type: "<%=commandName%>"
                    }

                    if (!req.params.id) throw "no id provided"

                    const result = await handle<%=commandName%>(assertNotEmpty(req.params.id), command);

                    return res.status(200).json({
                        ok: true,
                        next_expected_stream_version: result.nextExpectedStreamVersion?.toString(),
                        last_event_global_position: result.lastEventGlobalPosition?.toString()
                    });
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ok: false, error: 'Server error'});
                }
            });
        };
