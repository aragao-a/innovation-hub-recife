'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPB } from '@/lib/pocketbase'
import { Research } from '@/lib/types'
import Navbar from '@/components/Navbar'
import ResearchCard from '@/components/ResearchCard'
import { Search, ArrowRight, FlaskConical, Building2, Handshake } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [featured, setFeatured] = useState<Research[]>([])
  const [stats, setStats] = useState({ research: 0, institutions: 0, connections: 0 })
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const pb = getPB()

    pb.collection('research_projects')
      .getList<Research>(1, 6, {
        filter: 'status = "approved"',
        sort: '-view_count,-created',
        expand: 'researcher,institution',
      })
      .then((r) => setFeatured(r.items))
      .catch(() => {})

    Promise.all([
      pb.collection('research_projects').getList(1, 1, { filter: 'status = "approved"' }),
      pb.collection('institutions').getList(1, 1),
      pb.collection('contact_requests').getList(1, 1),
    ])
      .then(([r, i, c]) =>
        setStats({ research: r.totalItems, institutions: i.totalItems, connections: c.totalItems })
      )
      .catch(() => {})
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/pesquisas?q=${encodeURIComponent(query.trim())}`)
    else router.push('/pesquisas')
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-700/50 border border-blue-500/40 rounded-full px-4 py-1.5 text-sm mb-6">
            <FlaskConical size={14} />
            Hub de Inovação e Pesquisa do Recife
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Conectando pesquisa acadêmica com oportunidades reais
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Encontre projetos de pesquisa da academia pernambucana, em linguagem clara, prontos para virar parcerias.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pesquisas por tema, área ou palavra-chave..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button type="submit" className="bg-white text-blue-800 font-semibold px-5 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors">
              Buscar
            </button>
          </form>

          <div className="flex justify-center gap-10 mt-12 pt-10 border-t border-blue-700/50">
            {[
              { icon: <FlaskConical size={20} />, value: stats.research, label: 'Pesquisas publicadas' },
              { icon: <Building2 size={20} />, value: stats.institutions, label: 'Instituições' },
              { icon: <Handshake size={20} />, value: stats.connections, label: 'Conexões iniciadas' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-1 text-blue-300">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-blue-200 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pesquisas em destaque</h2>
            <p className="text-sm text-gray-500">Projetos com maior interesse da comunidade</p>
          </div>
          <Link href="/pesquisas" className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800 font-medium">
            Ver todas <ArrowRight size={15} />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma pesquisa publicada ainda.</p>
            <Link href="/cadastro" className="btn-primary mt-4 text-sm">Cadastre a primeira</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((r) => <ResearchCard key={r.id} research={r} />)}
          </div>
        )}
      </section>

      <section className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: '🔬',
              title: 'Para Pesquisadores',
              desc: 'Cadastre sua pesquisa, receba uma versão simplificada gerada por IA e conecte-se com empresas.',
              cta: 'Publicar pesquisa',
              href: '/cadastro?role=researcher',
            },
            {
              icon: '🏢',
              title: 'Para Empresas',
              desc: 'Encontre pesquisas relevantes para seu setor e inicie contato direto com os pesquisadores.',
              cta: 'Buscar soluções',
              href: '/pesquisas',
            },
            {
              icon: '🏛️',
              title: 'Para Instituições',
              desc: 'Gerencie as pesquisas de sua instituição, aprove publicações e acompanhe métricas.',
              cta: 'Criar conta',
              href: '/cadastro?role=institution',
            },
          ].map((block) => (
            <div key={block.title} className="p-6">
              <div className="text-3xl mb-3">{block.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{block.title}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{block.desc}</p>
              <Link href={block.href} className="btn-primary text-xs">{block.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        Hub de Inovação e Pesquisa do Recife · MVP protótipo funcional
      </footer>
    </div>
  )
}
