import { createClient } from '@supabase/supabase-js';

// ********************************************************************************
// == SupaBase ====================================================================
export const supabase = global.supabase || createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// -- Logic -----------------------------------------------------------------------
if(process.env.NODE_ENV !== 'production') {
  global.supabase = supabase;
}/* else -- production, do not set as global obj */
