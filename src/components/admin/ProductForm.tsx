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
import { Loader2, ArrowLeft, ArrowRight, Trash2, Plus } from 'lucide-react'

interface ProductFormProps {
  product?: any
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    quantity: '0',
    description: '',
    composition: '',
    measurements: '',
    category: '',
    is_promotion: false,
    is_featured: false,
    show_in_carousel: false,
  })

  const [images, setImages] = useState<any[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '0',
        description: product.description || '',
        composition: product.composition || '',
        measurements: product.measurements || '',
        category: product.category || '',
        is_promotion: product.is_promotion || false,
        is_featured: product.is_featured || false,
        show_in_carousel: product.show_in_carousel || false,
      })

      if (product.product_images) {
        const sortedImages = [...product.product_images].sort(
          (a, b) => (a.display_order || 0) - (b.display_order || 0),
        )
        setImages(sortedImages.map((img) => ({ ...img, _deleted: false })))
      }
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

      const newImage = {
        id: `temp-${Date.now()}`,
        url: data.publicUrl,
        display_order: images.filter((i) => !i._deleted).length,
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

    // Reassign display_order based on new position
    const reorderedActive = newActive.map((img, i) => ({ ...img, display_order: i }))

    // Merge back into main images array
    const newImages = images.map((img) => {
      if (img._deleted) return img
      const found = reorderedActive.find((ri) => ri.id === img.id)
      return found ? found : img
    })

    setImages(newImages)
  }

  const removeImage = (idToRemove: string) => {
    const newImages = images.map((img) => {
      if (img.id === idToRemove) {
        return { ...img, _deleted: true }
      }
      return img
    })

    // Re-adjust display_order for remaining active images
    let counter = 0
    const finalImages = newImages.map((img) => {
      if (!img._deleted) {
        const updated = { ...img, display_order: counter }
        counter++
        return updated
      }
      return img
    })

    setImages(finalImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let productId = product?.id

      const productData = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        description: formData.description,
        composition: formData.composition,
        measurements: formData.measurements,
        category: formData.category,
        is_promotion: formData.is_promotion,
        is_featured: formData.is_featured,
        show_in_carousel: formData.show_in_carousel,
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
              },
            ])
          } else {
            await supabase
              .from('product_images')
              .update({
                display_order: img.display_order,
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
          <Label htmlFor="quantity">Quantidade em Estoque</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            required
          />
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
              <SelectItem value="Blusas e Bodies">Blusas/Bodys</SelectItem>
              <SelectItem value="Conjuntos">Conjuntos</SelectItem>
              <SelectItem value="Saias">Partes de baixo</SelectItem>
              <SelectItem value="Macaquinhos">Macaquinho</SelectItem>
              <SelectItem value="Jeans">Jeans</SelectItem>
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
        <h3 className="text-lg font-semibold mb-1">Imagens do Produto</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Arraste não suportado, use as setas para ordenar as fotos
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {activeImages.map((img, index) => (
            <div
              key={img.id}
              className="relative group border rounded-md overflow-hidden bg-muted/20 aspect-[3/4]"
            >
              <img
                src={img.url}
                alt={`Produto ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
