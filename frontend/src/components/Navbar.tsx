'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getPB } from '@/lib/pocketbase'
import { ROLE_LABELS } from '@/lib/constants'
import { FlaskConical, LogOut, Menu, X, MessageSquare, LayoutDashboard, CheckSquare } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const pb = getPB()
  const user = pb.authStore.model
  const [mobileOpen, setMobileOpen] = useState(false)

  function logout() {
    pb.authStore.clear()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/pesquisas', label: 'Pesquisas' },
    ...(user ? [
      { href: '/dashboard', label: 'Painel', icon: <LayoutDashboard size={15} /> },
      { href: '/mensagens', label: 'Mensagens', icon: <MessageSquare size={15} /> },
      ...(user.role === 'institution' ? [{ href: '/aprovacoes', label: 'Aprovações', icon: <CheckSquare size={15} /> }] : []),
    ] : []),
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-800 text-sm">
            <FlaskConical size={20} className="text-blue-700" />
            <span className="hidden sm:inline">Hub Inovação Recife</span>
            <span className="sm:hidden">Hub Recife</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  pathname.startsWith(l.href)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {l.icon}
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ROLE_LABELS[user.role as string]}</p>
                </div>
                <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Sair">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-secondary text-xs px-3 py-1.5">Entrar</Link>
                <Link href="/cadastro" className="btn-primary text-xs px-3 py-1.5">Cadastrar</Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-1.5 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[user.role as string]}</p>
                </div>
                <button onClick={logout} className="text-sm text-red-600">Sair</button>
              </div>
            ) : (
              <div className="flex gap-2 px-3">
                <Link href="/login" className="btn-secondary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Entrar</Link>
                <Link href="/cadastro" className="btn-primary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Cadastrar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
