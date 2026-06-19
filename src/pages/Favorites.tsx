import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getFavorites, type Favorite } from '@/services/favorites'
import { ProductCard } from '@/components/ProductCard'
import { Loader2 } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { Link } from 'react-router-dom'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { favorites: favIds, toggleFavorite } = useFavorites()

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      getFavorites(user.id)
        .then(setFavorites)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-4 bg-background">
        <h1 className="font-sans font-light tracking-tight text-3xl mb-4 text-foreground">
          Seus Favoritos
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md font-sans">
          Faça login ou crie uma conta para poder salvar e visualizar os seus produtos favoritos.
        </p>
      </div>
    )
  }

  // Filter display list by the global favorites state so items disappear nicely when toggled off
  const displayFavorites = favorites.filter((fav) => favIds.has(fav.product_id))

  return (
    <div className="w-full pt-28 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="font-sans font-light tracking-tight text-4xl md:text-5xl mb-4 text-foreground">
            Favoritos
          </h1>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
            As peças que você mais amou, separadas especialmente para você.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayFavorites.map((favorite) => (
              <ProductCard
                key={favorite.id}
                product={favorite.products}
                isFavorite={favIds.has(favorite.product_id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
            {displayFavorites.length === 0 && (
              <div className="col-span-full flex flex-col items-center text-center py-20 text-muted-foreground">
                <p className="mb-6 font-sans">
                  Você ainda não tem nenhum produto salvo nos favoritos.
                </p>
                <Link
                  to="/produtos"
                  className="font-sans font-medium uppercase tracking-wider text-xs border-b border-muted-foreground pb-1 hover:text-foreground transition-colors"
                >
                  Descubra Nossas Peças
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
