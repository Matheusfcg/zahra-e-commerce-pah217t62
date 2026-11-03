// Limpeza de estado de autenticação legado em localStorage.
//
// Histórico: o app já esteve apontado para dois projetos Supabase. Sessões
// emitidas com a URL/key de um projeto ficam no localStorage com chaves
// `sb-<ref>-auth-token` (e `-code-verifier`). Se essas chaves forem processadas
// pelo cliente do projeto atual, surge o erro de navigator lock
// "lock:sb-<ref>-auth-token was released because another request stole it".
//
// Projeto ativo: onfkaptmtujiihiunsnu. Qualquer outra ref (ex.: dagtlwojkqyivnjgveda,
// usado como fallback antes) é considerada legada e removida.
//
// Roda no bootstrap, ANTES do App montar, e é idempotente.
const CURRENT_PROJECT_REF = 'onfkaptmtujiihiunsnu'

// Chaves de auth do supabase-js têm o formato sb-<ref>-auth-token[...]. Qualquer
// uma que não seja do projeto atual é descartada.
function isStaleAuthKey(key: string): boolean {
  const match = /^sb-([a-z0-9]+)-auth-token/.exec(key)
  return !!match && match[1] !== CURRENT_PROJECT_REF
}

export function cleanLegacyAuthStorage(): void {
  if (typeof window === 'undefined') return
  try {
    for (const store of [window.localStorage, window.sessionStorage]) {
      if (!store) continue
      const keysToRemove: string[] = []
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        if (key && isStaleAuthKey(key)) keysToRemove.push(key)
      }
      for (const key of keysToRemove) store.removeItem(key)
    }
  } catch {
    // Safari privado / storage bloqueado: não derruba o app por causa da limpeza.
  }
}
