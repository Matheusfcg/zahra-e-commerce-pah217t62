import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, type Product } from '@/services/products'
import { Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { useFavorites } from '@/hooks/use-favorites'
import { supabase } from '@/lib/supabase/client'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const promotion = searchParams.get('promotion')
  const { favorites, toggleFavorite } = useFavorites()

  const [siteContent, setSiteContent] = useState<Record<string, string>>(() => {
    try {
      const raw = sessionStorage.getItem('site_content_cache_v2')
      if (raw) {
        const parsed = JSON.parse(raw)
        return parsed.data || {}
      }
    } catch {
      // ignore
    }
    return {}
  })

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentCategoryInfo, setCurrentCategoryInfo] = useState<{
    name: string
    description: string | null
  } | null>(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const fetchCategoryInfo = category
      ? supabase
          .from('categories')
          .select('name, description')
          .ilike('name', category)
          .maybeSingle()
      : Promise.resolve({ data: null })

    import('@/services/siteContent').then(({ getSiteContentCached }) => {
      Promise.all([
        getProducts(category || undefined, promotion === 'true'),
        getSiteContentCached(),
        fetchCategoryInfo,
      ])
        .then(([productsData, contentMap, categoryResponse]) => {
          if (!isMounted) return
          setProducts(productsData || [])
          if (contentMap && Object.keys(contentMap).length > 0) {
            setSiteContent(contentMap)
          }
          if (categoryResponse?.data) {
            setCurrentCategoryInfo(categoryResponse.data)
          } else {
            setCurrentCategoryInfo(null)
          }
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    })

    return () => {
      isMounted = false
    }
  }, [category, promotion])

  const getText = (key: string, fallback: string) => siteContent[key] || fallback

  let title = getText('tab_name_principal', 'Todas as Peças')
  let subtitle: string | null =
    'Explore nossa coleção de peças exclusivas, desenvolvidas para inspirar o seu dia a dia.'

  if (promotion === 'true') {
    title = 'Promoções'
    subtitle = 'Aproveite nossas ofertas exclusivas.'
  } else if (category) {
    if (currentCategoryInfo?.description) {
      title = currentCategoryInfo.name || category
      subtitle = currentCategoryInfo.description
    } else {
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
        subtitle = null
      }
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
          {subtitle && (
            <p className="text-muted-foreground font-sans max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[3/4] w-full bg-[#f4f1ee] animate-pulse rounded-none" />
                <div className="h-4 w-3/4 mx-auto bg-[#e8e4e0] animate-pulse rounded" />
                <div className="h-4 w-1/3 mx-auto bg-[#e8e4e0] animate-pulse rounded" />
              </div>
            ))}
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
