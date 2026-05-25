import Link from 'next/link'
import { Building2, Eye, MessageCircle, Tag } from 'lucide-react'
import { Research } from '@/lib/types'
import { MATURITY_LABELS, MATURITY_COLORS, ODS_LIST } from '@/lib/constants'

interface Props {
  research: Research
}

export default function ResearchCard({ research }: Props) {
  const odsTags: number[] = research.ods_tags ? JSON.parse(research.ods_tags) : []
  const keywords: string[] = research.keywords
    ? research.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : []

  return (
    <Link href={`/pesquisas/${research.id}`} className="card p-5 block hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
            {research.title}
          </h3>
        </div>
        <span className={`badge shrink-0 ${MATURITY_COLORS[research.maturity_level]}`}>
          {MATURITY_LABELS[research.maturity_level]}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
        {research.simplified_description || research.technical_description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {keywords.slice(0, 4).map((kw) => (
          <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
            <Tag size={10} />
            {kw}
          </span>
        ))}
      </div>

      {odsTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {odsTags.slice(0, 3).map((id) => {
            const ods = ODS_LIST.find((o) => o.id === id)
            return ods ? (
              <span key={id} className="badge bg-emerald-50 text-emerald-700 text-xs">
                ODS {id}
              </span>
            ) : null
          })}
          {odsTags.length > 3 && (
            <span className="badge bg-gray-100 text-gray-500 text-xs">+{odsTags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 size={12} className="shrink-0" />
          <span className="truncate">
            {research.expand?.institution?.name || research.area}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1"><Eye size={12} />{research.view_count}</span>
          <span className="flex items-center gap-1"><MessageCircle size={12} />{research.contact_count}</span>
        </div>
      </div>
    </Link>
  )
}
