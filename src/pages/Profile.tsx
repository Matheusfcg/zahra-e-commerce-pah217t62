import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCepLookup } from '@/hooks/use-cep-lookup'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Loader2, MapPin, User, Calendar } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const { isLoading: isCepLoading, error: cepError, lookup: lookupCep } = useCepLookup()
  const [cepNotFound, setCepNotFound] = useState(false)
  const numberRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: any }) => {
        if (data) {
          setFullName(data.full_name || '')
          setPhone(data.phone || '')
          setBirthDate(data.birth_date || '')
          setDocumentNumber(data.document_number || '')
          setZipCode(data.zip_code || '')
          setStreet(data.street || '')
          setNumber(data.number || '')
          setComplement(data.complement || '')
          setNeighborhood(data.neighborhood || '')
          setCity(data.city || '')
          setState(data.state || '')
        }
        setLoading(false)
      })
  }, [user])

  const handleCepLookup = async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, '')
    if (clean.length !== 8) {
      setCepNotFound(false)
      return
    }
    const data = await lookupCep(clean)
    if (data) {
      setStreet(data.street)
      setNeighborhood(data.neighborhood)
      setCity(data.city)
      setState(data.state)
      setCepNotFound(false)
      // Focus on "Número" field automatically after successful auto-fill
      setTimeout(() => {
        numberRef.current?.focus()
      }, 50)
    } else {
      setCepNotFound(true)
    }
  }

  useEffect(() => {
    const clean = zipCode.replace(/\D/g, '')
    if (clean.length === 8) {
      handleCepLookup(zipCode)
    }
  }, [zipCode])

  const handleSave = async () => {
    if (!user) return
    if (!fullName.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    if (
      !zipCode.trim() ||
      !street.trim() ||
      !number.trim() ||
      !neighborhood.trim() ||
      !city.trim() ||
      !state.trim()
    ) {
      toast({ title: 'Preencha os campos de endereço obrigatórios', variant: 'destructive' })
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: fullName,
        phone,
        birth_date: birthDate || null,
        document_number: documentNumber,
        zip_code: zipCode,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      } as any)
      .eq('id', user.id)
    if (error) toast({ title: 'Erro ao salvar', variant: 'destructive' })
    else toast({ title: 'Perfil atualizado com sucesso!' })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-2xl space-y-8 animate-pulse">
          <div className="h-9 w-48 bg-[#e8e4e0] rounded" />
          <div className="border p-6 space-y-4">
            <div className="h-6 w-36 bg-[#e8e4e0] rounded" />
            <div className="h-12 w-full bg-[#f4f1ee] rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-12 w-full bg-[#f4f1ee] rounded" />
              <div className="h-12 w-full bg-[#f4f1ee] rounded" />
              <div className="h-12 w-full bg-[#f4f1ee] rounded" />
            </div>
          </div>
          <div className="border p-6 space-y-4">
            <div className="h-6 w-44 bg-[#e8e4e0] rounded" />
            <div className="h-12 w-1/3 bg-[#f4f1ee] rounded" />
            <div className="h-12 w-full bg-[#f4f1ee] rounded" />
          </div>
        </div>
      </div>
    )
  }

  const inputCls = 'rounded-none h-12'

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-serif text-3xl mb-8">Meu Perfil</h1>
        <div className="space-y-8">
          <div className="border p-6 space-y-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </h2>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <div className="relative">
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc">CPF/CNPJ</Label>
                <Input
                  id="doc"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="000.000.000-00"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
          <div className="border p-6 space-y-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço de Entrega
            </h2>
            <div className="space-y-2">
              <Label htmlFor="zip">CEP *</Label>
              <div className="flex gap-2">
                <Input
                  id="zip"
                  value={zipCode}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '')
                    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2')
                    setZipCode(v)
                    if (v.replace(/\D/g, '').length !== 8) {
                      setCepNotFound(false)
                    }
                  }}
                  onBlur={(e) => handleCepLookup(e.target.value)}
                  maxLength={9}
                  placeholder="00000-000"
                  className={`${inputCls} w-1/3`}
                />
                {isCepLoading && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground self-center ml-1" />
                )}
              </div>
              {cepNotFound && (
                <p className="text-sm text-red-600">
                  CEP não encontrado. Preencha o endereço manualmente.
                </p>
              )}
              {cepError && !cepNotFound && <p className="text-sm text-amber-600">{cepError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={isCepLoading}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  ref={numberRef}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                disabled={isCepLoading}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isCepLoading}
                  className={inputCls}
                />{' '}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  maxLength={2}
                  disabled={isCepLoading}
                  className={inputCls}
                />{' '}
              </div>
            </div>
          </div>
          <Button className="w-full rounded-none h-12" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Perfil'}
          </Button>
        </div>
      </div>
    </div>
  )
}
