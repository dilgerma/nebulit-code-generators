import {type Request, type Response} from 'express'
import {createServerClient, serializeCookieHeader} from '@supabase/ssr'

export function createClient(req: Request, res: Response) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return Object.keys(req.cookies).map((name) => ({name, value: req.cookies[name] || ''}))
                },
                setAll(cookiesToSet: any[]) {
                    res.setHeader(
                        'Set-Cookie',
                        cookiesToSet.map(({name, value, options}: any) =>
                            serializeCookieHeader(name, value, options)
                        )
                    )
                },
            },
        }
    )
    return supabase
}