'use client'

import { useState } from 'react'
import type { Meta } from '@/lib/supabase'
import { formatMoeda, formatData } from '@/lib/formatters'
import MetaForm from './MetaForm'

interface Props {
  metas: Meta[]
  onAtualizar: () => void
}

function calcularAlerta(meta: Meta): 'ok' | 'atencao' | 'critico' | 'vencida' | 'concluida' {
  const hoje = new Date()
  const fim = new Date(meta.data_fim + 'T00:00:00')
  const criacao = new Date(meta.created_at)

  if (Number(meta.valor_atual) >= Number(meta.valor_total)) return 'concluida'

  if (fim < hoje) return 'vencida'

  const diasRestantes = (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)

  // Progresso esperado no tempo decorrido
  const totalDias = (fim.getTime() - criacao.getTime()) / (1000 * 60 * 60 * 24)
  const diasDecorridos = (hoje.getTime() - criacao.getTime()) / (1000 * 60 * 60 * 24)
  const progressoEsperado =
    totalDias > 0 ? (diasDecorridos / totalDias) * Number(meta.valor_total) : 0
  const progressoReal = Number(meta.valor_atual)

  if (diasRestantes < 30) return 'critico'
  if (progressoReal < progressoEsperado * 0.7) return 'atencao'
  return 'ok'
}

function corAlerta(alerta: ReturnType<typeof calcularAlerta>) {
  switch (alerta) {
    case 'concluida': return 'text-lime'
    case 'ok': return 'text-lime'
    case 'atencao': return 'text-yellow-400'
    case 'critico': return 'text-orange-400'
    case 'vencida': return 'text-danger'
  }
}

function corBarra(alerta: ReturnType<typeof calcularAlerta>, pct: number) {
  if (pct >= 100 || alerta === 'concluida') return 'bg-lime'
  if (alerta === 'vencida') return 'bg-danger'
  if (alerta === 'critico') return 'bg-orange-400'
  if (alerta === 'atencao') return 'bg-yellow-400'
  return 'bg-lime'
}

function labelAlerta(alerta: ReturnType<typeof calcularAlerta>) {
  switch (alerta) {
    case 'concluida': return 'Concluída'
    case 'ok': return null
    case 'atencao': return 'Abaixo do ritmo'
    case 'critico': return 'Próximo do vencimento'
    case 'vencida': return 'Vencida'
  }
}

interface AdicionarValorProps {
  meta: Meta
  onSuccess: () => void
  onClose: () => void
}

function AdicionarValorModal({ meta, onSuccess, onClose }: AdicionarValorProps) {
  const [valor, setValor] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    const res = await fetch(`/api/metas/${meta.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'adicionar_valor', valor: Number(valor) }),
    })

    setSalvando(false)

    if (res.ok) {
      onSuccess()
      onClose()
    } else {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao adicionar valor')
    }
  }

  const faltando = Math.max(0, Number(meta.valor_total) - Number(meta.valor_atual))

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg font-light text-white">Adicionar valor</h2>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <p className="text-sm text-muted mb-1">{meta.nome}</p>
            <p className="text-xs text-muted">Falta: <span className="text-white">{formatMoeda(faltando)}</span></p>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Valor a adicionar</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              min="0.01"
              max={faltando}
              step="0.01"
              required
              autoFocus
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime/50"
            />
          </div>
          {erro && <p className="text-xs text-danger">{erro}</p>}
          <div className="flex gap-3">
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
              {salvando ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MetaList({ metas, onAtualizar }: Props) {
  const [editando, setEditando] = useState<Meta | null>(null)
  const [adicionando, setAdicionando] = useState<Meta | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)

  async function handleRemover(id: string) {
    if (!confirm('Arquivar esta meta?')) return
    setRemovendo(id)
    await fetch(`/api/metas/${id}`, { method: 'DELETE' })
    setRemovendo(null)
    onAtualizar()
  }

  if (metas.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center">
        <p className="text-muted text-sm">Nenhuma meta ativa. Crie sua primeira meta!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {metas.map((meta) => {
          const pct = Math.min(
            (Number(meta.valor_atual) / Number(meta.valor_total)) * 100,
            100
          )
          const alerta = calcularAlerta(meta)
          const badge = labelAlerta(alerta)

          const hoje = new Date()
          const fim = new Date(meta.data_fim + 'T00:00:00')
          const diasRestantes = Math.ceil(
            (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
          )
          const mesesRestantes = diasRestantes / 30.44
          const faltando = Math.max(0, Number(meta.valor_total) - Number(meta.valor_atual))
          const valorMensal =
            mesesRestantes > 0 && faltando > 0 ? faltando / mesesRestantes : null

          return (
            <div key={meta.id} className="bg-surface border border-border rounded-2xl p-5">
              {/* Cabeçalho */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-medium text-sm">{meta.nome}</h3>
                    {badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          alerta === 'concluida'
                            ? 'border-lime/30 text-lime bg-lime/10'
                            : alerta === 'vencida'
                            ? 'border-danger/30 text-danger bg-danger/10'
                            : alerta === 'critico'
                            ? 'border-orange-400/30 text-orange-400 bg-orange-400/10'
                            : 'border-yellow-400/30 text-yellow-400 bg-yellow-400/10'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Prazo: {formatData(meta.data_fim)}
                    {diasRestantes > 0 && alerta !== 'concluida' && (
                      <span className={`ml-1 ${corAlerta(alerta)}`}>
                        ({diasRestantes}d restantes)
                      </span>
                    )}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  {alerta !== 'concluida' && alerta !== 'vencida' && (
                    <button
                      onClick={() => setAdicionando(meta)}
                      className="px-3 py-1.5 rounded-lg text-xs text-lime border border-lime/30 hover:bg-lime/10 transition-colors"
                    >
                      + Adicionar
                    </button>
                  )}
                  <button
                    onClick={() => setEditando(meta)}
                    className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                    title="Editar"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemover(meta.id)}
                    disabled={removendo === meta.id}
                    className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                    title="Arquivar"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M10 12v4m4-4v4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Valores */}
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted">
                  <span className={`font-display ${corAlerta(alerta)}`}>
                    {formatMoeda(Number(meta.valor_atual))}
                  </span>
                  {' '}de{' '}
                  <span className="text-white font-display">
                    {formatMoeda(Number(meta.valor_total))}
                  </span>
                </span>
                <span className={`font-display text-sm ${corAlerta(alerta)}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="h-2 bg-border rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${corBarra(alerta, pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Info adicional */}
              <div className="flex justify-between text-xs text-muted">
                <span>
                  Falta: <span className="text-white">{formatMoeda(faltando)}</span>
                </span>
                {valorMensal !== null && (
                  <span>
                    Necessário/mês:{' '}
                    <span className={corAlerta(alerta)}>{formatMoeda(valorMensal)}</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editando && (
        <MetaForm
          meta={editando}
          onSuccess={onAtualizar}
          onClose={() => setEditando(null)}
        />
      )}

      {adicionando && (
        <AdicionarValorModal
          meta={adicionando}
          onSuccess={onAtualizar}
          onClose={() => setAdicionando(null)}
        />
      )}
    </>
  )
}
