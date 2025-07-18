'use server';


import {redirect} from 'next/navigation';
import createClient from "./api";
import {Request, Response} from "express"

type RequireUserResult = {
    user: any;
    error: null;
} | {
    user: null;
    error: string;
};

export async function requireUser(req: Request, resp: Response, redirectOnFailedLogin: boolean = true): Promise<RequireUserResult> {
    const supabase = createClient(req, resp)

    const {
        data: {user},
    } = await supabase.auth.getUser();
    if (!user) {
        if (redirectOnFailedLogin) {
            redirect('/auth/login');
        } else {
            return {
                user: null,
                error: 'UNAUTHORIZED',
            };
        }
    }

    return {
        user: user, error: null
    }
}

