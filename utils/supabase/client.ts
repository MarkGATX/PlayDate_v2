// import { createBrowserClient } from '@supabase/ssr'

// export function createClient() {
//     return createBrowserClient(
//         process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY!
//     )
// }

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing Supabase URL or API key');
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)

export default supabaseClient;