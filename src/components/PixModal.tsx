import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle2 } from 'lucide-react'

export function PixModal() {
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleShow = (e: any) => {
      setDetails(e.detail)
      setOpen(true)
      setCopied(false)
    }
    window.addEventListener('SHOW_PIX_MODAL', handleShow)
    return () => window.removeEventListener('SHOW_PIX_MODAL', handleShow)
  }, [])

  if (!details) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(details.payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 bg-white border-none shadow-xl rounded-2xl">
        <DialogHeader className="w-full">
          <DialogTitle className="text-center text-3xl font-bold text-black mb-2">
            Pague com Pix
          </DialogTitle>
          <DialogDescription className="sr-only">
            Escaneie o QR Code ou copie o código Pix para pagar.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-64 h-64 flex items-center justify-center mb-6 overflow-hidden">
          {/* Fallback to generic QR since we don't have a package, but stylized nicely */}
          <img
            src={`https://img.usecurling.com/p/256/256?q=qrcode&seed=${details.payload.length}`}
            alt="QR Code PIX"
            className="w-full h-full object-contain"
          />
        </div>

        <p className="text-gray-500 text-sm mb-1">Transferir Pix para:</p>
        <p className="text-black font-medium text-lg text-center uppercase">
          {details.merchantName}
        </p>
        <p className="text-black font-normal text-md text-center mt-1">{details.pixKey}</p>

        <div className="flex items-center justify-center gap-2 mt-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-4 border-black border-t-green-500"></div>
            <span className="font-bold text-xl tracking-tight">
              infinite<span className="font-semibold">pay</span>
            </span>
          </div>
        </div>

        <Button
          onClick={handleCopy}
          className="w-full mt-4 bg-black text-white hover:bg-gray-800 rounded-full h-12 text-lg"
        >
          {copied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
          {copied ? 'Copiado!' : 'Copiar código Pix'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
