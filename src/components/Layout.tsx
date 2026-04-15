import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { Chatbot } from '@/components/Chatbot'
import { CartProvider } from '@/contexts/CartContext'

export default function Layout() {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <Chatbot />
      </div>
    </CartProvider>
  )
}
