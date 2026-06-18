import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Loader2, UploadCloud, X, ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function ProductAdminForm({ product, onUpdated }: { product: any; onUpdated: () => void }) {
  const [price, setPrice] = useState<number>(product.price || 0)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleSave = async () => {
    setUploading(true)
    setProgress(0)

    const { error: priceError } = await supabase
      .from('products')
      .update({ price })
      .eq('id', product.id)

    if (priceError) {
      toast.error('Falha ao atualizar o preço')
      setUploading(false)
      return
    }

    if (files.length === 0) {
      toast.success('Preço atualizado com sucesso')
      setUploading(false)
      onUpdated()
      return
    }

    const { data: existingImages, error: orderError } = await supabase
      .from('product_images')
      .select('display_order')
      .eq('product_id', product.id)
      .order('display_order', { ascending: false })
      .limit(1)

    if (orderError) {
      toast.error('Erro ao buscar a ordem atual das imagens')
      setUploading(false)
      return
    }

    let currentOrder =
      existingImages && existingImages.length > 0 ? existingImages[0].display_order : 0
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${product.id}-${Date.now()}-${i}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        toast.error(`Falha ao fazer upload de ${file.name}`)
        failCount++
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        currentOrder++
        const { error: dbError } = await supabase.from('product_images').insert({
          product_id: product.id,
          url: publicUrlData.publicUrl,
          display_order: currentOrder,
        })

        if (dbError) failCount++
        else successCount++
      }
      setProgress(((i + 1) / files.length) * 100)
    }

    setUploading(false)
    if (successCount > 0) {
      toast.success(`Preço atualizado e ${successCount} imagem(ns) enviada(s)`)
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    if (failCount > 0) toast.error(`${failCount} imagem(ns) falharam ao ser enviada(s)`)
    onUpdated()
  }

  return (
    <div className="space-y-6 pt-4 pb-2">
      <div className="space-y-2">
        <Label htmlFor={`price-${product.id}`}>Preço (R$)</Label>
        <Input
          id={`price-${product.id}`}
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
        <Label>Carregar Imagens</Label>
        <div
          className={cn(
            'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted/50',
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <UploadCloud className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            Arraste e solte imagens aqui, ou clique para selecionar
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Suporta JPG, PNG, WEBP (Arquivos ilimitados)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Arquivos Selecionados ({files.length})</h4>
            {!uploading && (
              <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                Limpar Tudo
              </Button>
            )}
          </div>
          <div className="grid max-h-[250px] grid-cols-1 gap-2 overflow-y-auto pr-2 sm:grid-cols-2 md:grid-cols-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group relative flex items-center gap-2 rounded-md border p-2"
              >
                <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs" title={file.name}>
                  {file.name}
                </span>
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
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
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Salvando alterações...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <Button className="w-full sm:w-auto" onClick={handleSave} disabled={uploading}>
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
          </>
        ) : (
          'Salvar Alterações'
        )}
      </Button>
    </div>
  )
}
