import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Loader2, Save, Sparkles, RefreshCw } from 'lucide-react'
import { invalidateSiteContentCache, getBrandInfoCached } from '@/services/siteContent'

export function BrandSettingsCard() {
  const [brandName, setBrandName] = useState('MEYVES')
  const [brandColor, setBrandColor] = useState('#2D0B0B')
  const [emailTagline, setEmailTagline] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBrand()
  }, [])

  const loadBrand = async () => {
    setLoading(true)
    try {
      const info = await getBrandInfoCached(true)
      setBrandName(info.brandName || 'MEYVES')
      setBrandColor(info.brandColor || '#2D0B0B')
      setEmailTagline(info.emailHeaderTagline !== undefined ? info.emailHeaderTagline : '')
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanName = brandName.trim()
    if (!cleanName) {
      toast({
        title: 'Nome da marca não pode ficar vazio',
        description: 'Digite o nome desejado para o logotipo.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const entries = [
        { section_key: 'brand_name', content_value: cleanName, updated_at: now },
        {
          section_key: 'brand_color',
          content_value: brandColor.trim() || '#2D0B0B',
          updated_at: now,
        },
        {
          section_key: 'email_header_tagline',
          content_value: emailTagline.trim(),
          updated_at: now,
        },
      ]

      for (const item of entries) {
        const { error } = await supabase
          .from('site_content')
          .upsert(item, { onConflict: 'section_key' })
        if (error) throw error
      }

      invalidateSiteContentCache()

      toast({
        title: 'Identidade visual atualizada!',
        description: `O nome "${cleanName}" e as configurações do cabeçalho de e-mail foram salvos com sucesso.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar marca',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefault = () => {
    setBrandName('MEYVES')
    setBrandColor('#2D0B0B')
    setEmailTagline('')
  }

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-10 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#2D0B0B]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2D0B0B]" />
              Nome da Marca & Logotipo em Texto
            </CardTitle>
            <CardDescription className="mt-1">
              Edite o texto do logotipo que aparece no cabeçalho, rodapé e telas públicas do site.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="brand-name-input" className="text-sm font-semibold">
                Texto do Logotipo (Marca)
              </Label>
              <Input
                id="brand-name-input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ex: MEYVES"
                className="font-medium tracking-wider h-11 text-base uppercase"
                maxLength={40}
                required
              />
              <p className="text-xs text-muted-foreground">
                Dica: O texto será exibido no estilo serifado elegante padrão da loja com
                espaçamento refinado.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-color-input" className="text-sm font-semibold">
                Cor do Logotipo
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="brand-color-picker"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-11 w-12 rounded border p-1 cursor-pointer bg-background"
                  title="Seletor de cor"
                />
                <Input
                  id="brand-color-input"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#2D0B0B"
                  className="font-mono text-sm h-11 uppercase"
                  maxLength={9}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Padrão: <span className="font-mono">#2D0B0B</span> (vinho escuro elegante).
              </p>
            </div>
          </div>

          {/* Subtítulo / Tagline dos E-mails */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="email-tagline-input"
                className="text-sm font-semibold flex items-center gap-1.5"
              >
                <span>Subtítulo do Cabeçalho dos E-mails (Tagline)</span>
              </Label>
              {emailTagline.trim() && (
                <button
                  type="button"
                  onClick={() => setEmailTagline('')}
                  className="text-xs text-[#2D0B0B] hover:underline cursor-pointer"
                >
                  Deixar Vazio (remover subtítulo)
                </button>
              )}
            </div>
            <Input
              id="email-tagline-input"
              value={emailTagline}
              onChange={(e) => setEmailTagline(e.target.value)}
              placeholder="Deixe em branco para remover ou digite ex: MODA & ELEGÂNCIA"
              className="h-11 text-sm tracking-wider uppercase"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Texto que aparece abaixo do nome da marca no topo de todos os e-mails transacionais
              (boas-vindas, pedidos, rastreamento, nota fiscal, newsletter).
              <strong> Deixe vazio caso deseje exibir apenas o nome da marca</strong>, sem nenhum
              subtítulo ou espaçamento extra.
            </p>
          </div>

          {/* Live Preview Dual: Site Header & Email Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Preview Site Header */}
            <div className="rounded-lg border bg-muted/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cabeçalho da Loja (Site)
                </p>
                <span className="text-[10px] text-muted-foreground">Fundo #FAFAFA</span>
              </div>
              <div className="bg-[#FAFAFA] border border-gray-100 rounded-md p-6 flex flex-col items-center justify-center text-center shadow-xs min-h-[90px]">
                <span
                  className="font-serif text-2xl md:text-[28px] tracking-[0.15em] uppercase transition-all duration-200"
                  style={{ color: brandColor || '#2D0B0B' }}
                >
                  {brandName.trim() || 'MEYVES'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                Visualização do logotipo exibido no topo e rodapé da loja.
              </p>
            </div>

            {/* 2. Preview Email Header */}
            <div className="rounded-lg border bg-muted/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cabeçalho dos E-mails
                </p>
                <span className="text-[10px] text-muted-foreground">Todos os 9 templates</span>
              </div>
              <div className="bg-white border border-[#eae5df] rounded-md p-5 flex flex-col items-center justify-center text-center shadow-xs min-h-[90px]">
                <div
                  className="w-full text-center pb-3 border-b-2"
                  style={{ borderColor: brandColor || '#2D0B0B' }}
                >
                  <h3
                    className="font-serif text-xl tracking-[0.2em] uppercase font-bold transition-all duration-200"
                    style={{
                      color: brandColor || '#2D0B0B',
                      margin: emailTagline.trim() ? '0 0 4px' : '0',
                    }}
                  >
                    {brandName.trim() || 'MEYVES'}
                  </h3>
                  {emailTagline.trim() ? (
                    <p className="text-[10px] tracking-[0.15em] text-[#7a6e65] uppercase m-0">
                      {emailTagline.trim()}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                {emailTagline.trim()
                  ? `Exibindo subtítulo: "${emailTagline.trim()}"`
                  : 'Subtítulo ocultado: apenas o nome da marca será exibido nos e-mails.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefault}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Restaurar Padrão (MEYVES)
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-[#2D0B0B] hover:bg-[#1f0707] text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Marca
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
