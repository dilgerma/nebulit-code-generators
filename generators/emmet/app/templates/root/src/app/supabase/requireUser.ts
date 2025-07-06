'use server';


import {redirect} from 'next/navigation';
import {createClient} from "@/app/supabase/server";

type RequireUserResult = {
    user: any;
    error: null;
} | {
    user: null;
    error: string;
};

export async function requireUser(redirectOnFailedLogin: boolean = true): Promise<RequireUserResult> {
    const supabase = await createClient()

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

