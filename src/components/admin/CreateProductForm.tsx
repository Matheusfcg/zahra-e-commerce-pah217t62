import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Loader2, UploadCloud, X, ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function CreateProductForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState(0)
  const [desc, setDesc] = useState('')
  const [comp, setComp] = useState('')
  const [meas, setMeas] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleName = (v: string) => {
    setName(v)
    setSlug(
      v
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]+/g, ''),
    )
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles((prev) => [
        ...prev,
        ...Array.from(newFiles).filter((f) => f.type.startsWith('image/')),
      ])
    }
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setPrice(0)
    setDesc('')
    setComp('')
    setMeas('')
    setFiles([])
    setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    if (!name || !slug) return toast.error('Name and slug are required')
    setUploading(true)
    setProgress(10)

    const { data: newProd, error: prodErr } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        price,
        description: desc || null,
        composition: comp || null,
        measurements: meas || null,
      })
      .select()
      .single()

    if (prodErr) {
      toast.error(`Failed: ${prodErr.message}`)
      return setUploading(false)
    }

    let [success, fail] = [0, 0]
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const fileName = `${newProd.id}-${Date.now()}-${i}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })
      if (upErr) fail++
      else {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        const { error: dbErr } = await supabase.from('product_images').insert({
          product_id: newProd.id,
          url: urlData.publicUrl,
          display_order: i + 1,
        })
        if (dbErr) fail++
        else success++
      }
      setProgress(10 + ((i + 1) / files.length) * 90)
    }

    setUploading(false)
    if (files.length === 0) toast.success('Product created without images')
    else if (success > 0) toast.success(`Created & uploaded ${success} image(s)`)
    if (fail > 0) toast.error(`${fail} image(s) failed`)

    resetForm()
    onCreated()
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            value={name}
            onChange={(e) => handleName(e.target.value)}
            disabled={uploading}
            placeholder="e.g. Vestido Midi"
          />
        </div>
        <div className="space-y-2">
          <Label>Slug *</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={uploading}
            placeholder="vestido-midi"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Price (R$)</Label>
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
        <Label>Description</Label>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          disabled={uploading}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Composition</Label>
          <Input
            value={comp}
            onChange={(e) => setComp(e.target.value)}
            disabled={uploading}
            placeholder="e.g. 100% Algodão"
          />
        </div>
        <div className="space-y-2">
          <Label>Measurements</Label>
          <Input
            value={meas}
            onChange={(e) => setMeas(e.target.value)}
            disabled={uploading}
            placeholder="e.g. P, M, G"
          />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Label>Upload Images</Label>
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
          <p className="text-sm font-medium">Drag & drop images here, or click to select</p>
          <p className="mt-1 text-xs text-muted-foreground">Supports JPG, PNG, WEBP</p>
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
            <h4 className="text-sm font-medium">Files ({files.length})</h4>
            {!uploading && (
              <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                Clear All
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
            <span>Saving product...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button onClick={handleSave} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            'Save Product & Start Next'
          )}
        </Button>
      </div>
    </div>
  )
}
