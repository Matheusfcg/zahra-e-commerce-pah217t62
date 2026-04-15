import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  text: string
  sender: 'bot' | 'user'
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou a assistente virtual da Zahrá. Como posso ajudar você a encontrar a peça ideal hoje?',
      sender: 'bot',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMsg: Message = { id: Date.now().toString(), text: inputValue, sender: 'user' }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Mock AI response
    setTimeout(() => {
      let botResponse =
        'Nossa coleção Signature traz peças exclusivas. Gostaria de ver as opções de cores da Tote Bag?'
      if (inputValue.toLowerCase().includes('frete')) {
        botResponse = 'Oferecemos frete grátis para todo o Brasil em compras acima de R$ 500.'
      } else if (inputValue.toLowerCase().includes('tamanho')) {
        botResponse =
          'Nossa Signature Tote tem as medidas perfeitas: 32x45x15cm. Cabem notebooks de até 15 polegadas com folga!'
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot' },
      ])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300',
          !isOpen && 'animate-wiggle', // Adding wiggle if idle
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-background border shadow-2xl z-50 rounded-t-lg rounded-bl-lg overflow-hidden animate-slide-up">
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-medium text-sm">Zahrá Assistente</h3>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-96 flex flex-col bg-cream-dark/30">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-white border text-foreground rounded-tl-sm shadow-sm',
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 bg-background border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="rounded-full border-muted-foreground/30 focus-visible:ring-primary h-10"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full h-10 w-10 flex-shrink-0"
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
