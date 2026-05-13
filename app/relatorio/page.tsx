'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import KPICard from '@/components/KPICard'
import GraficoCategoria from '@/components/GraficoCategoria'
import GraficoEvolucao from '@/components/GraficoEvolucao'
import { formatMoeda } from '@/lib/formatters'

interface DadoCategoria {
  categoria: string
  total: number
  percentual: number
}

interface DadoEvolucao {
  mes: string
  totalEntradas: number
  totalSaidas: number
  saldo: number
}

interface MesAnterior {
  totalEntradas: number
  totalSaidas: number
  saldo: number
}

interface Relatorio {
  mes: string
  totalEntradas: number
  totalSaidas: number
  saldoLiquido: number
  porCategoria: DadoCategoria[]
  evolucao: DadoEvolucao[]
  mesAnterior: MesAnterior
}

function Delta({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0) return null
  const diff = atual - anterior
  const pct = Math.abs((diff / anterior) * 100).toFixed(0)
  const positivo = diff > 0
  return (
    <span className={`text-xs ${positivo ? 'text-lime' : 'text-danger'}`}>
      {positivo ? '▲' : '▼'} {pct}% vs mês anterior
    </span>
  )
}

export default function RelatorioPage() {
  const now = new Date()
  const mesDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [mes, setMes] = useState(mesDefault)
  const [dados, setDados] = useState<Relatorio | null>(null)
  const [carregando, setCarregando] = useState(true)

  const fetchRelatorio = useCallback(async () => {
    setCarregando(true)
    const res = await fetch(`/api/relatorio?mes=${mes}`)
    if (res.ok) setDados(await res.json())
    setCarregando(false)
  }, [mes])

  useEffect(() => {
    fetchRelatorio()
  }, [fetchRelatorio])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-light text-white">Relatório</h1>
              <p className="text-muted text-sm mt-1">Análise detalhada por período</p>
            </div>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="bg-surface border border-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-lime/50"
            />
          </div>

          {carregando ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-surface border border-border rounded-2xl p-5 animate-pulse h-28"
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-5 animate-pulse h-72" />
                <div className="bg-surface border border-border rounded-2xl p-5 animate-pulse h-72" />
              </div>
            </div>
          ) : dados ? (
            <>
              {/* KPIs com comparativo */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <KPICard
                  label="Total Entradas"
                  value={formatMoeda(dados.totalEntradas)}
                  variant="positive"
                  sublabel={
                    <Delta
                      atual={dados.totalEntradas}
                      anterior={dados.mesAnterior.totalEntradas}
                    />
                  }
                />
                <KPICard
                  label="Total Saídas"
                  value={formatMoeda(dados.totalSaidas)}
                  variant="negative"
                  sublabel={
                    <Delta
                      atual={dados.totalSaidas}
                      anterior={dados.mesAnterior.totalSaidas}
                    />
                  }
                />
                <KPICard
                  label="Saldo Líquido"
                  value={formatMoeda(dados.saldoLiquido)}
                  variant={dados.saldoLiquido >= 0 ? 'positive' : 'negative'}
                  sublabel={
                    <Delta
                      atual={dados.saldoLiquido}
                      anterior={dados.mesAnterior.saldo}
                    />
                  }
                />
              </div>

              {/* Gráficos lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wide mb-4">
                    Gastos por Categoria
                  </p>
                  <GraficoCategoria dados={dados.porCategoria} />
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wide mb-4">
                    Evolução — últimos 6 meses
                  </p>
                  <GraficoEvolucao dados={dados.evolucao} />
                </div>
              </div>

              {/* Tabela por categoria */}
              {dados.porCategoria.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wide mb-4">
                    Detalhamento por Categoria
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-muted font-normal pb-3">Categoria</th>
                        <th className="text-right text-muted font-normal pb-3">Total</th>
                        <th className="text-right text-muted font-normal pb-3 pr-4">%</th>
                        <th className="pb-3 w-36" />
                      </tr>
                    </thead>
                    <tbody>
                      {dados.porCategoria.map((cat) => (
                        <tr
                          key={cat.categoria}
                          className="border-b border-border/40 last:border-0"
                        >
                          <td className="py-3 text-white">{cat.categoria}</td>
                          <td className="py-3 text-right text-danger font-display">
                            {formatMoeda(cat.total)}
                          </td>
                          <td className="py-3 text-right text-muted pr-4">
                            {cat.percentual.toFixed(1)}%
                          </td>
                          <td className="py-3">
                            <div className="h-1.5 bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-lime rounded-full transition-all"
                                style={{ width: `${Math.min(cat.percentual, 100)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Estado vazio */}
              {dados.porCategoria.length === 0 && dados.totalEntradas === 0 && (
                <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                  <p className="text-muted text-sm">
                    Nenhuma transação registrada neste período.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-6 text-center">
              <p className="text-muted text-sm">Erro ao carregar relatório.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
