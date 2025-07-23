import {createServerClient, serializeCookieHeader} from '@supabase/ssr'
import {Request, Response} from 'express'
import { createClient as createSupabaseCLient } from '@supabase/supabase-js'


export const createServiceClient = () => {
    return createSupabaseCLient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        })
};

export default function createClient(req: Request, res: Response) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return Object.keys(req.cookies).map((name) => ({name, value: req.cookies[name] || ''}))
                },
                setAll(cookiesToSet) {
                    res.setHeader(
                        'Set-Cookie',
                        cookiesToSet.map(({name, value, options}) =>
                            serializeCookieHeader(name, value, options)
                        )
                    )
                },
            },
        }
    )
}