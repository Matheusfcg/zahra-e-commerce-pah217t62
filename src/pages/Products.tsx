import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, type Product } from '@/services/products'
import { Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { useFavorites } from '@/hooks/use-favorites'
import { supabase } from '@/lib/supabase/client'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const promotion = searchParams.get('promotion')
  const { favorites, toggleFavorite } = useFavorites()
  const [siteContent, setSiteContent] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      getProducts(category || undefined, promotion === 'true'),
      supabase.from('site_content').select('*'),
    ])
      .then(([productsData, contentResponse]) => {
        setProducts(productsData || [])
        if (contentResponse.data) {
          const contentMap = contentResponse.data.reduce(
            (acc, curr) => ({ ...acc, [curr.section_key]: curr.content_value }),
            {} as Record<string, string>,
          )
          setSiteContent(contentMap)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [category, promotion])

  const getText = (key: string, fallback: string) => siteContent[key] || fallback

  let title = getText('tab_name_principal', 'Todas as Peças')
  let subtitle =
    'Explore nossa coleção de peças exclusivas, desenvolvidas para inspirar o seu dia a dia.'

  if (promotion === 'true') {
    title = 'Promoções'
    subtitle = 'Aproveite nossas ofertas exclusivas.'
  } else if (category) {
    const catLower = category.toLowerCase()
    if (catLower.includes('conjuntos')) {
      title = getText('sets_title', getText('tab_name_conjuntos', category))
      subtitle = getText('sets_description', subtitle)
    } else if (catLower.includes('cima')) {
      title = getText('tops_title', getText('tab_name_partes_de_cima', category))
      subtitle = getText('tops_description', subtitle)
    } else if (catLower.includes('baixo')) {
      title = getText('bottoms_title', getText('tab_name_partes_de_baixo', category))
      subtitle = getText('bottoms_description', subtitle)
    } else {
      title = category
    }
  } else {
    title = getText('main_title', getText('tab_name_principal', 'Todas as Peças'))
  }

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
