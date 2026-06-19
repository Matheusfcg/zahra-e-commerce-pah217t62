import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProducts, type Product } from '@/services/products'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ProductCard } from '@/components/ProductCard'

const Index = () => {
  const [newInProducts, setNewInProducts] = useState<Product[]>([])
  const [soffiProducts, setSoffiProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await getProducts()

        const featured = all.filter((p) => p.is_featured)
        setNewInProducts(featured.length > 0 ? featured : all.slice(0, 8))

        const soffi = all.filter((p) => p.category?.toUpperCase() === 'CONFECÇÃO SÔFFI')
        setSoffiProducts(soffi.length > 0 ? soffi : all.slice(0, 4))
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="w-full pt-[80px] md:pt-[120px] pb-20">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#3A2222]" />
        </div>
      ) : (
        <>
          {/* NEW IN Section */}
          <section className="py-12 md:py-16 px-4 md:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wider text-[#3A2222]">
                NEW IN
              </h2>
            </div>

            <div className="max-w-[1400px] mx-auto relative px-4 md:px-12">
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {newInProducts.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="-left-4 lg:-left-12 border-none bg-transparent hover:bg-transparent text-gray-500 hover:text-black scale-150" />
                  <CarouselNext className="-right-4 lg:-right-12 border-none bg-transparent hover:bg-transparent text-gray-500 hover:text-black scale-150" />
                </div>
              </Carousel>
            </div>
          </section>

          {/* CONFECÇÃO SÔFFI Grid Section */}
          <section className="py-12 md:py-16 px-4 md:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wider text-[#3A2222]">
                CONFECÇÃO SÔFFI
              </h2>
            </div>

            <div className="max-w-[1400px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {soffiProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>

          {/* Feature Block 2 */}
          <section className="py-16 md:py-24 bg-white px-4 md:px-8">
            <div className="max-w-[1200px] mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full md:w-1/2">
                  <img
                    src="https://img.usecurling.com/p/800/1000?q=high%20fashion%20minimalist%20clothing&dpr=2&seed=10"
                    alt="Confecção Sôffi"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#3A2222] mb-6">
                    Confecção Sôffi
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-8 max-w-md leading-relaxed font-sans">
                    Confecção própria, com atenção aos detalhes, caimento impecável e um cuidado que
                    se sente ao vestir. Criada para te acompanhar com leveza e estilo.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white rounded-none px-10 py-6 uppercase tracking-widest text-[12px] font-bold transition-all bg-transparent"
                  >
                    <Link to="/produtos?category=CONFECÇÃO%20SÔFFI">Conheça Já</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Index
