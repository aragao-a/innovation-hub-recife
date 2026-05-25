'use client'

import { useEffect, useRef, useState } from 'react'
import { getPB } from '@/lib/pocketbase'
import { Message } from '@/lib/types'
import { Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  contactRequestId: string
  currentUserId: string
}

export default function ChatWindow({ contactRequestId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pb = getPB()

  useEffect(() => {
    loadMessages()

    pb.collection('messages').subscribe('*', (e) => {
      if (e.record.contact_request === contactRequestId) {
        if (e.action === 'create') {
          setMessages((prev) => [...prev, e.record as unknown as Message])
        }
      }
    })

    return () => {
      pb.collection('messages').unsubscribe('*')
    }
  }, [contactRequestId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    const records = await pb.collection('messages').getFullList<Message>({
      filter: `contact_request = "${contactRequestId}"`,
      sort: 'created',
      expand: 'sender',
    })
    setMessages(records)

    for (const msg of records) {
      if (msg.sender !== currentUserId && !msg.read) {
        await pb.collection('messages').update(msg.id, { read: true }).catch(() => {})
      }
    }
  }

  async function send() {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await pb.collection('messages').create({
        contact_request: contactRequestId,
        sender: currentUserId,
        content: text.trim(),
        read: false,
      })
      setText('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                {!isMine && (
                  <p className="text-xs font-medium mb-1 text-blue-700">
                    {msg.expand?.sender?.name || 'Usuário'}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatDistanceToNow(new Date(msg.created), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Escreva uma mensagem..."
          className="input"
        />
        <button onClick={send} disabled={!text.trim() || sending} className="btn-primary px-3 shrink-0">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
