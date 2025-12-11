import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase URL or Key in environment variables.");
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
