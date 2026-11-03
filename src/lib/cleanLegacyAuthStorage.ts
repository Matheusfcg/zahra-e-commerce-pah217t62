// Limpeza de estado de autenticação legado em localStorage.
//
// Histórico: builds antigos instanciavam o cliente Supabase apontando para o
// projeto morto onfkaptmtujiihiunsnu.supabase.co. Isso deixou no localStorage do
// navegador do usuário chaves como `sb-onfkaptmtujiihiunsnu-auth-token` e
// `sb-onfkaptmtujiihiunsnu-auth-token-code-verifier`. Se qualquer código (ou um
// cliente legado em cache de bundle antigo) tentar processar essas chaves, surge
// o erro de runtime "Lock "lock:sb-onfkaptmtujiihiunsnu-auth-token" was released
// because another request stole it" na página "/".
//
// Roda no bootstrap, ANTES do App montar, e é idempotente: nos navegadores que
// nunca viram o projeto antigo, não faz nada.
const DEAD_PROJECT_REF = 'onfkaptmtujiihiunsnu'

export function cleanLegacyAuthStorage(): void {
  if (typeof window === 'undefined') return
  try {
    for (const store of [window.localStorage, window.sessionStorage]) {
      if (!store) continue
      const keysToRemove: string[] = []
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        if (key && key.includes(DEAD_PROJECT_REF)) keysToRemove.push(key)
      }
      for (const key of keysToRemove) store.removeItem(key)
    }
  } catch {
    // Safari privado / storage bloqueado: não derruba o app por causa da limpeza.
  }
}
