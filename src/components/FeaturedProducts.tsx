import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHighlightedProducts, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavorites } from '@/hooks/use-favorites'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { favorites, toggleFavorite } = useFavorites()

  useEffect(() => {
    getHighlightedProducts()
      .then((data) => setProducts(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (!isLoading && products.length === 0) return null

  return (
    <section className="py-12 md:py-20 bg-white content-visibility-auto">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="font-serif text-2xl md:text-3xl text-[#2D0B0B] uppercase tracking-wide">
            Destaques
          </h2>
          <Button
            asChild
            variant="link"
            className="text-[#2D0B0B] hover:text-[#2D0B0B]/70 text-sm uppercase tracking-wider"
          >
            <Link to="/produtos">
              Ver tudo <ChevronRight className="h-4 w-4 inline" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
