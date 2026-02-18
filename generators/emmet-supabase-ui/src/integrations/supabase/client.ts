import { createClient } from '@supabase/supabase-js';

// Supabase project URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

// Publishable key (safe to expose in the front-end)
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);