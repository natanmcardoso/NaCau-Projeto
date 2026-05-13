'use client'

import type { Parcelamento } from '@/lib/supabase'
import { formatMoeda, formatData } from '@/lib/formatters'

interface ParcelamentoListProps {
  parcelamentos: Parcelamento[]
  onPagarParcela: (id: string) => void
  carregandoId: string | null
}

export default function ParcelamentoList({
  parcelamentos,
  onPagarParcela,
  carregandoId,
}: ParcelamentoListProps) {
  if (parcelamentos.length === 0) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        Nenhum parcelamento cadastrado.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {parcelamentos.map((p) => {
        const progresso = p.total_parcelas > 0 ? (p.parcelas_pagas / p.total_parcelas) * 100 : 0
        const concluido = p.parcelas_pagas >= p.total_parcelas
        const parcelasRestantes = p.total_parcelas - p.parcelas_pagas

        return (
          <div key={p.id} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-white text-sm font-medium">{p.descricao}</p>
                <p className="text-muted text-xs mt-0.5">
                  {formatData(p.data_inicio)} → {formatData(p.data_fim)} · vence dia {p.dia_vencimento}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-lg font-light text-white">
                  {formatMoeda(p.valor_parcela)}
                  <span className="text-muted text-xs font-sans">/parc.</span>
                </p>
                <p className="text-muted text-xs mt-0.5">Total {formatMoeda(p.valor_total)}</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                <span>
                  {p.parcelas_pagas} de {p.total_parcelas} parcelas pagas
                </span>
                <span>{Math.round(progresso)}%</span>
              </div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    concluido ? 'bg-lime' : 'bg-blue'
                  }`}
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between">
              {concluido ? (
                <span className="text-xs text-lime font-medium">Quitado</span>
              ) : (
                <span className="text-xs text-muted">
                  {parcelasRestantes} parcela{parcelasRestantes !== 1 ? 's' : ''} restante{parcelasRestantes !== 1 ? 's' : ''}
                  {' · '}{formatMoeda(parcelasRestantes * p.valor_parcela)} a pagar
                </span>
              )}

              {!concluido && (
                <button
                  onClick={() => onPagarParcela(p.id)}
                  disabled={carregandoId === p.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue/15 text-blue border border-blue/30 hover:bg-blue/25 transition-colors disabled:opacity-50"
                >
                  {carregandoId === p.id ? 'Salvando...' : 'Marcar parcela paga'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
