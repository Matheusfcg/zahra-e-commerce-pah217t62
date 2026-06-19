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
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 backdrop-blur hover:bg-white transition-colors"
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

        {product.is_promotion && (
          <div className="absolute top-4 left-4 bg-foreground text-background text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 shadow-sm rounded-none z-10">
            Promoção
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-sans text-sm font-medium leading-tight">
            <Link
              to={`/product/${product.slug}`}
              className="hover:underline underline-offset-4 decoration-muted-foreground/30 transition-all"
            >
              {product.name}
            </Link>
          </h3>
          <span className="font-sans text-sm text-muted-foreground whitespace-nowrap">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              product.price,
            )}
          </span>
        </div>
        {product.category && (
          <p className="text-xs text-muted-foreground font-sans">{product.category}</p>
        )}
      </div>
    </div>
  )
}
