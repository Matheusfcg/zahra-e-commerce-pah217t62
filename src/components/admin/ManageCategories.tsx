import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Plus, Trash2, Edit2, Star, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySlug, setNewCategorySlug] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState('')
  const [newCategoryIsFeatured, setNewCategoryIsFeatured] = useState(false)

  const [editingCategory, setEditingCategory] = useState<any>(null)

  const { toast } = useToast()

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive',
      })
    } else {
      setCategories(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleNameChange = (val: string) => {
    setNewCategoryName(val)
    if (
      !newCategorySlug ||
      newCategorySlug ===
        newCategoryName
          .trim()
          .toLowerCase()
          .replace(/[\s_]+/g, '-')
          .replace(/[^\w-]+/g, '')
    ) {
      setNewCategorySlug(
        val
          .trim()
          .toLowerCase()
          .replace(/[\s_]+/g, '-')
          .replace(/[^\w-]+/g, ''),
      )
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setIsSaving(true)
    const slug =
      newCategorySlug.trim() ||
      newCategoryName
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]+/g, '')

    const { error } = await supabase.from('categories').insert({
      name: newCategoryName.trim(),
      slug,
      description: newCategoryDescription.trim() || null,
      image_url: newCategoryImageUrl.trim() || null,
      is_featured: newCategoryIsFeatured,
    })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a categoria.',
        variant: 'destructive',
      })
      setIsSaving(false)
    } else {
      toast({ title: 'Sucesso', description: 'Categoria criada com sucesso.' })
      fetchCategories()
      setNewCategoryName('')
      setNewCategorySlug('')
      setNewCategoryDescription('')
      setNewCategoryImageUrl('')
      setNewCategoryIsFeatured(false)
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso.' })
      fetchCategories()
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    setIsSaving(true)
    const slug =
      editingCategory.slug?.trim() ||
      editingCategory.name
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]+/g, '')

    const { error } = await supabase
      .from('categories')
      .update({
        name: editingCategory.name.trim(),
        slug,
        description: editingCategory.description?.trim() || null,
        image_url: editingCategory.image_url?.trim() || null,
        is_featured: editingCategory.is_featured,
      })
      .eq('id', editingCategory.id)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a categoria.',
        variant: 'destructive',
      })
      setIsSaving(false)
    } else {
      toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso.' })
      setEditingCategory(null)
      fetchCategories()
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end bg-muted/20 p-4 rounded-lg border"
      >
        <div className="space-y-2">
          <Label>Nome da Categoria</Label>
          <Input
            placeholder="Ex: Conjuntos"
            value={newCategoryName}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            placeholder="Ex: conjuntos"
            value={newCategorySlug}
            onChange={(e) => setNewCategorySlug(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Subtítulo / Descrição</Label>
          <Input
            placeholder="Ex: Descubra nossa coleção de conjuntos elegantes."
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label>URL da Imagem de Capa (Para exibir no início)</Label>
          <Input
            placeholder="https://..."
            value={newCategoryImageUrl}
            onChange={(e) => setNewCategoryImageUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-4 h-10 px-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="new-featured"
              checked={newCategoryIsFeatured}
              onCheckedChange={setNewCategoryIsFeatured}
            />
            <Label htmlFor="new-featured" className="cursor-pointer">
              Exibir no Início
            </Label>
          </div>
          <Button type="submit" disabled={isSaving || !newCategoryName.trim()}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Adicionar
          </Button>
        </div>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma categoria encontrada.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {cat.image_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border">
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border">
                        <ImageIcon className="w-4 h-4 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {cat.name}
                    <div className="text-xs text-muted-foreground font-normal">{cat.slug}</div>
                  </TableCell>
                  <TableCell>
                    {cat.is_featured ? (
                      <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                        <Star className="w-3 h-3 mr-1 fill-amber-600" /> Na Página Inicial
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCategory(cat)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Editar Categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={editingCategory.slug || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, slug: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo / Descrição</Label>
                  <Input
                    value={editingCategory.description || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL da Imagem</Label>
                  <Input
                    value={editingCategory.image_url || ''}
                    placeholder="https://..."
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, image_url: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="edit-featured"
                    checked={editingCategory.is_featured || false}
                    onCheckedChange={(checked) =>
                      setEditingCategory({ ...editingCategory, is_featured: checked })
                    }
                  />
                  <Label htmlFor="edit-featured" className="cursor-pointer">
                    Exibir no Início
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || !editingCategory.name.trim()}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
