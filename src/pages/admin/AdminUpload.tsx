import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { ProductAdminForm } from '@/components/admin/ProductAdminForm'
import { CreateProductForm } from '@/components/admin/CreateProductForm'

export default function AdminUpload() {
  const { user, signIn, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (data) setProducts(data)
    if (error) toast.error('Erro ao buscar produtos')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const { error } = await signIn(email, password)
    setLoginLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Login realizado com sucesso')
  }

  if (authLoading) {
    return (
      <div className="mt-24 flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto mb-20 mt-24 max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle>Login Administrativo</CardTitle>
            <CardDescription>
              Por favor, faça login para acessar a área administrativa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto mb-20 mt-24 max-w-4xl px-4">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Produtos</h1>
          <p className="mt-2 text-muted-foreground">
            Atualize preços de produtos e envie imagens simultaneamente.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
              <DialogDescription>
                Crie um novo produto e envie suas imagens. O formulário será redefinido após salvar
                para que você possa adicionar rapidamente o próximo item.
              </DialogDescription>
            </DialogHeader>
            <CreateProductForm onCreated={fetchProducts} />
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Nenhum produto encontrado no banco de dados.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {products.map((product) => (
            <AccordionItem
              key={product.id}
              value={product.id}
              className="rounded-lg border bg-card px-4 shadow-sm"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex w-full items-center justify-between pr-6">
                  <span className="text-lg font-semibold">{product.name}</span>
                  <span className="font-medium text-muted-foreground">
                    R$ {product.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ProductAdminForm product={product} onUpdated={fetchProducts} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
