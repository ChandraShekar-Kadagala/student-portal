import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase dashboard
// I am using the ones provided in your prompt. 
const supabaseUrl = 'https://koassxnlxugkpwbhwxak.supabase.co';
const supabaseAnonKey = 'sb_publishable_B_R64NMKcIaE7kEpx6nTug_-gxJqTs4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
