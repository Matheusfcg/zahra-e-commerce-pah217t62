import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export function PixModal() {
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const handleStart = () => {
      setLoading(true)
      setError(false)
      setOpen(true)
    }

    const handleShow = (e: any) => {
      setDetails(e.detail)
      setLoading(false)
      setError(false)
      setOpen(true)
      setCopied(false)
    }

    const handleError = () => {
      setLoading(false)
      setError(true)
      setOpen(true)
    }

    const handleClose = () => {
      setOpen(false)
    }

    window.addEventListener('START_PIX_FLOW', handleStart)
    window.addEventListener('SHOW_PIX_MODAL', handleShow)
    window.addEventListener('PIX_ERROR', handleError)
    window.addEventListener('CLOSE_PIX_MODAL', handleClose)
    return () => {
      window.removeEventListener('START_PIX_FLOW', handleStart)
      window.removeEventListener('SHOW_PIX_MODAL', handleShow)
      window.removeEventListener('PIX_ERROR', handleError)
      window.removeEventListener('CLOSE_PIX_MODAL', handleClose)
    }
  }, [])

  const handleCopy = () => {
    if (!details) return
    navigator.clipboard.writeText(details.payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRetry = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 bg-white border-none shadow-xl rounded-2xl">
        <DialogHeader className="w-full">
          <DialogTitle className="text-center text-3xl font-bold text-black mb-2">
            Pague com Pix
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 mb-4 sr-only">
            Pague com Pix para finalizar seu pedido
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 w-full">
            <Loader2 className="w-12 h-12 text-black animate-spin" />
            <p className="text-gray-500 font-medium">Processando seu pedido...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-6 w-full">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">Erro na geração</p>
              <p className="text-sm text-gray-500">
                Não foi possível gerar o código Pix e salvar seu pedido.
                <br />
                Por favor, tente novamente.
              </p>
            </div>
            <Button
              onClick={handleRetry}
              className="w-full bg-black text-white hover:bg-gray-800 rounded-full h-12 text-lg font-medium"
            >
              Tentar novamente
            </Button>
          </div>
        ) : details ? (
          <div className="flex flex-col items-center w-full space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl w-full flex justify-center border border-gray-100">
              {details.payload ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(details.payload)}`}
                  alt="QR Code Pix"
                  className="w-48 h-48 mix-blend-multiply"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
              )}
            </div>

            <div className="w-full space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Beneficiário</span>
                <span className="font-semibold text-gray-900">
                  {details.merchantName || 'ELLEN CRISTINA'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Chave Pix</span>
                <span className="font-semibold text-gray-900">
                  {details.pixKey || '64.278.774/0001-61'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Valor</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    details.amount || 0,
                  )}
                </span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-gray-700 text-center">Pix Copia e Cola</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-hidden shadow-inner">
                  <p className="text-xs text-gray-500 truncate select-all font-mono">
                    {details.payload}
                  </p>
                </div>
                <Button
                  onClick={handleCopy}
                  className={`shrink-0 h-[42px] px-4 transition-all duration-300 ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-black hover:bg-gray-800'}`}
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </Button>
              </div>
            </div>

            <div className="w-full pt-2">
              <Button
                variant="outline"
                className="w-full rounded-full h-12 text-lg"
                onClick={() => setOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
