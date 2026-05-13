import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function totaisDoMes(primeiroDia: string, ultimoDia: string) {
  const { data: txs } = await supabase
    .from('transacoes')
    .select('tipo, valor, categoria')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)

  let totalEntradas = 0
  let totalSaidas = 0
  const porCategoria: Record<string, number> = {}

  for (const t of txs ?? []) {
    const valor = Number(t.valor)
    if (t.tipo === 'ganho' || t.tipo === 'salario') {
      totalEntradas += valor
    } else if (t.tipo === 'gasto' || t.tipo === 'gasto_fixo' || t.tipo === 'gasto_va') {
      totalSaidas += valor
      const cat = t.categoria || 'Outros'
      porCategoria[cat] = (porCategoria[cat] || 0) + valor
    }
  }

  return { totalEntradas, totalSaidas, porCategoria }
}

export async function GET(request: Request) {
  noStore()
  const { searchParams } = new URL(request.url)
  const mesParm = searchParams.get('mes')

  const now = new Date()
  const anoAtual = now.getFullYear()
  const mesAtual = String(now.getMonth() + 1).padStart(2, '0')
  const mesRef = mesParm || `${anoAtual}-${mesAtual}`

  const [anoStr, mesStr] = mesRef.split('-')
  const ano = Number(anoStr)
  const mes = Number(mesStr)

  const primeiroDia = `${mesRef}-01`
  const ultimoDia = new Date(ano, mes, 0).toISOString().split('T')[0]

  const { totalEntradas, totalSaidas, porCategoria } = await totaisDoMes(primeiroDia, ultimoDia)

  // Mês anterior (para comparativo)
  const dataAnterior = new Date(ano, mes - 2, 1)
  const anoAnt = dataAnterior.getFullYear()
  const mesAnt = String(dataAnterior.getMonth() + 1).padStart(2, '0')
  const primeiroDiaAnt = `${anoAnt}-${mesAnt}-01`
  const ultimoDiaAnt = new Date(anoAnt, dataAnterior.getMonth() + 1, 0).toISOString().split('T')[0]
  const mesAnterior = await totaisDoMes(primeiroDiaAnt, ultimoDiaAnt)

  // Evolução dos últimos 6 meses
  const evolucao = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1)
    const evoAno = d.getFullYear()
    const evoMes = String(d.getMonth() + 1).padStart(2, '0')
    const evoPrimeiro = `${evoAno}-${evoMes}-01`
    const evoUltimo = new Date(evoAno, d.getMonth() + 1, 0).toISOString().split('T')[0]

    const { totalEntradas: e, totalSaidas: s } = await totaisDoMes(evoPrimeiro, evoUltimo)
    evolucao.push({
      mes: `${evoMes}/${String(evoAno).slice(2)}`,
      totalEntradas: e,
      totalSaidas: s,
      saldo: e - s,
    })
  }

  const categorias = Object.entries(porCategoria)
    .map(([categoria, total]) => ({
      categoria,
      total,
      percentual: totalSaidas > 0 ? (total / totalSaidas) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return NextResponse.json({
    mes: mesRef,
    totalEntradas,
    totalSaidas,
    saldoLiquido: totalEntradas - totalSaidas,
    porCategoria: categorias,
    evolucao,
    mesAnterior: {
      totalEntradas: mesAnterior.totalEntradas,
      totalSaidas: mesAnterior.totalSaidas,
      saldo: mesAnterior.totalEntradas - mesAnterior.totalSaidas,
    },
  })
}
