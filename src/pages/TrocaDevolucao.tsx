import { useEffect } from 'react'

export default function TrocaDevolucao() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="w-full pt-[100px] md:pt-[140px] pb-24 bg-[#FAFAFA] min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl md:text-4xl font-serif text-[#2D0B0B] mb-10 text-center uppercase tracking-[0.1em]">
          Trocas e Devoluções
        </h1>

        <div className="bg-white p-6 md:p-10 shadow-sm border border-muted/50 rounded-sm text-[#333] space-y-8 text-sm md:text-base leading-relaxed">
          <div className="bg-[#FAFAF8] p-5 border-l-4 border-[#2D0B0B] rounded-r-sm">
            <p className="font-medium">
              Todas as solicitações são feitas exclusivamente pelo link:{' '}
              <a
                href="https://lamagieclothes.troque.app.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D0B0B] font-bold hover:underline transition-all"
              >
                https://lamagieclothes.troque.app.br/
              </a>
            </p>
          </div>

          <p className="text-red-700 font-semibold tracking-wide bg-red-50 p-4 rounded-sm border border-red-100">
            Não aceitamos trocas de peças promocionais.
          </p>

          <section>
            <h2 className="text-lg font-serif text-[#2D0B0B] mb-3 uppercase tracking-wider border-b pb-2">
              Prazo
            </h2>
            <p>
              Você tem até <strong>7 dias corridos</strong> após o recebimento para solicitar troca
              ou devolução. Em caso de defeito de fabricação, o prazo é de <strong>30 dias</strong>.
            </p>
            <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-sm border border-gray-100">
              <strong>Observação:</strong> Em compras realizadas com cupom ou promoção, o valor do
              cupom de troca será referente ao valor pago na compra, e não ao valor original do
              produto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[#2D0B0B] mb-3 uppercase tracking-wider border-b pb-2">
              Condições
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                A peça deve estar nova, com etiqueta e na embalagem original. Não aceitamos trocas
                ou devoluções de produtos usados, sujos ou manchados.
              </li>
              <li>
                O frete de envio até a gente é por nossa conta. O frete de reenvio da nova peça é de
                responsabilidade da cliente.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[#2D0B0B] mb-3 uppercase tracking-wider border-b pb-2">
              Como Trocar ou Devolver
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Acesse:{' '}
                <a
                  href="https://lamagieclothes.troque.app.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2D0B0B] font-medium hover:underline"
                >
                  https://lamagieclothes.troque.app.br/
                </a>
              </li>
              <li>
                Preencha os dados: número do pedido e tipo de solicitação (troca ou devolução).
              </li>
              <li>Siga as instruções para envio do produto.</li>
              <li>
                Após o recebimento e aprovação, o processo será concluído conforme sua escolha.
              </li>
              <li>Todas as atualizações chegam por e-mail.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[#2D0B0B] mb-3 uppercase tracking-wider border-b pb-2">
              Cupom de Troca
            </h2>
            <p>
              O cupom deve ser usado integralmente em uma única compra e é válido por{' '}
              <strong>90 dias</strong> a partir do envio por e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[#2D0B0B] mb-3 uppercase tracking-wider border-b pb-2">
              Reembolso
            </h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Cartão de Crédito:</strong> O estorno é feito diretamente na fatura —
                parcelado conforme as parcelas, à vista de forma integral. O prazo pode variar
                conforme a operadora, geralmente em até 10 dias úteis.
              </li>
              <li>
                <strong>Pix:</strong> O valor é devolvido diretamente na sua conta em até 3 dias
                úteis.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[#2D0B0B] mb-3 uppercase tracking-wider border-b pb-2">
              Exceções
            </h2>
            <p>
              Não realizamos trocas ou devoluções de produtos personalizados ou feitos sob
              encomenda, como ajustes de comprimento ou modificações de modelagem.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
