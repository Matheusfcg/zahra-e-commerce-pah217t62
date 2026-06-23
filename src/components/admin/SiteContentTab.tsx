import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Trash2, Plus, GripVertical } from 'lucide-react'

export default function SiteContentTab() {
  const [categories, setCategories] = useState<string[]>([])
  const [pix, setPix] = useState({
    name: 'ELLEN CRISTINA',
    key: '64278774000161',
    institution: 'InfinitePay',
    formattedKey: '64.278.774/0001-61',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    const { supabase } = await import('@/lib/supabase/client')
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .in('section_key', ['homepage_categories', 'pix_details'])
    if (data) {
      const cat = data.find((d) => d.section_key === 'homepage_categories')
      const p = data.find((d) => d.section_key === 'pix_details')
      if (cat?.content_value) {
        try {
          setCategories(JSON.parse(cat.content_value))
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

  const saveCategories = async () => {
    setLoading(true)
    const { supabase } = await import('@/lib/supabase/client')
    await supabase.from('site_content').upsert(
      {
        section_key: 'homepage_categories',
        content_value: JSON.stringify(categories),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' },
    )
    toast({ title: 'Categorias salvas com sucesso' })
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

  return (
    <div className="grid gap-8 mt-6 md:grid-cols-2">
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>Gerenciar Categorias</CardTitle>
          <CardDescription>
            Edite as categorias que aparecem na grade principal da página inicial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {categories.map((c, i) => (
            <div key={i} className="flex gap-2 items-center group">
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-move opacity-50 group-hover:opacity-100 transition-opacity" />
              <Input
                value={c}
                onChange={(e) => {
                  const nc = [...categories]
                  nc[i] = e.target.value
                  setCategories(nc)
                }}
                className="font-medium tracking-wide"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={async () => {
                  const categoryName = c
                  const { supabase } = await import('@/lib/supabase/client')
                  const { count } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('category', categoryName)
                  if (count && count > 0) {
                    if (
                      !window.confirm(
                        `Atenção: Existem ${count} produto(s) vinculados à categoria "${categoryName}". Tem certeza que deseja excluí-la?`,
                      )
                    ) {
                      return
                    }
                  }
                  setCategories(categories.filter((_, idx) => idx !== i))
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setCategories([...categories, 'Nova Categoria'])}
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Categoria
            </Button>
            <Button className="w-full" onClick={saveCategories} disabled={loading}>
              Salvar Categorias
            </Button>
          </div>
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
    </div>
  )
}
