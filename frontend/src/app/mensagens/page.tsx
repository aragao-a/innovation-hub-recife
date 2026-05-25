'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getPB } from '@/lib/pocketbase'
import { ContactRequest } from '@/lib/types'
import { MessageCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function MensagensPage() {
  const router = useRouter()
  const pb = getPB()
  const user = pb.authStore.model
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    const isResearcher = user.role === 'researcher'
    pb.collection('contact_requests')
      .getFullList<ContactRequest>({
        filter: isResearcher ? `researcher = "${user.id}"` : `organization = "${user.id}"`,
        sort: '-created',
        expand: isResearcher ? 'research,organization' : 'research,researcher',
      })
      .then(setContacts)
      .finally(() => setLoading(false))
  }, [])

  if (!user) return null

  const isResearcher = user.role === 'researcher'

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mensagens</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <MessageCircle size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma conversa ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => {
              const otherName = isResearcher
                ? c.expand?.organization?.name
                : c.expand?.researcher?.name
              const researchTitle = c.expand?.research?.title

              return (
                <Link key={c.id} href={`/mensagens/${c.id}`}
                  className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{otherName || 'Usuário'}</p>
                    <p className="text-xs text-gray-500 truncate">{researchTitle}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(c.created), { addSuffix: true, locale: ptBR })}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
