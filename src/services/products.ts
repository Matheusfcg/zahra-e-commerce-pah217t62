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
  product_colors: ProductColor[]
  product_images: ProductImage[]
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .order('created_at', { ascending: false })

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

export async function getMixedCollectionProducts() {
  const { data: highest, error: errHigh } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .order('price', { ascending: false })
    .limit(3)

  if (errHigh) throw errHigh

  const { data: lowest, error: errLow } = await supabase
    .from('products')
    .select(`
      *,
      product_colors (*),
      product_images (*)
    `)
    .order('price', { ascending: true })
    .limit(3)

  if (errLow) throw errLow

  const map = new Map<string, Product>()
  highest.forEach((p) => map.set(p.id, p as Product))
  lowest.forEach((p) => map.set(p.id, p as Product))

  return Array.from(map.values())
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
