'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import ParcelamentoForm from '@/components/ParcelamentoForm'
import ParcelamentoList from '@/components/ParcelamentoList'
import type { Parcelamento } from '@/lib/supabase'
import { formatMoeda } from '@/lib/formatters'

export default function ParcelamentosPage() {
  const [parcelamentos, setParcelamentos] = useState<Parcelamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostraForm, setMostraForm] = useState(false)
  const [carregandoId, setCarregandoId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'ativos' | 'todos'>('ativos')

  const carregar = useCallback(async () => {
    setCarregando(true)
    const res = await fetch('/api/parcelamentos')
    const data = await res.json()
    setParcelamentos(Array.isArray(data) ? data : [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function handlePagarParcela(id: string) {
    setCarregandoId(id)
    const res = await fetch(`/api/parcelamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pagar_parcela' }),
    })
    setCarregandoId(null)
    if (res.ok) {
      const atualizado = await res.json()
      setParcelamentos((prev) => prev.map((p) => (p.id === id ? atualizado : p)))
    }
  }

  const lista =
    filtro === 'ativos'
      ? parcelamentos.filter((p) => p.parcelas_pagas < p.total_parcelas)
      : parcelamentos

  const totalComprometido = parcelamentos
    .filter((p) => p.parcelas_pagas < p.total_parcelas)
    .reduce((acc, p) => acc + p.valor_parcela, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light text-white mb-1">Parcelamentos</h1>
            <p className="text-muted text-sm">
              Compromisso mensal:{' '}
              <span className="text-blue font-medium">{formatMoeda(totalComprometido)}</span>
            </p>
          </div>
          <button
            onClick={() => setMostraForm(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-lime text-background hover:bg-lime/90 transition-colors"
          >
            + Novo parcelamento
          </button>
        </div>

        {/* Filtro */}
        <div className="flex gap-2 mb-6">
          {(['ativos', 'todos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                filtro === f
                  ? 'bg-lime/10 text-lime border border-lime/30'
                  : 'text-muted border border-border hover:text-white'
              }`}
            >
              {f === 'ativos' ? 'Em andamento' : 'Todos'}
            </button>
          ))}
        </div>

        {/* Lista */}
        {carregando ? (
          <p className="text-muted text-sm">Carregando...</p>
        ) : (
          <ParcelamentoList
            parcelamentos={lista}
            onPagarParcela={handlePagarParcela}
            carregandoId={carregandoId}
          />
        )}
      </main>

      {mostraForm && (
        <ParcelamentoForm
          onSuccess={carregar}
          onClose={() => setMostraForm(false)}
        />
      )}
    </div>
  )
}
