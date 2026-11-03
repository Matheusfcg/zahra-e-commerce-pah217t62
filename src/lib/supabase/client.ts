// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
// 2026-11-03: cliente voltou para o projeto ativo da Meyves (onfkaptmtujiihiunsnu,
// região São Paulo, status Healthy). O projeto dagtlwojkqyivnjgveda, usado como
// fallback em runs anteriores, passa a ser legado e suas chaves de sessão são
// removidas no bootstrap (ver cleanLegacyAuthStorage).
// A URL é fixada aqui; a chave anon vem SOMENTE da env VITE_SUPABASE_PUBLISHABLE_KEY.
import { createClient } from '@supabase/supabase-js'
import { cleanLegacyAuthStorage } from '../cleanLegacyAuthStorage'
import type { Database } from './types'

const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

const SUPABASE_PROJECT_REF = 'onfkaptmtujiihiunsnu'
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`
// Publishable key "default" do projeto onfkaptmtujiihiunsnu (chave pública, segura
// para o navegador). Embutida como fallback para que o site funcione mesmo sem a env.
const FALLBACK_KEY = 'sb_publishable_krxgyxMeIpivXVt2uhswkQ_WqXZg-R7'

function resolveKey(): string {
  const candidate = rawKey?.trim()
  if (!candidate) return FALLBACK_KEY
  return candidate
}

export const SUPABASE_PUBLISHABLE_KEY = resolveKey()

// Chave de storage única para ESTE app. O navigator lock do GoTrueClient é
// nomeado a partir dela ("lock:<storageKey>"), então fixá-la aqui garante que
// todos os builds usem o MESMO lock.
export const SUPABASE_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

// Garantia de ordem: roda antes de QUALQUER cliente existir, mesmo que algum
// módulo importe o client antes do bootstrap (imports ESM são içados).
cleanLegacyAuthStorage()

export { SUPABASE_URL }

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
