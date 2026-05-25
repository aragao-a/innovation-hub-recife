'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getPB } from '@/lib/pocketbase'
import { Research, ContactRequest } from '@/lib/types'
import { MATURITY_LABELS, MATURITY_COLORS, ODS_LIST } from '@/lib/constants'
import {
  Building2, User, Tag, ChevronLeft, Eye, MessageCircle,
  BookOpen, Lightbulb, Loader2, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const pb = getPB()
  const user = pb.authStore.model

  const [research, setResearch] = useState<Research | null>(null)
  const [existingContact, setExistingContact] = useState<ContactRequest | null>(null)
  const [contacting, setContacting] = useState(false)
  const [tab, setTab] = useState<'simple' | 'technical'>('simple')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResearch()
  }, [id])

  async function loadResearch() {
    try {
      const r = await pb.collection('research_projects').getOne<Research>(id, {
        expand: 'researcher,institution',
      })
      setResearch(r)

      await pb.collection('research_projects').update(id, { view_count: (r.view_count || 0) + 1 }).catch(() => {})

      if (user && (user.role === 'business' || user.role === 'investor')) {
        const contacts = await pb.collection('contact_requests').getList<ContactRequest>(1, 1, {
          filter: `research = "${id}" && organization = "${user.id}"`,
        })
        if (contacts.items.length > 0) setExistingContact(contacts.items[0])
      }
    } catch {
      router.push('/pesquisas')
    } finally {
      setLoading(false)
    }
  }

  async function initiateContact() {
    if (!user) return router.push('/login')
    setContacting(true)
    try {
      const req = await pb.collection('contact_requests').create({
        research: id,
        organization: user.id,
        researcher: research!.researcher,
        status: 'pending',
      })
      await pb.collection('research_projects').update(id, {
        contact_count: (research!.contact_count || 0) + 1,
      })
      setExistingContact(req as ContactRequest)
      router.push(`/mensagens/${req.id}`)
    } finally {
      setContacting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-blue-600" /></div>
    </div>
  )

  if (!research) return null

  const odsTags: number[] = research.ods_tags ? JSON.parse(research.ods_tags) : []
  const keywords: string[] = research.keywords ? research.keywords.split(',').map((k) => k.trim()).filter(Boolean) : []
  const isOwner = user?.id === research.researcher
  const canContact = user && (user.role === 'business' || user.role === 'investor') && !isOwner

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/pesquisas" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          Voltar às pesquisas
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge bg-blue-100 text-blue-700 text-xs">{research.area}</span>
                    <span className={`badge ${MATURITY_COLORS[research.maturity_level]} text-xs`}>
                      {MATURITY_LABELS[research.maturity_level]}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-snug">{research.title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                <span className="flex items-center gap-1"><Eye size={13} />{research.view_count} visualizações</span>
                <span className="flex items-center gap-1"><MessageCircle size={13} />{research.contact_count} contatos</span>
                <span>{formatDistanceToNow(new Date(research.created), { addSuffix: true, locale: ptBR })}</span>
              </div>

              <div className="flex gap-1 border-b border-gray-200 mb-5">
                {[
                  { key: 'simple', label: 'Resumo Acessível', icon: <Lightbulb size={14} /> },
                  { key: 'technical', label: 'Descrição Técnica', icon: <BookOpen size={14} /> },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key as 'simple' | 'technical')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      tab === t.key
                        ? 'border-blue-700 text-blue-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>

              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {tab === 'simple'
                  ? (research.simplified_description || 'Resumo acessível não disponível.')
                  : research.technical_description}
              </div>
            </div>

            {keywords.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Tag size={14} />Palavras-chave</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span key={kw} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {odsTags.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">ODS Relacionados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {odsTags.map((id) => {
                    const ods = ODS_LIST.find((o) => o.id === id)
                    return ods ? (
                      <div key={id} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="badge bg-emerald-100 text-emerald-700 shrink-0">ODS {id}</span>
                        {ods.title}
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Pesquisador</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {research.expand?.researcher?.name || 'Pesquisador'}
                  </p>
                  <p className="text-xs text-gray-500">Pesquisador</p>
                </div>
              </div>

              {research.expand?.institution && (
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-gray-100">
                  <Building2 size={14} className="text-gray-400 shrink-0" />
                  <span>{research.expand.institution.name}</span>
                </div>
              )}
            </div>

            {canContact && (
              <div className="card p-5">
                {existingContact ? (
                  <div className="text-center space-y-3">
                    <CheckCircle2 size={28} className="text-green-600 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">Contato iniciado</p>
                    <p className="text-xs text-gray-500">Você já tem uma conversa com este pesquisador.</p>
                    <Link href={`/mensagens/${existingContact.id}`} className="btn-primary w-full justify-center text-sm">
                      Abrir conversa
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Interessado nesta pesquisa?</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Inicie um contato direto com o pesquisador para discutir parcerias ou aplicações.
                    </p>
                    <button onClick={initiateContact} disabled={contacting} className="btn-primary w-full justify-center">
                      {contacting ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
                      Iniciar contato
                    </button>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="card p-5 text-center space-y-3">
                <p className="text-sm text-gray-600">Faça login para entrar em contato com o pesquisador.</p>
                <Link href="/login" className="btn-primary w-full justify-center text-sm">Entrar</Link>
              </div>
            )}

            {isOwner && (
              <Link href={`/pesquisas/${id}/editar`} className="btn-secondary w-full justify-center">
                Editar pesquisa
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
