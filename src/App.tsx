/* Main App Component - Handles routing */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { lazy, Suspense, useEffect } from 'react'
import Layout from './components/Layout'
import { AuthProvider } from './hooks/use-auth'
import { setupGlobalPrefetchListener } from './lib/prefetch'
import { AdminRoute } from './components/AdminRoute'
import { useThemeFont } from './hooks/use-theme-font'
import SiteContentTab from './components/admin/SiteContentTab'
import { PixModal } from './components/PixModal'
import { ManageCategories } from './components/admin/ManageCategories'
import { MelhorEnvioSettings } from './components/admin/MelhorEnvioSettings'

// Route-based code splitting
const Auth = lazy(() => import('./pages/Auth'))
const Profile = lazy(() => import('./pages/Profile'))
const Index = lazy(() => import('./pages/Index'))
const Product = lazy(() => import('./pages/Product'))
const ProductsPage = lazy(() => import('./pages/Products'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Orders = lazy(() => import('./pages/Orders'))
const TrocaDevolucao = lazy(() => import('./pages/TrocaDevolucao'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminUpload = lazy(() => import('./pages/admin/AdminUpload'))
const Appearance = lazy(() => import('./pages/admin/Appearance'))
const ShippingCallback = lazy(() => import('./pages/admin/ShippingCallback'))

const APP_CACHE_VERSION = '1.0.1'

if (typeof window !== 'undefined') {
  ;(window as any).SiteContentTabComponent = SiteContentTab
  ;(window as any).PixModalComponent = PixModal
  ;(window as any).ManageCategoriesComponent = ManageCategories
  ;(window as any).MelhorEnvioSettingsComponent = MelhorEnvioSettings
}

const PageFallback = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-start pt-28 px-4">
    <div className="w-full max-w-[1200px] space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-[#e8e4e0] rounded mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] w-full bg-[#f4f1ee] rounded-none" />
            <div className="h-4 w-3/4 mx-auto bg-[#e8e4e0] rounded" />
            <div className="h-4 w-1/2 mx-auto bg-[#e8e4e0] rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

const App = () => {
  useThemeFont()

  useEffect(() => {
    setupGlobalPrefetchListener()
  }, [])

  useEffect(() => {
    const currentVersion = localStorage.getItem('app_cache_version')
    if (currentVersion !== APP_CACHE_VERSION) {
      sessionStorage.clear()
      localStorage.setItem('app_cache_version', APP_CACHE_VERSION)
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PixModal />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Index />} />
                <Route path="/produtos" element={<ProductsPage />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/meus-pedidos" element={<Orders />} />
                <Route path="/my-orders" element={<Orders />} />
                <Route path="/troca-e-devolucao" element={<TrocaDevolucao />} />
                <Route
                  path="/admin/upload"
                  element={
                    <AdminRoute>
                      <AdminUpload />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/appearance"
                  element={
                    <AdminRoute>
                      <Appearance />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/shipping-callback"
                  element={
                    <AdminRoute>
                      <ShippingCallback />
                    </AdminRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
