// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
// 2026-11-03: cliente fixado no projeto real da Meyves (dagtlwojkqyivnjgveda).
// O projeto antigo onfkaptmtujiihiunsnu não existe mais (DNS não resolve). Enquanto
// a URL vinha de env var, um build antigo chegou a fixar a ref morta no bundle,
// o que dava "Failed to fetch" no login e o erro de navigator lock
// "lock:sb-onfkaptmtujiihiunsnu-auth-token". A URL/key agora são resolvidas AQUI,
// descartando qualquer env var que ainda aponte para a ref morta.
import { createClient } from '@supabase/supabase-js'
import { cleanLegacyAuthStorage } from '../cleanLegacyAuthStorage'
import type { Database } from './types'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

const SUPABASE_PROJECT_REF = 'dagtlwojkqyivnjgveda'
const DEAD_PROJECT_REF = 'onfkaptmtujiihiunsnu'
const FALLBACK_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`
const FALLBACK_KEY = '<redacted>'

function resolveUrl(): string {
  const candidate = rawUrl?.trim().replace(/\/+$/, '')
  // Ignora env vars apontando para o projeto morto — causa raiz do lock conflitante.
  if (!candidate || candidate.includes(DEAD_PROJECT_REF)) return FALLBACK_URL
  return candidate
}

function resolveKey(): string {
  const candidate = rawKey?.trim()
  if (!candidate) return FALLBACK_KEY
  return candidate
}

export const SUPABASE_URL = resolveUrl()
export const SUPABASE_PUBLISHABLE_KEY = resolveKey()

// Chave de storage única para ESTE app. O navigator lock do GoTrueClient é
// nomeado a partir dela ("lock:<storageKey>"), então fixá-la aqui garante que
// todos os builds usem o MESMO lock e nenhum cliente aponte para a ref morta.
export const SUPABASE_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

// Garantia de ordem: roda antes de QUALQUER cliente existir, mesmo que algum
// módulo importe o client antes do bootstrap (imports ESM são içados).
cleanLegacyAuthStorage()

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    storageKey: SUPABASE_STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
