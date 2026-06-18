import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, type Product } from '@/services/products'
import { Loader2 } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="w-full pt-28 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-[#3d271d]">Todas as Peças</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore nossa coleção completa de peças exclusivas, desenvolvidas para inspirar o seu
            dia a dia.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer animate-fade-in">
                <div className="overflow-hidden bg-cream-dark mb-4 relative aspect-[3/4]">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={
                        product.product_images?.[0]?.url ||
                        'https://img.usecurling.com/p/800/1000?q=high%20fashion%20minimalist%20clothing&dpr=2'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  {product.is_promotion && (
                    <div className="absolute top-3 right-3 bg-[#D94F4F] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 shadow-sm rounded-sm z-10">
                      Promoção
                    </div>
                  )}
                </div>
                <div className="text-center pt-2">
                  <h3 className="font-serif text-xl mb-1">
                    <Link
                      to={`/product/${product.slug}`}
                      className="hover:text-primary/80 transition-colors"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p className="font-medium text-muted-foreground">
                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Nenhuma peça encontrada no catálogo.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
