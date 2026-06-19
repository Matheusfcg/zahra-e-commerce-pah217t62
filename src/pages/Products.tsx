import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, type Product } from '@/services/products'
import { Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { useFavorites } from '@/hooks/use-favorites'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const promotion = searchParams.get('promotion')
  const { favorites, toggleFavorite } = useFavorites()

  useEffect(() => {
    setIsLoading(true)
    getProducts(category || undefined, promotion === 'true')
      .then(setProducts)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [category, promotion])

  const title = promotion === 'true' ? 'Promoções' : category ? category : 'Todas as Peças'

  const subtitle =
    promotion === 'true'
      ? 'Aproveite nossas ofertas exclusivas.'
      : 'Explore nossa coleção de peças exclusivas, desenvolvidas para inspirar o seu dia a dia.'

  return (
    <div className="w-full pt-28 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="font-sans font-light tracking-tight text-4xl md:text-5xl mb-4 text-foreground uppercase">
            {title}
          </h1>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {promotion === 'true'
                  ? 'Nenhuma promoção ativa no momento.'
                  : 'Nenhuma peça encontrada no catálogo.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
