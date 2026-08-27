/**
 * Route & Data Prefetching Utility for ultra-snappy navigation
 */
import { getProducts, getProductBySlug } from '@/services/products'
import { supabase } from '@/lib/supabase/client'

// Page module import functions for component prefetching
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
  '/admin/upload': () => import('@/pages/admin/AdminUpload'),
  '/admin/appearance': () => import('@/pages/admin/Appearance'),
}

// Prefetch tracking to prevent duplicate network calls
const prefetchedUrls = new Set<string>()

/**
 * Prefetches the code chunk for a given route path
 */
export function prefetchRouteChunk(path: string) {
  const normalizedPath = path.split('?')[0].split('#')[0]
  if (pageLoaders[normalizedPath]) {
    pageLoaders[normalizedPath]()
  } else if (normalizedPath.startsWith('/product/')) {
    import('@/pages/Product')
  }
}

/**
 * Prefetches data associated with the given link URL
 */
export function prefetchRouteData(url: string) {
  if (prefetchedUrls.has(url)) return
  prefetchedUrls.add(url)

  try {
    const parsed = new URL(url, window.location.origin)
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
    }

    // If it's the exchange policy page
    if (pathname === '/troca-e-devolucao') {
      Promise.resolve(
        supabase
          .from('site_content')
          .select('content_value')
          .eq('section_key', 'exchange_return_policy')
          .maybeSingle(),
      ).catch(() => {})
    }
  } catch {
    // Ignore invalid URLs
  }
}

/**
 * Prefetch both route code and route data on hover/focus
 */
export function prefetchLink(url: string) {
  prefetchRouteChunk(url)
  prefetchRouteData(url)
}

/**
 * Global listener setup for prefetching links on hover / mouseenter / touchstart
 */
export function setupGlobalPrefetchListener() {
  if (typeof window === 'undefined') return

  const handlePointerEnter = (e: MouseEvent | TouchEvent) => {
    const target = (e.target as HTMLElement)?.closest('a')
    if (!target) return

    const href = target.getAttribute('href')
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    ) {
      return
    }

    prefetchLink(href)
  }

  window.addEventListener('mouseover', handlePointerEnter, { passive: true })
  window.addEventListener('touchstart', handlePointerEnter, { passive: true })

  // Idle prefetching for critical main pages
  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(() => {
      prefetchRouteChunk('/produtos')
      prefetchRouteChunk('/troca-e-devolucao')
      getProducts(undefined, false).catch(() => {})
    })
  } else {
    setTimeout(() => {
      prefetchRouteChunk('/produtos')
      prefetchRouteChunk('/troca-e-devolucao')
      getProducts(undefined, false).catch(() => {})
    }, 1500)
  }
}
