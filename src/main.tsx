/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

// Cleanup legacy Service Workers and stale CacheStorage from older builds
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
}

// @skip-protected: Do not remove. Required for React rendering.
createRoot(document.getElementById('root')!).render(<App />)
