'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getPB } from '@/lib/pocketbase'
import { Research } from '@/lib/types'
import { Check, X, Eye, Loader2, ClipboardList } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AprovacoesPage() {
  const router = useRouter()
  const pb = getPB()
  const user = pb.authStore.model
  const [pending, setPending] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'institution') {
      router.push('/dashboard')
      return
    }
    loadPending()
  }, [])

  async function loadPending() {
    const res = await pb.collection('research_projects').getFullList<Research>({
      filter: `institution = "${user!.institution}" && status = "pending_approval"`,
      sort: '-created',
      expand: 'researcher',
    })
    setPending(res)
    setLoading(false)
  }

  async function decide(id: string, approve: boolean) {
    setProcessing(id)
    await pb.collection('research_projects').update(id, {
      status: approve ? 'approved' : 'draft',
    })
    setPending((prev) => prev.filter((r) => r.id !== id))
    setProcessing(null)
  }

  if (!user || user.role !== 'institution') return null

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Aprovações pendentes</h1>
        <p className="text-sm text-gray-500 mb-8">
          Revise e aprove as pesquisas da sua instituição antes de publicá-las.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : pending.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma pesquisa aguardando aprovação.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge bg-yellow-100 text-yellow-800 text-xs">Aguardando aprovação</span>
                      <span className="text-xs text-gray-400">{r.area}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{r.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Pesquisador: {r.expand?.researcher?.name} ·{' '}
                      {formatDistanceToNow(new Date(r.created), { addSuffix: true, locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {r.simplified_description || r.technical_description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link href={`/pesquisas/${r.id}`} target="_blank"
                    className="btn-secondary text-xs flex items-center gap-1.5">
                    <Eye size={13} />
                    Visualizar completo
                  </Link>
                  <div className="flex-1" />
                  <button
                    onClick={() => decide(r.id, false)}
                    disabled={processing === r.id}
                    className="btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {processing === r.id ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                    Recusar
                  </button>
                  <button
                    onClick={() => decide(r.id, true)}
                    disabled={processing === r.id}
                    className="btn-primary text-xs bg-green-600 hover:bg-green-700"
                  >
                    {processing === r.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Aprovar e publicar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
