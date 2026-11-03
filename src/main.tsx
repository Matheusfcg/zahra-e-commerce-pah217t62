/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { cleanLegacyAuthStorage } from './lib/cleanLegacyAuthStorage'
import './main.css'

// Remove chaves de auth de projetos Supabase legados (ex.: sb-dagtlwojkqyivnjgveda-*)
// antes de qualquer código instanciar o cliente Supabase e tentar processá-las.
// Deve rodar antes do import do App para não haver janela de corrida.
cleanLegacyAuthStorage()

// Versão da limpeza de caches: bump a cada build que muda assets/imagem para
// forçar o descarte de caches antigos mesmo nos navegadores dos visitantes.
const SW_CLEANUP_VERSION = 'v8-2026-11-03'

// Cleanup legacy Service Workers and stale CacheStorage from older builds.
// Roda em TODA inicialização: garante que nenhum service worker antigo
// (workbox/registrado manualmente) siga servindo assets velhos do cache.
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const reg of registrations) {
          reg.unregister().catch((err) => {
            console.warn('[SW Cleanup] Falha ao desregistrar service worker legado:', err)
          })
        }
      })
      .catch(() => {
        /* ignore */
      })
  }

  // Clear stale legacy caches if any were created by previous service workers or workbox
  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => {
        for (const key of keys) {
          caches.delete(key).catch(() => {
            /* ignore */
          })
        }
      })
      .catch(() => {
        /* ignore */
      })
  }

  // Invalida o cache interno de dados do site para não servir hero/categorias velhos
  try {
    const key = `sw_cleanup_done_${SW_CLEANUP_VERSION}`
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      if ('caches' in window) {
        caches.keys().then((keys) => {
          // Revalida o cache do siteContent também (versão v5 usada na home)
          keys.forEach((k) => {
            if (k.includes('site_content') || k.includes('product')) {
              caches.delete(k).catch(() => {})
            }
          })
        })
      }
    }
  } catch {
    /* ignore */
  }
}

// @skip-protected: Do not remove. Required for React rendering.
createRoot(document.getElementById('root')!).render(<App />)
