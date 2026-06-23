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
  product_colors: ProductColor[]
  product_images: ProductImage[]
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) throw error
  return data as Product[]
}

export async function getProducts(category?: string, isPromotion?: boolean) {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
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
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Product
}

export async function getProductByName(name: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .ilike('name', name)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as Product | null
}

export async function getCarouselProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .eq('show_in_carousel', true)
    .gt('quantity', 0)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error
  return data as Product[]
}

export async function getMixedCollectionProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
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
}

export async function getTopStockProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .order('quantity', { ascending: false })
    .limit(5)

  if (error) throw error
  return data as Product[]
}
