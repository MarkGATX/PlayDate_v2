import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PLAYDATE_API_KEY!
  )
}