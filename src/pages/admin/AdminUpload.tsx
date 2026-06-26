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
import { Switch } from '@/components/ui/switch'
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
      .select('*, product_images(*), product_colors(*), product_sizes(*)')
      .order('name')
    if (data) setProducts(data)
    if (error) toast.error('Erro ao buscar produtos')
  }

  const fetchSiteContent = async () => {
    const { data, error } = await supabase.from('site_content').select('*').order('section_key')
    if (data) {
      const existingKeys = new Set(data.map((d) => d.section_key))
      const requiredKeys = [
        { key: 'hero_banner_1', value: '' },
        { key: 'hero_banner_2', value: '' },
        { key: 'hero_banner_3', value: '' },
        { key: 'hero_banner_4', value: '' },
        { key: 'category_1_label', value: 'Blusas/Bodys' },
        { key: 'category_1_image', value: '' },
        { key: 'category_1_title', value: 'Blusas/Bodys' },
        { key: 'category_1_desc', value: 'Descubra nossa coleção de blusas e bodys.' },
        { key: 'category_2_label', value: 'Conjuntos' },
        { key: 'category_2_image', value: '' },
        { key: 'category_2_title', value: 'Conjuntos' },
        { key: 'category_2_desc', value: 'Descubra nossa coleção de conjuntos elegantes.' },
        { key: 'category_3_label', value: 'Partes de baixo' },
        { key: 'category_3_image', value: '' },
        { key: 'category_3_title', value: 'Partes de Baixo' },
        { key: 'category_3_desc', value: 'Descubra nossa coleção de partes de baixo.' },
        { key: 'category_4_label', value: 'Macaquinho' },
        { key: 'category_4_image', value: '' },
        { key: 'category_4_title', value: 'Macaquinho' },
        { key: 'category_4_desc', value: 'Descubra nossa coleção de macaquinhos.' },
        { key: 'category_5_label', value: 'Jeans' },
        { key: 'category_5_image', value: '' },
        { key: 'category_5_title', value: 'Jeans' },
        { key: 'category_5_desc', value: 'Descubra nossa coleção de jeans.' },
      ]

      const mergedData = [...data]
      requiredKeys.forEach((req) => {
        if (!existingKeys.has(req.key)) {
          mergedData.push({
            id: '',
            section_key: req.key,
            content_value: req.value,
          })
        }
      })

      setSiteContent(mergedData)
      ;(window as any).__siteContentState = mergedData
      ;(window as any).__setSiteContentState = (val: any) => {
        setSiteContent(val)
        ;(window as any).__siteContentState =
          typeof val === 'function' ? val((window as any).__siteContentState) : val
      }
    }
    if (error) toast.error('Erro ao buscar conteúdos do site')
  }

  useEffect(() => {
    ;(window as any).__siteContentState = siteContent
    ;(window as any).__setSiteContentState = (val: any) => {
      setSiteContent(val)
      ;(window as any).__siteContentState =
        typeof val === 'function' ? val((window as any).__siteContentState) : val
    }
  }, [siteContent])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const { error } = await signIn(email, password)
    setLoginLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Login realizado com sucesso')
  }

  const handleToggleFeatured = async (id: string, is_featured: boolean) => {
    const { error } = await supabase.from('products').update({ is_featured }).eq('id', id)
    if (error) {
      toast.error('Erro ao atualizar destaque: ' + error.message)
    } else {
      toast.success('Destaque atualizado!')
      fetchProducts()
    }
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
        if (item.id) {
          await supabase
            .from('site_content')
            .update({ content_value: item.content_value })
            .eq('id', item.id)
        } else {
          await supabase
            .from('site_content')
            .upsert(
              { section_key: item.section_key, content_value: item.content_value },
              { onConflict: 'section_key' },
            )
        }
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
    hero_banner_1: 'IMAGEM HERO 1',
    hero_banner_2: 'IMAGEM HERO 2',
    hero_banner_3: 'IMAGEM HERO 3',
    hero_banner_4: 'IMAGEM HERO 4',
    category_1_label: 'RÓTULO DA CATEGORIA (BLUSAS/BODYS)',
    category_1_image: 'IMAGEM DA CATEGORIA (BLUSAS/BODYS)',
    category_1_title: 'TÍTULO DA SEÇÃO (BLUSAS/BODYS)',
    category_1_desc: 'DESCRIÇÃO DA CATEGORIA (BLUSAS/BODYS)',
    category_2_label: 'RÓTULO DA CATEGORIA (CONJUNTOS)',
    category_2_image: 'IMAGEM DA CATEGORIA (CONJUNTOS)',
    category_2_title: 'TÍTULO DA SEÇÃO (CONJUNTOS)',
    category_2_desc: 'DESCRIÇÃO DA CATEGORIA (CONJUNTOS)',
    category_3_label: 'RÓTULO DA CATEGORIA (PARTES DE BAIXO)',
    category_3_image: 'IMAGEM DA CATEGORIA (PARTES DE BAIXO)',
    category_3_title: 'TÍTULO DA SEÇÃO (PARTES DE BAIXO)',
    category_3_desc: 'DESCRIÇÃO DA CATEGORIA (PARTES DE BAIXO)',
    category_4_label: 'RÓTULO DA CATEGORIA (MACAQUINHO)',
    category_4_image: 'IMAGEM DA CATEGORIA (MACAQUINHO)',
    category_4_title: 'TÍTULO DA SEÇÃO (MACAQUINHO)',
    category_4_desc: 'DESCRIÇÃO DA CATEGORIA (MACAQUINHO)',
    category_5_label: 'RÓTULO DA CATEGORIA (JEANS)',
    category_5_image: 'IMAGEM DA CATEGORIA (JEANS)',
    category_5_title: 'TÍTULO DA SEÇÃO (JEANS)',
    category_5_desc: 'DESCRIÇÃO DA CATEGORIA (JEANS)',
  }

  const getFieldsForCategory = (category: string) => {
    return siteContent
      .filter((item) => {
        const key = item.section_key
        if (category === 'main')
          return ['hero_banner_1', 'hero_banner_2', 'hero_banner_3', 'hero_banner_4'].includes(key)
        if (category === 'cat1') return key.startsWith('category_1_')
        if (category === 'cat2') return key.startsWith('category_2_')
        if (category === 'cat3') return key.startsWith('category_3_')
        if (category === 'cat4') return key.startsWith('category_4_')
        if (category === 'cat5') return key.startsWith('category_5_')
        return false
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
            {item.section_key.includes('image') ||
            item.section_key.includes('banner') ||
            item.section_key.includes('carousel') ? (
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
          <TabsTrigger value="texts">Textos do Site</TabsTrigger>
          <TabsTrigger value="categories">Categorias & Pix</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          {(() => {
            const Comp = (window as any).SiteContentTabComponent
            return Comp ? (
              <Comp />
            ) : (
              <div className="py-12 text-center text-muted-foreground border rounded-lg bg-muted/10 mt-6">
                Carregando gerenciador de conteúdo...
              </div>
            )
          })()}
        </TabsContent>

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
                    <TableHead className="text-center">Exibição na Home</TableHead>
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
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={!!product.is_featured}
                            onCheckedChange={(checked) => handleToggleFeatured(product.id, checked)}
                          />
                        </div>
                      </TableCell>
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

        <TabsContent value="texts">
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
                      Banner Principal
                    </TabsTrigger>
                    <TabsTrigger value="cat1" className="flex-1 sm:flex-none">
                      Blusas/Bodys
                    </TabsTrigger>
                    <TabsTrigger value="cat2" className="flex-1 sm:flex-none">
                      Conjuntos
                    </TabsTrigger>
                    <TabsTrigger value="cat3" className="flex-1 sm:flex-none">
                      Partes de Baixo
                    </TabsTrigger>
                    <TabsTrigger value="cat4" className="flex-1 sm:flex-none">
                      Macaquinho
                    </TabsTrigger>
                    <TabsTrigger value="cat5" className="flex-1 sm:flex-none">
                      Jeans
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="main">{renderContentGroup('main')}</TabsContent>
                  <TabsContent value="cat1">{renderContentGroup('cat1')}</TabsContent>
                  <TabsContent value="cat2">{renderContentGroup('cat2')}</TabsContent>
                  <TabsContent value="cat3">{renderContentGroup('cat3')}</TabsContent>
                  <TabsContent value="cat4">{renderContentGroup('cat4')}</TabsContent>
                  <TabsContent value="cat5">{renderContentGroup('cat5')}</TabsContent>
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
