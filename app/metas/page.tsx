'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import MetaForm from '@/components/MetaForm'
import MetaList from '@/components/MetaList'
import type { Meta } from '@/lib/supabase'
import { formatMoeda } from '@/lib/formatters'

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostraForm, setMostraForm] = useState(false)
  const [filtro, setFiltro] = useState<'ativas' | 'todas'>('ativas')

  const carregar = useCallback(async () => {
    setCarregando(true)
    const url = filtro === 'todas' ? '/api/metas?todos=true' : '/api/metas'
    const res = await fetch(url)
    const data = await res.json()
    setMetas(Array.isArray(data) ? data : [])
    setCarregando(false)
  }, [filtro])

  useEffect(() => {
    carregar()
  }, [carregar])

  const metasAtivas = metas.filter((m) => m.ativo)
  const totalGuardado = metasAtivas.reduce((acc, m) => acc + Number(m.valor_atual), 0)
  const totalAlvo = metasAtivas.reduce((acc, m) => acc + Number(m.valor_total), 0)
  const pctGeral = totalAlvo > 0 ? (totalGuardado / totalAlvo) * 100 : 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-light text-white mb-1">Metas</h1>
              {metasAtivas.length > 0 && (
                <p className="text-muted text-sm">
                  {formatMoeda(totalGuardado)} de {formatMoeda(totalAlvo)} guardados —{' '}
                  <span className="text-lime">{pctGeral.toFixed(0)}% do total</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setMostraForm(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-lime text-background hover:bg-lime/90 transition-colors"
            >
              + Nova meta
            </button>
          </div>

          {/* Barra de progresso geral */}
          {metasAtivas.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
              <div className="flex justify-between text-xs text-muted mb-2">
                <span className="uppercase tracking-wide">Progresso geral</span>
                <span className="text-white">{pctGeral.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-lime transition-all"
                  style={{ width: `${Math.min(pctGeral, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted text-xs mb-0.5">Metas ativas</p>
                  <p className="text-white font-display">{metasAtivas.length}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-0.5">Total guardado</p>
                  <p className="text-lime font-display">{formatMoeda(totalGuardado)}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-0.5">Falta guardar</p>
                  <p className="text-white font-display">{formatMoeda(Math.max(0, totalAlvo - totalGuardado))}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filtro */}
          <div className="flex gap-2 mb-6">
            {(['ativas', 'todas'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                  filtro === f
                    ? 'bg-lime/10 text-lime border border-lime/30'
                    : 'text-muted border border-border hover:text-white'
                }`}
              >
                {f === 'ativas' ? 'Ativas' : 'Todas'}
              </button>
            ))}
          </div>

          {/* Lista */}
          {carregando ? (
            <p className="text-muted text-sm">Carregando...</p>
          ) : (
            <MetaList metas={metas} onAtualizar={carregar} />
          )}
        </div>
      </main>

      {mostraForm && (
        <MetaForm onSuccess={carregar} onClose={() => setMostraForm(false)} />
      )}
    </div>
  )
}
