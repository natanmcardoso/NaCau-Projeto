'use client'

import { useState } from 'react'
import type { Meta } from '@/lib/supabase'
import { formatMoeda, hojeISO } from '@/lib/formatters'

interface Props {
  meta?: Meta
  onSuccess: () => void
  onClose: () => void
}

export default function MetaForm({ meta, onSuccess, onClose }: Props) {
  const [nome, setNome] = useState(meta?.nome ?? '')
  const [valorTotal, setValorTotal] = useState(meta?.valor_total?.toString() ?? '')
  const [valorAtual, setValorAtual] = useState(meta?.valor_atual?.toString() ?? '0')
  const [dataFim, setDataFim] = useState(meta?.data_fim ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Preview: valor mensal necessário
  const mesesRestantes = (() => {
    if (!dataFim) return null
    const hoje = new Date()
    const fim = new Date(dataFim + 'T00:00:00')
    const diffMs = fim.getTime() - hoje.getTime()
    const meses = diffMs / (1000 * 60 * 60 * 24 * 30.44)
    return Math.max(0, meses)
  })()

  const faltando = Math.max(0, Number(valorTotal || 0) - Number(valorAtual || 0))
  const valorMensal =
    mesesRestantes !== null && mesesRestantes > 0 ? faltando / mesesRestantes : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    const payload = {
      nome,
      valor_total: Number(valorTotal),
      valor_atual: Number(valorAtual),
      data_fim: dataFim,
    }

    const url = meta ? `/api/metas/${meta.id}` : '/api/metas'
    const method = meta ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSalvando(false)

    if (res.ok) {
      onSuccess()
      onClose()
    } else {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao salvar meta')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg font-light text-white">
            {meta ? 'Editar meta' : 'Nova meta'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Nome da meta</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Viagem para Europa"
              required
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Valor total */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Valor total</label>
            <input
              type="number"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0,00"
              min="0.01"
              step="0.01"
              required
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Valor já guardado */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Valor já guardado</label>
            <input
              type="number"
              value={valorAtual}
              onChange={(e) => setValorAtual(e.target.value)}
              placeholder="0,00"
              min="0"
              step="0.01"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Data fim */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Data limite</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              min={meta ? undefined : hojeISO()}
              required
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Preview */}
          {valorTotal && dataFim && (
            <div className="bg-background border border-border rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-xs text-muted uppercase tracking-wide">Preview</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Falta guardar</span>
                <span className="text-white font-display">{formatMoeda(faltando)}</span>
              </div>
              {valorMensal !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Necessário por mês</span>
                  <span className="text-lime font-display">{formatMoeda(valorMensal)}</span>
                </div>
              )}
              {mesesRestantes !== null && mesesRestantes <= 0 && (
                <p className="text-xs text-danger">Data limite já passou</p>
              )}
            </div>
          )}

          {erro && <p className="text-xs text-danger">{erro}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-muted border border-border hover:text-white hover:border-white/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-lime text-background hover:bg-lime/90 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : meta ? 'Salvar' : 'Criar meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
