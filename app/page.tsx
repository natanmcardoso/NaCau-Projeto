'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import KPICard from '@/components/KPICard'
import GraficoCategoria from '@/components/GraficoCategoria'
import { formatMoeda, mesAtualFormatado } from '@/lib/formatters'

interface Saldo {
  rendaTotal: number
  saldoDisponivel: number
  saldoVA: number
  totalGastosFixos: number
  totalParcelamentosMensal: number
  totalMetasAtivas: number
  salario1: number
  salario2: number
  va1: number
  va2: number
  gastosDoMes: number
  ganhosDoMes: number
  gastosVADoMes: number
}

interface DadoCategoria {
  categoria: string
  total: number
  percentual: number
}

interface RelatorioMes {
  porCategoria: DadoCategoria[]
  totalSaidas: number
  mesAnterior: { totalEntradas: number; totalSaidas: number; saldo: number }
}

export default function HomePage() {
  const [saldo, setSaldo] = useState<Saldo | null>(null)
  const [relatorio, setRelatorio] = useState<RelatorioMes | null>(null)
  const [carregando, setCarregando] = useState(true)

  const now = new Date()
  const mesRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const fetchDados = useCallback(async () => {
    setCarregando(true)
    const [resSaldo, resRel] = await Promise.all([
      fetch('/api/saldo'),
      fetch(`/api/relatorio?mes=${mesRef}`),
    ])
    if (resSaldo.ok) setSaldo(await resSaldo.json())
    if (resRel.ok) setRelatorio(await resRel.json())
    setCarregando(false)
  }, [mesRef])

  useEffect(() => {
    fetchDados()
  }, [fetchDados])

  function varianteSaldo(valor: number) {
    if (valor > 0) return 'positive' as const
    if (valor < 0) return 'negative' as const
    return 'default' as const
  }

  // % do salário comprometido com fixos + parcelamentos
  const salarioTotal = saldo ? saldo.salario1 + saldo.salario2 : 0
  const totalComprometido = saldo
    ? saldo.totalGastosFixos + saldo.totalParcelamentosMensal
    : 0
  const pctComprometido =
    salarioTotal > 0 ? Math.min((totalComprometido / salarioTotal) * 100, 100) : 0

  // Comparativo mês anterior
  const difSaidas =
    relatorio && relatorio.mesAnterior.totalSaidas > 0
      ? ((relatorio.totalSaidas - relatorio.mesAnterior.totalSaidas) /
          relatorio.mesAnterior.totalSaidas) *
        100
      : null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-light text-white">Visão Geral</h1>
            <p className="text-muted text-sm mt-1 capitalize">{mesAtualFormatado()}</p>
          </div>

          {carregando ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-border rounded-2xl p-5 animate-pulse"
                  >
                    <div className="h-3 w-20 bg-border rounded mb-4" />
                    <div className="h-7 w-28 bg-border rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : saldo ? (
            <>
              {/* KPIs principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard
                  label="Renda Total"
                  value={formatMoeda(saldo.rendaTotal)}
                  sublabel={`Sal. ${formatMoeda(saldo.salario1 + saldo.salario2)} · VA ${formatMoeda(saldo.va1 + saldo.va2)}`}
                />
                <KPICard
                  label="Saldo Disponível"
                  value={formatMoeda(saldo.saldoDisponivel)}
                  variant={varianteSaldo(saldo.saldoDisponivel)}
                  sublabel={`Gastos: ${formatMoeda(saldo.gastosDoMes)}`}
                />
                <KPICard
                  label="Saldo VA"
                  value={formatMoeda(saldo.saldoVA)}
                  variant={varianteSaldo(saldo.saldoVA)}
                  sublabel={`Usado: ${formatMoeda(saldo.gastosVADoMes)}`}
                />
                <KPICard
                  label="Gastos Fixos"
                  value={formatMoeda(saldo.totalGastosFixos)}
                  variant="info"
                  sublabel="Comprometido/mês"
                />
              </div>

              {/* Indicador de comprometimento + gráfico */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Comprometimento do salário */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <p className="text-xs text-muted uppercase tracking-wide">
                    Comprometimento do Salário
                  </p>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted">Fixos vs Salário</span>
                      <span className="text-white font-display">
                        {pctComprometido.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pctComprometido > 70
                            ? 'bg-danger'
                            : pctComprometido > 40
                            ? 'bg-yellow-400'
                            : 'bg-lime'
                        }`}
                        style={{ width: `${pctComprometido}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-2">
                      {formatMoeda(totalComprometido)} de {formatMoeda(salarioTotal)} comprometidos
                      {saldo.totalParcelamentosMensal > 0 && (
                        <span className="ml-1">
                          (fixos {formatMoeda(saldo.totalGastosFixos)} + parcelas{' '}
                          {formatMoeda(saldo.totalParcelamentosMensal)})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Comparativo mês anterior */}
                  {relatorio && (
                    <div className="pt-3 border-t border-border space-y-2">
                      <p className="text-xs text-muted uppercase tracking-wide">
                        vs Mês Anterior
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Saídas mês anterior</span>
                        <span className="text-white font-display">
                          {formatMoeda(relatorio.mesAnterior.totalSaidas)}
                        </span>
                      </div>
                      {difSaidas !== null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Variação de saídas</span>
                          <span
                            className={`font-display ${
                              difSaidas > 0 ? 'text-danger' : 'text-lime'
                            }`}
                          >
                            {difSaidas > 0 ? '+' : ''}
                            {difSaidas.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumo do mês */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-xs text-muted uppercase tracking-wide">
                      Resumo do Mês
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Gastos lançados</span>
                      <span className="text-danger font-display">
                        − {formatMoeda(saldo.gastosDoMes)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Ganhos extras</span>
                      <span className="text-lime font-display">
                        + {formatMoeda(saldo.ganhosDoMes)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Gastos VA</span>
                      <span className="text-blue font-display">
                        − {formatMoeda(saldo.gastosVADoMes)}
                      </span>
                    </div>
                    {saldo.totalMetasAtivas > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Guardado em metas</span>
                        <span className="text-yellow-400 font-display">
                          − {formatMoeda(saldo.totalMetasAtivas)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gráfico de categorias */}
                <div className="bg-surface border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wide mb-2">
                    Gastos por Categoria — {mesAtualFormatado()}
                  </p>
                  <GraficoCategoria dados={relatorio?.porCategoria ?? []} />
                </div>
              </div>

              {/* Salários detalhado */}
              <div className="mt-4 bg-surface border border-border rounded-2xl p-5">
                <p className="text-xs text-muted uppercase tracking-wide mb-4">Salários</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted mb-1">Salário 1</p>
                    <p className="text-lime font-display">{formatMoeda(saldo.salario1)}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Salário 2</p>
                    <p className="text-lime font-display">{formatMoeda(saldo.salario2)}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">VA 1</p>
                    <p className="text-blue font-display">{formatMoeda(saldo.va1)}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">VA 2</p>
                    <p className="text-blue font-display">{formatMoeda(saldo.va2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-4 flex-wrap">
                <a
                  href="/transacoes"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime transition-colors"
                >
                  Ver todas as transações
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/relatorio"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime transition-colors"
                >
                  Ver relatório completo
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/metas"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime transition-colors"
                >
                  Ver metas
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-6 text-center">
              <p className="text-muted text-sm">
                Erro ao carregar dados. Verifique as{' '}
                <a href="/configuracoes" className="text-lime hover:underline">
                  Configurações
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
