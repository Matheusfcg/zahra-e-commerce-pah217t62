// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

const FALLBACK_URL = 'https://onfkaptmtujiihiunsnu.supabase.co'
const FALLBACK_KEY = '<redacted>'

export const SUPABASE_URL = (rawUrl && rawUrl.trim() !== '' ? rawUrl.trim() : FALLBACK_URL).replace(
  /\/+$/,
  '',
)
export const SUPABASE_PUBLISHABLE_KEY =
  rawKey && rawKey.trim() !== '' ? rawKey.trim() : FALLBACK_KEY

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
