/* Main App Component - Handles routing */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Product from './pages/Product'
import ProductsPage from './pages/Products'
import Checkout from './pages/Checkout'
import Favorites from './pages/Favorites'
import TrocaDevolucao from './pages/TrocaDevolucao'
import NotFound from './pages/NotFound'
import AdminUpload from './pages/admin/AdminUpload'
import Layout from './components/Layout'
import { AuthProvider } from './hooks/use-auth'
import { AdminRoute } from './components/AdminRoute'
import { useEffect } from 'react'
import SiteContentTab from './components/admin/SiteContentTab'
import { PixModal } from './components/PixModal'

const APP_CACHE_VERSION = '1.0.1'

if (typeof window !== 'undefined') {
  ;(window as any).SiteContentTabComponent = SiteContentTab
  ;(window as any).PixModalComponent = PixModal
}

const App = () => {
  useEffect(() => {
    const currentVersion = localStorage.getItem('app_cache_version')
    if (currentVersion !== APP_CACHE_VERSION) {
      sessionStorage.clear()
      localStorage.setItem('app_cache_version', APP_CACHE_VERSION)
    }
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PixModal />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/troca-e-devolucao" element={<TrocaDevolucao />} />
              <Route
                path="/admin/upload"
                element={
                  <AdminRoute>
                    <AdminUpload />
                  </AdminRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
