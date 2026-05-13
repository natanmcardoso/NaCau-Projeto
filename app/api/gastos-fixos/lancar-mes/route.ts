import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/gastos-fixos/lancar-mes
// Idempotente: verifica quais fixos já foram lançados no mês atual antes de lançar
export async function POST() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const inicioMes = `${ano}-${mes}-01`
  const fimMes = `${ano}-${mes}-31`

  // Busca todos os gastos fixos ativos
  const { data: fixos, error: erroFixos } = await supabase
    .from('gastos_fixos')
    .select('*')
    .eq('ativo', true)

  if (erroFixos || !fixos) {
    return NextResponse.json({ erro: 'Erro ao buscar gastos fixos.' }, { status: 500 })
  }

  if (fixos.length === 0) {
    return NextResponse.json({ lancados: 0, mensagem: 'Nenhum gasto fixo ativo.' })
  }

  // Busca transações do tipo gasto_fixo já lançadas no mês atual
  const { data: jaLancados, error: erroTransacoes } = await supabase
    .from('transacoes')
    .select('descricao')
    .eq('tipo', 'gasto_fixo')
    .gte('data', inicioMes)
    .lte('data', fimMes)

  if (erroTransacoes) {
    return NextResponse.json({ erro: 'Erro ao verificar lançamentos existentes.' }, { status: 500 })
  }

  const descricoesJaLancadas = new Set(
    (jaLancados ?? []).map((t) => t.descricao.toLowerCase().trim())
  )

  // Filtra os fixos que ainda não foram lançados neste mês
  const paraLancar = fixos.filter(
    (f) => !descricoesJaLancadas.has(f.descricao.toLowerCase().trim())
  )

  if (paraLancar.length === 0) {
    return NextResponse.json({
      lancados: 0,
      mensagem: 'Todos os gastos fixos já foram lançados neste mês.',
    })
  }

  // Monta as transações a inserir
  const transacoes = paraLancar.map((f) => {
    const dia = String(f.dia_vencimento ?? 10).padStart(2, '0')
    return {
      tipo: 'gasto_fixo' as const,
      descricao: f.descricao,
      valor: f.valor,
      categoria: f.categoria,
      data: `${ano}-${mes}-${dia}`,
      origem: 'dashboard' as const,
      usuario_id: null,
    }
  })

  const { error: erroInsert } = await supabase.from('transacoes').insert(transacoes)

  if (erroInsert) {
    return NextResponse.json({ erro: 'Erro ao lançar gastos fixos.' }, { status: 500 })
  }

  return NextResponse.json({
    lancados: paraLancar.length,
    mensagem: `${paraLancar.length} gasto(s) fixo(s) lançado(s) com sucesso.`,
  })
}
