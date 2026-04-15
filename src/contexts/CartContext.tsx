import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { toast } from '@/hooks/use-toast'

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  color: string
}

interface CartContextType {
  items: CartItem[]
  isDrawerOpen: boolean
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (id: string, color: string) => void
  updateQuantity: (id: string, color: string, quantity: number) => void
  openDrawer: () => void
  closeDrawer: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.color === item.color)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.color === item.color
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      }
      return [...prev, { ...item, quantity }]
    })
    setIsDrawerOpen(true)
    toast({
      title: 'Adicionado ao carrinho',
      description: `${item.name} foi adicionado com sucesso.`,
    })
  }, [])

  const removeFromCart = useCallback((id: string, color: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.color === color)))
  }, [])

  const updateQuantity = useCallback(
    (id: string, color: string, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(id, color)
        return
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id && i.color === color ? { ...i, quantity } : i)),
      )
    },
    [removeFromCart],
  )

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  )

  return React.createElement(
    CartContext.Provider,
    {
      value: {
        items,
        isDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        openDrawer,
        closeDrawer,
        totalItems,
        subtotal,
      },
    },
    children,
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
