import { Router, Request, Response } from 'express';
import { <%-command%>Command, handle<%-command%> } from './<%-command%>Command';
import {requireUser} from "../../supabase/requireUser";

const router = Router();

router.post('/<%-path%>/:id', async (req: Request, res: Response) => {
    const principal = await requireUser(req, res, false);
    if (principal.error) {
        return res.status(401).json(principal); // Adjust status code as needed
    }

    try {
        const command = req.body as <%-command%>Command;
        await handle<%-command%>(req.params.id, command);
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
});

export default router;
