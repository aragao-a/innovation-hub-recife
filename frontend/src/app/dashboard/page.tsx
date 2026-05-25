'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getPB } from '@/lib/pocketbase'
import { Research, ContactRequest } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import {
  Plus, Eye, MessageCircle, FlaskConical, Loader2,
  CheckSquare, EyeOff, Pencil
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const router = useRouter()
  const pb = getPB()
  const user = pb.authStore.model
  const [research, setResearch] = useState<Research[]>([])
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    loadData()
  }, [])

  async function loadData() {
    try {
      if (user!.role === 'researcher') {
        const res = await pb.collection('research_projects').getFullList<Research>({
          filter: `researcher = "${user!.id}"`,
          sort: '-created',
          expand: 'institution',
        })
        setResearch(res)
      } else if (user!.role === 'institution') {
        const res = await pb.collection('research_projects').getFullList<Research>({
          filter: `institution = "${user!.institution}"`,
          sort: '-created',
          expand: 'researcher',
        })
        setResearch(res)
      } else {
        const c = await pb.collection('contact_requests').getFullList<ContactRequest>({
          filter: `organization = "${user!.id}"`,
          sort: '-created',
          expand: 'research,researcher',
        })
        setContacts(c)
      }
    } finally {
      setLoading(false)
    }
  }

  async function toggleHide(r: Research) {
    const newStatus = r.status === 'hidden' ? 'approved' : 'hidden'
    await pb.collection('research_projects').update(r.id, { status: newStatus })
    setResearch((prev) => prev.map((x) => x.id === r.id ? { ...x, status: newStatus } : x))
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name.split(' ')[0]}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Seu painel pessoal</p>
          </div>
          {user.role === 'researcher' && (
            <Link href="/pesquisas/nova" className="btn-primary">
              <Plus size={16} />
              Nova pesquisa
            </Link>
          )}
          {user.role === 'institution' && (
            <Link href="/aprovacoes" className="btn-primary">
              <CheckSquare size={16} />
              Gerenciar aprovações
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {(user.role === 'researcher' || user.role === 'institution') && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {[
                    { label: 'Total', value: research.length, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Publicadas', value: research.filter((r) => r.status === 'approved').length, color: 'bg-green-50 text-green-700' },
                    { label: 'Aguardando', value: research.filter((r) => r.status === 'pending_approval').length, color: 'bg-yellow-50 text-yellow-700' },
                    { label: 'Visualizações', value: research.reduce((s, r) => s + (r.view_count || 0), 0), color: 'bg-purple-50 text-purple-700' },
                  ].map((s) => (
                    <div key={s.label} className={`card p-4 ${s.color}`}>
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-xs mt-0.5 opacity-80">{s.label}</div>
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {user.role === 'researcher' ? 'Minhas pesquisas' : 'Pesquisas da instituição'}
                </h2>

                {research.length === 0 ? (
                  <div className="card p-12 text-center text-gray-400">
                    <FlaskConical size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      {user.role === 'researcher'
                        ? 'Você ainda não publicou nenhuma pesquisa.'
                        : 'Nenhuma pesquisa associada à instituição.'}
                    </p>
                    {user.role === 'researcher' && (
                      <Link href="/pesquisas/nova" className="btn-primary mt-4 text-sm">Criar primeira pesquisa</Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {research.map((r) => (
                      <div key={r.id} className="card p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`badge text-xs ${STATUS_COLORS[r.status]}`}>
                              {STATUS_LABELS[r.status]}
                            </span>
                            <span className="text-xs text-gray-400">{r.area}</span>
                          </div>
                          <Link href={`/pesquisas/${r.id}`} className="font-medium text-gray-900 hover:text-blue-700 text-sm line-clamp-1">
                            {r.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Eye size={11} />{r.view_count}</span>
                            <span className="flex items-center gap-1"><MessageCircle size={11} />{r.contact_count}</span>
                            <span>{formatDistanceToNow(new Date(r.created), { addSuffix: true, locale: ptBR })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {user.role === 'researcher' && (
                            <>
                              <Link href={`/pesquisas/${r.id}/editar`}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Editar">
                                <Pencil size={15} />
                              </Link>
                              {r.status === 'approved' || r.status === 'hidden' ? (
                                <button onClick={() => toggleHide(r)}
                                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                  title={r.status === 'hidden' ? 'Mostrar' : 'Ocultar'}>
                                  <EyeOff size={15} />
                                </button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {(user.role === 'business' || user.role === 'investor') && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contatos iniciados</h2>
                {contacts.length === 0 ? (
                  <div className="card p-12 text-center text-gray-400">
                    <MessageCircle size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Você ainda não iniciou nenhum contato.</p>
                    <Link href="/pesquisas" className="btn-primary mt-4 text-sm">Buscar pesquisas</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((c) => (
                      <Link key={c.id} href={`/mensagens/${c.id}`} className="card p-4 block hover:shadow-md transition-shadow">
                        <p className="font-medium text-gray-900 text-sm mb-1">
                          {c.expand?.research?.title || 'Pesquisa'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Pesquisador: {c.expand?.researcher?.name} ·{' '}
                          {formatDistanceToNow(new Date(c.created), { addSuffix: true, locale: ptBR })}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
