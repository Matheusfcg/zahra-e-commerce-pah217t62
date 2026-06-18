import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductForm } from '@/components/admin/ProductForm'

export default function AdminUpload() {
  const { user, signIn, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [products, setProducts] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_colors(*)')
      .order('name')
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

  const handleDelete = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id)
    setIsDeleting(false)
    if (error) {
      toast.error('Erro ao excluir produto: ' + error.message)
    } else {
      toast.success('Produto removido com sucesso!')
      setProductToDelete(null)
      fetchProducts()
    }
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
    <div className="mx-auto mb-20 mt-24 max-w-5xl px-4">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Produtos</h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre, edite ou remova produtos do catálogo.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingProduct(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Atualize os dados e imagens do produto abaixo.'
                : 'Crie um novo produto e adicione suas imagens.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSuccess={() => {
              fetchProducts()
              setIsFormOpen(false)
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Nenhum produto encontrado no banco de dados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Imagens</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.slug}</div>
                  </TableCell>
                  <TableCell>R$ {product.price?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{product.product_images?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setIsFormOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
