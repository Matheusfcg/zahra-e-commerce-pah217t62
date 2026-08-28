import { supabase } from '@/lib/supabase/client'

const MEMORY_CACHE = new Map<string, { data: any; expiresAt: number }>()
const DEFAULT_TTL_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Generic storage & memory cache utility for lightning-fast synchronous cache hits
 */
export const smartCache = {
  get<T>(key: string, storage: 'session' | 'local' = 'session'): T | null {
    // 1. Check in-memory map
    const inMem = MEMORY_CACHE.get(key)
    if (inMem && Date.now() < inMem.expiresAt) {
      return inMem.data as T
    }

    // 2. Check web storage
    try {
      const store = storage === 'local' ? window.localStorage : window.sessionStorage
      const raw = store.getItem(key)
      if (!raw) return null

      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && 'data' in parsed && 'expiresAt' in parsed) {
        if (Date.now() < parsed.expiresAt) {
          // Warm up in-memory cache
          MEMORY_CACHE.set(key, { data: parsed.data, expiresAt: parsed.expiresAt })
          return parsed.data as T
        } else {
          store.removeItem(key)
          return null
        }
      }
      return parsed as T
    } catch {
      return null
    }
  },

  set<T>(
    key: string,
    data: T,
    ttlMs: number = DEFAULT_TTL_MS,
    storage: 'session' | 'local' = 'session',
  ): void {
    const expiresAt = Date.now() + ttlMs
    MEMORY_CACHE.set(key, { data, expiresAt })

    try {
      const store = storage === 'local' ? window.localStorage : window.sessionStorage
      store.setItem(key, JSON.stringify({ data, expiresAt }))
    } catch {
      // Ignore quota exceeded errors
    }
  },

  remove(key: string, storage: 'session' | 'local' = 'session'): void {
    MEMORY_CACHE.delete(key)
    try {
      const store = storage === 'local' ? window.localStorage : window.sessionStorage
      store.removeItem(key)
    } catch {
      // Ignore
    }
  },

  clearAll(): void {
    MEMORY_CACHE.clear()
    try {
      sessionStorage.clear()
    } catch {
      // Ignore
    }
  },
}

const CACHE_KEYS = {
  SITE_CONTENT: 'site_content_cache_v2',
  FEATURED_CATEGORIES: 'featured_categories_cache_v2',
  ALL_CATEGORIES: 'all_categories_cache_v2',
  EXCHANGE_POLICY: 'exchange_policy_cache_v2',
}

/**
 * Fetch all CMS site_content entries with persistent cache & background stale-while-revalidate
 */
export async function getSiteContentCached(forceRefresh = false): Promise<Record<string, string>> {
  if (!forceRefresh) {
    const cached = smartCache.get<Record<string, string>>(CACHE_KEYS.SITE_CONTENT)
    if (cached && Object.keys(cached).length > 0) {
      return cached
    }
  }

  try {
    const { data, error } = await supabase.from('site_content').select('section_key, content_value')

    if (error) throw error

    if (data) {
      const map = data.reduce(
        (acc, curr) => ({ ...acc, [curr.section_key]: curr.content_value }),
        {} as Record<string, string>,
      )
      smartCache.set(CACHE_KEYS.SITE_CONTENT, map, 15 * 60 * 1000) // 15 mins
      return map
    }
  } catch (e) {
    console.warn('Failed to fetch site_content:', e)
  }

  return smartCache.get<Record<string, string>>(CACHE_KEYS.SITE_CONTENT) || {}
}

/**
 * Fetch featured categories for homepage with cache
 */
export async function getFeaturedCategoriesCached(forceRefresh = false): Promise<any[]> {
  if (!forceRefresh) {
    const cached = smartCache.get<any[]>(CACHE_KEYS.FEATURED_CATEGORIES)
    if (cached && cached.length > 0) {
      return cached
    }
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_featured', true)
      .order('created_at')

    if (error) throw error

    if (data) {
      smartCache.set(CACHE_KEYS.FEATURED_CATEGORIES, data, 15 * 60 * 1000)
      return data
    }
  } catch (e) {
    console.warn('Failed to fetch featured categories:', e)
  }

  return smartCache.get<any[]>(CACHE_KEYS.FEATURED_CATEGORIES) || []
}

/**
 * Fetch all category names for header menu with cache
 */
export async function getCategoriesCached(forceRefresh = false): Promise<string[]> {
  if (!forceRefresh) {
    const cached = smartCache.get<string[]>(CACHE_KEYS.ALL_CATEGORIES)
    if (cached && cached.length > 0) {
      return cached
    }
  }

  try {
    const { data, error } = await supabase.from('categories').select('name').order('name')

    if (error) throw error

    if (data) {
      const names = data.map((c: any) => c.name)
      smartCache.set(CACHE_KEYS.ALL_CATEGORIES, names, 15 * 60 * 1000)
      return names
    }
  } catch (e) {
    console.warn('Failed to fetch categories:', e)
  }

  return smartCache.get<string[]>(CACHE_KEYS.ALL_CATEGORIES) || []
}

/**
 * Fetch exchange & return policy with cache
 */
export async function getExchangePolicyCached(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh) {
    const cached = smartCache.get<string>(CACHE_KEYS.EXCHANGE_POLICY)
    if (cached) {
      return cached
    }
  }

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('content_value')
      .eq('section_key', 'exchange_return_policy')
      .maybeSingle()

    if (error) throw error

    if (data?.content_value) {
      smartCache.set(CACHE_KEYS.EXCHANGE_POLICY, data.content_value, 30 * 60 * 1000)
      return data.content_value
    }
  } catch (e) {
    console.warn('Failed to fetch exchange policy:', e)
  }

  return smartCache.get<string>(CACHE_KEYS.EXCHANGE_POLICY) || null
}
