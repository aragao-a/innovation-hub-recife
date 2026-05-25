'use client'

import { RESEARCH_AREAS, MATURITY_LABELS, ODS_LIST } from '@/lib/constants'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

interface Filters {
  query: string
  area: string
  maturity: string
  ods: string
}

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
}

export default function SearchFilters({ filters, onChange }: Props) {
  const [showFilters, setShowFilters] = useState(false)

  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, palavra-chave..."
            value={filters.query}
            onChange={(e) => update('query', e.target.value)}
            className="input pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-1.5 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
        >
          <SlidersHorizontal size={15} />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Área</label>
            <select
              value={filters.area}
              onChange={(e) => update('area', e.target.value)}
              className="input"
            >
              <option value="">Todas as áreas</option>
              {RESEARCH_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Maturidade</label>
            <select
              value={filters.maturity}
              onChange={(e) => update('maturity', e.target.value)}
              className="input"
            >
              <option value="">Todos os estágios</option>
              {Object.entries(MATURITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">ODS</label>
            <select
              value={filters.ods}
              onChange={(e) => update('ods', e.target.value)}
              className="input"
            >
              <option value="">Todos os ODS</option>
              {ODS_LIST.map((o) => (
                <option key={o.id} value={String(o.id)}>ODS {o.id}: {o.title}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
