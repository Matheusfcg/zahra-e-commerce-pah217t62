import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Loader2,
  UploadCloud,
  X,
  ImageIcon,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ProductForm({
  product,
  onSuccess,
  onCancel,
}: {
  product?: any
  onSuccess: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const [desc, setDesc] = useState('')
  const [comp, setComp] = useState('')
  const [meas, setMeas] = useState('')
  const [isPromotion, setIsPromotion] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [category, setCategory] = useState('')

  const [existingImages, setExistingImages] = useState<any[]>([])
  const [existingColors, setExistingColors] = useState<any[]>([])
  const [newColors, setNewColors] = useState<{ name: string; hex_value: string }[]>([])
  const [colorsToDelete, setColorsToDelete] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const [colorInputName, setColorInputName] = useState('')
  const [colorInputHex, setColorInputHex] = useState('#000000')
  const [showAddColor, setShowAddColor] = useState(false)

  const PT_COLORS: Record<string, string> = {
    amarelo: '#FFFF00',
    azul: '#0000FF',
    branco: '#FFFFFF',
    preto: '#000000',
    vermelho: '#FF0000',
    verde: '#008000',
    cinza: '#808080',
    rosa: '#FFC0CB',
    roxo: '#800080',
    marrom: '#A52A2A',
    laranja: '#FFA500',
    bege: '#F5F5DC',
    prata: '#C0C0C0',
    ouro: '#FFD700',
    dourado: '#FFD700',
    vinho: '#800000',
    marinho: '#000080',
    ciano: '#00FFFF',
    magenta: '#FF00FF',
  }

  const handleColorNameChange = (val: string) => {
    setColorInputName(val)
    const normalized = val.trim().toLowerCase()
    if (PT_COLORS[normalized]) {
      setColorInputHex(PT_COLORS[normalized])
    }
  }

  const handleAddColor = () => {
    if (!colorInputName.trim()) {
      toast.error('O nome da cor não pode estar vazio')
      return
    }
    setNewColors((prev) => [...prev, { name: colorInputName.trim(), hex_value: colorInputHex }])
    setColorInputName('')
    setColorInputHex('#000000')
  }

  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setName(product.name || '')
      setSlug(product.slug || '')
      setPrice(product.price || 0)
      setQuantity(product.quantity || 0)
      setDesc(product.description || '')
      setComp(product.composition || '')
      setMeas(product.measurements || '')
      setIsPromotion(product.is_promotion || false)
      setIsFeatured(product.is_featured || false)
      setCategory(product.category || '')
      setExistingImages(
        [...(product.product_images || [])].sort(
          (a, b) => (a.display_order || 0) - (b.display_order || 0),
        ),
      )
      setExistingColors(product.product_colors || [])
      setNewColors([])
      setColorsToDelete([])
      setImagesToDelete([])
      setFiles([])
      setColorInputName('')
      setColorInputHex('#000000')
      setShowAddColor(false)
    } else {
      setName('')
      setSlug('')
      setPrice(0)
      setQuantity(0)
      setDesc('')
      setComp('')
      setMeas('')
      setIsPromotion(false)
      setIsFeatured(false)
      setCategory('')
      setExistingImages([])
      setExistingColors([])
      setNewColors([])
      setColorsToDelete([])
      setImagesToDelete([])
      setFiles([])
      setColorInputName('')
      setColorInputHex('#000000')
      setShowAddColor(false)
    }
  }, [product])

  const handleName = (v: string) => {
    setName(v)
    if (!product) {
      setSlug(
        v
          .toLowerCase()
          .replace(/[\s_]+/g, '-')
          .replace(/[^\w-]+/g, ''),
      )
    }
  }

  const moveImageLeft = (idx: number) => {
    if (idx === 0) return
    const newImages = [...existingImages]
    const temp = newImages[idx]
    newImages[idx] = newImages[idx - 1]
    newImages[idx - 1] = temp
    setExistingImages(newImages)
  }

  const moveImageRight = (idx: number) => {
    if (idx === existingImages.length - 1) return
    const newImages = [...existingImages]
    const temp = newImages[idx]
    newImages[idx] = newImages[idx + 1]
    newImages[idx + 1] = temp
    setExistingImages(newImages)
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles((prev) => [
        ...prev,
        ...Array.from(newFiles).filter((f) => f.type.startsWith('image/')),
      ])
    }
  }

  const removeExistingImage = (id: string) => {
    setImagesToDelete((prev) => [...prev, id])
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
  }

  const removeExistingColor = (id: string) => {
    setColorsToDelete((prev) => [...prev, id])
    setExistingColors((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSave = async () => {
    if (!name || !slug) return toast.error('Nome e slug são obrigatórios')
    setUploading(true)
    setProgress(10)

    let productId = product?.id

    if (product) {
      const { error: prodErr } = await supabase
        .from('products')
        .update({
          name,
          slug,
          price,
          quantity,
          description: desc || null,
          composition: comp || null,
          measurements: meas || null,
          is_promotion: isPromotion,
          is_featured: isFeatured,
          category: category || null,
        })
        .eq('id', product.id)

      if (prodErr) {
        toast.error(`Falha ao atualizar: ${prodErr.message}`)
        return setUploading(false)
      }
    } else {
      const { data: newProd, error: prodErr } = await supabase
        .from('products')
        .insert({
          name,
          slug,
          price,
          quantity,
          description: desc || null,
          composition: comp || null,
          measurements: meas || null,
          is_promotion: isPromotion,
          is_featured: isFeatured,
          category: category || null,
        })
        .select()
        .single()

      if (prodErr) {
        toast.error(`Falha ao criar: ${prodErr.message}`)
        return setUploading(false)
      }
      productId = newProd.id
    }

    if (imagesToDelete.length > 0) {
      await supabase.from('product_images').delete().in('id', imagesToDelete)
    }

    if (colorsToDelete.length > 0) {
      await supabase.from('product_colors').delete().in('id', colorsToDelete)
    }

    const validNewColors = newColors.filter((c) => c.name.trim() !== '')
    if (validNewColors.length > 0) {
      await supabase.from('product_colors').insert(
        validNewColors.map((c) => ({
          product_id: productId,
          name: c.name,
          hex_value: c.hex_value,
          image_url: '',
        })),
      )
    }

    setProgress(30)

    let [success, fail] = [0, 0]

    for (let i = 0; i < existingImages.length; i++) {
      const img = existingImages[i]
      await supabase
        .from('product_images')
        .update({ display_order: i + 1 })
        .eq('id', img.id)
    }

    let currentOrder = existingImages.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const fileName = `${productId}-${Date.now()}-${i}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })
      if (upErr) fail++
      else {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        currentOrder++
        const { error: dbErr } = await supabase.from('product_images').insert({
          product_id: productId,
          url: urlData.publicUrl,
          display_order: currentOrder,
        })
        if (dbErr) fail++
        else success++
      }
      setProgress(30 + ((i + 1) / files.length) * 70)
    }

    setUploading(false)
    if (product) {
      toast.success('Produto atualizado com sucesso!')
    } else {
      if (files.length === 0) toast.success('Produto criado sem imagens')
      else if (success > 0) toast.success(`Criado e carregado ${success} imagem(ns)`)
      if (fail > 0) toast.error(`${fail} imagem(ns) falharam`)
    }

    onSuccess()
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome do Produto *</Label>
          <Input
            value={name}
            onChange={(e) => handleName(e.target.value)}
            disabled={uploading}
            placeholder="ex. Vestido Midi"
          />
        </div>
        <div className="space-y-2">
          <Label>Quantidade *</Label>
          <Input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            disabled={uploading}
            placeholder="0"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Preço (R$)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          disabled={uploading}
          className="max-w-xs"
        />
      </div>
      <div className="space-y-2">
        <Label>Sobre (Descrição)</Label>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          disabled={uploading}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2 rounded-md border p-4 bg-muted/20">
        <Switch
          id="promotion"
          checked={isPromotion}
          onCheckedChange={setIsPromotion}
          disabled={uploading}
        />
        <Label htmlFor="promotion" className="cursor-pointer font-medium text-foreground">
          Marcar como Produto em Promoção (Aparecerá na seção Promoção do site)
        </Label>
      </div>

      <div className="flex items-center space-x-2 rounded-md border p-4 bg-muted/20 mt-4">
        <Switch
          id="featured"
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
          disabled={uploading}
        />
        <Label htmlFor="featured" className="cursor-pointer font-medium text-foreground">
          Marcar como Peça em Destaque (Ganhará um selo especial no site)
        </Label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory} disabled={uploading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conjuntos">Conjuntos</SelectItem>
              <SelectItem value="Parte de Cima">Parte de Cima</SelectItem>
              <SelectItem value="Parte de Baixo">Parte de Baixo</SelectItem>
              <SelectItem value="Acessórios">Acessórios</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Composição</Label>
          <Input
            value={comp}
            onChange={(e) => setComp(e.target.value)}
            disabled={uploading}
            placeholder="ex. 100% Algodão"
          />
        </div>
        <div className="space-y-2">
          <Label>Medidas</Label>
          <Input
            value={meas}
            onChange={(e) => setMeas(e.target.value)}
            disabled={uploading}
            placeholder="ex. P, M, G"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label>Cores Cadastradas</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddColor((prev) => !prev)}
            disabled={uploading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cor
          </Button>
        </div>

        {existingColors.length === 0 && newColors.length === 0 && !showAddColor && (
          <div className="text-sm text-muted-foreground italic">Nenhuma cor cadastrada.</div>
        )}

        {(existingColors.length > 0 || newColors.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {existingColors.map((color) => (
              <div
                key={color.id}
                className="group relative flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <div
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: color.hex_value }}
                />
                <span>{color.name}</span>
                <button
                  type="button"
                  onClick={() => removeExistingColor(color.id)}
                  disabled={uploading}
                  className="ml-2 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                  title="Remover cor"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {newColors.map((color, idx) => (
              <div
                key={`new-${idx}`}
                className="group relative flex items-center gap-2 rounded-md border bg-muted/50 p-2 text-sm"
              >
                <div
                  className="h-4 w-4 rounded-full border shadow-sm"
                  style={{ backgroundColor: color.hex_value }}
                />
                <span>{color.name}</span>
                <button
                  type="button"
                  onClick={() => setNewColors(newColors.filter((_, i) => i !== idx))}
                  disabled={uploading}
                  className="ml-2 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                  title="Remover nova cor"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddColor && (
          <div className="space-y-3 rounded-md border border-dashed p-3 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">Novas Cores</Label>
              <button
                type="button"
                onClick={() => setShowAddColor(false)}
                className="text-muted-foreground hover:text-foreground"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={colorInputName}
                onChange={(e) => handleColorNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddColor()
                  }
                }}
                placeholder="Nome da Cor (ex: Amarelo)"
                className="flex-1"
                disabled={uploading}
              />
              <div className="relative h-10 w-16 overflow-hidden rounded-md border shrink-0">
                <input
                  type="color"
                  value={colorInputHex}
                  onChange={(e) => setColorInputHex(e.target.value)}
                  className="absolute -inset-2 h-14 w-20 cursor-pointer"
                  disabled={uploading}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddColor}
                disabled={uploading}
                className="shrink-0"
                variant="secondary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2">
        <Label>Imagens do Produto</Label>

        {existingImages.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">
                Arraste não suportado, use as setas para ordenar as fotos
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {existingImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-md border"
                >
                  <img src={img.url} alt="Produto" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        moveImageLeft(idx)
                      }}
                      disabled={uploading || idx === 0}
                      className="p-1.5 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50"
                      title="Mover para esquerda"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        removeExistingImage(img.id)
                      }}
                      disabled={uploading}
                      className="p-1.5 bg-destructive text-white rounded-full hover:bg-destructive/80"
                      title="Remover imagem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        moveImageRight(idx)
                      }}
                      disabled={uploading || idx === existingImages.length - 1}
                      className="p-1.5 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50"
                      title="Mover para direita"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted/50',
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          <UploadCloud className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Arraste e solte imagens aqui, ou clique para adicionar novas
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Suporta JPG, PNG, WEBP</p>
          <input
            type="file"
            ref={fileRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Novas Imagens ({files.length})</h4>
            {!uploading && (
              <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                Limpar Tudo
              </Button>
            )}
          </div>
          <div className="grid max-h-[180px] grid-cols-1 gap-2 overflow-y-auto pr-2 sm:grid-cols-2">
            {files.map((file, i) => (
              <div key={i} className="group relative flex items-center gap-2 rounded-md border p-2">
                <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs">{file.name}</span>
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFiles(files.filter((_, idx) => idx !== i))
                    }}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-sm">
            <span>Salvando alterações...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={uploading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>
    </div>
  )
}
