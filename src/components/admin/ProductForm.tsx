import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ArrowRight, Trash2, Plus, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductFormProps {
  product?: any
  onSuccess: () => void
  onCancel: () => void
}

interface SizeEntry {
  id: string
  size_name: string
  quantity: string
  isNew?: boolean
  _deleted?: boolean
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: '',
    composition: '',
    measurements: '',
    category: '',
    is_promotion: false,
    is_featured: false,
    show_in_carousel: false,
    weight_g: '',
    height_cm: '',
    width_cm: '',
    length_cm: '',
  })

  const [images, setImages] = useState<any[]>([])
  const [sizes, setSizes] = useState<SizeEntry[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        composition: product.composition || '',
        measurements: product.measurements || '',
        category: product.category || '',
        is_promotion: product.is_promotion || false,
        is_featured: product.is_featured || false,
        show_in_carousel: product.show_in_carousel || false,
        weight_g: product.weight_g?.toString() || '',
        height_cm: product.height_cm?.toString() || '',
        width_cm: product.width_cm?.toString() || '',
        length_cm: product.length_cm?.toString() || '',
      })

      if (product.product_images) {
        const sortedImages = [...product.product_images].sort(
          (a, b) => (a.display_order || 0) - (b.display_order || 0),
        )
        setImages(sortedImages.map((img) => ({ ...img, _deleted: false })))
      }

      if (product.product_sizes && product.product_sizes.length > 0) {
        setSizes(
          product.product_sizes.map((s: any) => ({
            ...s,
            quantity: s.quantity.toString(),
            _deleted: false,
          })),
        )
      } else {
        setSizes([
          {
            id: `temp-${Date.now()}`,
            size_name: 'Tamanho Único',
            quantity: product.quantity?.toString() || '0',
            isNew: true,
            _deleted: false,
          },
        ])
      }
    } else {
      setSizes([
        {
          id: `temp-${Date.now()}`,
          size_name: 'Tamanho Único',
          quantity: '0',
          isNew: true,
          _deleted: false,
        },
      ])
    }
  }, [product])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'name' && !product) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)

      const hasCover = images.some((i) => !i._deleted && i.is_cover)

      const newImage = {
        id: `temp-${Date.now()}`,
        url: data.publicUrl,
        display_order: images.filter((i) => !i._deleted).length,
        is_cover: !hasCover,
        isNew: true,
        _deleted: false,
      }

      setImages([...images, newImage])
      toast.success('Imagem carregada com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao fazer upload da imagem: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const activeImages = images
    .filter((img) => !img._deleted)
    .sort((a, b) => a.display_order - b.display_order)

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return
    if (direction === 'right' && index === activeImages.length - 1) return

    const targetIndex = direction === 'left' ? index - 1 : index + 1

    const newActive = [...activeImages]
    const temp = newActive[index]
    newActive[index] = newActive[targetIndex]
    newActive[targetIndex] = temp

    const reorderedActive = newActive.map((img, i) => ({ ...img, display_order: i }))

    const newImages = images.map((img) => {
      if (img._deleted) return img
      const found = reorderedActive.find((ri) => ri.id === img.id)
      return found ? found : img
    })

    setImages(newImages)
  }

  const removeImage = (idToRemove: string) => {
    const newImages = images.map((img) => {
      if (img.id === idToRemove) return { ...img, _deleted: true }
      return img
    })

    let counter = 0
    const finalImages = newImages.map((img) => {
      if (!img._deleted) {
        const updated = { ...img, display_order: counter }
        counter++
        return updated
      }
      return img
    })

    // Check if we deleted the cover
    const hasCover = finalImages.some((i) => !i._deleted && i.is_cover)
    if (!hasCover) {
      const firstActive = finalImages.find((i) => !i._deleted)
      if (firstActive) firstActive.is_cover = true
    }

    setImages(finalImages)
  }

  const setCoverImage = (idToCover: string) => {
    setImages(
      images.map((img) => ({
        ...img,
        is_cover: img.id === idToCover,
      })),
    )
  }

  const activeSizes = sizes.filter((s) => !s._deleted)
  const totalQuantity = activeSizes.reduce(
    (acc, curr) => acc + parseInt(curr.quantity || '0', 10),
    0,
  )

  const addSize = (sizeName: string) => {
    setSizes([
      ...sizes,
      {
        id: `temp-${Date.now()}`,
        size_name: sizeName,
        quantity: '0',
        isNew: true,
        _deleted: false,
      },
    ])
  }

  const updateSize = (id: string, field: string, value: string) => {
    setSizes(sizes.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const removeSize = (id: string) => {
    setSizes(sizes.map((s) => (s.id === id ? { ...s, _deleted: true } : s)))
  }

  const applyPreset = (presetName: string) => {
    const presets: Record<string, { w: string; h: string; wd: string; l: string }> = {
      leve: { w: '150', h: '2', wd: '20', l: '15' },
      padrao: { w: '300', h: '4', wd: '25', l: '20' },
      medio: { w: '500', h: '7', wd: '27', l: '21' },
      volumoso: { w: '1000', h: '12', wd: '30', l: '25' },
      kit: { w: '1200', h: '14', wd: '33', l: '27' },
    }
    const preset = presets[presetName]
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        weight_g: preset.w,
        height_cm: preset.h,
        width_cm: preset.wd,
        length_cm: preset.l,
      }))
    }
  }

  const showShippingWarning =
    (formData.height_cm && parseFloat(formData.height_cm) < 1) ||
    (formData.width_cm && parseFloat(formData.width_cm) < 8) ||
    (formData.length_cm && parseFloat(formData.length_cm) < 13)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let productId = product?.id

      const productData = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        quantity: totalQuantity,
        description: formData.description,
        composition: formData.composition,
        measurements: formData.measurements,
        category: formData.category,
        is_promotion: formData.is_promotion,
        is_featured: formData.is_featured,
        show_in_carousel: formData.show_in_carousel,
        weight_g: formData.weight_g ? parseInt(formData.weight_g, 10) : 0,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : 0,
        width_cm: formData.width_cm ? parseFloat(formData.width_cm) : 0,
        length_cm: formData.length_cm ? parseFloat(formData.length_cm) : 0,
      }

      if (productId) {
        const { error } = await supabase.from('products').update(productData).eq('id', productId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single()
        if (error) throw error
        productId = data.id
      }

      // Process sizes
      for (const size of sizes) {
        if (size._deleted) {
          if (!size.isNew) {
            await supabase.from('product_sizes').delete().eq('id', size.id)
          }
        } else {
          const sizeData = {
            product_id: productId,
            size_name: size.size_name,
            quantity: parseInt(size.quantity || '0', 10),
          }
          if (size.isNew) {
            await supabase.from('product_sizes').insert([sizeData])
          } else {
            await supabase.from('product_sizes').update(sizeData).eq('id', size.id)
          }
        }
      }

      // Process images
      for (const img of images) {
        if (img._deleted) {
          if (!img.isNew) {
            await supabase.from('product_images').delete().eq('id', img.id)
          }
        } else {
          if (img.isNew) {
            await supabase.from('product_images').insert([
              {
                product_id: productId,
                url: img.url,
                display_order: img.display_order,
                is_cover: img.is_cover || false,
              },
            ])
          } else {
            await supabase
              .from('product_images')
              .update({
                display_order: img.display_order,
                is_cover: img.is_cover || false,
              })
              .eq('id', img.id)
          }
        }
      }

      toast.success(product ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
      onSuccess()
    } catch (err: any) {
      toast.error('Erro ao salvar produto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Estoque Total</Label>
          <Input value={totalQuantity} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Calculado automaticamente pelos tamanhos.</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => handleInputChange('category', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
              {categories.length === 0 && (
                <SelectItem value="Nenhuma" disabled>
                  Nenhuma categoria cadastrada
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="composition">Composição</Label>
          <Textarea
            id="composition"
            value={formData.composition}
            onChange={(e) => handleInputChange('composition', e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="measurements">Medidas</Label>
          <Textarea
            id="measurements"
            value={formData.measurements}
            onChange={(e) => handleInputChange('measurements', e.target.value)}
          />
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          <Label>Opções de Exibição</Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(val) => handleInputChange('is_featured', val)}
                id="featured"
              />
              <Label htmlFor="featured" className="font-normal cursor-pointer">
                Destaque na Home
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_promotion}
                onCheckedChange={(val) => handleInputChange('is_promotion', val)}
                id="promotion"
              />
              <Label htmlFor="promotion" className="font-normal cursor-pointer">
                Em Promoção
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.show_in_carousel}
                onCheckedChange={(val) => handleInputChange('show_in_carousel', val)}
                id="carousel"
              />
              <Label htmlFor="carousel" className="font-normal cursor-pointer">
                Carrossel Home
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Informações de Frete (Pesos e Medidas)</h3>
            <p className="text-sm text-muted-foreground">
              Para o cálculo correto do frete, adicione as dimensões da embalagem.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select onValueChange={applyPreset}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Preenchimento Rápido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leve">Leve (Biquínis, Regatas)</SelectItem>
                <SelectItem value="padrao">Padrão (T-shirts, Saias)</SelectItem>
                <SelectItem value="medio">Médio (Vestidos, Calças)</SelectItem>
                <SelectItem value="volumoso">Volumoso (Casacos, Tricôs)</SelectItem>
                <SelectItem value="kit">Kits/Conjuntos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showShippingWarning && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm">
            <strong>Atenção:</strong> As dimensões informadas estão abaixo do limite mínimo aceito
            pelos Correios (1cm A x 8cm L x 13cm C). Recomendamos o uso da caixa padrão.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight_g">Peso Total (g)</Label>
            <Input
              id="weight_g"
              type="number"
              min="0"
              value={formData.weight_g}
              onChange={(e) => handleInputChange('weight_g', e.target.value)}
              placeholder="Ex: 300"
            />
            <p className="text-[10px] text-muted-foreground">Adicione 50-100g p/ embalagem.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height_cm">Altura (cm)</Label>
            <Input
              id="height_cm"
              type="number"
              min="0"
              step="0.1"
              value={formData.height_cm}
              onChange={(e) => handleInputChange('height_cm', e.target.value)}
              placeholder="Min: 1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width_cm">Largura (cm)</Label>
            <Input
              id="width_cm"
              type="number"
              min="0"
              step="0.1"
              value={formData.width_cm}
              onChange={(e) => handleInputChange('width_cm', e.target.value)}
              placeholder="Min: 8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length_cm">Comprimento (cm)</Label>
            <Input
              id="length_cm"
              type="number"
              min="0"
              step="0.1"
              value={formData.length_cm}
              onChange={(e) => handleInputChange('length_cm', e.target.value)}
              placeholder="Min: 13"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tamanhos e Estoque</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSize('Tamanho Único')}
            >
              + T. Único
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addSize('')}>
              + Personalizado
            </Button>
          </div>
        </div>

        {activeSizes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
            Adicione pelo menos um tamanho.
          </p>
        ) : (
          <div className="space-y-3">
            {activeSizes.map((size) => (
              <div key={size.id} className="flex gap-3 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Nome (Ex: P, M, Tamanho Único)"
                    value={size.size_name}
                    onChange={(e) => updateSize(size.id, 'size_name', e.target.value)}
                    required
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Qtd"
                    value={size.quantity}
                    onChange={(e) => updateSize(size.id, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSize(size.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-1">Imagens do Produto</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use a estrela para definir a imagem de capa (aparecerá primeiro e nas miniaturas).
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {activeImages.map((img, index) => (
            <div
              key={img.id}
              className={cn(
                'relative group border rounded-md overflow-hidden bg-muted/20 aspect-[3/4] transition-all',
                img.is_cover && 'ring-2 ring-primary ring-offset-2',
              )}
            >
              <img
                src={img.url}
                alt={`Produto ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveImage(index, 'left')}
                    disabled={index === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => removeImage(img.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => moveImage(index, 'right')}
                    disabled={index === activeImages.length - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                {!img.is_cover && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 mt-2"
                    onClick={() => setCoverImage(img.id)}
                  >
                    <Star className="h-3 w-3 mr-1" /> Capa
                  </Button>
                )}
              </div>
              {img.is_cover && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> Capa
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                {index + 1}
              </div>
            </div>
          ))}

          <Label className="border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer aspect-[3/4] p-4 text-center">
            {uploadingImage ? (
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
            ) : (
              <Plus className="h-8 w-8 mb-2 text-muted-foreground/70" />
            )}
            <span className="text-sm font-medium">Adicionar Foto</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Salvar Alterações' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  )
}
