'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPB } from '@/lib/pocketbase'
import { Institution } from '@/lib/types'
import { ROLE_LABELS, INSTITUTION_TYPES } from '@/lib/constants'
import { FlaskConical, Loader2 } from 'lucide-react'

const ROLES = ['researcher', 'institution', 'business', 'investor'] as const

export default function CadastroPage() {
  const searchParams = useSearchParams()
  const [role, setRole] = useState<string>(searchParams.get('role') || 'researcher')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [instName, setInstName] = useState('')
  const [instType, setInstType] = useState(INSTITUTION_TYPES[0])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (role === 'researcher') {
      getPB()
        .collection('institutions')
        .getFullList<Institution>({ sort: 'name' })
        .then(setInstitutions)
        .catch(() => {})
    }
  }, [role])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const pb = getPB()

    try {
      let linkedInstitution = institutionId

      if (role === 'institution') {
        const inst = await pb.collection('institutions').create({
          name: instName,
          type: instType,
          city: 'Recife',
        })
        linkedInstitution = inst.id
      }

      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name,
        role,
        institution: linkedInstitution || '',
        bio,
      })

      await pb.collection('users').authWithPassword(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      const pbErr = err as { data?: { data?: Record<string, { message?: string }> } }
      const msgs = pbErr?.data?.data
      if (msgs) {
        const first = Object.values(msgs)[0]
        setError(first?.message || 'Erro ao criar conta.')
      } else {
        setError('Erro ao criar conta. Verifique os dados e tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-800 font-bold text-lg">
            <FlaskConical size={24} />
            Hub Inovação Recife
          </Link>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Criar conta</h1>
          <p className="text-sm text-gray-500 mb-6">Escolha seu perfil para começar</p>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors text-left ${
                  role === r
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome completo / Razão social</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input" placeholder="Seu nome" required />
            </div>

            <div>
              <label className="label">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input" placeholder="seu@email.com" required />
            </div>

            <div>
              <label className="label">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input" placeholder="Mínimo 8 caracteres" minLength={8} required />
            </div>

            {role === 'researcher' && (
              <div>
                <label className="label">Instituição vinculada</label>
                {institutions.length > 0 ? (
                  <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}
                    className="input" required>
                    <option value="">Selecione sua instituição</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Nenhuma instituição cadastrada ainda. Peça para sua instituição criar uma conta primeiro.
                  </p>
                )}
              </div>
            )}

            {role === 'institution' && (
              <>
                <div>
                  <label className="label">Nome da instituição</label>
                  <input type="text" value={instName} onChange={(e) => setInstName(e.target.value)}
                    className="input" placeholder="Ex: UFPE" required />
                </div>
                <div>
                  <label className="label">Tipo de instituição</label>
                  <select value={instType} onChange={(e) => setInstType(e.target.value)} className="input">
                    {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="label">Bio / Sobre você <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                className="input resize-none" rows={2} placeholder="Breve descrição..." />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta?{' '}
          <Link href="/login" className="text-blue-700 hover:text-blue-800 font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
