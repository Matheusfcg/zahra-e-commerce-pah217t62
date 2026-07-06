import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { AVAILABLE_FONTS, loadGoogleFont, applyThemeFont } from '@/hooks/use-theme-font'
import { Loader2, Save, Type } from 'lucide-react'

export function FontSettings() {
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('content_value')
      .eq('section_key', 'theme_settings')
      .single()
      .then(({ data, error }) => {
        if (!error && data?.content_value) {
          try {
            const parsed = JSON.parse(data.content_value)
            if (parsed.font) setSelectedFont(parsed.font)
          } catch (e) {
            // Ignore parse error
          }
        } else {
          // Fallback to primary_font
          supabase
            .from('site_content')
            .select('content_value')
            .eq('section_key', 'primary_font')
            .single()
            .then(({ data: legacy }) => {
              if (legacy?.content_value) setSelectedFont(legacy.content_value)
            })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadGoogleFont(selectedFont)
  }, [selectedFont])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('site_content').upsert(
      {
        section_key: 'theme_settings',
        content_value: JSON.stringify({ font: selectedFont }),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' },
    )
    if (error) {
      toast({ title: 'Erro ao salvar fonte', variant: 'destructive' })
    } else {
      toast({ title: 'Fonte salva com sucesso!' })
      applyThemeFont(selectedFont)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5" /> Fonte Principal
        </CardTitle>
        <CardDescription>
          Escolha a fonte principal do site. Esta fonte será aplicada a títulos, navegação e textos
          em todas as páginas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-3">
          <Label>Selecione a Fonte</Label>
          <Select value={selectedFont} onValueChange={setSelectedFont}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma fonte" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-muted/20 p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Pré-visualização
          </p>
          <p className="text-2xl font-serif mb-2" style={{ fontFamily: `"${selectedFont}"` }}>
            ZAHRÁ Brasil
          </p>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: `"${selectedFont}"` }}>
            A essência do estilo minimalista. Peças exclusivas pensadas para evidenciar a sua beleza
            natural.
          </p>
          <p
            className="text-xs uppercase tracking-wider mt-3 text-[#2D0B0B]"
            style={{ fontFamily: `"${selectedFont}"` }}
          >
            Compre agora • Entrega para todo o Brasil
          </p>
        </div>

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Fonte
        </Button>
      </CardContent>
    </Card>
  )
}
