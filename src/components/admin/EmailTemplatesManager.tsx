import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  htmlToPlainText,
  plainTextToHtml,
  fetchRecentEmailLogs,
  sendTestEmail,
  processPendingEmailLogs,
  checkDomainStatus,
  type EmailTemplate,
  type EmailTemplateInput,
  type EmailLogEntry,
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
  Eye,
  Check,
  Copy,
  Sparkles,
  Send,
  MessageSquare,
  HelpCircle,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
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

const SUGGESTED_VARIABLES = [
  { key: 'nome_cliente', label: 'Nome da Cliente', desc: 'Ex: Mariana Silva' },
  { key: 'numero_pedido', label: 'Nº do Pedido', desc: 'Ex: ZH84920' },
  { key: 'valor_total', label: 'Valor Total', desc: 'Ex: R$ 389,90' },
  { key: 'forma_pagamento', label: 'Forma de Pagamento', desc: 'Ex: PIX, Cartão' },
  { key: 'status_pedido', label: 'Status do Pedido', desc: 'Ex: Pagamento Confirmado' },
  { key: 'codigo_rastreio', label: 'Código de Rastreio', desc: 'Ex: BR984712049BR' },
  { key: 'transportadora', label: 'Transportadora', desc: 'Ex: Jadlog Express' },
  { key: 'link_nota_fiscal', label: 'Link da Nota Fiscal', desc: 'URL da NF' },
  { key: 'email_cliente', label: 'E-mail da Cliente', desc: 'mariana@exemplo.com' },
  { key: 'nome_loja', label: 'Nome da Loja', desc: 'Meyves' },
]

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Edit / Create Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)

  // Super simplified form data: Only Subject, Plain Text Body, and Friendly Name
  const [formSubject, setFormSubject] = useState('')
  const [formBodyText, setFormBodyText] = useState('')
  const [formName, setFormName] = useState('')
  const [saving, setSaving] = useState(false)

  // Textarea ref for placing dynamic variable tags at cursor position
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Live Preview inside Edit Dialog or separate Modal
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)

  // Delete Dialog State
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Copied tag feedback
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  // Test Email State
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false)
  const [testTemplate, setTestTemplate] = useState<EmailTemplate | null>(null)
  const [testEmailAddress, setTestEmailAddress] = useState('meyvesbr@gmail.com')
  const [sendingTest, setSendingTest] = useState(false)

  // Audit Logs State
  const [logs, setLogs] = useState<EmailLogEntry[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logsDialogOpen, setLogsDialogOpen] = useState(false)
  const [processingPending, setProcessingPending] = useState(false)
  const [domainStatus, setDomainStatus] = useState<any>(null)
  const [checkingDomain, setCheckingDomain] = useState(false)

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

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true)
    const { data, error } = await fetchRecentEmailLogs(30)
    if (error) {
      toast.error('Erro ao carregar logs de envio: ' + error.message)
    } else {
      setLogs(data || [])
    }
    setLoadingLogs(false)
  }, [])

  const handleProcessPending = async () => {
    setProcessingPending(true)
    try {
      const { data, error } = await processPendingEmailLogs()
      if (error || (data && data.success === false)) {
        toast.error('Falha ao reprocessar pendências: ' + (data?.error || error?.message))
      } else {
        toast.success(`Processamento concluído: ${data?.processed_count || 0} e-mails processados!`)
        loadLogs()
      }
    } catch (err: any) {
      toast.error('Erro ao acionar reprocessamento: ' + err.message)
    } finally {
      setProcessingPending(false)
    }
  }

  const handleCheckDomain = async () => {
    setCheckingDomain(true)
    try {
      const { data, error } = await checkDomainStatus()
      if (error) {
        toast.error('Erro ao verificar domínio no Resend: ' + error.message)
      } else {
        setDomainStatus(data)
        if (data?.verification?.found) {
          toast.success(
            `Domínio ${data.domain}: status '${data.verification.status || 'verificado'}' no Resend`,
          )
        } else if (data?.verification?.error) {
          toast.warning(`Aviso do Resend: ${data.verification.error}`)
        } else {
          toast.info(`Domínio ${data.domain} não encontrado listado no Resend.`)
        }
      }
    } catch (err: any) {
      toast.error('Erro ao verificar domínio: ' + err.message)
    } finally {
      setCheckingDomain(false)
    }
  }

  const handleOpenTestEmail = (template: EmailTemplate) => {
    setTestTemplate(template)
    setTestEmailDialogOpen(true)
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testTemplate) return
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      toast.error('Digite um e-mail válido para o teste.')
      return
    }

    setSendingTest(true)
    try {
      const { data, error } = await sendTestEmail(testTemplate.slug, testEmailAddress, {
        nome_cliente: 'Cliente Teste Meyves',
      })
      if (error || (data && data.success === false)) {
        const msg = data?.error || error?.message || 'Falha no disparo do e-mail de teste'
        toast.error(`Erro no disparo: ${msg}`)
      } else {
        toast.success(
          `E-mail de teste enviado para ${testEmailAddress}! Verifique a caixa de entrada.`,
        )
        setTestEmailDialogOpen(false)
        loadLogs()
      }
    } catch (err: any) {
      toast.error('Erro ao comunicar com a função de e-mail: ' + err.message)
    } finally {
      setSendingTest(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const handleOpenCreate = () => {
    setEditingTemplate(null)
    setFormName('')
    setFormSubject('')
    setFormBodyText(
      `Olá, {{nome_cliente}}!\n\nEscreva aqui a mensagem com todo o carinho para a sua cliente.\n\nQualquer dúvida, estamos à disposição!\nEquipe {{nome_loja}}`,
    )
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormName(template.name)
    setFormSubject(template.subject)

    // Extract pure, human-friendly text without HTML code
    const plain = htmlToPlainText(template.body_html)
    setFormBodyText(plain)
    setIsDialogOpen(true)
  }

  const insertVariableIntoBody = (varKey: string) => {
    const textToInsert = `{{${varKey}}}`
    const textarea = bodyTextareaRef.current

    if (textarea) {
      const start = textarea.selectionStart ?? formBodyText.length
      const end = textarea.selectionEnd ?? formBodyText.length
      const newText = formBodyText.substring(0, start) + textToInsert + formBodyText.substring(end)
      setFormBodyText(newText)

      // Restore focus and cursor position after tag insertion
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length)
      }, 50)
    } else {
      setFormBodyText((prev) => prev + ` ${textToInsert}`)
    }

    toast.success(`Tag ${textToInsert} inserida no texto`)
  }

  const copyVariable = (varKey: string) => {
    const tag = `{{${varKey}}}`
    navigator.clipboard.writeText(tag)
    setCopiedVar(varKey)
    toast.success(`Copiado: ${tag}`)
    setTimeout(() => setCopiedVar(null), 2000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formSubject.trim()) {
      toast.error('Por favor, preencha o assunto do e-mail.')
      return
    }

    if (!formBodyText.trim()) {
      toast.error('Por favor, preencha o texto do e-mail.')
      return
    }

    // Convert plain text back to clean, responsive HTML preserving email structure
    const updatedHtml = plainTextToHtml(formBodyText, editingTemplate?.body_html)

    setSaving(true)

    if (editingTemplate) {
      const { error } = await updateEmailTemplate(editingTemplate.id, {
        name: formName.trim() || editingTemplate.name,
        subject: formSubject.trim(),
        body_html: updatedHtml,
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
      const friendlyName = formName.trim() || 'Modelo Personalizado'
      const autoSlug =
        friendlyName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)+/g, '') +
        '_' +
        Math.floor(Math.random() * 1000)

      const payload: EmailTemplateInput = {
        name: friendlyName,
        slug: autoSlug,
        subject: formSubject.trim(),
        body_html: updatedHtml,
        allowed_variables: ['nome_cliente', 'email_cliente', 'nome_loja', 'numero_pedido'],
        description: 'Modelo personalizado criado pela loja',
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

  // Render preview formatted with dummy sample values
  const renderPreviewHtml = (subject: string, rawBodyOrHtml: string) => {
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
      nome_loja: 'Meyves',
      bloco_data_estimada:
        '<p style="font-size: 14px; background: #fdfbf7; padding: 10px 14px; border-left: 3px solid #2D0B0B; color: #2D0B0B; margin: 16px 0;"><strong>Previsão de entrega:</strong> 3 a 5 dias úteis</p>',
      bloco_rastreamento:
        '<div style="margin: 20px 0; padding: 16px; background-color: #f0f7f4; border: 1px solid #cce5d9; border-radius: 4px;"><h4 style="margin: 0 0 6px; color: #1b5e20; font-size: 13px; text-transform: uppercase;">Código de Rastreamento</h4><p style="margin: 0; font-family: monospace; font-size: 17px; font-weight: bold; color: #2D0B0B;">BR984712049BR</p><p style="margin: 4px 0 0; font-size: 12px; color: #555;">Transportadora: <strong>Jadlog Express</strong></p></div>',
      itens_pedido: `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">Vestido Midi Elegance Meyves (M)</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: center;">1</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">R$ 259,90</td>
        </tr>
      `,
      endereco_entrega:
        '<div style="margin-top: 18px; padding: 14px; background-color: #fdfbf7; border: 1px solid #f0ede8; border-radius: 4px;"><h3 style="font-size: 11px; font-weight: 700; margin: 0 0 6px; text-transform: uppercase; color: #2D0B0B;">Endereço de Entrega</h3><p style="font-size: 12px; color: #555; margin: 0;">Av. Paulista, 1000 - Apto 42<br/>São Paulo / SP - CEP: 01310-100</p></div>',
      botao_nota_fiscal:
        '<div style="margin-top: 18px; text-align: center;"><a href="#" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 10px 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Visualizar Nota Fiscal</a></div>',
      info_frete: 'Frete Expresso — R$ 24,90 (3 dias úteis)',
      conteudo_newsletter:
        'Conheça os novos vestidos e conjuntos sofisticados da Coleção Outono Meyves!',
      assunto_newsletter: 'Novidades Exclusivas Meyves',
    }

    let subj = subject || 'Assunto do E-mail'
    let body = /<[a-z][\s\S]*>/i.test(rawBodyOrHtml)
      ? rawBodyOrHtml
      : plainTextToHtml(rawBodyOrHtml)

    for (const [key, val] of Object.entries(mockVars)) {
      const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi')
      subj = subj.replace(reg, val)
      body = body.replace(reg, val)
    }

    const currentYear = new Date().getFullYear()

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2D0B0B; background-color: #ffffff; padding: 28px 22px; border: 1px solid #eae5df; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        <!-- Header da Loja -->
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2D0B0B;">
          <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 0.2em; color: #2D0B0B; margin: 0 0 6px; text-transform: uppercase; font-weight: 700;">MEYVES</h1>
          <p style="font-size: 10px; letter-spacing: 0.15em; color: #7a6e65; text-transform: uppercase; margin: 0;">Moda & Elegância</p>
        </div>

        <!-- Assunto Destacado -->
        <div style="text-align: center; margin-bottom: 22px;">
          <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #2D0B0B; font-weight: 600; margin: 0 0 6px; font-size: 20px;">${subj}</h2>
        </div>

        <!-- Corpo do E-mail -->
        <div style="font-size: 15px; line-height: 1.6; color: #333333;">
          ${body}
        </div>

        <!-- Rodapé Profissional Automático -->
        <hr style="border: none; border-top: 1px solid #eae6e1; margin: 30px 0 18px;" />
        <div style="text-align: center; font-size: 12px; color: #7a6e65; line-height: 1.6;">
          <p style="margin: 0 0 6px;">Dúvidas? Responda a este e-mail ou fale no WhatsApp.</p>
          <p style="margin: 0 0 10px; font-weight: 500;">
            <a href="https://wa.me/5511934160219" style="color: #2D0B0B; text-decoration: underline; margin-right: 12px;">WhatsApp (11) 93416-0219</a>
            <a href="mailto:meyvesbr@gmail.com" style="color: #2D0B0B; text-decoration: underline;">meyvesbr@gmail.com</a>
          </p>
          <p style="margin: 10px 0 0; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">
            Meyves © ${currentYear} — Todos os direitos reservados.
          </p>
        </div>
      </div>
    `
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2D0B0B]/20 bg-[#2D0B0B]/5 text-[#2D0B0B]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Modelos de E-mail</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Edite o assunto e o texto dos e-mails enviados aos clientes de forma simples e
                  direta.
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                loadLogs()
                setLogsDialogOpen(true)
              }}
              className="border-[#2D0B0B]/30 hover:bg-[#2D0B0B]/5 hover:text-[#2D0B0B] text-xs h-9"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Auditoria de Envios
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#2D0B0B] hover:bg-[#1a0606] text-white shrink-0 shadow-xs text-xs h-9"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Novo Modelo
            </Button>
          </div>
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
                Comece criando seu primeiro modelo de e-mail.
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
                    <TableHead className="w-[220px]">E-mail / Notificação</TableHead>
                    <TableHead>Assunto Atual</TableHead>
                    <TableHead className="hidden md:table-cell">Mensagem (Texto)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((tpl) => {
                    const plainBody = htmlToPlainText(tpl.body_html)
                    return (
                      <TableRow key={tpl.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="align-top py-4">
                          <div className="font-medium text-[#2D0B0B]">{tpl.name}</div>
                          {tpl.slug === 'welcome' && (
                            <Badge
                              variant="outline"
                              className="mt-1.5 text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 inline-flex items-center gap-1"
                            >
                              <ShieldCheck className="h-3 w-3" /> Ao criar conta
                            </Badge>
                          )}
                          {tpl.slug === 'first_purchase' && (
                            <Badge
                              variant="outline"
                              className="mt-1.5 text-[10px] bg-purple-50 text-purple-800 border-purple-200 inline-flex items-center gap-1"
                            >
                              <Sparkles className="h-3 w-3" /> 1ª Compra
                            </Badge>
                          )}
                          {tpl.slug.startsWith('order_') && (
                            <Badge
                              variant="outline"
                              className="mt-1.5 text-[10px] bg-amber-50 text-amber-800 border-amber-200 inline-flex items-center gap-1"
                            >
                              Pedido / Notificação
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <div className="text-sm font-medium text-foreground">{tpl.subject}</div>
                        </TableCell>
                        <TableCell className="align-top py-4 hidden md:table-cell">
                          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {plainBody || 'Sem texto definido'}
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenTestEmail(tpl)}
                              title="Enviar e-mail de teste para sua caixa de entrada"
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-[#2D0B0B]"
                            >
                              <Send className="mr-1 h-3.5 w-3.5" />
                              Testar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewTemplate(tpl)}
                              title="Ver como a cliente recebe"
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(tpl)}
                              title="Editar texto e assunto"
                              className="h-8 px-3 text-xs border-[#2D0B0B]/30 hover:bg-[#2D0B0B]/5 hover:text-[#2D0B0B]"
                            >
                              <Pencil className="mr-1.5 h-3.5 w-3.5" />
                              Editar
                            </Button>
                            {![
                              'welcome',
                              'order_created',
                              'order_paid',
                              'order_shipped',
                              'first_purchase',
                            ].includes(tpl.slug) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTemplateToDelete(tpl)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Excluir modelo"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helpful Variables Bar */}
      <Card className="bg-[#fdfbf7] border-[#f0ede8]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-[#2D0B0B]">
            <Sparkles className="h-4 w-4 text-[#8B4513]" />
            Tags Prontas para Inserir no E-mail
          </CardTitle>
          <CardDescription className="text-xs">
            Ao digitar o texto ou o assunto, você pode usar essas etiquetas. O sistema troca
            automaticamente pelos dados reais da cliente!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_VARIABLES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => copyVariable(item.key)}
                className="group inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border bg-white hover:bg-[#2D0B0B]/5 hover:border-[#2D0B0B]/30 transition-all text-left shadow-2xs"
                title={`Clique para copiar {{${item.key}}}`}
              >
                <span className="font-medium text-[#2D0B0B]">{item.label}:</span>
                <span className="font-mono text-[11px] text-muted-foreground group-hover:text-[#2D0B0B]">
                  {`{{${item.key}}}`}
                </span>
                {copiedVar === item.key ? (
                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="h-2.5 w-2.5 text-muted-foreground opacity-40 group-hover:opacity-100 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Super Simple Edit / Create Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#2D0B0B]" />
              {editingTemplate
                ? `Editar E-mail: ${editingTemplate.name}`
                : 'Criar Novo Modelo de E-mail'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Altere o assunto e a mensagem que sua cliente irá receber. O visual bonito e cabeçalho
              da loja são mantidos automaticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Title / Name (only if creating new, or editable name) */}
            <div className="space-y-1.5">
              <Label htmlFor="template_name" className="text-xs font-semibold text-foreground">
                Nome de Identificação do E-mail
              </Label>
              <Input
                id="template_name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Confirmação de Pedido, Boas-vindas, etc."
                className="text-sm"
                required
              />
            </div>

            {/* 1. Assunto */}
            <div className="space-y-1.5">
              <Label
                htmlFor="template_subject"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>1. Assunto do E-mail *</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  (O título que a cliente lê na caixa de entrada)
                </span>
              </Label>
              <Input
                id="template_subject"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="Ex: Seu pedido #{{numero_pedido}} está a caminho, {{nome_cliente}}! ✨"
                className="text-sm font-medium"
                required
              />
            </div>

            {/* 2. Corpo do E-mail (Texto Puro estilo WhatsApp / Bloco de Notas) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="template_body" className="text-xs font-semibold text-foreground">
                  2. Corpo da Mensagem (Texto) *
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Escreva naturalmente. Pressione Enter para novas linhas.
                </span>
              </div>
              <Textarea
                ref={bodyTextareaRef}
                id="template_body"
                value={formBodyText}
                onChange={(e) => setFormBodyText(e.target.value)}
                placeholder="Olá, {{nome_cliente}}! Ficamos muito felizes em atender você..."
                rows={10}
                className="text-sm leading-relaxed font-sans bg-white resize-y"
                required
              />
            </div>

            {/* Click-to-insert Chips bar */}
            <div className="space-y-2 bg-[#fdfbf7] p-3 rounded-md border border-[#f0ede8]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#2D0B0B] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#8B4513]" /> Inserir dado dinâmico no texto:
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Clique para inserir no cursor
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_VARIABLES.map((v) => (
                  <Button
                    key={v.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariableIntoBody(v.key)}
                    className="h-7 text-xs bg-white hover:bg-[#2D0B0B] hover:text-white border-muted-foreground/20 transition-colors"
                  >
                    + {v.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Live Quick Preview Accordion */}
            <div className="border rounded-md p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#2D0B0B] flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Como o e-mail vai ficar:
                </span>
                <span className="text-[11px] text-muted-foreground">
                  (Demonstração visual em tempo real)
                </span>
              </div>
              <div className="border rounded bg-white p-2 max-h-60 overflow-y-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderPreviewHtml(formSubject, formBodyText),
                  }}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
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

      {/* Full Preview Dialog (Clean - No source code tab) */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#2D0B0B]" />
              Visualização do E-mail
            </DialogTitle>
            <DialogDescription className="text-xs">
              É exatamente assim que a sua cliente receberá a mensagem no computador ou celular.
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-muted/30 rounded-md border space-y-1">
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Assunto da Mensagem:
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {previewTemplate.subject
                    .replace(/\{\{\s*nome_cliente\s*\}\}/gi, 'Mariana Silva')
                    .replace(/\{\{\s*numero_pedido\s*\}\}/gi, 'ZH84920')}
                </div>
              </div>

              <div className="border rounded-md p-3 bg-neutral-100 overflow-x-auto">
                <div
                  className="preview-container"
                  dangerouslySetInnerHTML={{
                    __html: renderPreviewHtml(previewTemplate.subject, previewTemplate.body_html),
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (previewTemplate) handleOpenEdit(previewTemplate)
                setPreviewTemplate(null)
              }}
              className="border-[#2D0B0B]/30 hover:bg-[#2D0B0B]/5 hover:text-[#2D0B0B]"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar Este E-mail
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
              Tem certeza que deseja remover o modelo <strong>{templateToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
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

      {/* Test Email Modal */}
      <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#2D0B0B]" />
              Enviar E-mail de Teste
            </DialogTitle>
            <DialogDescription className="text-xs">
              Envie um disparo real do modelo <strong>{testTemplate?.name}</strong> para validar se
              está chegando na caixa de entrada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendTest} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="test_email" className="text-xs font-semibold">
                E-mail de Destino para Teste
              </Label>
              <Input
                id="test_email"
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="seu-email@gmail.com"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                O e-mail será disparado imediatamente utilizando o backend Resend configurado.
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setTestEmailDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={sendingTest}
                className="bg-[#2D0B0B] hover:bg-[#1a0606] text-white"
              >
                {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Agora
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Audit Logs Modal */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#2D0B0B]" />
              Auditoria de Envios de E-mail (Logs Reais)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Histórico detalhado de disparos efetuados pelo sistema, incluindo status do Resend e
              eventuais falhas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Top Toolbar in Audit Logs Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-muted/30 rounded-md border text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">
                  {logs.length} último(s) registro(s)
                </span>
                {logs.some((l) => l.status === 'pending') && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                    {logs.filter((l) => l.status === 'pending').length} pendente(s)
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckDomain}
                  disabled={checkingDomain}
                  className="h-8 text-xs bg-white"
                  title="Verifica se o domínio meyves.com.br está verificado no Resend"
                >
                  {checkingDomain ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 mr-1 text-[#2D0B0B]" />
                  )}
                  Checar Domínio Resend
                </Button>
                {logs.some((l) => l.status === 'pending') && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleProcessPending}
                    disabled={processingPending}
                    className="h-8 text-xs bg-[#2D0B0B] text-white hover:bg-[#1a0606]"
                    title="Dispara imediatamente envio das notificações que ficaram pendentes"
                  >
                    {processingPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Send className="h-3 w-3 mr-1" />
                    )}
                    Disparar Pendentes Agora
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadLogs}
                  disabled={loadingLogs}
                  className="h-8 text-xs"
                >
                  {loadingLogs ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Atualizar
                </Button>
              </div>
            </div>

            {domainStatus && (
              <div className="p-2.5 rounded-md border text-xs bg-[#fdfbf7] border-[#f0ede8] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#2D0B0B]">
                    Status do Domínio meyves.com.br no Resend:{' '}
                  </span>
                  <span className="font-mono">
                    {domainStatus?.verification?.found
                      ? domainStatus?.verification?.status || 'registrado'
                      : domainStatus?.verification?.error || 'não cadastrado'}
                  </span>
                </div>
                {domainStatus?.verification?.found ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Conectado
                  </Badge>
                ) : (
                  <Badge variant="destructive">Pendente / Não validado</Badge>
                )}
              </div>
            )}

            {loadingLogs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#2D0B0B]" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-muted/20 text-muted-foreground text-xs">
                Nenhum log de disparo gravado ainda.
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden text-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Remetente Usado</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/20">
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-medium text-[#2D0B0B]">
                          {log.template_slug || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-[11px]">
                          <div>{log.recipient_email}</div>
                          {log.resend_id && (
                            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                              ID: {log.resend_id}
                            </div>
                          )}
                          {log.error_message && (
                            <div
                              className="text-[10px] text-rose-600 line-clamp-2 mt-0.5 font-sans"
                              title={log.error_message}
                            >
                              {log.error_message}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px] truncate max-w-[160px]">
                          {log.from_address || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {log.status === 'sent' ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                              >
                                Enviado
                              </Badge>
                            ) : log.status === 'error' ? (
                              <Badge
                                variant="outline"
                                className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]"
                                title={log.error_message || ''}
                              >
                                Erro
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                              >
                                {log.status}
                              </Badge>
                            )}
                            {log.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => processPendingEmailLogs(log.id).then(loadLogs)}
                                className="h-6 px-1.5 text-[10px] text-[#2D0B0B] hover:underline"
                                title="Enviar esta linha pendente agora"
                              >
                                Enviar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button onClick={() => setLogsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
