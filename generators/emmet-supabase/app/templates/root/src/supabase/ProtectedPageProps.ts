import {type Request, type Response} from "express";
import {createClient} from "./serverProps";

export async function getAuthenticatedUser(req: Request, res: Response) {
    const supabase = createClient(req, res)
    const {data, error} = await supabase.auth.getUser()
    if (error || !data) {
        return null
    }
    return data.user
}

export async function requireAuthMiddleware(req: Request, res: Response, next: () => void) {
    const user = await getAuthenticatedUser(req, res)
    if (!user) {
        res.redirect('/auth/login')
        return
    }
    (req as any).user = user
    next()
}