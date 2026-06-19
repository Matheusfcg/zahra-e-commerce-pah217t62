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
import NotFound from './pages/NotFound'
import AdminUpload from './pages/admin/AdminUpload'
import AdminContent from './pages/admin/AdminContent'
import Layout from './components/Layout'
import { AuthProvider } from './hooks/use-auth'
import { AdminRoute } from './components/AdminRoute'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route
              path="/admin/upload"
              element={
                <AdminRoute>
                  <AdminUpload />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminRoute>
                  <AdminContent />
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

export default App
