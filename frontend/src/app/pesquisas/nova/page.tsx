'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getPB } from '@/lib/pocketbase'
import { generateResearchSummary } from '@/app/actions'
import { RESEARCH_AREAS, MATURITY_LABELS, ODS_LIST } from '@/lib/constants'
import { Sparkles, Loader2, ChevronLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function NovaPage() {
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

  if (!user || user.role !== 'researcher') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Apenas pesquisadores podem cadastrar pesquisas.</p>
          <Link href="/login" className="btn-primary mt-4">Entrar</Link>
        </div>
      </div>
    )
  }

  function setField(key: string, value: string | number[]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function generateAI() {
    if (!form.title || !form.technical_description) {
      setAiError('Preencha o título e a descrição técnica primeiro.')
      return
    }
    setAiLoading(true)
    setAiError('')
    const result = await generateResearchSummary({
      title: form.title,
      area: form.area,
      keywords: form.keywords,
      technical_description: form.technical_description,
    })
    if (result.error) {
      setAiError(result.error)
    } else {
      setForm((f) => ({
        ...f,
        simplified_description: result.simplified_description,
        ods_tags: result.ods_suggestions,
      }))
    }
    setAiLoading(false)
  }

  function toggleOds(id: number) {
    setForm((f) => ({
      ...f,
      ods_tags: f.ods_tags.includes(id) ? f.ods_tags.filter((x) => x !== id) : [...f.ods_tags, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent, asDraft = false) {
    e.preventDefault()
    if (!form.simplified_description) {
      setError('Gere ou escreva um resumo acessível antes de publicar.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await pb.collection('research_projects').create({
        ...form,
        ods_tags: JSON.stringify(form.ods_tags),
        status: asDraft ? 'draft' : 'pending_approval',
        researcher: user.id,
        institution: user.institution,
        view_count: 0,
        contact_count: 0,
      })
      router.push('/dashboard')
    } catch {
      setError('Erro ao salvar pesquisa. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          Voltar ao painel
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nova pesquisa</h1>
        <p className="text-sm text-gray-500 mb-8">Após o envio, sua instituição precisará aprovar antes de publicar.</p>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Informações básicas</h2>

            <div>
              <label className="label">Título da pesquisa *</label>
              <input type="text" value={form.title} onChange={(e) => setField('title', e.target.value)}
                className="input" placeholder="Título claro e descritivo" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Área *</label>
                <select value={form.area} onChange={(e) => setField('area', e.target.value)} className="input">
                  {RESEARCH_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Estágio de maturidade *</label>
                <select value={form.maturity_level} onChange={(e) => setField('maturity_level', e.target.value)} className="input">
                  {Object.entries(MATURITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Palavras-chave</label>
              <input type="text" value={form.keywords} onChange={(e) => setField('keywords', e.target.value)}
                className="input" placeholder="Separe por vírgula: saúde, IA, sustentabilidade" />
            </div>

            <div>
              <label className="label">Descrição técnica *</label>
              <textarea value={form.technical_description} onChange={(e) => setField('technical_description', e.target.value)}
                className="input resize-none" rows={6} placeholder="Descreva a pesquisa com todos os detalhes técnicos..." required />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Resumo acessível</h2>
                <p className="text-xs text-gray-500 mt-0.5">Versão simplificada para não-acadêmicos</p>
              </div>
              <button type="button" onClick={generateAI} disabled={aiLoading} className="btn-primary text-xs px-3 py-1.5">
                {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                Gerar com IA
              </button>
            </div>

            {aiError && (
              <div className="flex items-start gap-2 bg-amber-50 text-amber-800 text-xs px-3 py-2 rounded-lg border border-amber-200">
                <Info size={13} className="mt-0.5 shrink-0" />
                {aiError}
              </div>
            )}

            <textarea value={form.simplified_description} onChange={(e) => setField('simplified_description', e.target.value)}
              className="input resize-none" rows={5}
              placeholder="Clique em 'Gerar com IA' ou escreva manualmente um resumo sem jargões técnicos..." />
          </div>

          <div className="card p-5 space-y-3">
            <div>
              <h2 className="font-semibold text-gray-900">ODS relacionados</h2>
              <p className="text-xs text-gray-500 mt-0.5">Objetivos de Desenvolvimento Sustentável da ONU (a IA sugere automaticamente)</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ODS_LIST.map((ods) => (
                <label key={ods.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                  form.ods_tags.includes(ods.id)
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}>
                  <input type="checkbox" checked={form.ods_tags.includes(ods.id)} onChange={() => toggleOds(ods.id)} className="sr-only" />
                  <span className="font-bold text-emerald-600 shrink-0">ODS {ods.id}</span>
                  <span className="line-clamp-2">{ods.title}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={saving} className="btn-secondary">
              Salvar rascunho
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Enviar para aprovação
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
