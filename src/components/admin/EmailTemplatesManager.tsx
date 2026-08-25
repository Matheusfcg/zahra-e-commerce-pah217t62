import { useState, useEffect, useCallback } from 'react'
import {
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  type EmailTemplate,
  type EmailTemplateInput,
} from '@/services/emailTemplates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Variable,
  Eye,
  Check,
  Copy,
  Info,
  Sparkles,
  Send,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const SUGGESTED_VARIABLES = [
  { key: 'nome_cliente', desc: 'Nome do cliente' },
  { key: 'email_cliente', desc: 'E-mail do cliente' },
  { key: 'numero_pedido', desc: 'Identificador do pedido (Ex: A8F1B)' },
  { key: 'valor_total', desc: 'Valor total em R$ (Ex: 199,90)' },
  { key: 'forma_pagamento', desc: 'Método utilizado (Ex: PIX, Cartão)' },
  { key: 'status_pedido', desc: 'Status atual por extenso' },
  { key: 'codigo_rastreio', desc: 'Código de rastreamento' },
  { key: 'transportadora', desc: 'Nome da transportadora' },
  { key: 'link_nota_fiscal', desc: 'URL para download do PDF da NF' },
  { key: 'itens_pedido', desc: 'Tabela formatada com produtos comprados' },
  { key: 'endereco_entrega', desc: 'Bloco estilizado com endereço de entrega' },
  { key: 'bloco_rastreamento', desc: 'Card estilizado com código de rastreio' },
  { key: 'bloco_data_estimada', desc: 'Aviso com prazo previsto de envio/entrega' },
  { key: 'nome_loja', desc: 'Nome da loja (Zahrá Brasil)' },
]

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Edit / Create Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState<{
    slug: string
    name: string
    subject: string
    body_html: string
    allowed_variables_str: string
    description: string
  }>({
    slug: '',
    name: '',
    subject: '',
    body_html: '',
    allowed_variables_str: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)

  // Preview Dialog
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState<'preview' | 'html'>('preview')

  // Delete Dialog
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Copied state indicator
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    const { data, error } = await fetchEmailTemplates()
    if (error) {
      toast.error('Erro ao carregar modelos de e-mail: ' + error.message)
    } else {
      setTemplates(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const handleOpenCreate = () => {
    setEditingTemplate(null)
    setFormData({
      slug: '',
      name: '',
      subject: '',
      body_html: `<p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>!
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
  Escreva aqui o conteúdo da sua mensagem personalizada.
</p>`,
      allowed_variables_str: 'nome_cliente, email_cliente, nome_loja',
      description: '',
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      slug: template.slug,
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      allowed_variables_str: (template.allowed_variables || []).join(', '),
      description: template.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body_html.trim()) {
      toast.error('Preencha o nome, o assunto e o corpo do e-mail.')
      return
    }

    const variables = formData.allowed_variables_str
      .split(',')
      .map((v) => v.trim().replace(/^\{\{|\}\}$/g, ''))
      .filter(Boolean)

    let autoSlug = formData.slug.trim()
    if (!autoSlug) {
      autoSlug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)+/g, '')
    }

    setSaving(true)

    if (editingTemplate) {
      const { error } = await updateEmailTemplate(editingTemplate.id, {
        name: formData.name.trim(),
        slug: autoSlug,
        subject: formData.subject.trim(),
        body_html: formData.body_html,
        allowed_variables: variables,
        description: formData.description.trim() || null,
      })
      setSaving(false)
      if (error) {
        toast.error('Erro ao atualizar modelo: ' + error.message)
      } else {
        toast.success('Modelo de e-mail atualizado com sucesso!')
        setIsDialogOpen(false)
        loadTemplates()
      }
    } else {
      const payload: EmailTemplateInput = {
        name: formData.name.trim(),
        slug: autoSlug,
        subject: formData.subject.trim(),
        body_html: formData.body_html,
        allowed_variables: variables,
        description: formData.description.trim() || null,
      }
      const { error } = await createEmailTemplate(payload)
      setSaving(false)
      if (error) {
        toast.error('Erro ao criar modelo: ' + error.message)
      } else {
        toast.success('Novo modelo de e-mail criado com sucesso!')
        setIsDialogOpen(false)
        loadTemplates()
      }
    }
  }

  const handleDelete = async () => {
    if (!templateToDelete) return
    setDeleting(true)
    const { error } = await deleteEmailTemplate(templateToDelete.id)
    setDeleting(false)
    if (error) {
      toast.error('Erro ao excluir modelo: ' + error.message)
    } else {
      toast.success('Modelo excluído com sucesso!')
      setTemplateToDelete(null)
      loadTemplates()
    }
  }

  const copyVariable = (varName: string) => {
    const text = `{{${varName}}}`
    navigator.clipboard.writeText(text)
    setCopiedVar(varName)
    toast.success(`Copiado: ${text}`)
    setTimeout(() => setCopiedVar(null), 2000)
  }

  const insertVariableIntoBody = (varName: string) => {
    const textToInsert = `{{${varName}}}`
    setFormData((prev) => ({
      ...prev,
      body_html: prev.body_html + textToInsert,
    }))
    toast.success(`Variável ${textToInsert} adicionada ao final do texto`)
  }

  // Render dummy preview with mocked sample values
  const renderPreviewHtml = (template: EmailTemplate) => {
    const mockVars: Record<string, string> = {
      nome_cliente: 'Mariana Silva',
      email_cliente: 'mariana.silva@exemplo.com.br',
      numero_pedido: 'ZH84920',
      valor_total: '389,90',
      forma_pagamento: 'PIX (com 5% OFF)',
      status_pedido: 'Em Separação',
      codigo_rastreio: 'BR984712049BR',
      transportadora: 'Melhor Envio (Jadlog Express)',
      link_nota_fiscal: '#',
      nome_loja: 'Zahrá Brasil',
      bloco_data_estimada:
        '<p style="font-size: 14px; background: #fdfbf7; padding: 10px 14px; border-left: 3px solid #2D0B0B; color: #2D0B0B; margin: 16px 0;"><strong>Previsão de envio/entrega:</strong> 3 a 5 dias úteis</p>',
      bloco_rastreamento:
        '<div style="margin: 24px 0; padding: 18px; background-color: #f0f7f4; border: 1px solid #cce5d9; border-radius: 4px;"><h4 style="margin: 0 0 8px; color: #1b5e20; font-size: 14px; text-transform: uppercase;">Código de Rastreamento</h4><p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #2D0B0B;">BR984712049BR</p><p style="margin: 6px 0 0; font-size: 13px; color: #555;">Transportadora: <strong>Jadlog Express</strong></p></div>',
      itens_pedido: `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">Vestido Midi Elegance Zahrá (Tam: M | Cor: Off-White)</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">1</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">R$ 259,90</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">Blusa Seda Pura Zahrá (Tam: P | Cor: Terracota)</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">1</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">R$ 130,00</td>
        </tr>
      `,
      endereco_entrega:
        '<div style="margin-top: 20px; padding: 16px; background-color: #fdfbf7; border: 1px solid #f0ede8; border-radius: 4px;"><h3 style="font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; color: #2D0B0B;">Endereço de Entrega</h3><p style="font-size: 13px; color: #555; margin: 0;">Av. Paulista, 1000, Apto 42<br/>Bela Vista - São Paulo / SP<br/>CEP: 01310-100</p></div>',
      botao_nota_fiscal:
        '<div style="margin-top: 20px; text-align: center;"><a href="#" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 10px 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Visualizar Nota Fiscal</a></div>',
      info_frete: 'Frete Expresso — R$ 24,90 (3 dias úteis)',
      conteudo_newsletter:
        'Conheça os novos modelos exclusivos da coleção de outono com tecidos leves e cortes sofisticados!',
      assunto_newsletter: 'Novidades Exclusivas Zahrá',
    }

    let subj = template.subject
    let body = template.body_html

    for (const [key, val] of Object.entries(mockVars)) {
      const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi')
      subj = subj.replace(reg, val)
      body = body.replace(reg, val)
    }

    const currentYear = new Date().getFullYear()

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D0B0B; background-color: #ffffff; padding: 32px 24px; border: 1px solid #f0ede8; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #2D0B0B;">
          <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; letter-spacing: 0.2em; color: #2D0B0B; margin: 0 0 8px; text-transform: uppercase; font-weight: 700;">ZAHRÁ</h1>
          <p style="font-size: 11px; letter-spacing: 0.15em; color: #7a6e65; text-transform: uppercase; margin: 0;">Moda & Elegância</p>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #2D0B0B; font-weight: 600; margin: 0 0 6px; font-size: 22px;">${subj}</h2>
        </div>
        <div>
          ${body}
        </div>
        <hr style="border: none; border-top: 1px solid #eae6e1; margin: 36px 0 20px;" />
        <div style="text-align: center; font-size: 13px; color: #7a6e65; line-height: 1.6;">
          <p style="margin: 0 0 8px;">Dúvidas? Fale com a gente pelo WhatsApp ou responda a este e-mail.</p>
          <p style="margin: 0 0 12px; font-weight: 500;">
            <a href="https://wa.me/5511934160219" style="color: #2D0B0B; text-decoration: underline; margin-right: 12px;">WhatsApp (11) 93416-0219</a>
            <a href="mailto:sac@zahrabrasil.com.br" style="color: #2D0B0B; text-decoration: underline;">sac@zahrabrasil.com.br</a>
          </p>
          <p style="margin: 12px 0 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">
            Zahrá Brasil © ${currentYear} — Todos os direitos reservados.
          </p>
        </div>
      </div>
    `
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2D0B0B]/20 bg-[#2D0B0B]/5 text-[#2D0B0B]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Modelos de E-mail</CardTitle>
                <CardDescription>
                  Gerencie todos os comunicados automáticos da loja, personalize assuntos, mensagens
                  HTML e utilize variáveis dinâmicas.
                </CardDescription>
              </div>
            </div>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#2D0B0B] hover:bg-[#1a0606] text-white shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Modelo
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-lg bg-muted/5">
              <Mail className="mx-auto h-10 w-10 mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-base mb-1">Nenhum modelo cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece criando seu primeiro modelo de e-mail personalizado.
              </p>
              <Button onClick={handleOpenCreate} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Criar Modelo
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[220px]">Nome & Identificador</TableHead>
                    <TableHead>Assunto Padrão</TableHead>
                    <TableHead className="hidden md:table-cell">Variáveis Disponíveis</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((tpl) => (
                    <TableRow key={tpl.id} className="hover:bg-muted/10">
                      <TableCell className="align-top py-4">
                        <div className="font-medium text-[#2D0B0B]">{tpl.name}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">
                          {tpl.slug}
                        </div>
                        {tpl.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {tpl.description}
                          </div>
                        )}
                        {tpl.slug === 'welcome' && (
                          <Badge
                            variant="outline"
                            className="mt-2 text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200"
                          >
                            Disparo Automático no Cadastro
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="text-sm font-medium text-foreground">{tpl.subject}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {tpl.body_html.replace(/<[^>]+>/g, ' ').slice(0, 100)}...
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {tpl.allowed_variables && tpl.allowed_variables.length > 0 ? (
                            tpl.allowed_variables.slice(0, 5).map((v) => (
                              <button
                                key={v}
                                onClick={() => copyVariable(v)}
                                title={`Clique para copiar {{${v}}}`}
                                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border"
                              >
                                {copiedVar === v ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5 opacity-60" />
                                )}
                                {`{{${v}}}`}
                              </button>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Nenhuma declarada</span>
                          )}
                          {tpl.allowed_variables && tpl.allowed_variables.length > 5 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{tpl.allowed_variables.length - 5} mais
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewTemplate(tpl)
                              setPreviewMode('preview')
                            }}
                            title="Visualizar e-mail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(tpl)}
                            title="Editar modelo"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTemplateToDelete(tpl)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Excluir modelo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guide Card with variables list */}
      <Card className="bg-[#fdfbf7] border-[#f0ede8]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#2D0B0B]">
            <Sparkles className="h-4 w-4 text-[#8B4513]" />
            Guia de Variáveis Dinâmicas
          </CardTitle>
          <CardDescription className="text-xs">
            Você pode inserir qualquer uma dessas tags nos campos de <strong>Assunto</strong> e{' '}
            <strong>Corpo do E-mail</strong>. O sistema irá substituí-las automaticamente no momento
            do disparo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {SUGGESTED_VARIABLES.map((item) => (
              <div
                key={item.key}
                onClick={() => copyVariable(item.key)}
                className="group cursor-pointer p-2 rounded border bg-white hover:border-[#2D0B0B]/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#2D0B0B]">
                    {`{{${item.key}}}`}
                  </span>
                  {copiedVar === item.key ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit / Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate
                ? `Editar Modelo: ${editingTemplate.name}`
                : 'Criar Novo Modelo de E-mail'}
            </DialogTitle>
            <DialogDescription>
              Configure o assunto, a identificação e o corpo em HTML ou texto com suporte a
              variáveis dinâmicas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome do Modelo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Confirmação de Envio Especial"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Identificador (Slug único) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ex: order_shipped_special"
                  className="font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject">Assunto do E-mail *</Label>
              <div className="relative">
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Seu pedido #{{numero_pedido}} está a caminho, {{nome_cliente}}!"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dica: Você pode usar variáveis no assunto, ex: <code>{`{{nome_cliente}}`}</code> ou{' '}
                <code>{`{{numero_pedido}}`}</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="body_html">Corpo do E-mail (HTML / Texto formatado) *</Label>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> O cabeçalho e rodapé da Zahrá são inseridos
                  automaticamente
                </span>
              </div>
              <Textarea
                id="body_html"
                value={formData.body_html}
                onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                placeholder="<p>Olá, {{nome_cliente}}...</p>"
                rows={12}
                className="font-mono text-xs leading-relaxed"
                required
              />
            </div>

            {/* Quick insert variables */}
            <div className="space-y-1.5 bg-muted/30 p-3 rounded-md border">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Inserir Variável no Conteúdo
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_VARIABLES.map((v) => (
                  <Button
                    key={v.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariableIntoBody(v.key)}
                    className="h-7 text-xs font-mono bg-white hover:bg-muted"
                  >
                    + {`{{${v.key}}}`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="allowed_variables_str">
                  Variáveis Permitidas (separadas por vírgula)
                </Label>
                <Input
                  id="allowed_variables_str"
                  value={formData.allowed_variables_str}
                  onChange={(e) =>
                    setFormData({ ...formData, allowed_variables_str: e.target.value })
                  }
                  placeholder="nome_cliente, numero_pedido, valor_total"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Descrição / Finalidade interna</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Enviado após confirmação de pagamento"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#2D0B0B] hover:bg-[#1a0606] text-white"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTemplate ? 'Salvar Alterações' : 'Criar Modelo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle>Pré-visualização: {previewTemplate?.name}</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {previewTemplate?.slug}
                </DialogDescription>
              </div>
              <Tabs value={previewMode} onValueChange={(v: any) => setPreviewMode(v)}>
                <TabsList className="h-8">
                  <TabsTrigger value="preview" className="text-xs">
                    Visual
                  </TabsTrigger>
                  <TabsTrigger value="html" className="text-xs">
                    HTML Puro
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-muted/40 rounded-md border space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase">Assunto</div>
                <div className="text-sm font-medium text-foreground">
                  {previewTemplate.subject
                    .replace(/\{\{\s*nome_cliente\s*\}\}/gi, 'Mariana Silva')
                    .replace(/\{\{\s*numero_pedido\s*\}\}/gi, 'ZH84920')}
                </div>
              </div>

              {previewMode === 'preview' ? (
                <div className="border rounded-md p-2 bg-neutral-100 overflow-x-auto">
                  <div
                    className="preview-container"
                    dangerouslySetInnerHTML={{ __html: renderPreviewHtml(previewTemplate) }}
                  />
                </div>
              ) : (
                <pre className="p-4 bg-muted/60 rounded-md border text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[450px]">
                  {previewTemplate.body_html}
                </pre>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (previewTemplate) handleOpenEdit(previewTemplate)
                setPreviewTemplate(null)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar Este Modelo
            </Button>
            <Button onClick={() => setPreviewTemplate(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Modelo de E-mail</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o modelo <strong>{templateToDelete?.name}</strong> (
              {templateToDelete?.slug})? Esta ação não pode ser desfeita. Se o sistema tentar enviar
              um e-mail com este slug, usará o modelo padrão de fallback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir Modelo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
