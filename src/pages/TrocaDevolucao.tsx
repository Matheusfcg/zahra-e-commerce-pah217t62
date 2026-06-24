import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

const fallbackContent = `**Trocar ou devolver**

**Trocas e Devoluções**
Todas as solicitações são feitas exclusivamente pelo link: https://lamagieclothes.troque.app.br/
Não aceitamos trocas de peças promocionais.

**Prazo**
Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução. Em caso de defeito de fabricação, o prazo é de 30 dias.
Observação: Em compras realizadas com cupom ou promoção, o valor do cupom de troca será referente ao valor pago na compra, e não ao valor original do produto.

**Condições**
A peça deve estar nova, com etiqueta e na embalagem original. Não aceitamos trocas ou devoluções de produtos usados, sujos ou manchados.
O frete de envio até a gente é por nossa conta. O frete de reenvio da nova peça é de responsabilidade da cliente.

**Como Trocar ou Devolver**
Acesse: https://lamagieclothes.troque.app.br/
Preencha os dados: número do pedido e tipo de solicitação (troca ou devolução).
Siga as instruções para envio do produto.
Após o recebimento e aprovação, o processo será concluído conforme sua escolha.
Todas as atualizações chegam por e-mail.

**Cupom de Troca**
O cupom deve ser usado integralmente em uma única compra e é válido por 90 dias a partir do envio por e-mail.

**Reembolso**
Cartão de Crédito: O estorno é feito diretamente na fatura — parcelado conforme as parcelas, à vista de forma integral. O prazo pode variar conforme a operadora, geralmente em até 10 dias úteis.
Pix: O valor é devolvido diretamente na sua conta em até 3 dias úteis.

**Exceções**
Não realizamos trocas ou devoluções de produtos personalizados ou feitos sob encomenda, como ajustes de comprimento ou modificações de modelagem.`

const formatPolicy = (text: string) => {
  let html = text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-[#2D0B0B] font-serif text-lg mt-6 mb-2 block border-b border-muted/30 pb-2">$1</strong>',
  )
  html = html.replace(
    /(https:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-medium">$1</a>',
  )
  return html
}

export default function TrocaDevolucao() {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchPolicy = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content_value')
          .eq('section_key', 'exchange_policy')
          .single()

        if (data && data.content_value) {
          setContent(data.content_value)
        } else {
          setContent(fallbackContent)
        }
      } catch (err) {
        setContent(fallbackContent)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPolicy()
  }, [])

  return (
    <div className="w-full pt-[100px] md:pt-[140px] pb-24 bg-[#FAFAFA] min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl md:text-4xl font-serif text-[#2D0B0B] mb-10 text-center uppercase tracking-[0.1em]">
          Trocas e Devoluções
        </h1>

        <div className="bg-white p-6 md:p-10 shadow-sm border border-muted/50 rounded-sm text-[#333] text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: formatPolicy(content) }} />
          )}
        </div>
      </div>
    </div>
  )
}
