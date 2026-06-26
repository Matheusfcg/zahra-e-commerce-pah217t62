import { supabase } from '@/lib/supabase/client'
import type { Product } from './products'

export type Favorite = {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products: Product
}

const PRODUCT_SELECT =
  'id, slug, name, price, quantity, description, composition, measurements, is_promotion, is_featured, show_in_carousel, category, product_colors(id, name, hex_value, image_url), product_images(id, url, display_order)'

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .select(`*, products(${PRODUCT_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Favorite[]
}

export async function addFavorite(userId: string, productId: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .insert([{ user_id: userId, product_id: productId }])

  if (error) throw error
  return data
}

export async function removeFavorite(userId: string, productId: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) throw error
  return data
}

export async function getFavoriteIds(userId: string) {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('product_id')
    .eq('user_id', userId)

  if (error) throw error
  return data.map((f) => f.product_id)
}
