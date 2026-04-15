import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Leaf, Star, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProducts, type Product } from '@/services/products'

const Index = () => {
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then((products) => {
        if (products.length > 0) {
          setFeaturedProduct(products[0])
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=high%20fashion%20elegant%20woman%20minimalist"
            alt="Zahrá Hero"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto flex flex-col items-center animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
            O Essencial e ser inesquecível
          </h1>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-cream hover:text-primary rounded-none px-8 py-6 text-sm uppercase tracking-widest font-medium transition-transform hover:scale-105"
          >
            <Link to={featuredProduct ? `/product/${featuredProduct.slug}` : '#'}>
              Descubra Mais
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Product Showcase */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProduct ? (
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 w-full lg:w-1/2 group overflow-hidden bg-cream-dark">
                <Link to={`/product/${featuredProduct.slug}`}>
                  <img
                    src={
                      featuredProduct.product_images?.[0]?.url ||
                      'https://img.usecurling.com/p/800/1000?q=bag'
                    }
                    alt={featuredProduct.name}
                    className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              </div>
              <div className="flex-1 lg:pl-12 text-center lg:text-left">
                <h2 className="font-serif text-4xl mb-4">{featuredProduct.name}</h2>
                <p className="text-xl font-medium mb-6">
                  R$ {Number(featuredProduct.price).toFixed(2).replace('.', ',')}
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                  {featuredProduct.description}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-none px-12 py-6 text-sm uppercase tracking-widest"
                >
                  <Link to={`/product/${featuredProduct.slug}`}>Comprar Agora</Link>
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

      {/* Call to Action / Image break */}
      <section className="h-[60vh] relative flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/800?q=abstract%20minimalist%20fabric%20texture%20burgundy"
            alt="Texture"
            className="w-full h-full object-cover opacity-90"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">A Arte da Simplicidade</h2>
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-primary rounded-none"
          >
            Conheça a Zahrá
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Index
