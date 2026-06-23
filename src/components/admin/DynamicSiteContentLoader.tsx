import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'

export function DynamicSiteContentLoader() {
  const [categories, setCategories] = useState<string[]>([])
  const [newCat, setNewCat] = useState('')
  const [pixConfig, setPixConfig] = useState({
    nome: '',
    chave: '',
    instituicao: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .in('section_key', ['home_categories', 'pix_config'])
    if (data) {
      const catData = data.find((d) => d.section_key === 'home_categories')
      if (catData?.content_value) {
        try {
          const parsed = JSON.parse(catData.content_value)
          if (Array.isArray(parsed)) setCategories(parsed)
        } catch {
          /* intentionally ignored */
        }
      }
      const pixData = data.find((d) => d.section_key === 'pix_config')
      if (pixData?.content_value) {
        try {
          setPixConfig(JSON.parse(pixData.content_value))
        } catch {
          /* intentionally ignored */
        }
      }
    }
    setIsLoading(false)
  }

  const handleSaveCategories = async () => {
    setIsSaving(true)
    await supabase.from('site_content').upsert(
      {
        section_key: 'home_categories',
        content_value: JSON.stringify(categories),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' },
    )
    toast({ title: 'Categorias salvas com sucesso!' })
    setIsSaving(false)
  }

  const handleSavePix = async () => {
    setIsSaving(true)
    await supabase.from('site_content').upsert(
      {
        section_key: 'pix_config',
        content_value: JSON.stringify(pixConfig),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' },
    )
    toast({ title: 'Configurações PIX salvas!' })
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Categorias da Home</CardTitle>
          <CardDescription>
            Gerencie as categorias exibidas na grade principal da página inicial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm font-medium border"
              >
                <span>{cat}</span>
                <button
                  onClick={() => setCategories(categories.filter((_, i) => i !== idx))}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  title="Remover categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhuma categoria cadastrada.</p>
            )}
          </div>

          <div className="flex gap-2 max-w-md items-end">
            <div className="space-y-1 flex-1">
              <Label>Adicionar Nova Categoria</Label>
              <Input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Ex: Acessórios"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCat.trim()) {
                    setCategories([...categories, newCat.trim()])
                    setNewCat('')
                  }
                }}
              />
            </div>
            <Button
              onClick={() => {
                if (newCat.trim()) {
                  setCategories([...categories, newCat.trim()])
                  setNewCat('')
                }
              }}
              variant="secondary"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>

          <Button onClick={handleSaveCategories} disabled={isSaving} className="mt-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Categorias
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados de Pagamento (PIX)</CardTitle>
          <CardDescription>
            Defina as informações de recebimento exibidas para os clientes no checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nome do Beneficiário</Label>
              <Input
                value={pixConfig.nome}
                onChange={(e) => setPixConfig({ ...pixConfig, nome: e.target.value })}
                placeholder="ex: ELLEN CRISTINA"
              />
            </div>
            <div className="space-y-2">
              <Label>Chave PIX ou CNPJ</Label>
              <Input
                value={pixConfig.chave}
                onChange={(e) => setPixConfig({ ...pixConfig, chave: e.target.value })}
                placeholder="ex: 64278774000161"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Instituição de Pagamento</Label>
              <Input
                value={pixConfig.instituicao}
                onChange={(e) => setPixConfig({ ...pixConfig, instituicao: e.target.value })}
                placeholder="ex: InfinitePay"
                className="max-w-md"
              />
            </div>
          </div>
          <Button onClick={handleSavePix} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
