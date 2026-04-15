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
  description: string
  composition: string
  measurements: string
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
