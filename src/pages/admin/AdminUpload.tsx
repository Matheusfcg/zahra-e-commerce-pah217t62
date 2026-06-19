import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2, MousePointerClick, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  // Content state
  const [siteContent, setSiteContent] = useState<any[]>([])
  const [savingContent, setSavingContent] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchSiteContent()
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

  const fetchSiteContent = async () => {
    const { data, error } = await supabase.from('site_content').select('*').order('section_key')
    if (data) setSiteContent(data)
    if (error) toast.error('Erro ao buscar conteúdos do site')
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

  const handleContentSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingContent(true)
    try {
      for (const item of siteContent) {
        await supabase
          .from('site_content')
          .update({ content_value: item.content_value })
          .eq('id', item.id)
      }
      toast.success('Conteúdo atualizado com sucesso!')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      toast.error('Erro ao atualizar conteúdo')
    } finally {
      setSavingContent(false)
    }
  }

  const handleContentChangeByKey = (key: string, value: string) => {
    setSiteContent((prev) =>
      prev.map((item) => (item.section_key === key ? { ...item, content_value: value } : item)),
    )
  }

  const handleImageUpload = async (key: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `site-content/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)

      handleContentChangeByKey(key, data.publicUrl)
      toast.success('Imagem enviada com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao enviar imagem: ' + err.message)
    }
  }

  const labelMap: Record<string, string> = {
    curated_title: 'TÍTULO DA CURADORIA',
    footer_about: 'RODAPÉ - SOBRE',
    footer_copyright: 'RODAPÉ - COPYRIGHT',
    footer_whatsapp: 'RODAPÉ - WHATSAPP',
    hero_button: 'BOTÃO DO HERO',
    hero_description: 'DESCRIÇÃO DO HERO',
    hero_left_image: 'IMAGEM ESQUERDA DO HERO',
    hero_right_image: 'IMAGEM DIREITA DO HERO',
    hero_title: 'TÍTULO DO HERO',
    values_1_title: 'TÍTULO DO VALOR 1',
    values_1_desc: 'DESCRIÇÃO DO VALOR 1',
    values_2_title: 'TÍTULO DO VALOR 2',
    values_2_desc: 'DESCRIÇÃO DO VALOR 2',
    values_3_title: 'TÍTULO DO VALOR 3',
    values_3_desc: 'DESCRIÇÃO DO VALOR 3',
    sets_description: 'DESCRIÇÃO DA CATEGORIA (CONJUNTOS)',
    tops_description: 'DESCRIÇÃO DA CATEGORIA (PARTES DE CIMA)',
    bottoms_description: 'DESCRIÇÃO DA CATEGORIA (PARTES DE BAIXO)',
  }

  const getFieldsForCategory = (category: string) => {
    return siteContent
      .filter((item) => {
        const key = item.section_key
        if (category === 'sets') return ['sets_description'].includes(key)
        if (category === 'tops') return ['tops_description'].includes(key)
        if (category === 'bottoms') return ['bottoms_description'].includes(key)
        return ![
          'sets_description',
          'tops_description',
          'bottoms_description',
          'hero_carousel_1',
          'hero_carousel_2',
          'hero_carousel_3',
          'hero_carousel_4',
          'hero_carousel_5',
          'hero_carousel_6',
        ].includes(key)
      })
      .sort((a, b) => {
        const labelA = labelMap[a.section_key] || a.section_key
        const labelB = labelMap[b.section_key] || b.section_key
        return labelA.localeCompare(labelB)
      })
  }

  const renderContentGroup = (category: string) => {
    const fields = getFieldsForCategory(category)
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {fields.map((item) => (
          <div key={item.id} className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {labelMap[item.section_key] || item.section_key.replace(/_/g, ' ')}
            </Label>
            {item.section_key.includes('image') || item.section_key.includes('carousel') ? (
              <div className="flex gap-2">
                <Input
                  value={item.content_value}
                  onChange={(e) => handleContentChangeByKey(item.section_key, e.target.value)}
                  type="url"
                  placeholder="https://..."
                  className="flex-1"
                />
                <Label className="cursor-pointer flex items-center justify-center px-3 border rounded-md hover:bg-secondary shrink-0 transition-colors">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(item.section_key, file)
                    }}
                  />
                </Label>
              </div>
            ) : item.content_value.length > 50 || item.section_key.includes('desc') ? (
              <Textarea
                value={item.content_value}
                onChange={(e) => handleContentChangeByKey(item.section_key, e.target.value)}
                className="min-h-[100px] resize-none"
              />
            ) : (
              <Input
                value={item.content_value}
                onChange={(e) => handleContentChangeByKey(item.section_key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="mt-24 flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
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
    <div
      className="mx-auto mb-20 mt-24 max-w-5xl px-4 min-h-[80vh]"
      style={{
        cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%232D0B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>'), auto`,
      }}
    >
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie o catálogo de produtos e os textos do site.
          </p>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="content">Conteúdo do Site</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="mb-6 flex justify-end">
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
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8B4513] bg-[#1a0f0f] shrink-0">
                <MousePointerClick className="h-6 w-6 text-[#8B4513]" />
              </div>
              <div>
                <CardTitle>Gerenciar Textos do Site</CardTitle>
                <CardDescription>
                  Altere os textos exibidos na página inicial e outras áreas públicas.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContentSave} className="space-y-6">
                <Tabs defaultValue="main" className="w-full">
                  <TabsList className="mb-6 flex-wrap h-auto">
                    <TabsTrigger value="main" className="flex-1 sm:flex-none">
                      Opção Principal
                    </TabsTrigger>
                    <TabsTrigger value="sets" className="flex-1 sm:flex-none">
                      Conjuntos
                    </TabsTrigger>
                    <TabsTrigger value="tops" className="flex-1 sm:flex-none">
                      Partes de Cima
                    </TabsTrigger>
                    <TabsTrigger value="bottoms" className="flex-1 sm:flex-none">
                      Partes de Baixo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="main">{renderContentGroup('main')}</TabsContent>
                  <TabsContent value="sets">{renderContentGroup('sets')}</TabsContent>
                  <TabsContent value="tops">{renderContentGroup('tops')}</TabsContent>
                  <TabsContent value="bottoms">{renderContentGroup('bottoms')}</TabsContent>
                </Tabs>

                <div className="pt-6 border-t flex justify-end">
                  <Button type="submit" disabled={savingContent} className="w-full sm:w-auto">
                    {savingContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
