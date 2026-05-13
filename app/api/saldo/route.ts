import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  noStore()
  const now = new Date()
  const ano = now.getFullYear()
  const mes = String(now.getMonth() + 1).padStart(2, '0')
  const primeiroDia = `${ano}-${mes}-01`
  // Último dia: usa o primeiro dia do próximo mês - 1
  const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]

  // Configurações (salario1, salario2, va1, va2)
  const { data: configData, error: configError } = await supabase
    .from('config')
    .select('key, value')

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  const config: Record<string, number> = {}
  for (const item of configData ?? []) {
    config[item.key] = Number(item.value) || 0
  }

  const salario1 = config['salario1'] || 0
  const salario2 = config['salario2'] || 0
  const va1 = config['va1'] || 0
  const va2 = config['va2'] || 0

  // Gastos fixos ativos
  const { data: gastosFixos, error: gfError } = await supabase
    .from('gastos_fixos')
    .select('valor')
    .eq('ativo', true)

  if (gfError) {
    return NextResponse.json({ error: gfError.message }, { status: 500 })
  }

  const totalGastosFixos = (gastosFixos ?? []).reduce(
    (sum, g) => sum + Number(g.valor),
    0
  )

  // Parcelamentos em andamento (parcelas_pagas < total_parcelas)
  const { data: parcelamentos, error: parcError } = await supabase
    .from('parcelamentos')
    .select('valor_parcela, parcelas_pagas, total_parcelas')

  if (parcError) {
    return NextResponse.json({ error: parcError.message }, { status: 500 })
  }

  const totalParcelamentosMensal = (parcelamentos ?? [])
    .filter((p) => p.parcelas_pagas < p.total_parcelas)
    .reduce((sum, p) => sum + Number(p.valor_parcela), 0)

  // Transações do mês atual
  const { data: transacoes, error: txError } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 })
  }

  let gastosDoMes = 0
  let ganhosDoMes = 0
  let gastosVADoMes = 0

  for (const t of transacoes ?? []) {
    const valor = Number(t.valor)
    if (t.tipo === 'gasto') gastosDoMes += valor
    else if (t.tipo === 'ganho') ganhosDoMes += valor
    else if (t.tipo === 'gasto_va') gastosVADoMes += valor
  }

  const rendaTotal = salario1 + salario2 + va1 + va2
  const saldoDisponivel =
    salario1 + salario2 - totalGastosFixos - gastosDoMes + ganhosDoMes
  const saldoVA = va1 + va2 - gastosVADoMes

  return NextResponse.json({
    rendaTotal,
    saldoDisponivel,
    saldoVA,
    totalGastosFixos,
    totalParcelamentosMensal,
    salario1,
    salario2,
    va1,
    va2,
    gastosDoMes,
    ganhosDoMes,
    gastosVADoMes,
  })
}
