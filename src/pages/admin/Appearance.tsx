import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FontSettings } from '@/components/admin/FontSettings'

export default function Appearance() {
  return (
    <div className="container max-w-4xl py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
          <Link to="/admin/upload">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary tracking-tight">Aparência</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a identidade visual e tipografia da loja.
          </p>
        </div>
      </div>
      <div className="grid gap-8">
        <FontSettings />
      </div>
    </div>
  )
}
