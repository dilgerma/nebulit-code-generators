import {type EmailOtpType} from '@supabase/supabase-js'
import {Request, Response} from "express";

import createClient from './api'

function stringOrFirstString(item: string | string[] | undefined) {
    return Array.isArray(item) ? item[0] : item
}

export default async function LoginHandler(req: Request, res: Response) {
    if (req.method !== 'GET') {
        res.status(405).appendHeader('Allow', 'GET').end()
        return
    }

    const queryParams = req.query
    const token_hash = stringOrFirstString(queryParams["token_hash"]?.toString())
    const type = stringOrFirstString(queryParams["type"]?.toString())

    let next = '/error'

    if (token_hash && type) {
        const supabase = createClient(req, res)
        const {error} = await supabase.auth.verifyOtp({
            type: type as EmailOtpType,
            token_hash,
        })
        if (error) {
            console.error(error)
        } else {
            next = stringOrFirstString(queryParams["next"]?.toString()) || '/'
        }
    }

    res.redirect(next)
}