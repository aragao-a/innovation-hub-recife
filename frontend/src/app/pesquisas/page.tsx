'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getPB } from '@/lib/pocketbase'
import { Research } from '@/lib/types'
import Navbar from '@/components/Navbar'
import ResearchCard from '@/components/ResearchCard'
import SearchFilters from '@/components/SearchFilters'
import { FlaskConical, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'

interface Filters {
  query: string
  area: string
  maturity: string
  ods: string
}

export default function PesquisasPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<Filters>({
    query: searchParams.get('q') || '',
    area: '',
    maturity: '',
    ods: '',
  })
  const [results, setResults] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pb = getPB()
  const user = pb.authStore.model

  const search = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    try {
      const parts = ['status = "approved"']
      if (f.query) parts.push(`(title ~ "${f.query}" || keywords ~ "${f.query}" || simplified_description ~ "${f.query}")`)
      if (f.area) parts.push(`area = "${f.area}"`)
      if (f.maturity) parts.push(`maturity_level = "${f.maturity}"`)
      if (f.ods) parts.push(`ods_tags ~ "${f.ods}"`)

      const res = await pb.collection('research_projects').getList<Research>(p, 12, {
        filter: parts.join(' && '),
        sort: '-view_count,-created',
        expand: 'researcher,institution',
      })
      setResults(res.items)
      setTotalPages(res.totalPages)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    search(filters, 1)
  }, [filters])

  useEffect(() => {
    search(filters, page)
  }, [page])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesquisas</h1>
            <p className="text-sm text-gray-500">Descubra projetos científicos de Recife</p>
          </div>
          {user?.role === 'researcher' && (
            <Link href="/pesquisas/nova" className="btn-primary">
              <Plus size={16} />
              Nova pesquisa
            </Link>
          )}
        </div>

        <div className="mb-6">
          <SearchFilters filters={filters} onChange={setFilters} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma pesquisa encontrada com esses filtros.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r) => <ResearchCard key={r.id} research={r} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs">
                  Anterior
                </button>
                <span className="flex items-center text-sm text-gray-600">Página {page} de {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-xs">
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
