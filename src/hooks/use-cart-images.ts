import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CartItem } from '@/contexts/CartContext'

export function useCartProductImages(items: CartItem[]) {
  const [imagesMap, setImagesMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    async function fetchImages() {
      const productIds = Array.from(new Set(items.map((i) => i.id)))
      if (productIds.length === 0) return

      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          product_images (url, display_order),
          product_colors (name, image_url)
        `)
        .in('id', productIds)

      if (products) {
        const newMap: Record<string, string[]> = {}
        for (const item of items) {
          const product = products.find((p) => p.id === item.id)
          if (product) {
            const colorImages = product.product_colors
              .filter((c) => c.name === item.color && c.image_url)
              .map((c) => c.image_url)

            const otherImages = product.product_images
              .sort((a, b) => a.display_order - b.display_order)
              .map((i) => i.url)

            const allImages = Array.from(new Set([...colorImages, ...otherImages]))
            newMap[`${item.id}-${item.color}`] = allImages.length > 0 ? allImages : [item.image]
          } else {
            newMap[`${item.id}-${item.color}`] = [item.image]
          }
        }
        setImagesMap(newMap)
      }
    }

    fetchImages()
  }, [items])

  return imagesMap
}
