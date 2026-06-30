import { supabase } from '@/lib/supabase/client'

export type ProductColor = {
  id: string
  name: string
  hex_value: string
  image_url: string
}

export type ProductImage = {
  id: string
  url: string
  display_order: number
  is_cover?: boolean
}

export type ProductSize = {
  id: string
  size_name: string
  quantity: number
}

export type Product = {
  id: string
  slug: string
  name: string
  price: number
  quantity: number
  description: string
  composition: string
  measurements: string
  is_promotion: boolean
  is_featured?: boolean
  show_in_carousel?: boolean
  category?: string
  weight_g?: number
  height_cm?: number
  width_cm?: number
  length_cm?: number
  product_colors: ProductColor[]
  product_images: ProductImage[]
  product_sizes?: ProductSize[]
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

export function clearProductsCache() {
  cache.clear()
}

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const data = await fetcher()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

const PRODUCT_SELECT =
  'id, slug, name, price, quantity, description, composition, measurements, is_promotion, is_featured, show_in_carousel, category, weight_g, height_cm, width_cm, length_cm, product_colors(id, name, hex_value, image_url), product_images(id, url, display_order, is_cover), product_sizes(id, size_name, quantity)'

export async function getFeaturedProducts() {
  return fetchWithCache('featured', async () => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) throw error
    return data as Product[]
  })
}

export async function getProducts(category?: string, isPromotion?: boolean) {
  const key = `products-${category || 'all'}-${isPromotion || 'all'}`
  return fetchWithCache(key, async () => {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.ilike('category', category)
    }

    if (isPromotion) {
      query = query.eq('is_promotion', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Product[]
  })
}

export async function getProductBySlug(slug: string) {
  return fetchWithCache(`product-slug-${slug}`, async () => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Product
  })
}

export async function getProductByName(name: string) {
  return fetchWithCache(`product-name-${name}`, async () => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .ilike('name', name)
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data as Product | null
  })
}

export async function getCarouselProducts() {
  return fetchWithCache('carousel', async () => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('show_in_carousel', true)
      .gt('quantity', 0)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    return data as Product[]
  })
}

export async function getMixedCollectionProducts() {
  return fetchWithCache('mixed-collection', async () => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    const uniqueProducts: Product[] = []
    const names = new Set<string>()

    for (const product of data as Product[]) {
      if (!names.has(product.name)) {
        names.add(product.name)
        uniqueProducts.push(product)
      }
    }

    return uniqueProducts.slice(0, 6)
  })
}

export async function getTopStockProducts() {
  return fetchWithCache('top-stock', async () => {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('quantity', { ascending: false })
      .limit(5)

    if (error) throw error
    return data as Product[]
  })
}
