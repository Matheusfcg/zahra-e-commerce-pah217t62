import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Trash2, Send, Mail, PenSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  fetchSubscribers,
  deleteSubscriber,
  sendNewsletter,
  type NewsletterSubscriber,
} from '@/services/newsletter'

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchSubscribers()
    setSubscribers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: string) => {
    const { error } = await deleteSubscriber(id)
    if (error) {
      toast.error('Erro ao remover inscrito')
    } else {
      toast.success('Inscrito removido')
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Preencha o assunto e o conteúdo')
      return
    }
    setSending(true)
    const { error } = await sendNewsletter(subject.trim(), content.trim())
    setSending(false)
    if (error) {
      toast.error('Erro ao enviar newsletter')
    } else {
      toast.success('Newsletter enviada para todos os inscritos!')
      setIsComposeOpen(false)
      setSubject('')
      setContent('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Newsletter</CardTitle>
            <CardDescription>
              Gerencie os inscritos na newsletter e envie novidades para seus clientes.
            </CardDescription>
          </div>
          <Button onClick={() => setIsComposeOpen(true)} className="shrink-0">
            <PenSquare className="mr-2 h-4 w-4" />
            Compor Novidade
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <Mail className="mx-auto h-8 w-8 mb-2 opacity-50" />
            Nenhum inscrito na newsletter ainda.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Inscrito em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          Total de inscritos ativos: {subscribers.length}
        </p>
      </CardContent>

      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compor Novidade</DialogTitle>
            <DialogDescription>
              Escreva o assunto e o conteúdo do e-mail que será enviado para todos os inscritos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Novidades da coleção outono!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite a mensagem que será enviada..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar para todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
