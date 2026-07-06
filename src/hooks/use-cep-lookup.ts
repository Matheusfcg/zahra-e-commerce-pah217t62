import { useState, useCallback, useRef } from 'react'

export interface CepData {
  street: string
  neighborhood: string
  city: string
  state: string
}

export interface UseCepLookupResult {
  isLoading: boolean
  error: string | null
  lookup: (rawCep: string) => Promise<CepData | null>
}

export function useCepLookup(): UseCepLookupResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastCepRef = useRef<string>('')

  const lookup = useCallback(async (rawCep: string): Promise<CepData | null> => {
    const clean = rawCep.replace(/\D/g, '')

    if (clean.length !== 8) {
      setError(null)
      return null
    }

    if (lastCepRef.current === clean) {
      return null
    }
    lastCepRef.current = clean

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      if (!response.ok) {
        throw new Error('Erro de conexão')
      }
      const data = await response.json()

      if (data.erro) {
        setError('CEP não encontrado')
        setIsLoading(false)
        return null
      }

      const result: CepData = {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }

      setIsLoading(false)
      return result
    } catch {
      setError('Não foi possível buscar o CEP. Preencha o endereço manualmente.')
      setIsLoading(false)
      return null
    }
  }, [])

  return { isLoading, error, lookup }
}
