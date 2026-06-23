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
          <DialogDescription className="text-center text-gray-500 mb-4 sr-only">
            Pague com Pix
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white p-2 rounded-xl w-64 h-64 flex items-center justify-center mb-6 overflow-hidden">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(details.payload)}`}
            alt="QR Code PIX"
            className="w-full h-full object-contain mix-blend-multiply"
          />
        </div>

        <p className="text-gray-500 text-sm mb-4 text-center mt-[-10px]">
          Abra o aplicativo do seu banco e escaneie
          <br />o QR Code para pagar
        </p>

        <p className="text-gray-500 text-sm mb-1 text-center">Transferir Pix para:</p>
        <p className="text-black font-semibold text-lg text-center uppercase tracking-wide">
          {details.merchantName}
        </p>
        <p className="text-black font-medium text-md text-center mt-1">
          {details.pixKey?.includes('/') || details.pixKey?.length === 14
            ? `CNPJ: ${details.pixKey}`
            : details.pixKey}
        </p>

        <div className="flex items-center justify-center gap-2 mt-6 mb-4">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="4" />
              <circle cx="12" cy="12" r="4" fill="#8bc34a" />
            </svg>
            <span className="font-bold text-xl tracking-tight text-black">
              infinite<span className="font-semibold">pay</span>
            </span>
          </div>
        </div>

        <Button
          onClick={handleCopy}
          className="w-full mt-4 bg-black text-white hover:bg-gray-800 rounded-full h-12 text-lg font-medium"
        >
          {copied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
          {copied ? 'Copiado!' : 'Copiar código Pix'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
