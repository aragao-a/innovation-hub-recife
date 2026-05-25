'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getPB } from '@/lib/pocketbase'
import { Research } from '@/lib/types'
import { generateResearchSummary } from '@/app/actions'
import { RESEARCH_AREAS, MATURITY_LABELS, ODS_LIST } from '@/lib/constants'
import { Sparkles, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditarPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const pb = getPB()
  const user = pb.authStore.model

  const [form, setForm] = useState({
    title: '',
    area: RESEARCH_AREAS[0],
    keywords: '',
    technical_description: '',
    simplified_description: '',
    maturity_level: 'basic',
    ods_tags: [] as number[],
  })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    pb.collection('research_projects').getOne<Research>(id).then((r) => {
      if (r.researcher !== user.id) { router.push(`/pesquisas/${id}`); return }
      setForm({
        title: r.title,
        area: r.area,
        keywords: r.keywords,
        technical_description: r.technical_description,
        simplified_description: r.simplified_description,
        maturity_level: r.maturity_level,
        ods_tags: r.ods_tags ? JSON.parse(r.ods_tags) : [],
      })
      setLoading(false)
    }).catch(() => router.push('/dashboard'))
  }, [id])

  function setField(key: string, value: string | number[]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function generateAI() {
    setAiLoading(true)
    setAiError('')
    const result = await generateResearchSummary({
      title: form.title,
      area: form.area,
      keywords: form.keywords,
      technical_description: form.technical_description,
    })
    if (result.error) setAiError(result.error)
    else setForm((f) => ({ ...f, simplified_description: result.simplified_description, ods_tags: result.ods_suggestions }))
    setAiLoading(false)
  }

  function toggleOds(oid: number) {
    setForm((f) => ({
      ...f,
      ods_tags: f.ods_tags.includes(oid) ? f.ods_tags.filter((x) => x !== oid) : [...f.ods_tags, oid],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await pb.collection('research_projects').update(id, {
        ...form,
        ods_tags: JSON.stringify(form.ods_tags),
      })
      router.push('/dashboard')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-blue-600" /></div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />Voltar ao painel
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar pesquisa</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Informações básicas</h2>
            <div>
              <label className="label">Título *</label>
              <input type="text" value={form.title} onChange={(e) => setField('title', e.target.value)} className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Área *</label>
                <select value={form.area} onChange={(e) => setField('area', e.target.value)} className="input">
                  {RESEARCH_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Maturidade *</label>
                <select value={form.maturity_level} onChange={(e) => setField('maturity_level', e.target.value)} className="input">
                  {Object.entries(MATURITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Palavras-chave</label>
              <input type="text" value={form.keywords} onChange={(e) => setField('keywords', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Descrição técnica *</label>
              <textarea value={form.technical_description} onChange={(e) => setField('technical_description', e.target.value)}
                className="input resize-none" rows={6} required />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Resumo acessível</h2>
              <button type="button" onClick={generateAI} disabled={aiLoading} className="btn-primary text-xs px-3 py-1.5">
                {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                Regerar com IA
              </button>
            </div>
            {aiError && <p className="text-xs text-red-600">{aiError}</p>}
            <textarea value={form.simplified_description} onChange={(e) => setField('simplified_description', e.target.value)}
              className="input resize-none" rows={5} />
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">ODS relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ODS_LIST.map((ods) => (
                <label key={ods.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                  form.ods_tags.includes(ods.id) ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}>
                  <input type="checkbox" checked={form.ods_tags.includes(ods.id)} onChange={() => toggleOds(ods.id)} className="sr-only" />
                  <span className="font-bold text-emerald-600 shrink-0">ODS {ods.id}</span>
                  <span className="line-clamp-2">{ods.title}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

          <div className="flex gap-3 justify-end">
            <Link href="/dashboard" className="btn-secondary">Cancelar</Link>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
