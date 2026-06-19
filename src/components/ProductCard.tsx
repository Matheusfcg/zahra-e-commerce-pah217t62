import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/services/products'

interface ProductCardProps {
  product: Product
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

export function ProductCard({ product, isFavorite, onToggleFavorite }: ProductCardProps) {
  return (
    <div className="group flex flex-col gap-4 animate-fade-in">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/10">
        <Link to={`/product/${product.slug}`}>
          <img
            src={
              product.product_images?.[0]?.url ||
              'https://img.usecurling.com/p/800/1000?q=high%20fashion%20minimalist%20clothing&dpr=2'
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite(product.id)
          }}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/70 backdrop-blur hover:bg-white transition-colors"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-all duration-300',
              isFavorite
                ? 'fill-red-500 text-red-500 scale-110'
                : 'text-gray-600 hover:text-gray-900',
            )}
          />
        </button>

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 items-end">
          {product.is_promotion && (
            <div className="bg-[#D94F4F] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 shadow-sm rounded-sm">
              SALE
            </div>
          )}
          {product.is_featured && (
            <div className="bg-[#3A2222] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 shadow-sm rounded-sm">
              Peça em destaque
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center text-center gap-1 mt-3 px-1">
        <h3 className="font-serif text-[13px] uppercase tracking-wider text-[#3A2222]">
          <Link to={`/product/${product.slug}`} className="hover:opacity-70 transition-opacity">
            {product.name}
          </Link>
        </h3>
        <span
          className={cn(
            'font-sans text-[13px] whitespace-nowrap font-medium',
            product.is_promotion ? 'text-[#D94F4F]' : 'text-[#3A2222]',
          )}
        >
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            product.price,
          )}
        </span>
      </div>
    </div>
  )
}
