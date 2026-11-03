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
const CURRENT_PROJECT_REF = 'dagtlwojkqyivnjgveda'

// Chaves de auth do supabase-js têm o formato sb-<ref>-auth-token[...]. Qualquer
// uma que não seja do projeto atual (morto ou de outro projeto) é descartada,
// para que uma sessão emitida com URL/key antiga não fique presa no navegador.
function isStaleAuthKey(key: string): boolean {
  if (key.includes(DEAD_PROJECT_REF)) return true
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
