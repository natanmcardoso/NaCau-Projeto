'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import KPICard from '@/components/KPICard'
import { formatMoeda, mesAtualFormatado } from '@/lib/formatters'

interface Saldo {
  rendaTotal: number
  saldoDisponivel: number
  saldoVA: number
  totalGastosFixos: number
  salario1: number
  salario2: number
  va1: number
  va2: number
  gastosDoMes: number
  ganhosDoMes: number
  gastosVADoMes: number
}

export default function HomePage() {
  const [saldo, setSaldo] = useState<Saldo | null>(null)
  const [carregando, setCarregando] = useState(true)

  const fetchSaldo = useCallback(async () => {
    setCarregando(true)
    const res = await fetch('/api/saldo')
    if (res.ok) {
      setSaldo(await res.json())
    }
    setCarregando(false)
  }, [])

  useEffect(() => {
    fetchSaldo()
  }, [fetchSaldo])

  function varianteSaldo(valor: number) {
    if (valor > 0) return 'positive' as const
    if (valor < 0) return 'negative' as const
    return 'default' as const
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-light text-white">
              Visão Geral
            </h1>
            <p className="text-muted text-sm mt-1 capitalize">
              {mesAtualFormatado()}
            </p>
          </div>

          {carregando ? (
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

              {/* Detalhamento */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wide mb-4">
                    Salários
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Salário 1</span>
                      <span className="text-lime font-display">{formatMoeda(saldo.salario1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Salário 2</span>
                      <span className="text-lime font-display">{formatMoeda(saldo.salario2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">VA 1</span>
                      <span className="text-blue font-display">{formatMoeda(saldo.va1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">VA 2</span>
                      <span className="text-blue font-display">{formatMoeda(saldo.va2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wide mb-4">
                    Resumo do mês
                  </p>
                  <div className="space-y-3">
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
                    <div className="flex justify-between text-sm border-t border-border pt-3">
                      <span className="text-muted">Fixos comprometidos</span>
                      <span className="text-white font-display">
                        − {formatMoeda(saldo.totalGastosFixos)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <a
                  href="/transacoes"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime transition-colors"
                >
                  Ver todas as transações
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
