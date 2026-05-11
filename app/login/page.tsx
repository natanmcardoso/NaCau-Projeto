'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    // Se já está autenticado, redireciona
    const auth = document.cookie.includes('nacau_auth=true') ||
      localStorage.getItem('nacau_session') === 'true'
    if (auth) router.replace('/')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao fazer login.')
        return
      }

      localStorage.setItem('nacau_session', 'true')
      router.replace('/')
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-light text-white tracking-tight">
            Na<span className="text-lime">Cau</span>
          </h1>
          <p className="text-muted text-sm mt-2">Gestão financeira do casal</p>
        </div>

        {/* Card de login */}
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-lg font-medium text-white mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-lime transition-colors"
              />
            </div>

            {erro && (
              <p className="text-danger text-sm">{erro}</p>
            )}

            <button
              type="submit"
              disabled={carregando || !senha}
              className="w-full bg-lime text-background font-medium rounded-xl px-4 py-3 hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {carregando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-xs mt-6">
          NaCau v1.0 · Uso privado
        </p>
      </div>
    </div>
  )
}
