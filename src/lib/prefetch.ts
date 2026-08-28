/**
 * Route & Data Prefetching Utility for ultra-snappy navigation
 */
import { getProducts, getProductBySlug, getHighlightedProducts } from '@/services/products'
import {
  getSiteContentCached,
  getFeaturedCategoriesCached,
  getExchangePolicyCached,
  getCategoriesCached,
} from '@/services/siteContent'

// Page module dynamic import functions for route chunk prefetching
const pageLoaders: Record<string, () => Promise<any>> = {
  '/': () => import('@/pages/Index'),
  '/produtos': () => import('@/pages/Products'),
  '/troca-e-devolucao': () => import('@/pages/TrocaDevolucao'),
  '/favoritos': () => import('@/pages/Favorites'),
  '/checkout': () => import('@/pages/Checkout'),
  '/auth': () => import('@/pages/Auth'),
  '/perfil': () => import('@/pages/Profile'),
  '/orders': () => import('@/pages/Orders'),
  '/meus-pedidos': () => import('@/pages/Orders'),
  '/my-orders': () => import('@/pages/Orders'),
  '/admin/upload': () => import('@/pages/admin/AdminUpload'),
  '/admin/appearance': () => import('@/pages/admin/Appearance'),
  '/shipping-callback': () => import('@/pages/admin/ShippingCallback'),
}

// Prefetch tracking to prevent duplicate network calls
const prefetchedUrls = new Set<string>()
const prefetchedChunks = new Set<string>()

/**
 * Prefetches the JavaScript code chunk for a given route path
 */
export function prefetchRouteChunk(path: string) {
  const normalizedPath = path.split('?')[0].split('#')[0]
  if (prefetchedChunks.has(normalizedPath)) return
  prefetchedChunks.add(normalizedPath)

  if (pageLoaders[normalizedPath]) {
    pageLoaders[normalizedPath]().catch(() => {})
  } else if (normalizedPath.startsWith('/product/')) {
    import('@/pages/Product').catch(() => {})
  }
}

/**
 * Prefetches data associated with the given link URL
 */
export function prefetchRouteData(url: string) {
  if (prefetchedUrls.has(url)) return
  prefetchedUrls.add(url)

  try {
    const parsed = new URL(
      url,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
    )
    const pathname = parsed.pathname
    const searchParams = parsed.searchParams

    // If it's a product detail page
    if (pathname.startsWith('/product/')) {
      const slug = pathname.replace('/product/', '')
      if (slug) {
        getProductBySlug(slug).catch(() => {})
      }
    }

    // If it's the products catalog
    if (pathname === '/produtos') {
      const category = searchParams.get('category') || undefined
      const isPromotion = searchParams.get('promotion') === 'true'
      getProducts(category, isPromotion).catch(() => {})
      getSiteContentCached().catch(() => {})
    }

    // If it's the homepage
    if (pathname === '/') {
      getSiteContentCached().catch(() => {})
      getFeaturedCategoriesCached().catch(() => {})
      getHighlightedProducts().catch(() => {})
    }

    // If it's the exchange policy page
    if (pathname === '/troca-e-devolucao') {
      getExchangePolicyCached().catch(() => {})
    }
  } catch {
    // Ignore invalid URLs
  }
}

/**
 * Prefetch both route code and route data on interaction (hover/focus/touch/pointerdown)
 */
export function prefetchLink(url: string) {
  if (!url) return
  prefetchRouteChunk(url)
  prefetchRouteData(url)
}

/**
 * Global listener setup for prefetching links on hover / mouseover / pointerdown / touchstart
 */
export function setupGlobalPrefetchListener() {
  if (typeof window === 'undefined') return

  const handleInteraction = (e: Event) => {
    const target = (e.target as HTMLElement)?.closest('a')
    if (!target) return

    const href = target.getAttribute('href')
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#') ||
      href.startsWith('javascript:')
    ) {
      return
    }

    prefetchLink(href)
  }

  // Listen to multiple high-intent user interaction events
  window.addEventListener('mouseover', handleInteraction, { passive: true })
  window.addEventListener('touchstart', handleInteraction, { passive: true })
  window.addEventListener('pointerdown', handleInteraction, { passive: true })

  // Idle prefetching for critical main paths and essential store data
  const idlePrefetch = () => {
    // 1. Chunks
    prefetchRouteChunk('/produtos')
    prefetchRouteChunk('/troca-e-devolucao')
    prefetchRouteChunk('/favoritos')
    prefetchRouteChunk('/checkout')

    // 2. Critical Data
    getSiteContentCached().catch(() => {})
    getCategoriesCached().catch(() => {})
    getFeaturedCategoriesCached().catch(() => {})
    getHighlightedProducts().catch(() => {})
    getProducts(undefined, false).catch(() => {})
  }

  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(() => idlePrefetch(), { timeout: 3000 })
  } else {
    setTimeout(idlePrefetch, 1200)
  }
}
