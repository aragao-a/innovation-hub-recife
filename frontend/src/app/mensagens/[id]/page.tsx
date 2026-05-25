'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ChatWindow from '@/components/ChatWindow'
import { getPB } from '@/lib/pocketbase'
import { ContactRequest } from '@/lib/types'
import { ChevronLeft, Loader2, ExternalLink } from 'lucide-react'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const pb = getPB()
  const user = pb.authStore.model
  const [contact, setContact] = useState<ContactRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    pb.collection('contact_requests')
      .getOne<ContactRequest>(id, { expand: 'research,organization,researcher' })
      .then(setContact)
      .catch(() => router.push('/mensagens'))
      .finally(() => setLoading(false))
  }, [id])

  if (!user) return null

  const otherPerson = user.id === contact?.researcher
    ? contact?.expand?.organization
    : contact?.expand?.researcher

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {loading || !contact ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/mensagens" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{otherPerson?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 truncate">
                sobre:{' '}
                <Link href={`/pesquisas/${contact.research}`}
                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5">
                  {contact.expand?.research?.title}
                  <ExternalLink size={10} />
                </Link>
              </p>
            </div>
          </div>

          <div className="card flex-1 overflow-hidden" style={{ height: '65vh' }}>
            <ChatWindow contactRequestId={id} currentUserId={user.id} />
          </div>
        </div>
      )}
    </div>
  )
}
