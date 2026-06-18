import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Leaf, Star, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getProducts,
  getProductByName,
  getMixedCollectionProducts,
  getTopStockProducts,
  type Product,
} from '@/services/products'

const getPrimaryImageUrl = (images?: Product['product_images']) => {
  if (!images || images.length === 0)
    return 'https://img.usecurling.com/p/800/1000?q=fashion%20clothing&dpr=2'
  return [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0].url
}

const Index = () => {
  const [promoProducts, setPromoProducts] = useState<Product[]>([])
  const [mixedCollection, setMixedCollection] = useState<Product[]>([])
  const [topStock, setTopStock] = useState<Product[]>([])
  const [heroProduct, setHeroProduct] = useState<Product | null>(null)
  const [showcaseProduct, setShowcaseProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, maxiRenda, mixed, top] = await Promise.all([
          getProducts(),
          getProductByName('Maxi Renda').catch(() => null),
          getMixedCollectionProducts(),
          getTopStockProducts(),
        ])

        const uniqueTopStock: Product[] = []
        const topStockNames = new Set<string>()
        for (const p of top) {
          if (!topStockNames.has(p.name)) {
            topStockNames.add(p.name)
            uniqueTopStock.push(p)
          }
        }

        const uniquePromo: Product[] = []
        const promoNames = new Set<string>()
        for (const p of all.filter((p) => p.is_promotion)) {
          if (!promoNames.has(p.name)) {
            promoNames.add(p.name)
            uniquePromo.push(p)
          }
        }

        setPromoProducts(uniquePromo)

        // Hero product is Maxi Renda, fallback to first top stock
        setHeroProduct(maxiRenda || uniqueTopStock[0] || all[0] || null)

        // Showcase product is T-shirt Basica or fallback to next available
        const tshirtBasica = all.find((p) => p.name.toLowerCase().includes('basica'))
        setShowcaseProduct(tshirtBasica || uniqueTopStock[1] || all[1] || null)

        setMixedCollection(mixed)
        setTopStock(uniqueTopStock)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full bg-black overflow-hidden group">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : heroProduct ? (
          <div className="relative h-full w-full">
            <div className="absolute inset-0 z-0 bg-black">
              <img
                src={getPrimaryImageUrl(heroProduct.product_images)}
                alt={heroProduct.name}
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4 max-w-3xl mx-auto animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-tight">
                O Essencial é ser inesquecível
              </h1>
              <p className="text-xl md:text-3xl mb-4 font-light tracking-wider drop-shadow-md">
                {heroProduct.name}
              </p>
              {heroProduct.description && (
                <p className="text-base md:text-lg mb-4 font-light max-w-xl mx-auto drop-shadow-md line-clamp-2">
                  {heroProduct.description}
                </p>
              )}
              <p className="text-2xl font-medium mb-8 drop-shadow-md">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  heroProduct.price,
                )}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-cream hover:text-primary rounded-none px-8 py-6 text-sm uppercase tracking-widest font-medium transition-transform hover:scale-105"
              >
                <Link to={`/product/${heroProduct.slug}`}>Descubra Mais</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight animate-fade-in-up">
              O Essencial é ser inesquecível
            </h1>
          </div>
        )}
      </section>

      {/* Featured Product Showcase */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showcaseProduct ? (
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 w-full lg:w-1/2 group overflow-hidden bg-cream-dark">
                <Link to={`/product/${showcaseProduct.slug}`}>
                  <img
                    src={getPrimaryImageUrl(showcaseProduct.product_images)}
                    alt={showcaseProduct.name}
                    className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              </div>
              <div className="flex-1 lg:pl-12 text-center lg:text-left">
                <h2 className="font-serif text-4xl mb-4">{showcaseProduct.name}</h2>
                <p className="text-xl font-medium mb-6">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    showcaseProduct.price,
                  )}
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                  {showcaseProduct.description}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-none px-12 py-6 text-sm uppercase tracking-widest"
                >
                  <Link to={`/product/${showcaseProduct.slug}`}>Comprar Agora</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum produto em destaque no momento.
            </div>
          )}
        </div>
      </section>

      {/* Nossa Coleção Collection */}
      {!isLoading && mixedCollection.length > 0 && (
        <section className="py-24 bg-white" id="colecao">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl mb-4">Nossa Coleção</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Seleção dinâmica de peças exclusivas, combinando o melhor do luxo acessível e da
                alta-costura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mixedCollection.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="overflow-hidden bg-cream-dark mb-4 relative aspect-[3/4]">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={getPrimaryImageUrl(product.product_images)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
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
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button
                asChild
                variant="outline"
                className="rounded-none px-8 py-6 text-sm uppercase tracking-widest border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Link to="/produtos">Ver Todas as Peças</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Promoção Section */}
      {!isLoading && promoProducts.length > 0 && (
        <section className="py-24 bg-red-50" id="promocao">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl mb-4 text-[#D94F4F]">Promoção</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Seleção especial com preços irresistíveis. Aproveite as nossas ofertas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {promoProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="overflow-hidden bg-cream-dark mb-4 relative aspect-[3/4]">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={getPrimaryImageUrl(product.product_images)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    <div className="absolute top-3 right-3 bg-[#D94F4F] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 shadow-sm rounded-sm z-10">
                      Promoção
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <h3 className="font-serif text-xl mb-1">
                      <Link
                        to={`/product/${product.slug}`}
                        className="hover:text-[#D94F4F] transition-colors"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <p className="font-medium text-[#D94F4F]">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Values */}
      <section className="py-24 bg-cream-dark/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-white shadow-sm text-primary">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium">Design Autoral</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Peças exclusivas desenhadas no Brasil com foco no minimalismo atemporal.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-white shadow-sm text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium">Qualidade Premium</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Seleção rigorosa de materiais para garantir durabilidade e sofisticação.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-white shadow-sm text-primary">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium">Sustentabilidade</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Compromisso com o meio ambiente utilizando couro vegano de alta tecnologia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
