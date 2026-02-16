import {Request, Response, Router} from 'express';
import {<%=readModelName%>ReadModel, tableName} from "./<%=readModelName%>Projection";
import {WebApiSetup} from "@event-driven-io/emmett-expressjs";
import createClient from "../../supabase/api";
import {readmodel} from "../../core/readmodel";
import {requireUser} from "../../supabase/requireUser";

export const api =
    (
        // external dependencies
    ): WebApiSetup =>
        (router: Router): void => {
            router.get('/api/query/<%=collectionName%>-collection', async (req: Request, res: Response) => {
                try {
                    const principal = await requireUser(req, res, true);
                    if (principal.error) {
                        return;
                    }

                    const userId = principal.user.id;
                    const id = req.query._id?.toString();

                    const supabase = createClient()

                    const query: any = {};
                    delete query._id;

                    const data: <%=readModelName%>ReadModel | <%=readModelName%>ReadModel[] | null =
                        id ? await readmodel(tableName, supabase).findById<<%=readModelName%>ReadModel>("id", id) :
                            await readmodel(tableName, supabase).findAll<<%=readModelName%>ReadModel>(query)

                    // Serialize, handling bigint properly
                    const sanitized = JSON.parse(
                        JSON.stringify(data || [], (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value
                        )
                    );

                    return res.status(200).json(sanitized);
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ok: false, error: 'Server error'});
                }
            });
        };
