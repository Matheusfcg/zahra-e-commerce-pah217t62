import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/services/products'

interface ProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
}

export function ProductCard({ product, isFavorite = false, onToggleFavorite }: ProductCardProps) {
  return (
    <div className="group flex flex-col gap-3 animate-fade-in">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/10">
        <Link to={`/product/${product.slug}`}>
          <img
            src={
              product.product_images?.find((img) => img.is_cover)?.url ||
              product.product_images?.[0]?.url ||
              'https://img.usecurling.com/p/800/1000?q=high%20fashion%20minimalist%20clothing&dpr=2'
            }
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite?.(product.id)
          }}
          className="absolute top-4 right-4 z-10 p-1 text-gray-700 hover:text-red-500 transition-colors"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-all duration-300',
              isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'stroke-[1.5]',
            )}
          />
        </button>

        <button
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 text-gray-700 hover:text-black transition-colors"
          aria-label="Adicionar ao carrinho"
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 items-start">
          {product.is_featured && null}
        </div>
      </div>
      <div className="flex flex-col items-center text-center gap-1 mt-3 px-1">
        <h3 className="font-sans text-[13px] font-medium text-[#2D0B0B]">
          <Link to={`/product/${product.slug}`} className="hover:opacity-70 transition-opacity">
            {product.name}
          </Link>
        </h3>
        <span className="font-sans text-[14px] font-bold text-[#2D0B0B] mt-0.5">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            product.price,
          )}
        </span>
      </div>
    </div>
  )
}
