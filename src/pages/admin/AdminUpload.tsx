import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Loader2, UploadCloud, X, ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function AdminUpload() {
  const { user, signIn, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('id, name').order('name')
    if (data) setProducts(data)
    if (error) toast.error('Error fetching products')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const { error } = await signIn(email, password)
    setLoginLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Logged in successfully')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'))
      setFiles((prev) => [...prev, ...newFiles].slice(0, 100))
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
      setFiles((prev) => [...prev, ...newFiles].slice(0, 100))
    }
  }

  const handleUpload = async () => {
    if (!selectedProductId) return toast.error('Please select a product')
    if (files.length === 0) return toast.error('Please select files to upload')

    setUploading(true)
    setProgress(0)

    const { data: existingImages, error: orderError } = await supabase
      .from('product_images')
      .select('display_order')
      .eq('product_id', selectedProductId)
      .order('display_order', { ascending: false })
      .limit(1)

    if (orderError) {
      toast.error('Error fetching current image order')
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
      const fileName = `${selectedProductId}-${Date.now()}-${i}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`)
        failCount++
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        currentOrder++

        const { error: dbError } = await supabase.from('product_images').insert({
          product_id: selectedProductId,
          url: publicUrlData.publicUrl,
          display_order: currentOrder,
        })

        if (dbError) {
          toast.error(`Failed to save record for ${file.name}`)
          failCount++
        } else {
          successCount++
        }
      }
      setProgress(((i + 1) / files.length) * 100)
    }

    setUploading(false)
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)`)
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    if (failCount > 0) {
      toast.error(`${failCount} image(s) failed to upload`)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto mb-20 mt-12 max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Please login to access the admin area.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto mb-20 mt-8 max-w-4xl px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bulk Image Upload</CardTitle>
          <CardDescription>Upload up to 100 images for a specific product.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Target Product</Label>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <div
              className={cn(
                'rounded-lg border-2 border-dashed p-12 text-center transition-colors',
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted/50',
              )}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <UploadCloud className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Drag & drop images here, or click to select</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports JPG, PNG, WEBP (Max 100 files)
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
                <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
                {!uploading && (
                  <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto pr-2 md:grid-cols-3">
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
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={uploading || files.length === 0 || !selectedProductId}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Start Upload
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
