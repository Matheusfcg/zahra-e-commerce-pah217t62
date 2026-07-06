import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Trash2, Plus, ArrowUp, ArrowDown, UploadCloud } from 'lucide-react'
import { MelhorEnvioSettings } from '@/components/admin/MelhorEnvioSettings'

export default function SiteContentTab() {
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [pix, setPix] = useState({
    name: 'ELLEN CRISTINA',
    key: '64278774000161',
    institution: 'InfinitePay',
    formattedKey: '64.278.774/0001-61',
  })
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    const { supabase } = await import('@/lib/supabase/client')
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .in('section_key', ['hero_images', 'pix_details'])
    if (data) {
      const hero = data.find((d) => d.section_key === 'hero_images')
      const p = data.find((d) => d.section_key === 'pix_details')
      if (hero?.content_value) {
        try {
          const parsed = JSON.parse(hero.content_value)
          if (Array.isArray(parsed)) setHeroImages(parsed)
        } catch {
          /* intentionally ignored */
        }
      }
      if (p?.content_value) {
        try {
          setPix(JSON.parse(p.content_value))
        } catch {
          /* intentionally ignored */
        }
      }
    }
  }

  const saveHeroImages = async () => {
    setLoading(true)
    const { supabase } = await import('@/lib/supabase/client')
    await supabase.from('site_content').upsert(
      {
        section_key: 'hero_images',
        content_value: JSON.stringify(heroImages.filter((img) => img.trim() !== '')),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' },
    )
    toast({ title: 'Imagens do banner salvas com sucesso' })
    setLoading(false)
  }

  const savePix = async () => {
    setLoading(true)
    const { supabase } = await import('@/lib/supabase/client')
    await supabase.from('site_content').upsert(
      {
        section_key: 'pix_details',
        content_value: JSON.stringify(pix),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' },
    )
    toast({ title: 'Dados do PIX salvos com sucesso' })
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `hero-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('site-assets').getPublicUrl(fileName)

      setHeroImages([...heroImages, publicUrl])
      toast({ title: 'Imagem carregada com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao carregar imagem', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...heroImages]
    if (direction === 'up' && index > 0) {
      ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    } else if (direction === 'down' && index < newItems.length - 1) {
      ;[newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]]
    }
    setHeroImages(newItems)
  }

  return (
    <div className="grid gap-8 mt-6 md:grid-cols-2">
      <Card className="border shadow-sm md:col-span-2">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>Banner Principal (Hero)</CardTitle>
          <CardDescription>
            Gerencie as imagens que aparecem no carrossel principal da página inicial. Adicione URLs
            diretas ou faça upload de novas imagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {heroImages.map((img, i) => (
            <div key={i} className="flex gap-2 items-center group">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveItem(i, 'up')}
                  disabled={i === 0}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveItem(i, 'down')}
                  disabled={i === heroImages.length - 1}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              <div className="w-16 h-12 bg-muted rounded border overflow-hidden shrink-0 flex items-center justify-center">
                {img ? (
                  <img src={img} alt={`Banner ${i}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Vazio</span>
                )}
              </div>
              <Input
                value={img}
                onChange={(e) => {
                  const nc = [...heroImages]
                  nc[i] = e.target.value
                  setHeroImages(nc)
                }}
                placeholder="https://..."
                className="font-medium tracking-wide"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setHeroImages(heroImages.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="pt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setHeroImages([...heroImages, ''])}
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar URL
            </Button>
            <div>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <UploadCloud className="w-4 h-4 mr-2" /> Fazer Upload
              </Button>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={saveHeroImages} disabled={loading}>
            Salvar Imagens do Banner
          </Button>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>Detalhes de Pagamento PIX</CardTitle>
          <CardDescription>
            Configure os dados da conta que receberá os pagamentos via PIX.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label>Nome do Recebedor</Label>
            <Input
              value={pix.name}
              onChange={(e) => setPix({ ...pix, name: e.target.value })}
              placeholder="Ex: ELLEN CRISTINA"
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label>CNPJ / Chave PIX (Apenas números ou formato exato)</Label>
            <Input
              value={pix.key}
              onChange={(e) => setPix({ ...pix, key: e.target.value })}
              placeholder="Ex: 64278774000161"
            />
          </div>
          <div className="space-y-2">
            <Label>Chave Formatada (Apenas para exibição)</Label>
            <Input
              value={pix.formattedKey}
              onChange={(e) => setPix({ ...pix, formattedKey: e.target.value })}
              placeholder="Ex: 64.278.774/0001-61"
            />
          </div>
          <div className="space-y-2">
            <Label>Instituição Financeira</Label>
            <Input
              value={pix.institution}
              onChange={(e) => setPix({ ...pix, institution: e.target.value })}
              placeholder="Ex: InfinitePay"
            />
          </div>
          <div className="pt-2">
            <Button className="w-full" onClick={savePix} disabled={loading}>
              Salvar Dados PIX
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <MelhorEnvioSettings />
      </div>
    </div>
  )
}
