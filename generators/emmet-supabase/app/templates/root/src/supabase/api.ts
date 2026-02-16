import {createClient as createSupabaseClient} from '@supabase/supabase-js'
import {Request} from 'express'

/**
 * Creates a Supabase client for server-side API operations
 * This client does not persist sessions and is used for JWT verification
 */
export const createServiceClient = () => {
    console.log(process.env.SUPABASE_URL)
    return createSupabaseClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    )
}

/**
 * Creates a Supabase client for verifying JWT tokens
 * Used in backend API endpoints
 */
export default function createClient() {
    return createSupabaseClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        }
    )
}

/**
 * Creates an authenticated Supabase client with the user's JWT token
 * This ensures Row Level Security (RLS) policies are applied with the user's context
 */
export async function createAuthenticatedClient(req: Request) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    console.log(token)
    console.log(process.env.SUPABASE_URL!)
    const client = createSupabaseClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        }
    );

    if (token) {
        await client.auth.setSession({
            access_token: token,
            refresh_token: '',
        });
    }

    return client;
}