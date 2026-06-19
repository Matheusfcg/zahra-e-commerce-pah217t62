import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { getFavoriteIds, addFavorite, removeFavorite } from '@/services/favorites'
import { toast } from 'sonner'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      getFavoriteIds(user.id)
        .then((ids) => setFavorites(new Set(ids)))
        .catch(console.error)
    } else {
      setFavorites(new Set())
    }
  }, [user])

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast.error('Faça login para salvar seus produtos favoritos.')
      return
    }

    const isFav = favorites.has(productId)
    const newFavs = new Set(favorites)

    if (isFav) {
      newFavs.delete(productId)
      setFavorites(newFavs)
      try {
        await removeFavorite(user.id, productId)
      } catch (e) {
        toast.error('Erro ao remover favorito.')
        setFavorites(favorites) // Revert on error
      }
    } else {
      newFavs.add(productId)
      setFavorites(newFavs)
      try {
        await addFavorite(user.id, productId)
        toast.success('Produto salvo nos favoritos.')
      } catch (e) {
        toast.error('Erro ao adicionar favorito.')
        setFavorites(favorites) // Revert on error
      }
    }
  }

  return { favorites, toggleFavorite }
}
