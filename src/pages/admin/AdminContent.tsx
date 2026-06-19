import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const CMS_FIELDS = [
  { key: 'hero_title', label: 'Título do Banner Principal', type: 'textarea' },
  { key: 'hero_description', label: 'Descrição do Banner Principal', type: 'textarea' },
  { key: 'hero_button', label: 'Botão do Banner Principal', type: 'input' },
  { key: 'values_1_title', label: 'Pilar 1 - Título', type: 'input' },
  { key: 'values_1_desc', label: 'Pilar 1 - Descrição', type: 'textarea' },
  { key: 'values_2_title', label: 'Pilar 2 - Título', type: 'input' },
  { key: 'values_2_desc', label: 'Pilar 2 - Descrição', type: 'textarea' },
  { key: 'values_3_title', label: 'Pilar 3 - Título', type: 'input' },
  { key: 'values_3_desc', label: 'Pilar 3 - Descrição', type: 'textarea' },
  { key: 'footer_about', label: 'Rodapé - Sobre a Marca', type: 'textarea' },
  { key: 'footer_copyright', label: 'Rodapé - Direitos Autorais (Copyright)', type: 'input' },
  { key: 'footer_whatsapp', label: 'Rodapé - WhatsApp / Contato', type: 'input' },
]

export default function AdminContent() {
  const [content, setContent] = useState<Record<string, { id?: string; value: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase.from('site_content').select('*')
      if (error) throw error

      const loadedMap: Record<string, { id?: string; value: string }> = {}
      data.forEach((item) => {
        loadedMap[item.section_key] = { id: item.id, value: item.content_value }
      })

      // Initialize any missing keys from CMS_FIELDS with empty string
      CMS_FIELDS.forEach((field) => {
        if (!loadedMap[field.key]) {
          loadedMap[field.key] = { value: '' }
        }
      })

      setContent(loadedMap)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar conteúdo',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateField = (key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates = Object.entries(content).map(([key, item]) => {
        const payload: any = {
          section_key: key,
          content_value: item.value,
          updated_at: new Date().toISOString(),
        }
        if (item.id) {
          payload.id = item.id
        }
        return payload
      })

      const { error } = await supabase
        .from('site_content')
        .upsert(updates, { onConflict: 'section_key' })
      if (error) throw error

      toast({ title: 'Conteúdo salvo', description: 'As alterações foram salvas com sucesso.' })

      // Auto-refresh as requested to reflect changes system-wide
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-serif text-[#2D0B0B]">
          Gerenciar Conteúdo do Site
        </h1>
        <p className="text-gray-500 mt-2">
          Atualize os textos principais do site, como banners, pilares da marca e rodapé.
        </p>
      </div>

      <div className="grid gap-8 pb-24">
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-[#2D0B0B] border-b pb-2">Banner Principal</h2>
          {CMS_FIELDS.filter((f) => f.key.startsWith('hero_')).map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={content[field.key]?.value || ''}
                  onChange={(e) => handleUpdateField(field.key, e.target.value)}
                  className="w-full focus-visible:ring-[#2D0B0B]"
                  rows={3}
                />
              ) : (
                <Input
                  value={content[field.key]?.value || ''}
                  onChange={(e) => handleUpdateField(field.key, e.target.value)}
                  className="w-full focus-visible:ring-[#2D0B0B]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6 mt-4">
          <h2 className="text-xl font-medium text-[#2D0B0B] border-b pb-2">Pilares da Marca</h2>
          {CMS_FIELDS.filter((f) => f.key.startsWith('values_')).map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={content[field.key]?.value || ''}
                  onChange={(e) => handleUpdateField(field.key, e.target.value)}
                  className="w-full focus-visible:ring-[#2D0B0B]"
                  rows={2}
                />
              ) : (
                <Input
                  value={content[field.key]?.value || ''}
                  onChange={(e) => handleUpdateField(field.key, e.target.value)}
                  className="w-full focus-visible:ring-[#2D0B0B]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6 mt-4">
          <h2 className="text-xl font-medium text-[#2D0B0B] border-b pb-2">Rodapé</h2>
          {CMS_FIELDS.filter((f) => f.key.startsWith('footer_')).map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={content[field.key]?.value || ''}
                  onChange={(e) => handleUpdateField(field.key, e.target.value)}
                  className="w-full focus-visible:ring-[#2D0B0B]"
                  rows={3}
                />
              ) : (
                <Input
                  value={content[field.key]?.value || ''}
                  onChange={(e) => handleUpdateField(field.key, e.target.value)}
                  className="w-full focus-visible:ring-[#2D0B0B]"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-end px-4 md:px-8">
        <div className="max-w-4xl w-full mx-auto flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#2D0B0B] hover:bg-[#3d1616] text-white px-8 h-12 w-full md:w-auto"
          >
            {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
